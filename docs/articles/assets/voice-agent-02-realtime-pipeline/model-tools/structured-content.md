# 三家 Function Calling 的职责与时序

本轮新增两张图，复用已有 Qwen 工具时序图；均为应用执行自定义函数的路径，不涵盖供应商托管 MCP。

| 图 | 参与者 | 请求 | 回传 | 续答 |
|---|---|---|---|---|
| 已有 Qwen 图 | 应用、Qwen、业务服务 | function_call_arguments.done | function_call_output + call_id + output | 应用发送 response.create |
| 05 Doubao | 应用、Seeduplex、业务服务 | function_call_arguments.done 的 items | items 中 role=tool、call_id、content | 收齐该批结果后模型续答 |
| 06 OpenAI | 应用、OpenAI Realtime、业务服务 | 从 response.done.output 取得 function_call | function_call_output + call_id + output | 应用发送 response.create |

共同方向：模型 → 应用（请求）；应用 → 业务（执行）；业务 → 应用（结果）；应用 → 模型（回传）；模型 → 应用（回答）。应用校验参数、权限与执行条件。长字段只在对应消息行出现。
