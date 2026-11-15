# Voice 模型对比快照：2026-11-15

研究区间：2026-11-01—2026-11-15（Asia/Shanghai）。[上期快照](../2026-11-01/README.md)的查询日期为 11 月 1 日，具体时间未记录，不补造时间戳。

本次重新读取 AA 原网页 HTML 并解析表格，保存 47 个配置和 30 个 Arena 条目。没有复制旧 CSV 后改日期。查询时间保留 UTC 偏移；`source-tables.json` 保存原始单元格、页面文件 SHA-256 与查询时间。原 HTML 仅在研究工作目录留存，不作为整个网页的公开镜像。

## 文件与口径

- [speech-to-speech.csv](speech-to-speech.csv)：47 个配置，保留原提供方、版本、推理档位。index 单位为分；reasoning、dynamics、agentic、success 为百分数；elo 为 Elo；ttfa 为秒。
- cost 为固定 40 题 Big Bench Audio 子集成本，按输入音频时长折算成 USD/input_audio_hour，包含音频输入/输出、文本输入/输出及单独暴露的思考 token，排除缓存折扣及工具费用。input_price/output_price 分别为 USD/音频输入小时、USD/音频输出小时，不能混为 cost。
- [speech-agent-arena.csv](speech-agent-arena.csv)：Elo 及其 95% 区间、出场次数、TSR 及其 95% 区间。出场次数不是独立用户数，也不是 TSR 分母；GPT-Realtime-1.5 为 1000 Elo 固定锚点。
- [changes.csv](changes.csv)：两期值、引用、查询日期/已知时间、稳定记录标识、单位、差值、方向、样本/区间及可比性。空值不填零。
- [source-tables.json](source-tables.json)：重新获取的原表单元格，含另外的级联服务配置表。
- [identity-map.json](identity-map.json)：每个榜单条目的名字映射；仅规范括号、标点、年份展开及厂商简称，不合并新旧版本。
- [supplemental.json](supplemental.json)：Higgs Duplex 与 Sophon 的公开自测数据，单独注明条件。新观察不等于本期发布；没有上期值，不计算环比。
- [sources.json](sources.json)：21 项来源/厂商核验记录，记录访问不足与未确认线索；[manifest.json](manifest.json) 保存比较规则。
- [verify-snapshot.py](verify-snapshot.py)：用 Python 标准库复核快照与差值。下载本期目录和相邻上期目录后运行。

## 本期比较结论

AA 47 个配置及 Arena 30 项都能匹配到上期条目。变化记录共 448 行：308 项公开值持平、44 项推理分数精度不一致、76 项缺值、4 项零成本含义未确认、16 项新增自测观察。持平项包括样本与区间字段，不等于 308 个独立模型或测试。

推理列的上期 CSV 以整数保存，本期原表保留小数。39 项显示不同，但都与旧值的整数取整相容；整列暂不算涨跌，不补造旧期小数，也不更改历史文章。任务、首音、成本和 Arena 可核对值相同；无法据此推断背后发生了新一轮测试。

只有公开值相同且有效的指标记录零差值。未披露的精确模型快照、托管地区、测试环境不猜测；未来出现非零差异时必须先核验身份和口径。数据方向与优劣方向分别记录。相对变化单位为 %，成功率绝对变化应解释为百分点；本期没有可确认的上升或下降。

AA 的 τ-Voice 通常平均三次运行；当前页面注记 Astra medium、Sol low、GPT-Realtime-2 Minimal 为一次，GPT-Realtime-2.1 High 为两次。Arena 区间相互重叠时不据点估计宣称显著优劣。AA 没有单列中文成绩；未列某个模型不表示其能力较差。

Google、OpenAI、Qwen、豆包、Grok、Amazon、ElevenLabs、Cartesia、StepFun、MiniCPM、Boson、Sophon 等的核验范围详见 sources.json。腾讯 Hy Realtime 仅取得二手发布线索，LiquidCodec 原文打开失败，均不发表未核实的性能数字。论文、厂商自测、API 发布和完整 Agent 服务保持各自归属。
