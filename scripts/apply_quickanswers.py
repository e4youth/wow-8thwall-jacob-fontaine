import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPS = ['blackland','gold-dollar','huston-tillotson','rogers-washington-holy-cross','victory-grill']
LABELS = [
  ('where_you_are','Where you are'),
  ('why_it_matters','Why it matters'),
  ('what_is_this_place','What is this place'),
  ('key_fact','Key fact'),
  ('deeper_history','Deeper history'),
  ('wrap','Wrap'),
]

BUTTON_HTML = '<div id="quickAnswers" class="quickAnswers">\n' + '\n'.join(
  f'    <button class="playBtn" type="button" data-seg="{i}">{lbl}</button>' for i,lbl in LABELS
) + '\n  </div>'

CSS_SNIPPET = """
.quickAnswers {
  position: absolute;
  left: 50%;
  bottom: 20vh;
  transform: translate(-50%, 0);
  width: min(92vw, 720px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  pointer-events: auto;
}

@media (min-width: 680px) {
  .quickAnswers { grid-template-columns: 1fr 1fr; }
}

.playBtn {
  pointer-events: auto;
  padding: 12px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 1em;
  font-family: 'Nunito', monospace;
}

.playBtn:active {
  transform: scale(0.98);
}

.playBtn[disabled] {
  opacity: 0.55;
}
""".strip() + "\n"

def replace_overlay(body: str) -> str:
  # Replace playNarrationBtn if present
  body2 = re.sub(r'<button[^>]*id="playNarrationBtn"[\s\S]*?</button>', BUTTON_HTML, body, flags=re.I)
  if body2 != body:
    return body2

  # Else insert after captionText span
  marker = '<span id="captionText"></span>'
  if marker in body:
    return body.replace(marker, marker + '\n  ' + BUTTON_HTML)
  return body

def set_dialogue_src(body: str, exp: str, manifest: dict) -> str:
  # pick default as what_is_this_place
  seg = next((s for s in manifest['segments'] if s['id']=='what_is_this_place'), manifest['segments'][0])
  new_src = f"assets/segments/{seg['file']}"
  body = re.sub(r'(<audio\s+[^>]*id="DialogueSound"[^>]*src=")([^"]+)(")', r"\1"+new_src+r"\3", body, flags=re.I)
  return body

def set_caption_placeholder(body: str) -> str:
  # replace captions and info on captionController with placeholder (like rosewood)
  body = re.sub(r'(<a-entity\s+[^>]*id="captionController"[\s\S]*?captions=")([\s\S]*?)("\s*[\s\S]*?info=")([\s\S]*?)("[\s\S]*?>\s*</a-entity>)',
                r'\1script: Select a quick answer to begin.\3duration: 14; chunkSize: 6; audioId: DialogueSound; textId: captionText\5',
                body, flags=re.I)
  return body

def patch_app(app: str, exp: str, manifest: dict) -> str:
  # Remove old playNarrationBtn handler block if present (we'll replace with new block)
  app = re.sub(r'// UI hook:[\s\S]*?audio\.addEventListener\(\x27ended\x27,[\s\S]*?\)\s*\}\)\s*', '', app, flags=re.M)

  # Insert our quickAnswers handler at end
  seg_map = {s['id']: s for s in manifest['segments']}
  # js object literal
  def js_str(s):
    return s.replace('\\','\\\\').replace('"','\\"')

  lines = ["// UI hook: Quick answers (short segments).", "window.addEventListener('DOMContentLoaded', () => {", "  const audio = document.getElementById('DialogueSound')", "  const captionController = document.getElementById('captionController')", "  const captionText = document.getElementById('captionText')", "  const buttons = Array.from(document.querySelectorAll('#quickAnswers [data-seg]'))", "  if (!audio || !captionController || buttons.length === 0) return", "", "  const SEGMENTS = {"]
  for id_, _lbl in LABELS:
    s = seg_map.get(id_)
    if not s:
      continue
    dur = round(float(s['end'])-float(s['start']), 2)
    lines.append(f"    {id_}: {{")
    lines.append(f"      src: 'assets/segments/{s['file']}',")
    lines.append(f"      duration: {dur},")
    lines.append(f"      script: \"{js_str(s.get('script',''))}\",\n    }},")
  lines += ["  }", "", "  const setButtonsEnabled = (enabled) => { buttons.forEach((b) => { b.disabled = !enabled }) }", "", "  const playSeg = async (segId) => {", "    const seg = SEGMENTS[segId]", "    if (!seg) return", "    captionController.setAttribute('captions', `script: ${seg.script}`)", "    captionController.setAttribute('info', `duration: ${seg.duration}; chunkSize: 6; audioId: DialogueSound; textId: captionText`)", "    if (captionText) captionText.textContent = seg.script", "    audio.pause()", "    audio.currentTime = 0", "    audio.src = seg.src", "    audio.load()", "    setButtonsEnabled(false)", "    try { await audio.play() } catch (e) { console.warn('Audio play blocked/failed', e); setButtonsEnabled(true) }", "  }", "", "  buttons.forEach((btn) => { btn.addEventListener('click', () => playSeg(btn.getAttribute('data-seg'))) })", "  audio.addEventListener('ended', () => setButtonsEnabled(true))", "})", ""]

  return app.rstrip() + "\n\n" + "\n".join(lines) + "\n"

def ensure_css(css: str) -> str:
  if 'quickAnswers' in css:
    return css
  return css.rstrip() + "\n\n" + CSS_SNIPPET

def ensure_audio_play_emit(anim: str) -> str:
  # ensure audio-play emits dialogueEntity for captions binding
  anim = anim.replace("entityId: 'jacobEntity'", "entityId: 'dialogueEntity'")
  return anim


def main():
  for exp in EXPS:
    base = ROOT / 'experiences' / exp / 'src'
    manifest_path = base / 'assets' / 'segments' / f'{exp}_segments.json'
    if not manifest_path.exists():
      print('SKIP', exp, 'missing', manifest_path)
      continue
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))

    body_path = base / 'body.html'
    app_path = base / 'app.js'
    css_path = base / 'index.css'
    anim_path = base / 'anim-controller.js'

    body = body_path.read_text(encoding='utf-8', errors='ignore')
    body = replace_overlay(body)
    body = set_dialogue_src(body, exp, manifest)
    body = set_caption_placeholder(body)
    body_path.write_text(body, encoding='utf-8')

    app = app_path.read_text(encoding='utf-8', errors='ignore')
    app = patch_app(app, exp, manifest)
    app_path.write_text(app, encoding='utf-8')

    css = css_path.read_text(encoding='utf-8', errors='ignore')
    css = ensure_css(css)
    css_path.write_text(css, encoding='utf-8')

    anim = anim_path.read_text(encoding='utf-8', errors='ignore')
    anim = ensure_audio_play_emit(anim)
    anim_path.write_text(anim, encoding='utf-8')

    print('OK', exp)

if __name__ == '__main__':
  main()
