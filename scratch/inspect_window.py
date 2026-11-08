import sqlite3
import json

conn = sqlite3.connect("dev.db")
c = conn.cursor()
c.execute("SELECT transcricaoJson FROM SessaoPlenaria WHERE videoId = 'EYCz2CQkeNA'")
snippets = json.loads(c.fetchone()[0])

for s in snippets:
    if 480 <= s['start'] <= 660:
        print(f"[{s['timeStr']}] {s['text']}")

conn.close()
