import sqlite3
import json

conn = sqlite3.connect("dev.db")
c = conn.cursor()
c.execute("SELECT videoId, transcricaoJson FROM SessaoPlenaria WHERE videoId = 'EYCz2CQkeNA'")
row = c.fetchone()
snippets = json.loads(row[1])
conn.close()

# Grouping algorithm
blocks = []
current_block = None

for s in snippets:
    text = s["text"].strip()
    if text.startswith(">>"):
        text = text[2:].strip()
    if not text:
        continue
    
    spk = s.get("orador", "Mesa Diretora")
    start = s.get("start", 0)
    dur = s.get("duration", 0)
    tema = s.get("tema", "Debates Gerais")
    
    if current_block is None:
        current_block = {
            "orador": spk,
            "tema": tema,
            "start": start,
            "end": start + dur,
            "texts": [text],
            "youtubeLink": s.get("youtubeLink")
        }
    else:
        same_speaker = (spk == current_block["orador"])
        time_gap = start - current_block["end"]
        word_count = sum(len(t.split()) for t in current_block["texts"])
        
        # Agrupa se mesmo orador, sem pausa longa (< 5s), até ~50 a 70 palavras para formar um parágrafo fluido
        if same_speaker and time_gap <= 5.0 and word_count < 65:
            current_block["texts"].append(text)
            current_block["end"] = max(current_block["end"], start + dur)
            if tema != "Debates Gerais" and current_block["tema"] == "Debates Gerais":
                current_block["tema"] = tema
        else:
            blocks.append(current_block)
            current_block = {
                "orador": spk,
                "tema": tema,
                "start": start,
                "end": start + dur,
                "texts": [text],
                "youtubeLink": s.get("youtubeLink")
            }

if current_block:
    blocks.append(current_block)

print(f"Total de snippets originais: {len(snippets)}")
print(f"Total de parágrafos/blocos legíveis: {len(blocks)}")
print("\n--- PRIMEIROS 6 BLOCOS AGRUPADOS ---")
for b in blocks[:6]:
    full = " ".join(b["texts"])
    start_m, start_s = int(b["start"] // 60), int(b["start"] % 60)
    end_m, end_s = int(b["end"] // 60), int(b["end"] % 60)
    print(f"[{start_m:02d}:{start_s:02d} - {end_m:02d}:{end_s:02d}] {b['orador']} ({b['tema']})")
    print(f"   \"{full}\"\n")
