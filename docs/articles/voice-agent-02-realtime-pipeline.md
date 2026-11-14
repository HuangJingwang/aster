# Voice Agent 实践与落地（二）：从语音输入到工具执行，拆解实时交互链路

在会议里说一句“米娜，查一下下一场会议”，系统先要判断是否被唤醒、是谁在提问、话有没有说完，才轮到查询和回答。本文沿着 Mina 的这条链路，比较 Pipecat、TEN、LiveKit 的交互控制，以及 Qwen 与豆包 Realtime 的工具调用方式，再拆解监控与优化指标。

## 一、为什么选择 Qwen Realtime

Voice Agent 常见的两种架构是：

```text
级联式：音频 → ASR → 文本模型 → TTS → 音频
原生实时式：音频 → Realtime 模型 → 音频
                          ↕
                       工具调用
```

级联式允许独立选择 ASR、文本模型和 TTS，各组件也可以流式运行。原生 Realtime 模型直接接收和生成语音，能够利用语气等转写难以保留的信息，并减少模块间的转换。[LiveKit Realtime 模型说明](https://docs.livekit.io/agents/models/realtime/)

原生语音能力已有产品实践：Speech Agent Arena 纳入了 Gemini Live、Grok Voice 等模型；字节的 SeedRealtime 已在豆包 App 上线，支持音视频全双工交互。[Speech Agent Arena](https://artificialanalysis.ai/speech-to-speech/arena)、[SeedRealtime 官方介绍](https://seed.bytedance.com/zh/blog/seedrealtime-audio-visual-full-duplex-llm-released-toward-omni-modal-natural-interaction)

火山引擎也已提供实时语音 API。下文比较的是全双工 JSON 协议，其文档指定 `session.model=1.2.6.1`；旧版 S2S 二进制协议与豆包 App 的能力不能直接套用到这套接口。[火山引擎全双工接入说明](https://docs.volcengine.com/docs/doubao-voice/access-must-read?lang=zh)

Mina 采用 Qwen Realtime，是因为它提供流式音频输入输出、会话控制和 Function Calling，能够接入现有业务编排。本文以当前代码默认的 `qwen3.8-omni-flash-realtime` 为例，使用 WebSocket 接入，由应用执行工具。[Qwen Realtime 文档](https://help.aliyun.com/zh/model-studio/omni-realtime-api)

## 二、传输、编排与模型的职责

| 层次 | 职责 | 组件 |
|---|---|---|
| 媒体传输 | 采集、上传、下发和播放音频 | 客户端 SDK、LiveKit、Agora |
| 会话编排 | 管理轮次、上下文、模型调用和工具执行 | Pipecat、LiveKit Agents |
| 模型服务 | 理解语音、生成工具调用和回答 | Qwen Realtime |
| 业务执行 | 查询数据、执行操作、返回结果 | 日历 API、内部服务 |

LiveKit 的媒体基础设施与 LiveKit Agents 是不同层次的组件。Pipecat 可以使用 `LiveKitTransport` 传输音频；会话编排层对应的比较对象则是 Pipecat 与 LiveKit Agents。[Pipecat LiveKit Transport](https://docs.pipecat.ai/api-reference/server/services/transport/livekit)

Pipecat 通过 Frame 承载音频、文本和控制信号，由 Processor 沿 Pipeline 处理；LiveKit Agents 通过 `AgentSession` 管理输入、模型调用和输出，由 Agent 定义指令与工具。[Pipecat Frames](https://github.com/pipecat-ai/docs/blob/main/api-reference/server/frames/overview.mdx)、[LiveKit AgentSession](https://docs.livekit.io/agents/logic/sessions/)

Mina 当前使用 Agora，并有 Qwen、豆包的自定义实时适配；本文以 Qwen 路径展开，其他框架用于对照。

下图区分音频主路径、响应控制和工具调用循环：

![语音链路：RTC 音频先经过应用唤醒门控，再输入 Qwen；应用控制响应与工具执行](assets/voice-agent-02-realtime-pipeline/01-voice-pipeline.png)

采集、上传和模型接收持续重叠；工具结果回传后，模型继续回答或发起下一次调用。

## 三、音频输入：格式适配与队列

客户端完成采集、回声消除和降噪后，通过 RTC 上传音频。Agent 将收到的数据转换为模型要求的格式，再持续发送。

客户端音轨、RTC 编码与模型输入格式可能不同。Mina 当前向 Qwen 输入 16 kHz 单声道 PCM，按 24 kHz PCM 处理输出；这些参数应与所用模型和协议匹配。

输入阶段主要检查三处：

- **格式转换**：确认重采样和编码转换在哪一层完成，避免多个处理器重复转换。
- **处理队列**：音频处理回调不应同步等待业务查询，否则会阻塞后续帧。
- **分帧大小**：大帧增加积累等待，小帧增加消息与调度开销，需要结合传输和模型接口调整。

连接建立、会话配置和工具目录加载尽量在会话准备阶段完成。监控时区分冷启动与长连接内的连续对话。

## 四、唤醒、发言准入与轮次判断

### 同一句话，需要做哪些判断

“米娜，查一下今天的会议……下午的就行”包含几个不同的控制问题：

| 判断 | 要回答的问题 | 判断失误的表现 |
|---|---|---|
| 唤醒 / 激活 | 用户是否要进入与 Agent 的交互？ | 旁人聊天触发响应，或叫了名字没反应 |
| 发言准入 | 这段话是否属于当前交互，是否允许这个人发起请求？ | 把其他参会人的话接进当前请求 |
| VAD（语音活动检测） | 当前音频里是否有人声？ | 噪声被当成人声，或轻声说话被漏掉 |
| 轮次结束检测（EOT） | 用户是否说完，准备交出话语权？ | 在“下午的就行”之前抢答 |
| 打断判断 | 新输入是否应该停止正在播报的回答？ | 一声“嗯”就打断回答 |

这些信号可以并行计算，不能把表格理解为固定串行流水线。尤其是 VAD 检测到人声，并不意味着用户在叫 Agent，也不意味着一句话已经结束。

### 唤醒词模型与转写匹配的区别

声学关键词检测（KWS，Keyword Spotting）直接从音频识别约定的唤醒词；转写匹配则先跑 ASR，再从文本里找名字或短语。前者要部署模型、调整阈值，后者依赖转写时延和识别质量。若 ASR 在云端，转写后再过滤也意味着音频已经送去识别，不能据此声称“唤醒前音频不上云”。按钮和快捷键则由用户显式激活会话，不需要识别唤醒词。

几套方案的控制点分别是：

| 框架 / 产品 | 唤醒或进入交互 | 轮次结束判断 |
|---|---|---|
| Pipecat | `WakePhraseUserTurnStartStrategy` 在最终转写中匹配短语，并维护唤醒窗口 | 可选静音超时、Smart Turn 或其他策略 |
| TEN | TEN VAD 与 TEN Turn Detection 分别处理语音活动和轮次；唤醒需在具体应用里另行设计 | 公开的 TEN Turn Detection 根据文本输出 `finished`、`unfinished`、`wait` |
| LiveKit | `livekit-wakeword` 在客户端运行 ONNX 唤醒词分类器 | 可选音频轮次模型、文本轮次模型，以及适配器支持的服务端检测等方式 |
| Codex Voice | 公开文档确认 Voice 按钮和配置的快捷键入口 | 文档未披露其内部轮次模型，不能从交互效果反推实现 |

Pipecat 的短语策略在一段有效期内允许继续说话，不必每轮重新喊名字；它本身依赖转写，不是音频 KWS。[Pipecat User Turn Strategies](https://docs.pipecat.ai/api-reference/server/utilities/turn-management/user-turn-strategies)

LiveKit 的官方唤醒示例先在客户端监听，命中阈值后连接房间并让 Agent 加入。这个部署位置与服务端唤醒不同，会把房间连接和 Agent 启动带入首次交互的等待。[LiveKit Wakeword Detection](https://docs.livekit.io/agents/multimodality/audio/wakeword/)

Codex 可确认的是显式启动语音和自然打断能力；公开说明不足以证明其采用某个唤醒词模型。OpenAI Realtime API 支持的检测模式，也不能直接作为 Codex 内部实现的证据。[Codex Voice 使用说明](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)

Mina 的 `SherpaWakeDetector` 使用 `sherpa_onnx.KeywordSpotter`，运行在 Agent 服务所在机器，按参会人的音轨分别检测。音频已通过 RTC 到达 Agent，唤醒门控决定是否继续送入 Realtime。检测器保留近期音频，命中后对齐并补送唤醒附近的音频，避免漏掉紧接着说出的“查一下”。

因此，唤醒状态至少要带上发言人、有效期和音频缓冲。持续交互期间可免唤醒续说；换人或超时后重新判断。识别到名字只解决交互入口，工具权限仍由业务会话校验。

### 轮次模型到底在看什么

只按静音窗口收句容易在思考停顿处抢答。进一步判断是否说完，可以用文本，也可以直接用音频：

- **文本语义判断**：TEN Turn Detection 对用户文本分类，区分说完、未完和要求等待。它需要先获得可用转写，ASR 的遗漏也会影响判断。[TEN Turn Detection](https://github.com/TEN-framework/ten-turn-detection)
- **音频轮次判断**：Pipecat Smart Turn 直接处理 PCM，结合语音内容与韵律；通常由 VAD 发现停顿后再运行。模型不依赖转写，不代表接入它的整条应用链路都不等待转写。[Smart Turn](https://github.com/pipecat-ai/smart-turn)
- **可选音频或文本模型**：LiveKit 当前同时提供这两类检测器。音频检测器可用于 Realtime 而不额外引入 STT；文本检测器依赖转写与上下文。[LiveKit Turn Detector](https://docs.livekit.io/agents/logic/turns/turn-detector/)

另一种做法是沿用 Realtime 服务自身的轮次判断。这里要明确谁负责最终提交一轮：如果框架与模型各自触发响应，可能重复回答；如果两者依次等待，又可能增加延迟。接入外部轮次模型前，应确认供应商是否支持关闭内置检测、手动提交和手动触发响应，不能只替换一个检测器名称。

### Mina 怎样控制响应

Mina 的 Qwen 路径保留服务端 VAD，同时关闭自动响应和自动打断，相关配置字段为：

```json
{
  "create_response": false,
  "interrupt_response": false
}
```

这是会话配置片段。唤醒门控放行音频后，应用仍需结合轮次、转写和会话状态决定是否发送 `response.create`。最终转写若参与准入，就会成为应用链路的依赖，即使模型本身能够直接理解音频。

豆包全双工路径则会自动产生回复。Mina 的适配器暂存尚未准入的模型事件，准入后再交付，并在工具执行前检查轮次是否仍有效。两条路径的业务约束相同，控制位置不同。

## 五、工具调用：协议、执行与续答

模型无法从当前上下文获得会议安排时，需要查询业务服务。应用先通过 `session.update` 注册工具，再处理模型返回的调用请求。

下面以已唤醒的会话为前提，按应用控制响应的方式，展示一次 Qwen 查询的协议时序：

![Qwen 工具调用时序：配置会话、输入音频、触发响应、校验执行、回传结果并续答，包含拒绝执行和查询失败](assets/voice-agent-02-realtime-pipeline/02-tool-call-sequence.png)

工具调用循环以 `call_id` 关联请求与结果；拒绝执行或查询失败也需要返回明确状态。

Qwen 使用 `response.function_call_arguments.done` 返回完整的名称、参数和 `call_id`。以下为示意事件，省略了其他响应元数据：

```json
{
  "type": "response.function_call_arguments.done",
  "name": "get_next_meeting",
  "call_id": "call_example",
  "arguments": "{\"date\":\"2026-11-14\",\"timezone\":\"Asia/Shanghai\"}"
}
```

应用解析 `arguments`、校验参数，再执行日历查询。身份与可访问范围由可信会话提供，不使用模型参数替代授权信息。

查询成功后，通过 `conversation.item.create` 回传结果：

```json
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_example",
    "output": "{\"status\":\"ok\",\"start_at\":\"2026-11-14T15:00:00+08:00\"}"
  }
}
```

结果必须关联原 `call_id`。应用随后发送 `response.create`，模型基于结果生成回答，或者继续请求其他工具。[Qwen Function Calling](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-function-calling)

例如，拿到会议 ID 后继续查询参会人员，需要第二次调用；查询两个互不依赖的日历，则可以在业务工具内部并发。并行能力取决于依赖关系和应用调度。

Pipecat 的工具接口提供工具名、参数、调用 ID 和结果回调；LiveKit Agents 通过 Agent 声明工具并交给会话执行。Mina 的自定义实时适配会收齐完整响应后再执行工具。[Pipecat 工具接口](https://reference-server.pipecat.ai/en/stable/api/pipecat.services.llm_service.html)

工具结果应区分成功、明确失败、已受理和结果未知。查询超时可以返回失败；写操作已提交但回执超时时，应先查询执行状态，结合幂等机制处理重试，避免重复创建或修改。

### Qwen 与豆包的续答协议不同

事件名称相似，不代表可以只改模型地址。以下对照 Qwen Realtime 与 Mina 所接的豆包全双工 JSON 协议，且仅讨论原生工具续答分支：

| 环节 | Qwen Realtime | 豆包全双工 JSON 协议 |
|---|---|---|
| 调用请求 | `response.function_call_arguments.done` 的 `name`、`arguments`、`call_id` 描述一次调用 | 同名事件的 `items` 可以包含多个调用，各有 `call_id` |
| 工具结果 | `conversation.item.create` 中的 `item.type=function_call_output`，结果为 `output` 字符串 | 同名事件使用 `items`，每项包含 `role=tool`、`call_id` 和 `content` |
| 继续生成 | 回传结果后，应用显式发送 `response.create` | 收齐工具结果后自动续答；该接入路径不发送 `response.create` |
| 输出音频 | `response.audio.delta` | `response.output_audio.delta` |

豆包文档要求按 `call_id` 执行并聚合该批结果后回传；这不等于业务函数一定要并发执行，仍要检查依赖和副作用。Qwen 也不能因为单个事件描述一次调用，就被推断为每轮只能调用一个工具。[Qwen Function Calling](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-function-calling)、[豆包全双工 Function Calling](https://docs.volcengine.com/docs/doubao-voice/access-must-read?lang=zh)

这个区别会改变编排顺序。Qwen 可以在回传结果后、发出 `response.create` 前完成续答准备；Mina 的豆包适配则先更新本轮指令和回执状态，再回传结果，因为回传本身就会触发续答。工具超时也要生成对应的失败结果，不能漏掉一个 `call_id` 后继续等模型。

## 六、流式播放与打断

音频输出路径为：

```text
模型音频分块 → 输出队列 → 格式适配与发送 → 客户端缓冲 → 播放
```

生成与播放应当重叠，避免收齐整段音频后才发送。缓冲大小需要兼顾首声延迟和播放连续性，过小的缓冲可能放大网络抖动。

用户打断时，需要协调四个动作：

1. 停止播放并清理待播音频。
2. 取消旧生成，或丢弃它后续产生的输出。
3. 更新轮次版本，阻止过期结果进入新回答。
4. 根据业务状态决定是否取消工具任务。

停止声音不会撤销已提交的操作。写请求仍可能需要收取回执；被打断的回答也不能按完整内容计入“用户已听到”的上下文。

## 七、Mina 的分支：前台语音与后台任务

Mina 将较长的业务任务交给后台 `MeetingAgent`，前台暴露委托、进度、修改、暂停、继续和取消等控制入口。

```text
前台：理解请求 → 委托任务 → 受理反馈 → 继续接收输入
后台：接收任务 → 执行业务工具 → 生成结果 → 等待交付
```

业务任务可以跨越多个语音轮次。用户查询进度时应关联已有任务；“别说了，继续做”只停止播报。需要界面确认的写入，提案生成后仍须等待确认。

输出也分为两条路径：普通回答使用 Qwen 原生音频；部分控制反馈、受理反馈和已确定的结果走独立 TTS。`_speak_control_results` 将已有 `reply` 转成 `TTSSpeakFrame`，不再请求 Qwen 改写。

因此，埋点必须标记实际路径。原生响应记录模型音频事件；独立 TTS 响应还要记录文本准备与合成时间。

## 八、指标拆解与 Grafana 看板

回答延迟从本轮用户语音结束开始计时，分别记录三个终点；首次唤醒和会话准备另外统计，避免被这个起点排除。

| 指标 | 终点 | 查询场景示例 |
|---|---|---|
| 首声延迟 | 首段反馈开始播放 | “好的，我查一下” |
| 有效回答延迟 | 包含结果的回答开始播放 | “下一场会议下午三点开始” |
| 任务完成延迟 | 业务获得确定的执行结果 | 日历查询成功返回 |

三者不保证按表中顺序发生。有效回答需要由业务结果对应的音频段标记，不能用首个音频分块代替；自由对话的回答质量则需要额外评测。

对于一次 Qwen 工具调用，可按以下边界埋点。这是应用侧建议口径，并非框架内置指标名。

| 阶段 | 起点 → 终点 |
|---|---|
| 轮次等待 | 用户语音结束 → 应用确认轮次结束 |
| 响应准备 | 轮次确认 → 发出响应请求 |
| 工具决策 | 响应请求 → 完整工具参数就绪 |
| 工具调度等待 | 参数就绪 → handler 开始执行，包含等待完整响应的时间 |
| 工具执行 | handler 开始 → 执行结果产生 |
| 结果回传 | 执行结果产生 → 结果发送完成 |
| 结果续答 | 结果发送完成 → 首块结果音频到达 |
| 播放准备 | 首块音频到达应用 → 客户端开始播放 |

多轮调用按 `call_id` 分别记录。直接回答不产生工具阶段；独立 TTS 路径记录文本就绪到首块合成音频的时长。

豆包自动响应没有应用发送 `response.create` 的边界，应改记供应商可观察的轮次 / 响应事件，并单列“模型事件到达 → 应用准入放行”的等待。不要把两种边界都叫作模型推理耗时；服务内部阶段不可见时，只报告能测到的区间。

交互控制还需要一组质量指标：

| 指标 | 建议口径 |
|---|---|
| 唤醒延迟 | 标注的唤醒词结束 → 唤醒命中；另记命中 → 会话可接收请求 |
| 误唤醒 | 无唤醒意图时的错误激活次数 / 监听小时数 |
| 漏唤醒 | 未识别的有效唤醒次数 / 标注的有效唤醒总数 |
| 首句丢失 | 唤醒后紧随的请求出现前缀缺失的比例，用“唤醒词 + 连续指令”样本验证 |
| 误切句 | 用户尚未交出话语权就提交轮次的次数 / 标注轮次总数 |
| 打断生效时间 | 接受打断 → 客户端旧音频停止播放；另记误打断比例 |

误唤醒、漏唤醒和误切句需要标注样本或人工抽检，无法仅凭服务端成功日志得出。Mina 已有 `wake.queue` 与 `wake.batch_inference` 埋点，可先观察检测排队和批次推理；它们都不等于完整唤醒延迟。

LiveKit trace 已包含 `eou_wait`、`function_tool`、`realtime_inference` 等阶段。Pipecat 的自定义适配则可在 Processor、模型事件和工具 handler 的边界补充埋点。[LiveKit Session traces and metrics](https://docs.livekit.io/reference/agents/session-traces/)

Grafana 可分为回答延迟、阶段耗时、交互质量和单次 trace 四组视图。按模型、工具、响应路径和状态分组；会话、轮次、响应、调用和任务 ID 放入日志或 trace，避免成为高基数指标标签。

测量时需要明确三项约束：

- **起点口径**：收到 `speech_stopped` 已包含传输和检测等待，不能当作用户实际停声时间；缺少前端时间时，应注明使用服务端事件作为起点。
- **跨端时钟**：客户端与服务端时间需要校准。没有播放回执，只能报告音频接收或提交输出的耗时。
- **统计关系**：阶段 P95 不能相加，并行阶段也不能直接累加；关键路径要从同一次请求的 trace 判断。

## 九、根据关键路径优化

先定位延迟集中在哪个阶段，再调整对应组件：

| 瓶颈 | 调整方向 | 同时验证 |
|---|---|---|
| 会话准备 | 复用连接，提前配置工具与固定上下文 | 重连后的配置一致性 |
| 唤醒等待 | 检查 KWS 排队、转写依赖和唤醒后连接；保留连续指令音频 | 误唤醒、漏唤醒、首句丢失 |
| 轮次等待 | 调整端点策略，消除重复等待 | 误切句、抢话率 |
| 模型决策 | 缩小工具目录、消除描述歧义、裁剪上下文 | 工具选择与参数正确率 |
| 工具执行 | 优化下游查询、并发独立任务、限制重试 | 成功率、幂等性 |
| 结果续答 | 裁剪无关返回字段，减少无必要的模型往返 | 回答完整性与结果一致性 |
| 音频播放 | 流式发送，减少队列积压，调整缓冲 | 断续率、打断生效时间 |

优化前后使用相同请求集，区分冷启动、直接回答、工具调用和后台任务路径。只有延迟下降且任务成功率、误切句与打断体验未退化，调整才值得保留。

## 参考

- [Qwen Realtime：实时多模态](https://help.aliyun.com/zh/model-studio/omni-realtime-api)
- [Qwen Function Calling](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-function-calling)
- [Pipecat Frames](https://github.com/pipecat-ai/docs/blob/main/api-reference/server/frames/overview.mdx)
- [Pipecat LiveKit Transport](https://docs.pipecat.ai/api-reference/server/services/transport/livekit)
- [Pipecat LLM Service 与工具调用接口](https://reference-server.pipecat.ai/en/stable/api/pipecat.services.llm_service.html)
- [LiveKit AgentSession](https://docs.livekit.io/agents/logic/sessions/)
- [LiveKit Realtime Models](https://docs.livekit.io/agents/models/realtime/)
- [LiveKit Turn Detection](https://docs.livekit.io/agents/logic/turns/)
- [Pipecat User Turn Strategies](https://docs.pipecat.ai/api-reference/server/utilities/turn-management/user-turn-strategies)
- [Pipecat Smart Turn](https://github.com/pipecat-ai/smart-turn)
- [TEN Turn Detection](https://github.com/TEN-framework/ten-turn-detection)
- [LiveKit Wakeword Detection](https://docs.livekit.io/agents/multimodality/audio/wakeword/)
- [LiveKit 音频与文本轮次模型](https://docs.livekit.io/agents/logic/turns/turn-detector/)
- [Codex Voice 使用说明](https://help.openai.com/en/articles/20001275-chatgpt-work-and-codex)
- [LiveKit Session Traces and Metrics](https://docs.livekit.io/reference/agents/session-traces/)
- [Artificial Analysis Speech Agent Arena](https://artificialanalysis.ai/speech-to-speech/arena)
- [SeedRealtime 官方介绍](https://seed.bytedance.com/zh/blog/seedrealtime-audio-visual-full-duplex-llm-released-toward-omni-modal-natural-interaction)
- [火山引擎全双工接入与工具调用](https://docs.volcengine.com/docs/doubao-voice/access-must-read?lang=zh)

## 摘要与标签

沿 Mina 的语音链路，对照唤醒与轮次策略、Qwen 与豆包的工具续答协议，拆解从输入到播放的监控与优化方法。

建议标签：Voice Agent、Qwen、Pipecat、LiveKit、可观测性。

## 附录：编辑规划

资料与代码核对日期：2026 年 11 月 14 日。以下仅用于编辑，不属于发布正文。

| 章节 | 内容边界 |
|---|---|
| 1—2 | 选型依据、组件职责和全链路总览 |
| 3—4 | 音频格式与队列、唤醒与准入、音频 / 文本轮次检测、响应控制 |
| 5 | Qwen 工具时序、豆包协议差异、结果关联与失败处理 |
| 6—7 | 播放和打断、Mina 的后台委托与 TTS 分支 |
| 8 | 回答延迟、交互质量、供应商埋点差异和统计限制 |
| 9 | 按瓶颈选择优化措施与验证指标 |

已完成第二章链路图和第五章工具调用时序图，正文引用 PNG，可编辑 SVG 与生成脚本保存在同一目录：

- [链路图 SVG](assets/voice-agent-02-realtime-pipeline/01-voice-pipeline.svg)
- [工具调用时序图 SVG](assets/voice-agent-02-realtime-pipeline/02-tool-call-sequence.svg)
- [重绘脚本](assets/voice-agent-02-realtime-pipeline/render_diagrams.py)

两图依据本文引用的 Qwen 协议与应用实现，使用统一配色区分客户端、应用、模型和业务服务。第八章单轮耗时图待实际 trace 补充，并需注明样本和测量口径。
