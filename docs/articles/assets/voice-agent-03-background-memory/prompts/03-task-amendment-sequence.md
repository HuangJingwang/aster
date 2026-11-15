Use case: infographic-diagram. Create ONE finished Chinese technical article sequence diagram, portrait 4:5, high-resolution raster. Baoyu linear-progression sequence layout with craft-handmade style. Warm cream #FFF8F0, subtle paper texture, charcoal hand-ink outlines, soft blue / sage green / pale apricot paper cutout headers, shallow paper shadows, ample whitespace. Accurate readable Chinese print, short labels, no mascot/photo/watermark. Prioritize accurate arrows and legibility over decoration. This is a real sequence diagram: four participants horizontally, dotted lifelines downward, TIME FLOWS DOWN. Every message on its own horizontal row. NOT a generic flowchart and NOT a set of numbered boxes.
Title: “后台执行时，对话继续”
Subtitle: “示例：修改发生在业务写入前”
Four column headers left to right: “用户”, “语音前台”, “请求协调”, “业务后台”. Keep these four and only these four participants. Use readable large text and generous row spacing.
Draw exactly these interactions in order from top to bottom. Solid arrows are instructions/input, dashed arrows are replies/results. All arrowheads point to the listed recipient. Do not combine opposing messages into double-headed arrows.
1 用户 → 语音前台: “整理行动项”
2 语音前台 → 请求协调: “委托请求”
3 请求协调 → 业务后台: “任务快照 v1”
4 语音前台 → 用户 (dashed): “收到”
5 用户 → 语音前台: “只要发布相关”
6 语音前台 → 请求协调: “修改要求”
A small apricot note attached to 请求协调 lifeline at this height: “要求版本 → v2”
7 请求协调 → 业务后台: “停止 v1，启动 v2”
Draw a sage execution bar along 业务后台 lifeline from just below row 7 through row 12. Short label on its right: “重新读取资料\n推理与工具调用”. This is continuous business work while progress-query messages occur to the LEFT; progress queries must not touch or restart the business lifeline.
8 用户 → 语音前台: “做到哪了？”
9 语音前台 → 请求协调: “查询状态”
10 请求协调 → 语音前台 (dashed): “当前进度”
11 语音前台 → 用户 (dashed): “还在整理”
12 业务后台 → 请求协调 (dashed): “v2 结果与回执”
Small apricot note beside 请求协调 immediately after row12: “保存结果，核对版本”
13 请求协调 → 语音前台 (dashed): “可交付结果”
14 语音前台 → 用户: “空闲时播报”
15 语音前台 → 请求协调 (dashed): “完整播放回执”
At bottom, a short note spanning columns 语音前台 and 请求协调: “更新交付状态与历史引用”
Footer, small but readable: “已有写入发出时，先等回执再启动新版本”
Do not show unconditional immediate cancellation of sent business writes. The subtitle bounds this diagram to the no-write-in-flight branch. No permanent databases drawn, no claim that all history is durable. Use each exact label once; no extra prose. Leave breathing room around notes; arrows must not cross labels. All Chinese glyphs and v1/v2 correct. Large unambiguous arrowheads, modest title, most space reserved for the sequence.
