"""Generate editable SVG sources; export PNGs with the repository's sharp package.

Run from the repository root:
  python3 docs/articles/assets/voice-agent-02-realtime-pipeline/render_diagrams.py
"""
from pathlib import Path
from html import escape
import subprocess

OUT = Path(__file__).resolve().parent
INK, MUTED, LINE = '#18283f', '#53657a', '#52647b'
BLUE, PURPLE, ORANGE, GRAY = '#eaf3ff', '#f1edff', '#fff3e3', '#f0f3f7'


class SVG:
    def __init__(self, width, height, title, description):
        self.parts = [f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="{LINE}"/></marker></defs>
<rect width="100%" height="100%" fill="#ffffff"/>
<g font-family="PingFang SC, Noto Sans CJK SC, Microsoft YaHei, sans-serif" fill="{INK}">''']

    def text(self, x, y, content, size=22, anchor='start', color=INK, weight=400, mono=False):
        family = ' font-family="SFMono-Regular, Consolas, monospace"' if mono else ''
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{color}" font-weight="{weight}"{family}>{escape(content)}</text>')

    def rect(self, x, y, w, h, fill, stroke='#c8d4e1', radius=12):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" fill="{fill}" stroke="{stroke}" stroke-width="1.7"/>')

    def path(self, d, dashed=False, arrow=True, color=LINE, width=2.2):
        dash = ' stroke-dasharray="8 6"' if dashed else ''
        end = ' marker-end="url(#arrow)"' if arrow else ''
        self.parts.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"{dash}{end}/>')

    def node(self, x, y, w, h, title, subtitle, fill):
        self.rect(x, y, w, h, fill)
        self.text(x+w/2, y+47, title, 26, 'middle', weight=600)
        self.text(x+w/2, y+83, subtitle, 20, 'middle', color=MUTED)

    def write(self, name):
        target = OUT / f'{name}.svg'
        target.write_text('\n'.join(self.parts + ['</g></svg>']), encoding='utf-8')
        subprocess.run(['node', '-e', "const sharp=require('sharp'); sharp(process.argv[1],{density:144}).png().toFile(process.argv[2]).catch(e=>{console.error(e);process.exit(1)});", str(target), str(target.with_suffix('.png'))], check=True)


flow = SVG(1440, 840, '语音请求如何经过模型与工具', '客户端音频经 RTC 到达应用，在 Agent 本地通过唤醒门控后输入 Qwen。应用控制响应，Qwen 可直接返回音频，也可请求应用执行工具；工具调用业务服务后将结果回传模型。')
flow.text(50, 65, '语音请求如何经过模型与工具', 36, weight=650)
flow.text(50, 105, '应用经 WebSocket 接入 Qwen 的原生续答路径', 22, color=MUTED)
flow.node(50, 240, 230, 120, '客户端采集', '采集、分帧与上传', GRAY)
flow.node(350, 240, 300, 120, '应用接入与响应控制', '音频适配、唤醒与准入', BLUE)
flow.node(780, 240, 300, 120, 'Qwen Realtime', '语音理解与响应生成', PURPLE)
flow.node(1180, 240, 210, 120, '输出与播放', '下发、缓冲与播放', GRAY)
flow.node(780, 555, 300, 120, '应用工具执行', '参数校验与权限检查', BLUE)
flow.node(1180, 555, 210, 120, '业务服务', '查询日历等数据', ORANGE)
flow.path('M 280 300 L 350 300')
flow.text(315, 282, 'RTC', 19, 'middle')
flow.path('M 650 280 L 780 280')
flow.text(715, 264, '流式音频', 20, 'middle')
flow.path('M 650 335 L 780 335', dashed=True)
flow.text(715, 319, '触发响应', 20, 'middle')
flow.path('M 930 240 L 930 177 L 500 177 L 500 240', dashed=True)
flow.text(715, 161, '轮次事件', 20, 'middle', color=MUTED)
flow.path('M 1080 300 L 1180 300')
flow.text(1130, 282, '音频分块', 19, 'middle')
flow.path('M 860 360 L 860 555')
flow.text(842, 436, '调用请求', 22, 'end')
flow.text(842, 466, '名称、参数、call_id', 19, 'end', color=MUTED)
flow.path('M 1000 555 L 1000 360')
flow.text(1018, 436, '回传结果', 22)
flow.text(1018, 466, '同一 call_id', 19, color=MUTED)
flow.path('M 1080 590 L 1180 590')
flow.text(1130, 574, '业务查询', 19, 'middle')
flow.path('M 1180 650 L 1080 650')
flow.text(1130, 632, '结果', 19, 'middle')
flow.text(50, 430, '直接回答：生成音频后进入播放链路。', 22)
flow.text(50, 466, '工具回答：执行、回传，再生成回答或继续调用。', 22)
flow.rect(50, 535, 620, 140, BLUE)
flow.text(76, 571, '唤醒门控（Mina · Agent 本地 KWS）', 23, weight=600)
flow.text(76, 611, '未命中：继续检测，不向 Realtime 送音频。', 20)
flow.text(76, 644, '命中：绑定发言人，补送缓冲音频，再持续输入。', 20)
flow.rect(50, 730, 1340, 68, '#f8fafc', '#e3e9f0')
flow.path('M 76 764 L 135 764')
flow.text(150, 771, '音频 / 工具数据', 19, color=MUTED)
flow.path('M 390 764 L 449 764', dashed=True)
flow.text(465, 771, '轮次 / 响应控制', 19, color=MUTED)
flow.text(760, 771, '工具执行见第八章，语音输出见第十章', 19, color=MUTED)
flow.write('01-voice-pipeline')

seq = SVG(1440, 1660, '一次 Qwen 工具调用如何完成', '应用配置会话并持续输入音频，轮次准入后触发响应。模型请求工具，应用校验权限，执行查询或构造拒绝结果，按 call_id 回传并请求续答，最后流式播放音频。')
seq.text(50, 60, '一次 Qwen 工具调用如何完成', 36, weight=650)
seq.text(50, 99, '已唤醒的会话 · 应用控制响应的查询示例 · 时间从上到下', 22, color=MUTED)
actors = [('客户端',120,GRAY),('应用 / Agent',400,BLUE),('Qwen Realtime',940,PURPLE),('业务服务',1320,ORANGE)]
for title, x, fill in actors:
    seq.rect(x-100, 140, 200, 66, fill)
    seq.text(x, 181, title, 24, 'middle', weight=600)
    seq.path(f'M {x} 206 L {x} 1555', dashed=True, arrow=False, color='#c3cedb', width=1.5)


def msg(x1, x2, y, label, detail=None, dashed=False, code=True):
    seq.path(f'M {x1} {y} L {x2} {y}', dashed=dashed)
    seq.text((x1+x2)/2, y-(36 if detail else 13), label, 19 if code else 22, 'middle', mono=code)
    if detail:
        seq.text((x1+x2)/2, y-10, detail, 19, 'middle', color=MUTED)


def frame(x, y, w, h, label):
    seq.rect(x, y, w, h, 'none', '#b8c9dc', 5)
    seq.rect(x, y, 270, 32, '#f1f6fc', '#b8c9dc', 4)
    seq.text(x+12, y+23, label, 18, color=MUTED, weight=600)


msg(400,940,270,'session.update','声明 tools 与轮次策略')
msg(940,400,325,'session.updated',dashed=True)
frame(45,355,970,160,'loop 持续输入音频')
msg(120,400,420,'音频帧（RTC）',code=False)
msg(400,940,480,'input_audio_buffer.append')
msg(940,400,560,'input_audio_buffer.speech_stopped',dashed=True)
seq.rect(255,590,290,54,BLUE)
seq.text(400,625,'轮次确认与应用准入',22,'middle')
msg(400,940,690,'response.create')
frame(285,730,1090,650,'loop 模型请求工具时重复')
msg(940,400,820,'response.function_call_arguments.done','name / arguments / call_id',dashed=True)
seq.rect(285,845,570,54,BLUE)
seq.text(570,880,'收齐响应，校验参数、权限与轮次有效性',22,'middle')
frame(310,925,1040,280,'alt 允许执行')
msg(400,1320,985,'执行业务查询',code=False)
msg(1320,400,1045,'返回查询结果或错误',dashed=True,code=False)
seq.path('M 310 1070 L 1350 1070', dashed=True, arrow=False, color='#b8c9dc', width=1.5)
seq.text(323,1098,'else 拒绝执行',18,color=MUTED,weight=600)
seq.path('M 400 1130 L 455 1130 L 455 1170 L 400 1170')
seq.text(477,1157,'构造拒绝结果，不调用业务服务',22)
msg(400,940,1280,'conversation.item.create','function_call_output · 保留原 call_id')
msg(400,940,1350,'response.create')
frame(45,1410,970,145,'loop 流式输出音频')
msg(940,400,1475,'response.audio.delta',dashed=True)
msg(400,120,1535,'音频下发与播放',code=False)
seq.text(50,1610,'实线：应用发送 / 执行请求；虚线箭头：服务端事件 / 返回结果。',20,color=MUTED)
seq.text(50,1639,'查询超时由应用构造错误结果，再按原 call_id 回传。',18,color=MUTED)
seq.write('02-tool-call-sequence')
