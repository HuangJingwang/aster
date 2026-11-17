Use case: infographic-diagram.
Redraw the supplied memory diagram for a Chinese technical blog. Keep ONLY its craft-handmade visual language, not its old layout or content. New image aspect ratio 4:5 portrait, high-resolution crisp Chinese text, generous whitespace, large readable labels at a blog column width of 760px.

Style: warm pale cream paper #FFF8F0 with subtle texture, softly torn paper cards, very shallow paper shadows, charcoal clean hand-drawn outlines and legible Chinese handwriting. Muted blue for input/model cards, apricot for application records, sage green for audio/output. No mascots, photographs, gradients, elaborate decorations, tiny print, English filler, or watermark.

Learning goal: make clear who writes new state, when the application reads it, how the frontend model receives it, and who writes playback status back. This is an application-design illustration, not an automatic framework feature or a database pushing events itself.

Title exactly: “新状态怎样进入下一轮对话”
Small subtitle exactly: “应用设计示意”

Use a single top-to-bottom process with FIVE numbered bands. A clear thin return arrow on the far right runs from band 5 to the records card in band 1; label it “供后续对话读取”. All arrows have visible arrowheads, never cross text. Keep diagram content precisely as below, no extra concepts.

BAND 1: orange heading “1  应用更新任务记录”.
Two small parallel incoming cards (not connected to each other):
“用户补充要求” with sublabel “更新要求版本”
“后台返回工具结果” with sublabel “保存提案 ID、结果及所属版本”
Both arrows point into a wide orange card “任务记录” with smaller labels “要求版本 · 执行结果 · 交付状态”.
The two sources are independent update events, NOT a claim they must happen in that order.

BAND 2: blue heading “2  应用读取并组装输入”.
Connect task-record card to this band with downward arrow labeled “模型响应前读取”.
Wide blue card containing two lines:
“近期对话 + 最新任务状态”
“+ 当前版本的结果引用”
Beside the card a small document icon with label “对话历史”, with an arrow INTO the card. No automatic database-to-model link.

BAND 3: blue heading “3  适配层送入前台模型”.
Two equal alternative cards, side by side, branching from assembled input:
Left: “普通请求” / “随下一次模型请求发送”
Right: “Realtime 会话” / “通过上下文更新送入”
Both converge downward into a single blue card “前台模型”.
These are alternative integration routes, not consecutive steps.

BAND 4: sage heading “4  前台组织回复并播报”.
Down arrow from frontend model to a simple speaker icon and sage card reading “回复 → 语音输出”.
Keep this band compact.

BAND 5: orange heading “5  输出侧回写交付状态”.
Down arrow labeled “播放事件”.
Two compact side-by-side status chips: “播放完成” and “被打断”.
Below them a single orange card “记录实际交付状态”.
From this card draw the right-side return arrow into BAND 1's “任务记录”, label “供后续对话读取”. The return arrow represents application state writeback, not automatic model learning or replay.
No long-term memory/preferences or persistence boxes in this image. Do not imply speech interruption cancels the business task. Do not draw a compulsory background model call for every frontend turn.

All quoted Chinese labels must be accurate and fully visible. Preserve generous margins. Use hierarchy to make the five actions easy to follow without large decorative banner occupying the page.
