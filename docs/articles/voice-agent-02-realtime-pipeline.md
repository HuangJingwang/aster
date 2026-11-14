# Voice Agent 实践与落地（二）：从语音输入到工具执行，拆解实时交互链路

Mina 的语音请求包含音频传输、轮次判断、模型推理、工具执行和播放。本文以“查询下一场会议”为例，拆解 Qwen Realtime 的调用链路，对照 Pipecat 与 LiveKit Agents 的编排方式，并给出分阶段的监控与优化方案。

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

火山引擎也已提供实时语音 API，但其版本与豆包 App 最新能力是否一致，需要分别确认。[火山引擎实时语音 API](https://docs.volcengine.com/docs/doubao-voice/end-to-endreal-time-speech-large-model-api-access-document?lang=en)

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

Mina 当前使用 Agora 和自定义 Qwen 适配；LiveKit Agents 用于对照会话编排。

以“查询下一场会议”为例，逻辑链路如下：

```text
采集与上传 → 持续输入模型 → 轮次确认与响应控制
→ 生成工具调用 → 执行业务查询 → 回传结果并续答 → 音频下发与播放
```

采集、上传和模型接收持续重叠；无需等整句话录完才开始传输。

## 三、音频输入：格式适配与队列

客户端完成采集、回声消除和降噪后，通过 RTC 上传音频。Agent 将收到的数据转换为模型要求的格式，再持续发送。

客户端音轨、RTC 编码与模型输入格式可能不同。Mina 当前向 Qwen 输入 16 kHz 单声道 PCM，按 24 kHz PCM 处理输出；这些参数应与所用模型和协议匹配。

输入阶段主要检查三处：

- **格式转换**：确认重采样和编码转换在哪一层完成，避免多个处理器重复转换。
- **处理队列**：音频处理回调不应同步等待业务查询，否则会阻塞后续帧。
- **分帧大小**：大帧增加积累等待，小帧增加消息与调度开销，需要结合传输和模型接口调整。

连接建立、会话配置和工具目录加载尽量在会话准备阶段完成。监控时区分冷启动与长连接内的连续对话。

## 四、轮次判断与应用响应控制

用户说“查一下今天的会议……下午的就行”时，中间的停顿不一定表示输入结束。过早响应会遗漏条件，过晚响应则增加等待。

VAD（语音活动检测）判断是否存在语音；轮次检测还可以结合语义与上下文。LiveKit Agents 支持多种轮次策略，实时模型也可使用服务端检测，具体组合取决于适配能力。[LiveKit 轮次处理](https://docs.livekit.io/agents/logic/turns/)

需要分别记录三个时刻：用户停止发声、系统确认轮次结束、应用触发响应。它们之间的等待来源不同。

Mina 保留 Qwen 服务端 VAD，同时关闭自动响应和自动打断，相关配置字段为：

```json
{
  "create_response": false,
  "interrupt_response": false
}
```

这是会话配置片段。应用检查发言人准入、唤醒和会话状态后，再触发响应。最终转写若参与这些检查，就会成为应用链路的依赖，即使模型本身能够直接理解音频。

定位延迟时，应将端点检测与应用准备分开。缩短静音窗口只能影响前者，还需要同时检查误切句和抢话率。

## 五、工具调用：协议、执行与续答

模型无法从当前上下文获得会议安排时，需要查询业务服务。应用先通过 `session.update` 注册工具，再处理模型返回的调用请求。

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

端到端指标统一从本轮用户语音结束开始，分别记录三个终点：

| 指标 | 终点 | 查询场景示例 |
|---|---|---|
| 首声延迟 | 首段反馈开始播放 | “好的，我查一下” |
| 有效回答延迟 | 包含结果的回答开始播放 | “下一场会议下午三点开始” |
| 任务完成延迟 | 业务获得确定的执行结果 | 日历查询成功返回 |

三者不保证按表中顺序发生。有效回答需要由业务结果对应的音频段标记，不能用首个音频分块代替；自由对话的回答质量则需要额外评测。

对于一次工具调用，可按以下边界埋点。这是应用侧建议口径，并非框架内置指标名。

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

LiveKit trace 已包含 `eou_wait`、`function_tool`、`realtime_inference` 等阶段。Pipecat 的自定义适配则可在 Processor、模型事件和工具 handler 的边界补充埋点。[LiveKit Session traces and metrics](https://docs.livekit.io/reference/agents/session-traces/)

Grafana 建议保留三组视图：端到端 P50/P95 与失败率、各阶段耗时分布、关联 trace 的单次请求。按模型、工具、响应路径和状态分组；会话、轮次、响应、调用和任务 ID 放入日志或 trace，避免成为高基数指标标签。

测量时需要明确三项约束：

- **起点口径**：收到 `speech_stopped` 已包含传输和检测等待，不能当作用户实际停声时间；缺少前端时间时，应注明使用服务端事件作为起点。
- **跨端时钟**：客户端与服务端时间需要校准。没有播放回执，只能报告音频接收或提交输出的耗时。
- **统计关系**：阶段 P95 不能相加，并行阶段也不能直接累加；关键路径要从同一次请求的 trace 判断。

## 九、根据关键路径优化

先定位延迟集中在哪个阶段，再调整对应组件：

| 瓶颈 | 调整方向 | 同时验证 |
|---|---|---|
| 会话准备 | 复用连接，提前配置工具与固定上下文 | 重连后的配置一致性 |
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
- [LiveKit Session Traces and Metrics](https://docs.livekit.io/reference/agents/session-traces/)
- [Artificial Analysis Speech Agent Arena](https://artificialanalysis.ai/speech-to-speech/arena)
- [SeedRealtime 官方介绍](https://seed.bytedance.com/zh/blog/seedrealtime-audio-visual-full-duplex-llm-released-toward-omni-modal-natural-interaction)
- [火山引擎端到端实时语音 API](https://docs.volcengine.com/docs/doubao-voice/end-to-endreal-time-speech-large-model-api-access-document?lang=en)

## 摘要与标签

以 Qwen Realtime 为例，结合 Pipecat、LiveKit Agents 与 Mina 实践，拆解语音输入、轮次、工具调用和播放链路，给出监控指标与优化方向。

建议标签：Voice Agent、Qwen、Pipecat、LiveKit、可观测性。

## 附录：编辑规划

资料与代码核对日期：2026 年 11 月 14 日。以下仅用于编辑，不属于发布正文。

| 章节 | 内容边界 |
|---|---|
| 1—2 | 选型依据、组件职责和全链路总览 |
| 3—4 | 音频格式与队列、轮次判断与应用响应控制 |
| 5 | 工具协议、结果关联、调用依赖与失败处理 |
| 6—7 | 播放和打断、Mina 的后台委托与 TTS 分支 |
| 8 | 统一指标定义、埋点边界和统计限制 |
| 9 | 按瓶颈选择优化措施与验证指标 |

配图计划：第二章绘制组件关系图，第五章绘制工具调用时序图，第八章使用实际 trace 绘制单轮耗时图。前两张以接口与代码为依据，耗时图注明样本和测量口径。当前未生成图片文件。
