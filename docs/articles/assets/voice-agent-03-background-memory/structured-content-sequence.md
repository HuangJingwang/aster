# 时序图结构与依据

- 读者问题：后台执行期间，新输入如何接到任务；状态与交付记录在何时更新。
- 布局：四参与者时序图，时间向下；4:5，中文，craft-handmade，内置 imagegen。
- 参与者：用户、语音前台（含播放运行时）、请求协调、业务后台。
- 正常分支：受理生成 v1 快照；写入前修改增加为 v2，取消旧执行并启动新版本；查询进度只读取请求状态；v2 完成后核对版本与播报时机；完整播放后更新交付状态与历史引用。
- 保留边界：图仅画没有在途写入的修改分支。已有写入时先等待回执；结果不确定时停止重规划，在正文解释。
- 源码核对：当前本地 Mina 的 MeetingRequests.start/_amend/_replace/_run/snapshot/mark_delivered，MeetingVoiceRuntime.frontend_messages，TaskRunner.stream_turn_events，播放回执处理。
- 图为简化协作时序，不代表各角色各占一个进程，也不代表所有记忆已持久化。主线是前后台协作；快慢路径只在正文中作类比。
