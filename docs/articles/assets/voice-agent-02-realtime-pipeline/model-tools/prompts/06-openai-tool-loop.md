Create a Chinese technical-blog infographic, portrait 3:4, layout linear-progression implemented as a three-participant sequence diagram. Topic: OpenAI Realtime WebSocket application-owned function-tool loop, not remote MCP. Style: craft-handmade, warm cream paper #FFF8F0, very subtle paper texture, pastel blue application header, sage green model header, pale apricot business header, charcoal hand-drawn thin lines, simple paper-cut shapes and very light shadows. No mascots, photorealism or logos. Plenty of whitespace and highly legible exact protocol labels. Match a warm handmade engineering diagram, not a dashboard.
Title: “OpenAI Realtime：回传结果后显式续答”. Small subtitle: “Function Calling · tools 已注册 · 时间从上到下”.
Three equal columns: LEFT “应用”, CENTER “OpenAI Realtime”, RIGHT “业务服务”, each with a thin vertical dashed lifeline. Every message is on a separate horizontal row, time flows down. Exact ordered messages:
1. From CENTER model to LEFT application, left-pointing arrow: “取得完整工具请求” with small protocol text “response.done” and second line “output[] · function_call · call_id”.
2. A small self-action box on LEFT application: “校验参数与权限”.
3. From LEFT application to RIGHT business, right-pointing arrow crossing model lifeline without connecting to it: “执行业务查询”.
4. From RIGHT business to LEFT application, left-pointing arrow: “返回业务结果”.
5. From LEFT application to CENTER model, right-pointing arrow: “回传工具结果” with protocol text “conversation.item.create” and second line “function_call_output · call_id · output”.
6. From LEFT application to CENTER model, a SEPARATE right-pointing arrow below row 5: “请求续答” with protocol text “response.create”.
7. From CENTER model to LEFT application, left-pointing arrow: “返回回答音频” with protocol text “response.output_audio.delta”.
Bottom small note: “应用执行 function 工具；远程 MCP 不属于此图”.
Critical: arrows never reversed; model does not call business service directly; result return and continuation trigger are TWO separate rows; do not write response.audio.delta (OpenAI uses response.output_audio.delta in this version). Do not add user, RTC, wakeword, invented timing or performance data. Preserve English spelling. Labels must not overlap arrows. Show an uncluttered complete sequence fitting the portrait canvas with generous margins.
