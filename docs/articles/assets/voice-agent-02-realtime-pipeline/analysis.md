# 配图分析与版本记录

- 写作规则：HuangJingwang/practical-tech-writing，7671ad9b80c39133a10b0b68192b6ddee5b54e62。
- Visual IP：yangchuansheng/visual-ip-illustrations，30a9d4e05124fda05356acb679fa2989ed5cb51c。
- 结构图：baoyu-infographic 1.117.4，craft-handmade，中文，内置 imagegen。
- 读者：理解后端调用、初次接触实时语音编排的工程师。
- 主线：一次唤醒进入交互，输入与输出在多轮中重复，工具由应用执行。
- 事实来源：正文参考资料、已核对的 Mina 实现；不画测量数据。

## 图的职责与布置

| 图 | 位置 | 布局与画幅 | 读者应理解的关系 |
|---|---|---|---|
| 01-pipeline-craft | 接入架构之后 | structural-breakdown，4:3 | 客户端、应用、模型、业务的职责与工具循环 |
| 02-pause-is-not-end | VAD 与轮次检测之间 | Tom 概念隐喻，16:9 | 停顿不等于说完，提前截断会丢条件 |
| 03-tool-sequence-craft | 工具结果续答 | linear-progression / 三方时序，3:4 | 应用执行工具，关联结果，并显式触发 Qwen 续答 |
| 04-followup-context | 多轮上下文 | Tom 概念隐喻，16:9 | 追问必须关联上一轮确定的对象 |

Tom 角色按用户写作 skill 的配置采用，动作分别为阻止剪断、系线关联；状态分别为 focused、focused。每张仅两个主要道具。路由维护状态 gated-authorized，来源与边界记录见所安装 visual-ip-illustrations/references/ips/tom/rights.md；该状态不表示版权方授权。本次是用户文章配图，不向上游公开样例目录发布。

## 交付与检查

保存完整提示词和原始位图。旧 SVG 仅保留为历史资产，当前正文切换到新图。

本轮检查结果：

- 链路图为 1448 × 1086，工具时序图为 1086 × 1448；两张 Tom 插图均为 1672 × 941。
- 已逐图检查调用箭头、`call_id`、Qwen 显式续答步骤及拒绝／超时结果路径，未发现与正文冲突。
- Tom 的动作分别对应保留未完成表达、关联追问对象，中文标签与正文概念一致。
- Markdown 渲染后四张图片均加载成功，保持原始比例；列表、引用、表格与代码块正常解析。
- 正文相对链接全部有效，三段 JSON 示例及其中嵌套的 JSON 字符串均通过解析。
