# 时序图结构与依据

本文图 1 取自 Mina 的在途写入修改测试。沿用中文竖幅手绘布局，三列依次为语音交互、任务执行、业务服务，时间向下。

1. v1 发出创建提案请求。
2. 交互侧受理 v2 的新截止时间，执行侧停止 v1 的后续步骤。
3. 业务服务交回 v1 的创建回执，标明提案 p1。
4. 执行侧读取并修改 p1，待业务服务确认，向交互侧返回 v2 结果。

依据为 `test_amend_inflight_write_collects_receipt_before_new_plan`、`MeetingRequests._amend` 和 `MeetingRequests._replace`。图中合并了针对 p1 的读取与修改，测试分别断言了两次调用。结果未知的处理见正文。
