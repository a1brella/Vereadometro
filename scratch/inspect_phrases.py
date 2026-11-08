import sqlite3
import json

conn = sqlite3.connect("dev.db")
c = conn.cursor()
c.execute("SELECT videoId, transcricaoJson FROM SessaoPlenaria")
rows = c.fetchall()

for vid, tj in rows:
    snippets = json.loads(tj)
    print(f"\n==========================================")
    print(f"=== VIDEO {vid} (total snippets: {len(snippets)}) ===")
    print(f"==========================================")
    found = 0
    for s in snippets:
        t = s["text"].lower()
        if any(w in t for w in ["palavra", "tribuna", "pela ordem", "vereador", "vereadora", "presidente", "secretário"]):
            print(f"[{s['timeStr']}] {s['text']}")
            found += 1
            if found >= 25:
                break
conn.close()
