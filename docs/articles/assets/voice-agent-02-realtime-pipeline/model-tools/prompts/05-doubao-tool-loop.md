Create a Chinese technical-blog infographic, portrait 3:4, layout linear-progression implemented as a three-participant sequence diagram. Topic: exact application-owned function-tool loop of Doubao Seeduplex (not the newer SeedRealtime App model). Style: craft-handmade, warm cream paper #FFF8F0, very subtle paper texture, pastel blue application header, sage green model header, pale apricot business header, charcoal hand-drawn thin lines, simple paper-cut shapes and very light shadows. No mascots, photorealism or logos. Plenty of whitespace and highly legible exact protocol labels. It should match a warm handmade engineering diagram, not a dashboard.
Title: “豆包 Seeduplex：工具结果触发续答”. Small subtitle: “Function Calling · tools 已注册 · 时间从上到下”.
Three equal columns with headers left “应用”, center “Seeduplex”, right “业务服务”, each with a thin vertical dashed lifeline. Every message is on its own horizontal row. Exact ordered messages:
1. From CENTER model to LEFT application, left-pointing arrow: “请求工具” with small protocol text “response.function_call_arguments.done” and second line “items · call_id”.
2. A small self-action box on LEFT application: “校验参数与权限”.
3. From LEFT application to RIGHT business, right-pointing arrow crossing model lifeline without connecting to it: “执行业务查询”.
4. From RIGHT business to LEFT application, left-pointing arrow: “返回业务结果”.
5. From LEFT application to CENTER model, right-pointing arrow: “回传该批结果” with small protocol text “conversation.item.create” and second line “items · role=tool · call_id · content”.
6. A green self-action box on CENTER model only: “收齐结果 → 自动续答”.
7. From CENTER model to LEFT application, left-pointing arrow: “返回回答音频” with small protocol text “response.output_audio.delta”.
Bottom small note: “结果按 call_id 配对；本链路不发送 response.create”.
Critical: arrows never reversed; model does not call the business service directly; step 5 carries results from app to model; automatic continuation is on model lifeline, there is NO response.create request arrow. Do not add a user, RTC, wakeword, source logos, invented timing or performance data. Preserve all English field spelling. Labels must not overlap arrows. Show an uncluttered complete sequence fitting the portrait canvas with generous margins.
