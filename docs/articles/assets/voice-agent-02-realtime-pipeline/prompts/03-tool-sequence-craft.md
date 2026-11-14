Create one Chinese technical sequence infographic, portrait 3:4, approximately 1536 x 2048. baoyu-infographic layout linear-progression adapted to a true three-participant sequence diagram; style craft-handmade. Warm cream #FFF8F0, very subtle paper texture, muted blue, sage and apricot header cards, slightly irregular charcoal pen lines, light paper accents, generous whitespace. No mascot, no screenshot, no polished vector appearance.
Title exactly "一次 Qwen 工具调用".
Subtitle exactly "已唤醒、已准入；时间从上到下".
Three columns left to right with dashed vertical lifelines: "应用 / Agent", "Qwen Realtime", "业务服务". Every message occupies a separate horizontal row. Precisely these rows top to bottom:
1 Application -> Qwen, label "response.create", smaller explanation "请求响应".
2 Qwen -> Application, label "完整工具参数", smaller explanation "name · arguments · call_id".
3 A note anchored on Application lifeline, "校验参数、权限与轮次".
4 Application -> Business, label "执行查询", with a small nearby condition "校验通过".
5 Business -> Application dashed return, label "结果 / 错误".
6 A note on Application, "拒绝或超时：构造对应结果".
7 Application -> Qwen, label "conversation.item.create", smaller explanation "function_call_output · 同一 call_id".
8 Application -> Qwen, label "response.create", smaller explanation "显式触发续答".
9 Qwen -> Application dashed return, label "response.audio.delta", smaller explanation "交付音频，进入播放".
Rows 2 through 8 enclosed in a thin hand-drawn grouping frame labeled "需要工具时；可继续调用". Row 1 and row 9 outside the frame. Exact arrow direction is critical: model never calls business directly. Rejection note means denied calls skip business query and still return a matched result; do not draw an unconditional rejection after success.
Footer exactly "直接回答跳过工具环节；工具结果必须匹配 call_id".
Keep labels short and exact. Leave lots of vertical separation, no arrows through text. This image is Qwen only, do not show Doubao automatic continuation, timings or measurements. Render a clean technical sequence with warm paper craft aesthetic, not a dense poster.
