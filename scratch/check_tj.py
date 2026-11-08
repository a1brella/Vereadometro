import sqlite3
import json

conn = sqlite3.connect("dev.db")
c = conn.cursor()
c.execute("SELECT videoId, transcricaoJson FROM SessaoPlenaria WHERE videoId = 'EYCz2CQkeNA'")
row = c.fetchone()
print("VIDEO:", row[0])
tj = row[1]
print("TJ len:", len(tj))
parsed = json.loads(tj)
print("PARSED len:", len(parsed))
print("FIRST ITEM:", parsed[0])
conn.close()
