# 2026 年 10 月 Voice 模型：完整评测记录

本文汇总语音对话模型与语音 Agent 服务的公开评测，比较语音推理、任务完成、对话交互、真人偏好、响应速度和使用成本。覆盖商业 API、托管语音 Agent，以及有公开研究或部署资料的语音模型。

本文中的 Voice 指接受语音输入并提供语音回复的对话系统。单独的语音识别（ASR）、语音合成（TTS）、音乐生成模型不纳入同一排名；它们是独立的产品类别，需要使用各自的测试集。

**时间说明：本文以 2026 年 10 月为观察月份，资料核对日期为 2026 年 11 月 1 日。动态榜单采用核对当日的数据，无法据此还原 10 月 31 日的历史成绩。** 论文和厂商公告按各自发布日期引用，不同表格的实验时间可能不同。

## 1. 统计范围与数据来源

定量部分保留 Artificial Analysis 汇总表中可读取的全部 47 个配置，以及 Speech Agent Arena 的全部 30 个条目，两者有重叠。另补充未出现在这些表中的语音模型和研究结果。这一范围覆盖所选公开来源，不等于穷尽市场上的私有部署、地区版本和企业内部模型。

| 来源 | 性质 | 本文采用的数据 |
| --- | --- | --- |
| [Artificial Analysis Speech to Speech](https://artificialanalysis.ai/speech-to-speech) | 第三方评测，动态页面 | 综合指数、语音推理、交互、模拟任务、首音、成本 |
| [Speech Agent Arena](https://artificialanalysis.ai/speech-to-speech/arena) | 真人盲测与任务检查，动态页面 | 偏好 Elo、置信区间、样本数、任务成功率 |
| [DuplexAct-Bench](https://arxiv.org/abs/2609.39446) | 研究基准，2026-09-30 发布 | 中英双语交互行为测试 |
| [Qwen Audio 3.1 技术报告](https://arxiv.org/abs/2609.25176) | 厂商自测，2026-09-24 修订 | 尚未被主榜完整覆盖的版本、接话与打断数据 |
| [AGI-Eval 语音交互评测](https://cloud.tencent.com/developer/article/2534525) | 真人产品评测，2025-06-25 发布 | 旧版中文产品自然流畅度，单独作为历史资料 |

表中“—”表示该来源未给出成绩，不表示零分、不支持该功能或无法使用。模型名称中的 High、Minimal、Mini 等配置分别保留。不同测试中的名称无法确认对应时，不自动合并。

## 2. 模型与产品类别

语音输入和语音输出相同，并不意味着内部实现相同。单一语音模型、多个模型组成的级联系统，以及包含工具和业务流程的托管 Agent，都可能以一个 API 对外提供服务。

| 类别 | 本文覆盖的模型或系列 | 比较时需保留的信息 |
| --- | --- | --- |
| 商业语音／多模态接口 | OpenAI GPT-Live、GPT-Realtime、GPT-4o Audio；Google Gemini Live／Native Audio；Grok Voice；Qwen Audio Realtime／Omni；Amazon Nova Sonic；Phonic 1；StepAudio；Higgs Realtime；Deepslate Opal | 具体版本、推理配置、服务端参数、API 地区 |
| 完整语音 Agent 服务 | Cartesia Managed Agents、ElevenLabs Agents、Eleven Realtime、Deepgram Voice Agent、Inworld Realtime | 组成模型、工具配置、默认调度和轮次策略 |
| 其他被测模型与研究系统 | Moshi、PersonaPlex、Nemotron Voicechat、Raon SpeechChat、Freeze-Omni、FLM-Audio；以及第 6 节补充模型 | 权重或接口是否可用、运行硬件、量化与推理实现 |

上述类别用于说明评测对象，不按架构推断能力。例如，ElevenLabs 明确说明 Eleven Realtime Mini／Max 使用经过联合优化的级联架构，不能因名称带有 Realtime 就归类为单一原生音频模型。[ElevenLabs 架构说明](https://elevenlabs.io/docs/eleven-agents/guides/openai-realtime-compatibility)

## 3. 语音推理、任务完成与综合指数

以下按厂商及版本组织，未按单一总分重新排列。名称沿用来源，展示精度也沿用汇总表。

语音推理采用 Big Bench Audio，交互行为采用 FDB 子集，模拟任务完成采用 AA 实现的 τ-Voice。综合指数由语音推理、模拟任务完成、Arena 偏好、Arena 任务成功率四项等权构成；交互分、速度和价格不直接进入综合指数。[计分方法](https://artificialanalysis.ai/methodology/speech-to-speech-benchmarking)

| 模型／配置 | 综合指数 ↑ | 语音推理 ↑ | 交互行为 ↑ | 模拟任务完成 ↑ |
| --- | --- | --- | --- | --- |
| Qwen Audio 3.0 Realtime Plus | 69.5 | 99% | 98.4% | 54.6% |
| Qwen Audio 3.0 Realtime Flash | 67.7 | 96% | 96.9% | 35.9% |
| Qwen3.5 Omni Plus Realtime | — | 99% | — | — |
| Qwen3.5 Omni Flash Realtime | — | 59% | — | — |
| Qwen3 Omni Flash | — | 59% | 72.7% | — |
| Qwen3 Omni Realtime | — | 57% | — | — |
| Nova 2.0 Sonic (Mar 2026) | — | 88% | — | — |
| Higgs Realtime | — | 69% | 92.8% | 18.6% |
| FLM-Audio | — | 16% | 62.0% | — |
| Deepslate Opal | — | 85% | 85.7% | 17.5% |
| Eleven Realtime v1 Max | 77.3 | 99% | 94.1% | 47.6% |
| Eleven Realtime v1 Mini | 64.4 | 76% | 95.8% | 46.8% |
| Gemini 3.8 Live Extended Thinking (High) | 82.6 | 98% | 91.9% | 68.6% |
| Gemini 3.8 Live | 74.5 | 92% | 96.1% | 30.1% |
| Gemini 3.1 Flash Live High | 72.0 | 97% | 74.3% | 37.7% |
| Gemini 3.1 Flash Live Minimal | 64.2 | 71% | 72.3% | 26.2% |
| Gemini 2.5 Flash Native Audio Dialog | — | 69% | — | — |
| Gemini 2.5 Flash Native Audio Dialog Thinking | — | 91% | — | — |
| Gemini 2.5 Flash Native Audio Preview (Dec 2025) | — | — | 44.0% | 22.8% |
| Gemini 2.5 Flash Native Audio Preview (Sep 2025) | — | — | 30.3% | — |
| Raon SpeechChat | — | 58% | 86.2% | — |
| Moshi | — | 4% | 61.0% | — |
| Nemotron Voicechat | — | 27% | 52.9% | — |
| PersonaPlex | — | 19% | 91.0% | — |
| GPT-Live-1 (Astra, medium) | 83.2 | 90% | 94.9% | 74.5% |
| GPT-Live-1 (Sol, low) | 80.1 | 89% | 97.3% | 59.3% |
| GPT-Realtime-2.1 High | 75.2 | 96% | 95.7% | 45.7% |
| GPT-Realtime-2.1 Minimal | 70.7 | 87% | 92.7% | 38.0% |
| GPT-Realtime-2.1 Mini High | — | 75% | 91.7% | 29.4% |
| GPT-Realtime-2.1 Mini Minimal | 54.4 | 63% | 91.8% | 22.5% |
| GPT-Realtime-2 (High) | 73.6 | 97% | 95.3% | 39.8% |
| GPT-Realtime-2 (Medium) | — | 93% | 95.2% | 37.4% |
| GPT-Realtime-2 (Minimal) | 63.3 | 72% | 96.1% | 30.8% |
| GPT-Realtime-1.5 | 70.3 | 81% | 95.7% | 38.8% |
| GPT Realtime (Aug 2025) | 69.1 | 83% | 93.9% | 30.4% |
| GPT Realtime Mini (Oct 2025) | 56.1 | 64% | 95.7% | 15.1% |
| GPT-4o mini Realtime (Dec 2024) | — | 69% | — | — |
| GPT-4o audio chatcompletions | — | 54% | — | — |
| GPT-4o Realtime (Dec 2024) | — | — | 89.8% | 27.9% |
| Phonic 1 (High) | 87.1 | 99% | — | 79.9% |
| Grok Voice 3.0 | 86.9 | 99% | 97.0% | 71.6% |
| Grok Voice 2.0 | 81.3 | 97% | 95.1% | 56.5% |
| Grok Voice 1.0 | 73.7 | 97% | 77.8% | 52.1% |
| Grok Voice Fast 1.0 | — | 93% | 71.6% | 27.4% |
| StepAudio 3 Realtime | — | 100% | 98.9% | — |
| Step-Audio R1.1 (Realtime) | — | 98% | — | — |
| Freeze-Omni | — | 33% | 58.7% | — |

数据来源：[AA 模型汇总表](https://artificialanalysis.ai/speech-to-speech)，2026-11-01 查询。百分比列均为越高越好，不能将不同列视为同一种成功率。

在有综合指数的配置中，Phonic 1 High 为 87.1，Grok Voice 3.0 为 86.9，GPT-Live-1 Astra medium 为 83.2，Gemini 3.8 Live Extended Thinking High 为 82.6。领先项目随指标变化；没有完整四项成绩的模型不产生综合指数。

汇总表采用整数精度展示部分语音推理分数。例如 StepAudio 3 Realtime 在表中为 100%，来源说明中的精确值为 99.7%，不能解释成所有题目均正确。τ-Voice 的重复运行次数也不完全一致：部分配置只有一次或两次结果。综合指数中的 Arena Elo 在首次满足发布条件时冻结，不随实时偏好榜同步变化。

## 4. 响应速度与成本

首音时间（TTFA）表示测试中开始生成音频输出所需的时间。这里采用同一来源的 Big Bench Audio 口径，不换算为真实通话中“用户说完到扬声器响起”的时间。

成本列采用固定测试负载：计入该测试的输入、输出及单独计费的推理等费用，再按输入音频时长归一化。它不是只收取输入音频的单价，也不是一小时实际电话通话的报价。未计入的网络、电话线路、工具调用和自建部署开销仍需另算。[成本与速度方法](https://artificialanalysis.ai/methodology/speech-to-speech-benchmarking)

| 模型／配置 | 首音时间 ↓（秒） | 测试成本 ↓（美元／输入音频小时） |
| --- | --- | --- |
| Qwen Audio 3.0 Realtime Plus | 1.54 | 4.42 |
| Qwen Audio 3.0 Realtime Flash | 1.55 | 4.77 |
| Qwen3.5 Omni Plus Realtime | 2.64 | 0.00* |
| Qwen3.5 Omni Flash Realtime | 0.79 | 0.00* |
| Qwen3 Omni Flash | 4.82 | 1.77 |
| Qwen3 Omni Realtime | 0.88 | 2.26 |
| Nova 2.0 Sonic (Mar 2026) | 1.14 | 4.89 |
| Higgs Realtime | 1.47 | — |
| Deepslate Opal | 0.44 | 6.48 |
| Eleven Realtime v1 Max | 0.57 | 4.80 |
| Eleven Realtime v1 Mini | 0.62 | 4.80 |
| Gemini 3.8 Live Extended Thinking (High) | 1.35 | 3.50 |
| Gemini 3.8 Live | 1.18 | 0.84 |
| Gemini 3.1 Flash Live High | 2.99 | 1.75 |
| Gemini 3.1 Flash Live Minimal | 0.96 | 1.50 |
| Gemini 2.5 Flash Native Audio Dialog | 0.63 | 1.42 |
| Gemini 2.5 Flash Native Audio Dialog Thinking | 3.87 | — |
| Raon SpeechChat | 0.04 | — |
| GPT-Live-1 (Astra, medium) | 1.34 | 5.83 |
| GPT-Live-1 (Sol, low) | 1.24 | 4.47 |
| GPT-Realtime-2.1 High | 1.21 | 10.75 |
| GPT-Realtime-2.1 Minimal | 0.97 | 11.31 |
| GPT-Realtime-2.1 Mini High | 4.28 | 3.45 |
| GPT-Realtime-2.1 Mini Minimal | 0.85 | 4.60 |
| GPT-Realtime-2 (High) | 1.14 | 4.14 |
| GPT-Realtime-2 (Medium) | 1.22 | 3.97 |
| GPT-Realtime-2 (Minimal) | 1.12 | 3.07 |
| GPT-Realtime-1.5 | 0.81 | 11.44 |
| GPT Realtime (Aug 2025) | 0.98 | 11.08 |
| GPT Realtime Mini (Oct 2025) | 0.81 | 3.04 |
| GPT-4o mini Realtime (Dec 2024) | 1.27 | 5.75 |
| GPT-4o audio chatcompletions | 3.38 | 0.00* |
| GPT-4o Realtime (Dec 2024) | 1.49 | 2.04 |
| Phonic 1 (High) | 0.61 | 4.20 |
| Grok Voice 3.0 | 0.81 | 4.80 |
| Grok Voice 2.0 | 0.70 | 4.80 |
| Grok Voice 1.0 | 1.25 | 3.00 |
| Grok Voice Fast 1.0 | 0.78 | 3.00 |
| StepAudio 3 Realtime | 8.83 | — |
| Step-Audio R1.1 (Realtime) | 1.53 | 0.00* |

数据来源：[AA 模型汇总表](https://artificialanalysis.ai/speech-to-speech)，2026-11-01 查询。本表保留至少有一项速度或成本数据的配置；两项均缺失的模型仍在上一表中。

\* 原表显示 0.00，本文保留原值。公开表格无法单独说明这是四舍五入、占位还是计费设置结果，因此不据此认定服务免费，也不将其作为最低价结论。

首音较快和整体能力较高可以同时成立，也可能存在取舍。比较不同推理档位时，应同时保留任务成绩；比较可本地运行的模型时，云端测试速度不能直接换算为个人设备速度。所有数值只对应记录中的测试配置。

## 5. 真人偏好与实际任务成功率

Speech Agent Arena 让参与者在同一场景下分别与两个隐藏身份的系统通话，随后选择整体偏好。任务成功率另行检查符合条件的对话是否完成所需工具调用。[Arena 测试流程](https://artificialanalysis.ai/speech-to-speech/arena/overview)

以下为完整的 30 个条目，按页面当日 Elo 顺序列出。出场样本数不是独立用户人数，也不是任务成功率分母。

| 模型／系统 | 偏好 Elo ↑ | Elo 95% 区间 | 出场样本数 | 任务成功率 ↑ |
| --- | --- | --- | --- | --- |
| Cartesia Managed Agents | 1111 | 1083–1140 | 685 | 91.7% |
| Gemini 3.1 Flash Live Minimal | 1089 | 1064–1114 | 990 | 74.6% |
| Gemini 3.8 Live | 1074 | 1047–1101 | 606 | 93.2% |
| Gemini 3.1 Flash Live High | 1062 | 1037–1086 | 957 | 71.8% |
| Grok Voice 3.0 | 1059 | 1031–1086 | 668 | 94.8% |
| GPT-Live-1 (Sol, low) | 1037 | 1012–1062 | 773 | 90.9% |
| GPT-Live-1 (Astra, medium) | 1027 | 1002–1052 | 736 | 87.4% |
| Phonic 1 (High) | 1012 | 986–1038 | 683 | 92.3% |
| GPT-Realtime-1.5 | 1000 | 固定锚点 | 921 | 85.1% |
| Grok Voice 2.0 | 991 | 966–1016 | 669 | 94.6% |
| Eleven Realtime v1 Max | 990 | 964–1017 | 676 | 87.1% |
| ElevenLabs Agents (Default Cascaded System) | 985 | 961–1010 | 893 | 90.5% |
| Eleven Realtime v1 Mini | 981 | 954–1007 | 661 | 60.3% |
| GPT Realtime (Aug 2025) | 967 | 943–991 | 917 | 89.4% |
| Gemini 3.8 Live Extended Thinking (High) | 966 | 941–990 | 773 | 89.1% |
| Nova 2.0 Sonic (Mar 2026) | 964 | 940–988 | 913 | 57.1% |
| GPT-Realtime-2.1 Minimal | 933 | 909–957 | 932 | 89.4% |
| GPT-Realtime-2.1 High | 931 | 907–955 | 887 | 91.5% |
| GPT Realtime Mini (Oct 2025) | 922 | 898–945 | 962 | 79.6% |
| GPT-Realtime-2 (High) | 920 | 896–944 | 905 | 89.8% |
| GPT-Realtime-2 (Minimal) | 918 | 894–941 | 980 | 84.7% |
| Nova Sonic | 907 | 882–933 | 827 | 57.1% |
| Grok Voice 1.0 | 903 | 877–929 | 864 | 80.7% |
| Deepgram Voice Agent (Default Cascaded System) | 901 | 877–925 | 955 | 73.7% |
| Inworld Realtime (Default Cascaded System) | 884 | 859–908 | 941 | 69.9% |
| Qwen Audio 3.0 Realtime Flash | 858 | 825–892 | 293 | 81.7% |
| Qwen3.5 Omni Plus Realtime | 843 | 818–868 | 942 | 62.0% |
| GPT-Realtime-2.1 Mini Minimal | 840 | 815–864 | 967 | 76.7% |
| Qwen3.5 Omni Flash Realtime | 832 | 808–857 | 969 | 29.1% |
| Qwen Audio 3.0 Realtime Plus | 798 | 762–834 | 316 | 77.8% |

数据来源：[Speech Agent Arena](https://artificialanalysis.ai/speech-to-speech/arena)，2026-11-01 查询。任务成功率也存在抽样不确定性，其区间可在原榜查看。

Cartesia Managed Agents 的偏好点估计最高；Grok Voice 3.0 的任务成功率为表内最高的 94.8%。两项结果衡量不同方面。相邻模型的 Elo 区间常有重叠，因此点估计排序不等于已经证实的严格强弱关系。GPT-Realtime-1.5 的 1000 是标尺锚点。

本表未单列中文成绩，不能直接视为中文对话排名。与厂商发布时引用的 Elo 不一致，也可能来自后续样本累积；比较历史变化需要保存相同日期的快照。

## 6. 未被主榜完整覆盖的模型

公开榜单并未覆盖所有语音产品。下表补充有官方资料的模型，按已核实的能力与材料类型描述；没有同口径分数的条目不补估计值。

| 模型／系列 | 官方资料确认的范围 | 当前比较材料 |
| --- | --- | --- |
| 字节 SeedRealtime | 音视频全双工交互、主动响应、对话时机控制 | 厂商发布与自测；不能与 SeedDuplex 不同版本的成绩互换。[官方介绍](https://seed.bytedance.com/en/seedrealtime) |
| SeedDuplex 1.2.6.1 | Qwen 报告中的字节基线版本 | 有同组延迟与交互结果，见下一表。[报告](https://arxiv.org/html/2609.25176v2) |
| Qwen Audio 3.1 Realtime | 语音对话、工具使用、交互策略 | 厂商报告；缺少本文主榜的完整指标。[报告](https://arxiv.org/abs/2609.25176) |
| MiniCPM-o 4.5 | 9B 实时全双工多模态模型 | 有部署文档及 DuplexAct-Bench 结果。[官方部署说明](https://openbmb.cn/docs/en/guides/minicpm-o/minicpm-o-4.5/deploy) |
| Realtime-Venus Audio／Omni | 两个 9B 模型，配合异步任务执行框架 | 官方模型、框架说明；不套用 MiniCPM 的成绩。[官方仓库](https://github.com/inclusionAI/Realtime-Venus/blob/main/README.md) |
| Tencent Covo-Audio-Chat／Chat-FD | 7B 语音模型及全双工研究变体 | 仓库发布 Chat；Chat-FD 的研究结果不等于两者可用性相同。[官方仓库](https://github.com/Tencent/Covo-Audio) |
| Xiaomi MiMo-Audio | 音频理解、生成与语音任务 | 官方仓库与技术报告，缺少本文主榜完整指标。[官方仓库](https://github.com/XiaomiMiMo/MiMo-Audio) |
| Moonshot Kimi-Audio | 音频理解、生成、语音对话 | 已发布权重与评测工具；缺少同口径完整指标。[官方仓库](https://github.com/MoonshotAI/Kimi-Audio) |
| GLM-4-Voice | 中英语音对话、语气与表达控制 | 公开论文；流式语音输出不自动等于完整全双工能力。[论文](https://arxiv.org/abs/2412.02612) |
| Fun-Audio-Chat | 8B 语音交互模型 | 官方代码、模型与评测；不等同于 Qwen Audio 商业接口。[官方仓库](https://github.com/QwenAudio/Fun-Audio-Chat) |
| SALMONN-omni | 全双工语音理解与生成研究 | 论文及演示；不据此推定商业 API 或完整权重已发布。[论文](https://arxiv.org/abs/2505.17060) |
| DuplexOmni | 实时交互与后台推理分离的音视频系统 | 研究报告；与商用服务的配置、部署条件不同。[论文](https://arxiv.org/html/2606.09186) |

Qwen Audio 3.1 报告的 FDB 实验提供以下补充数据。它们属于厂商自测，未单列中文，不能与 AA 的 TTFA 列直接比较；GPT-Realtime-2 默认采用 low-effort 设置。

| 模型 | 接话延迟 ↓（秒） | 打断后停声 ↓（秒） | 打断后响应 ↓（秒） |
| --- | ---: | ---: | ---: |
| GPT-Realtime-2 | 1.799 | 0.383 | 1.872 |
| SeedDuplex 1.2.6.1 | 1.844 | 1.419 | 2.108 |
| Qwen-Audio-3.0-Realtime | 1.539 | 1.041 | 1.9432 |
| Qwen-Audio-3.1-Realtime | 1.921 | 1.116 | 1.954 |

数据来源：[Qwen 报告 Table 10](https://arxiv.org/html/2609.25176v2#S6)。第一列为 FDB v1.0 正常轮次交替，后两列为 v1.5 用户打断，不将三项相加形成总延迟。

## 7. 研究基准中的交互表现

DuplexAct-Bench 对 12 个系统进行双语流式测试。下表完整保留参评系统，展示用户打断行为正确率。该项只对打断发生时系统正在说话的有效试验计分，要求内容与时机同时合格；它不是单纯的音频停止检测率。

| 系统 | 评测覆盖语言 | 用户打断行为正确率 ↑ |
| --- | --- | ---: |
| Freeze-Omni | 英语、中文 | 9.9% |
| MiniCPM-o 4.5 | 英语、中文 | 24.8% |
| Moshi | 英语、中文 | 26.1% |
| PersonaPlex | 英语、中文 | 35.7% |
| VITA-1.5 | 英语 | 8.6% |
| Raon-SpeechChat | 英语 | 31.2% |
| DuplexCascade | 英语 | 7.3% |
| Nemotron 3 VoiceChat | 英语 | 10.0% |
| Qwen3.5-Omni | 英语、中文 | 39.8% |
| Grok Voice | 英语、中文 | 9.8% |
| GPT Realtime 2.1 | 英语、中文 | 47.6% |
| Gemini 2.5 Native Audio | 英语、中文 | 42.4% |

数据来源：[DuplexAct-Bench Table 2](https://arxiv.org/html/2609.39446)。语言列表示论文的评测覆盖，不是厂商支持语言清单。各系统的覆盖范围不同，表中也未分离中文成绩。Grok Voice、Qwen3.5-Omni 等名称保持论文原样，不替换成其他榜单的最新版本。

论文还测试抗误打断、主动发言、沉默与附和。单项行为成绩不能替代完整会话质量；基于合成场景的自动测试，也不等同于真人使用偏好。

## 8. 中文评测与历史结果

中文专项数据与通用语音榜单分开列示。AGI-Eval 在 2025 年发布的真人产品评测使用三档自然流畅度评分，结果如下。这是一组历史产品数据，不构成 2026 年 10 月最新版排名。

| 产品／模型（当时版本） | 平均自然流畅度 ↑ |
| --- | ---: |
| 阶跃 AI | 0.64 |
| 豆包 | 0.63 |
| GPT-4o | 0.60 |
| Minimax AI | 0.60 |
| 通义 | 0.50 |
| Qwen2.5-Omni | 0.44 |
| Gemini live | 0.41 |
| 文小言 | 0.41 |

来源：[AGI-Eval 原报告](https://cloud.tencent.com/developer/article/2534525)。评测包含 1,624 条对话与 480 名评分用户；0、0.5、1 分分别表示不自然、部分自然、完全自然流畅。分数为平均值，不是胜率。

TELEVAL 则针对中文语音交互的内容可靠性与回应适当性，包括方言、共情和声学线索。它将端到端延迟与全双工能力列为后续扩展方向，因此不用于给上文补齐响应时间。[TELEVAL 论文](https://arxiv.org/html/2507.18061)

## 9. 对比结论

公开评测中，不同指标对应不同的领先配置。综合指数、真人偏好、任务成功率、首音速度和成本之间没有统一的排序，也没有公开证据支持把某个模型概括为所有场景下的最佳选择。

商业 API 与托管 Agent 的结果包含服务和编排影响；本地模型的表现还取决于硬件与推理实现。没有出现在某张榜单，通常只能说明缺少该来源的数据。旧版产品的中文成绩，也不能替代新版本验证。

本文保留各来源的版本、单位和缺失项，供同类模型之间比较。对于需要正式选型的场景，还应在目标语言、网络地区、并发规模和业务工具配置下复测，并将结果与对应的公开基准分别记录。

## 参考

1. [Artificial Analysis：Speech to Speech](https://artificialanalysis.ai/speech-to-speech)
2. [Artificial Analysis：Speech Agent Arena](https://artificialanalysis.ai/speech-to-speech/arena)
3. [Artificial Analysis：评测方法](https://artificialanalysis.ai/methodology/speech-to-speech-benchmarking)
4. [Artificial Analysis：Arena 测试流程](https://artificialanalysis.ai/speech-to-speech/arena/overview)
5. [Qwen Audio 3.1：版本记录](https://arxiv.org/abs/2609.25176)；[全文](https://arxiv.org/html/2609.25176v2)
6. [DuplexAct-Bench：版本记录](https://arxiv.org/abs/2609.39446)；[全文](https://arxiv.org/html/2609.39446)
7. [AGI-Eval：实时语音交互产品评测](https://cloud.tencent.com/developer/article/2534525)
8. [TELEVAL：中文交互评测](https://arxiv.org/html/2507.18061)
9. [ElevenLabs：Realtime 架构说明](https://elevenlabs.io/docs/eleven-agents/guides/openai-realtime-compatibility)
10. [ByteDance SeedRealtime](https://seed.bytedance.com/en/seedrealtime)
11. [MiniCPM-o 4.5：部署文档](https://openbmb.cn/docs/en/guides/minicpm-o/minicpm-o-4.5/deploy)
12. [Realtime-Venus：官方仓库](https://github.com/inclusionAI/Realtime-Venus/blob/main/README.md)
13. [Covo-Audio：官方仓库](https://github.com/Tencent/Covo-Audio)
14. [MiMo-Audio：官方仓库](https://github.com/XiaomiMiMo/MiMo-Audio)
15. [Kimi-Audio：官方仓库](https://github.com/MoonshotAI/Kimi-Audio)
16. [GLM-4-Voice：论文](https://arxiv.org/abs/2412.02612)
17. [Fun-Audio-Chat：官方仓库](https://github.com/QwenAudio/Fun-Audio-Chat)
18. [SALMONN-omni：论文](https://arxiv.org/abs/2505.17060)
19. [DuplexOmni：论文](https://arxiv.org/html/2606.09186)
