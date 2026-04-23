import json, math, os, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPS = [
  'blackland',
  'gold-dollar',
  'huston-tillotson',
  'rogers-washington-holy-cross',
  'victory-grill',
]

INTENTS = [
  ('where_you_are', 'Where you are'),
  ('why_it_matters', 'Why it matters'),
  ('what_is_this_place', 'What is this place'),
  ('key_fact', 'Key fact'),
  ('deeper_history', 'Deeper history'),
  ('wrap', 'Wrap'),
]

def ffmpeg_path():
  # rely on PATH
  return 'ffmpeg'

def run(cmd):
  subprocess.check_call(cmd, shell=False)

def load_verbose_json(p: Path):
  with p.open('r', encoding='utf-8') as f:
    return json.load(f)

def segment_transcript(segments, n_chunks=6, max_len=30.0):
  total = segments[-1]['end'] if segments else 0
  if total <= 0:
    return []

  target = total / n_chunks
  chunks=[]
  i=0
  for chunk_idx in range(n_chunks):
    if i >= len(segments):
      break
    start = segments[i]['start']
    text_parts=[]
    end = start

    remaining_chunks = n_chunks - chunk_idx
    # greedy accumulate
    while i < len(segments):
      seg=segments[i]
      next_end = seg['end']
      next_len = next_end - start
      # ensure we leave at least one segment per remaining chunk
      remaining_segs = len(segments) - i
      must_leave = remaining_chunks - 1
      if remaining_segs <= must_leave:
        break

      text_parts.append(seg['text'].strip())
      end = next_end
      i += 1

      # stop conditions
      if next_len >= target and remaining_chunks > 1:
        break
      if next_len >= max_len:
        break

    # Always include at least one segment
    if not text_parts and i < len(segments):
      seg=segments[i]
      text_parts=[seg['text'].strip()]
      start=seg['start']
      end=seg['end']
      i += 1

    chunks.append({
      'start': float(start),
      'end': float(end),
      'text': re.sub(r'\s+', ' ', ' '.join(text_parts)).strip(),
    })

  # if leftover segments, append to last chunk
  if i < len(segments) and chunks:
    tail_text = []
    start = chunks[-1]['start']
    end = chunks[-1]['end']
    for seg in segments[i:]:
      tail_text.append(seg['text'].strip())
      end = seg['end']
    chunks[-1]['end'] = float(end)
    chunks[-1]['text'] = re.sub(r'\s+', ' ', (chunks[-1]['text'] + ' ' + ' '.join(tail_text))).strip()

  # normalize count
  if len(chunks) > n_chunks:
    chunks = chunks[:n_chunks]
  return chunks


def cut_mp3(src_mp3: Path, out_mp3: Path, start: float, end: float):
  dur = max(0.01, end - start)
  fade_out_start = max(0.0, dur - 0.08)
  af = f"afade=t=in:st=0:d=0.06,afade=t=out:st={fade_out_start}:d=0.08"
  cmd=[ffmpeg_path(), '-hide_banner', '-loglevel', 'error', '-y', '-ss', f'{start}', '-to', f'{end}', '-i', str(src_mp3),
       '-af', af, '-c:a', 'libmp3lame', '-q:a', '3', str(out_mp3)]
  run(cmd)


def main():
  for exp in EXPS:
    exp_dir = ROOT / 'experiences' / exp / 'src'
    assets = exp_dir / 'assets'
    mp3s = [p for p in assets.glob('*.mp3') if 'water' not in p.name.lower()]
    if not mp3s:
      print('SKIP', exp, 'no mp3')
      continue
    src_mp3 = mp3s[0]

    verbose = (ROOT / 'docs' / f'{exp}_transcript_verbose.json')
    if not verbose.exists():
      print('SKIP', exp, 'missing transcript json', verbose)
      continue

    v = load_verbose_json(verbose)
    segs = v.get('segments') or []
    chunks = segment_transcript(segs, n_chunks=len(INTENTS))
    if len(chunks) != len(INTENTS):
      print('WARN', exp, 'chunks', len(chunks))

    out_dir = assets / 'segments'
    out_dir.mkdir(parents=True, exist_ok=True)

    seg_manifest = {
      'source': src_mp3.name,
      'version': 'v1',
      'unit': 'seconds',
      'segments': []
    }

    for (intent_id, label), ch in zip(INTENTS, chunks):
      fname = f"{exp}__{intent_id}_v1.mp3"
      out_mp3 = out_dir / fname
      cut_mp3(src_mp3, out_mp3, ch['start'], ch['end'])
      seg_manifest['segments'].append({
        'id': intent_id,
        'file': fname,
        'start': round(ch['start'], 2),
        'end': round(ch['end'], 2),
        'label': label,
        'script': ch['text'],
      })

    (out_dir / f'{exp}_segments.json').write_text(json.dumps(seg_manifest, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('OK', exp, '->', out_dir)

if __name__ == '__main__':
  main()
