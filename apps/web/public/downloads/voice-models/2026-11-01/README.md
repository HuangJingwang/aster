# 文章数据记录

对应文章：[2026 年 10 月 Voice 模型对比](https://www.asterh.me/posts/voice-model-comparison-202610)。

正文摘选用于分析的配置；全部表格、补充模型、历史中文评测与原始参考保留在 [完整评测记录](benchmark-details.md)。

两份 CSV 记录 2026-11-01 查询的官方表格数值，不能当作 2026-10-31 的存档。每行保留查询日期和来源 URL。空字段表示原来源缺失，不填零。

## speech-to-speech.csv

47 个模型配置。`index` 为综合指数；`reasoning`、`dynamics`、`agentic` 为百分数值，分别对应语音推理、交互行为、模拟任务完成。`ttfa` 单位为秒；`cost` 是 AA 的 Big Bench Audio 子集测试成本，单位为美元／输入音频小时，包含该测试的多类计费项，不能当作输入单价或实际电话每小时报价。

`cost` 中的 `0.00` 保留原始显示值，不代表已确认免费。`provider` 使用简称；Grok 对应原表的 SpaceXAI。日期标签 `Aug '25`、`Oct '25` 在名称中展开为 `Aug 2025`、`Oct 2025`。

## speech-agent-arena.csv

30 个模型或系统条目。`elo` 为偏好点估计；`ci_low`、`ci_high` 为其 95% 区间。GPT-Realtime-1.5 为固定 1000 的锚点，区间留空。`samples` 为出场样本数，不是独立用户数或任务成功率分母；`success` 为任务成功率的百分数值。

两张表有重叠，不可相加计算独立模型数。CSV 与文章中的显示值已逐项比对来源；不对原榜单内部的取整、测试配置差异或缺失值补作推断。
