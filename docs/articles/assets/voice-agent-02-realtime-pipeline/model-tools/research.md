# 模型选型与工具协议核验

核验日期：2026-11-14。本文只将公开协议作为通用讲解来源，Mina 的已有实现单列在结尾。榜单用于选择考察方向，不替代项目评测。

## 选型依据

- [Artificial Analysis Speech-to-Speech](https://artificialanalysis.ai/speech-to-speech/)：语音推理、交互节奏、Agent 任务和响应性能分项展示。查阅时 StepAudio 3 Realtime、Qwen Audio 3.0 Realtime Plus 位于语音推理与交互节奏前列；不能外推为所有任务最佳，也不能把分数转移到 qwen3.8-omni-flash-realtime。
- [SeedRealtime 官方介绍](https://seed.bytedance.com/zh/SeedRealtime)与[模型目录](https://seed.bytedance.com/zh/models)：确认音视频全双工模型及 App 体验入口。未确认 App 同版本能力的公开 API，不等于证明豆包所有实时模型均未开放。
- [Seeduplex API](https://docs.volcengine.com/docs/doubao-voice/end-to-end-real-time-voice-full-duplex-version?lang=zh)：已有公开接口，本文限定 session.model=1.2.6.1。公开资料出现 Doubao-Seed-Realtime-1.0，但与 App 当前版本的映射未确认。

## 三条应用执行函数的路径

| 服务 | 请求 | 回传 | 续答 |
|---|---|---|---|
| Qwen | response.function_call_arguments.done，包含 name、arguments、call_id | conversation.item.create；item.type=function_call_output，call_id 与字符串 output | 应用发送 response.create |
| Seeduplex | response.function_call_arguments.done；items 中多个调用 | conversation.item.create；items[].role=tool，call_id，content[].type=input_text 与 text | 收齐这一批工具结果后自动继续 |
| OpenAI | 本文以 response.done.response.output 收集 function_call 项 | conversation.item.create；item.type=function_call_output，call_id 与字符串 output | 应用发送 response.create |

- [Qwen 客户端事件](https://help.aliyun.com/zh/model-studio/client-events)：工具声明嵌套 function；结果回传和响应触发。
- [Qwen 服务端事件](https://help.aliyun.com/zh/model-studio/server-events)：完整参数事件、音频 response.audio.delta。
- [Qwen 接入](https://help.aliyun.com/zh/model-studio/omni-realtime-api)：模型型号与接入路径。
- [Seeduplex 接入说明](https://docs.volcengine.com/docs/doubao-voice/access-must-read?lang=zh)：该批调用全部完成后聚合回传与自动续答；具体字段以 API 定义为准。
- [OpenAI 工具与 MCP](https://developers.openai.com/api/docs/guides/realtime-mcp)、[Realtime 会话](https://developers.openai.com/api/docs/guides/realtime-conversations)：应用函数执行、call_id 关联、回传及 response.create；音频 response.output_audio.delta。本文不混入服务端执行的远程 MCP 路径。
- [TEN Framework 概念](https://theten.ai/docs/ten_framework/concept_overview)：Extension 为处理单元，Graph 描述单元间数据流。

## 图示检查

两张图均采用应用、实时模型、业务服务三列，时间向下。逐项核对：模型发请求到应用；应用校验后调用业务；业务结果回应用；应用按 call_id 回传模型。豆包自动续答，OpenAI 另发 response.create；音频均从模型返回应用。没有把模型画成直接访问业务服务。
