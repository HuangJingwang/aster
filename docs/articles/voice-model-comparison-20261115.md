本期研究区间为 **2026 年 11 月 1—15 日**，数据查询日为 11 月 15 日。对照上期留存快照，Artificial Analysis 的 47 个模型配置与 Speech Agent Arena 的 30 个条目没有增减；任务完成率、首音、成本和真人偏好的可核对数值也没有变化。本期增量主要是新候选模型、接口开放范围和框架支持。下文分别记录。

## 同模型较上期变化

下表只列几组代表配置。τ-Voice 任务完成率，单位为 %，越高越好；两期查询日分别为 **11 月 1 日、11 月 15 日**，来源均为 [AA Speech to Speech](https://artificialanalysis.ai/speech-to-speech)。

表内简写配置：Phonic 1 为 High；GPT-Live-1 为 Astra medium；Gemini 3.8 为 Live Extended Thinking High；Qwen 3.0 为 Audio Realtime Plus。

| 模型／配置 | 上期 | 本期 | 变化 |
| --- | ---: | ---: | --- |
| Phonic 1 | 79.9 | 79.9 | — 持平 |
| GPT-Live-1 | 74.5 | 74.5 | — 持平 |
| Grok Voice 3.0 | 71.6 | 71.6 | — 持平 |
| Gemini 3.8 | 68.6 | 68.6 | — 持平 |
| Qwen 3.0 | 54.6 | 54.6 | — 持平 |

“持平”表示公开精度下的值相同。榜单没有给出两次独立重测的证明，不能由此判断模型在这两周完全没有变化。本期没有可确认的改善或退步，因此不添加涨跌箭头。

**语音推理列需要单独处理。** 上期 CSV 多以整数保存，这次页面保留一位小数，例如 Qwen Audio 3.0 Realtime Plus 为 99 → 99.2，StepAudio 3 Realtime 为 100 → 99.7。它们都与上期取整值相容，暂记为“精度不一致，不比较”，不能写成提升 0.2 或下降 0.3 个百分点。原快照保留，本期附件保存完整显示精度。

[Arena](https://artificialanalysis.ai/speech-to-speech/arena) 的 30 项 Elo、区间、样本数与任务成功率也与上期一致。Cartesia Managed Agents 仍为 1111 Elo（95% 区间 1083–1140，685 次出场）。完整 Agent 服务与基础模型继续按各自配置识别，未把同名系列合并统计。

Qwen Audio 3.0 Realtime Plus 的速度与成本也保持原值，来源与查询日期同上：

| 指标（越低越好） | 上期 | 本期 | 变化 |
| --- | ---: | ---: | --- |
| 首音（s） | 1.54 | 1.54 | — 持平 |
| 成本（美元／输入小时） | 4.42 | 4.42 | — 持平 |

成本单位为美元／输入音频小时，按固定 40 题 Big Bench Audio 子集折算，包含该测试的多类计费项。它适合比较同口径的测试开销；业务通话账单仍取决于双方发言时长、输出长度与工具使用。来源中的 $0.00 原样保留在附件，费用含义未确认，不据此标注免费。

## 新增观察：Higgs Realtime Duplex

Boson AI 于 **11 月 5 日**公布 Higgs Realtime Duplex，前台为 45B MoE，可在对话期间运行工具和后台推理。官方采用 160 ms 音视频分块；这个数是处理粒度，公开文中没有把它作为端到端接话延迟。截至本次查询，新 Duplex API 仍在候补名单阶段，当前可用的 Higgs Realtime 是另一个版本。[官方发布](https://www.boson.ai/blog/higgs-realtime-duplex)

下面摘录 Boson 发布表中的同指标对照，均为百分数、越高越好。Higgs 为厂商自测，其他模型成绩引用公开报告／榜单，官方称复现了其中超过一半，但未逐格注明。因此，这张表独立于前面的 AA 快照。

| 模型／配置 | BBA 准确率 ↑ | τ-Voice pass@1 ↑ |
| --- | ---: | ---: |
| Higgs Duplex | 98.9 | 69.8 |
| GPT-Live-1 | 90 | 74.5 |
| Gemini 3.8 | 98 | 68.6 |

BBA 指 Big Bench Audio；GPT-Live-1 为 Astra medium，Gemini 3.8 为 Live Extended Thinking High。Higgs 的语音推理成绩较高，任务完成率仍低于这组 GPT-Live 配置。选型上可以增加一个候选，现有 AA 中旧版 Higgs Realtime 的 18.6% 任务成绩不能拿来计算新版本的环比；160 ms 分块也不足以支持“比某 API 接话快”的结论。

## 可部署模型：Sophon 的速度与表达取舍

本期新增观察 Sophon-Realtime v1。官方模型卡列出共享 32B 主模型的 Tag、Flash、E2E 三种语音输出配置。以下均为作者自测；首音为单用户条件，部署建议为一张 80 GB GPU，完整硬件型号与跨地区网络条件未在该表给出。[模型卡与测试说明](https://huggingface.co/adventists-ai/Sophon-Realtime-v1)

| 语音配置 | 首音（s）↓ | 中文 F1 ↑ | 英文 F1 ↑ |
| --- | ---: | ---: | ---: |
| Tag | 约 0.6 | 0.86 | 0.80 |
| Flash | 0.31 | 0.77 | 0.63 |
| E2E | 约 0.25 | 0.85 | 0.75 |

NVV-SuperBench 测的是笑、叹气、呼吸等声音是否按要求出现，采用官方脚本、每类 50 项、Gemini 3 Flash 判分。它可以衡量声音表达的实现情况，中文真人偏好仍需另测。Tag 的表达分数较高，Flash 牺牲部分表达成绩换取更短首音；E2E 在这组自测中兼顾两项，跨服务的延迟排名还缺统一测试。

作者另报 Full-Duplex-Bench v3 工具调用 pass@1 为 48%，但注明取多次运行中的最好成绩。这与 AA 的 τ-Voice 平均成绩不同，暂不放入统一任务榜，也不计算“超过某模型多少”。

## 已有接口与框架的变化

- **OpenAI：** 11 月 2 日，Live API 的出站 SIP 呼叫向所有组织开放。这是电话接入范围变化，本期 AA 分数没有相应变化。[API 更新日志](https://developers.openai.com/api/docs/changelog)
- **ElevenLabs：** 11 月 2 日，Eleven Realtime 完成全工作区开放；11 月 9 日新增 Scribe v3 Live。官方称后者在 73 种语言 FLEURS 上的语义词错误率较 v2 Realtime 相对降低 44%，并加入轮次预测。它属于实时转写组件，接话改善还取决于整套 Agent 的轮次与播放策略。[11 月 2 日更新](https://elevenlabs.io/docs/changelog/2026/11/2) · [11 月 9 日更新](https://elevenlabs.io/docs/changelog/2026/11/9)
- **Qwen：** 11 月 10 日发布 qwen-audio-agent v2.1.0，增加 Audio 3.1 Realtime 接入和运行中任务更新等功能。模型发布页将 `qwen-audio-3.1-realtime-flash` 记在 10 月 27 日，框架更新日期与模型日期分别记录。[框架记录](https://github.com/QwenAudio/qwen-audio-agent) · [模型发布记录](https://docs.qwencloud.com/changelog/models)

厂商目录也比榜单覆盖得更快。例如 Amazon Nova 2.5 Sonic 的官方发布日期为 10 月 5 日，而当前 AA 表仍列 Nova 2.0 Sonic（Mar 2026）。2.5 的接口资料可以用于接入准备，2.0 的成绩继续归属 2.0。[AWS 模型卡](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-2-5-sonic.html)

## 中文与打断评测的缺口

本期核验的资料仍未提供一组同时覆盖豆包当前接口、Qwen 当前版本与 OpenAI 当前配置的中文接话、停声、偏好完整对照。[DuplexAct-Bench](https://arxiv.org/html/2609.39446) 覆盖中英双语和 12 个系统，适合观察主动发言、保持安静、打断等行为；它的版本集合与当前商业接口并不完全重合。Sophon 补充的中文非语言发声成绩也不能填补这个缺口。

本期榜单没有提供新的换型依据。新增候选可以进入小规模接入测试；SIP、框架、转写组件的更新，则按实际使用环节评估。完整型号、来源范围与缺失项留在附件，下一期继续使用本次快照对照。

## 数据附件

- [本期快照说明与厂商核验范围](/downloads/voice-models/2026-11-15/README.md)
- [47 个模型配置 CSV](/downloads/voice-models/2026-11-15/speech-to-speech.csv) · [30 个真人评测条目 CSV](/downloads/voice-models/2026-11-15/speech-agent-arena.csv)
- [逐项变化记录](/downloads/voice-models/2026-11-15/changes.csv) · [新增观察与自测数据](/downloads/voice-models/2026-11-15/supplemental.json)
- [原表提取记录](/downloads/voice-models/2026-11-15/source-tables.json) · [上期快照](/downloads/voice-models/2026-11-01/README.md)
