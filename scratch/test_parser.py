import sqlite3
import json
import re

conn = sqlite3.connect("dev.db")
c = conn.cursor()
c.execute("SELECT videoId, transcricaoJson FROM SessaoPlenaria")
rows = c.fetchall()

VEREADORES = [
    {"nome": "Felipe Vasques", "aliases": ["felipe vasques", "felipe", "vasques"]},
    {"nome": "Lukão", "aliases": ["lukão", "lukao", "lucas alves"]},
    {"nome": "Chagas Moura", "aliases": ["chagas moura", "chagas"]},
    {"nome": "Vinícius Duarte", "aliases": ["vinícius duarte", "vinicius duarte", "vinícius", "vinicius"]},
    {"nome": "Jullian de Cielio", "aliases": ["jullian de cielio", "julian de cielio", "jullian", "julian", "cielio"]},
    {"nome": "Rita Monteiro", "aliases": ["rita monteiro", "rita"]},
    {"nome": "Cicinho Cabeleireiro", "aliases": ["cicinho", "cícero josé"]},
    {"nome": "Jacqueline Gouveia", "aliases": ["jacqueline", "jaqueline"]},
    {"nome": "Capitão Vieira", "aliases": ["capitão vieira", "capitao vieira", "vieira neto"]},
    {"nome": "Raimundo Jr", "aliases": ["raimundo jr", "raimundo junior"]},
    {"nome": "Auricelia Bezerra", "aliases": ["auricelia", "auricélia"]},
    {"nome": "Cleilson Móveis", "aliases": ["cleilson"]},
    {"nome": "Rafael Cearense", "aliases": ["rafael cearense", "rafael rolim", "rafael"]},
    {"nome": "Alexandre Sobreira", "aliases": ["alexandre sobreira", "sobreira"]},
    {"nome": "Márcio Jóias", "aliases": ["márcio jóias", "marcio joias", "márcio andré"]},
    {"nome": "Barbosa Neto", "aliases": ["barbosa neto", "barbosa"]},
    {"nome": "Boaz das Rotatórias", "aliases": ["boaz"]},
    {"nome": "Professora PG", "aliases": ["professora pg", "professora pegê", "pegê", "pergentina", "vereadora pg", "dra. pergentina", "pg"]},
    {"nome": "Vandinho Pereira", "aliases": ["vandinho"]},
    {"nome": "Bilinha", "aliases": ["bilinha", "william bazilio"]},
    {"nome": "Badú", "aliases": ["badú", "badu"]},
    # Convidados frequentes / suplentes em comissões
    {"nome": "Dr. Saulo Santana (Comissão de Saúde)", "aliases": ["saulo santana", "saulo", "dr. saulo"]},
    {"nome": "Dra. Rebeca (Convidada Especial)", "aliases": ["rebeca"]},
]

PASSAGEM_PATTERNS = [
    re.compile(r'(?:passo|passamos|vou\s+passar(?:\s+logo)?|passar(?:\s+logo)?|concedo|conceder|tem|com)\s+(?:a|a\s+nobre)?\s*(?:palavra)?\s*(?:ao|à|a|para|pro|pra|para\s+o|para\s+a)?\s*(.*)', re.IGNORECASE),
    re.compile(r'(?:ouvir|ouviremos|chamo|convido|convidamos)\s+(?:agora\s+)?(?:a\s+tribuna\s+)?(?:o|a)?\s*(?:nobre|senhor|senhora|dr\.|dra\.)?\s*(.*)', re.IGNORECASE),
    re.compile(r'pela\s+ordem\s+(?:o|a)?\s*(?:nobre|senhor|senhora)?\s*(.*)', re.IGNORECASE),
    re.compile(r'(?:assuma|ocupar|na)\s+tribuna\s+(?:o|a)?\s*(.*)', re.IGNORECASE),
    re.compile(r'vereador(?:a)?\s+([a-zA-ZÀ-ÖØ-öø-ÿ\s]+?)\s+(?:com\s+a\s+palavra|vai\s+falar|pela\s+ordem|dispõe|tem\s+\d+\s+minutos)', re.IGNORECASE),
]

def match_orador(txt):
    cleaned = txt.lower().strip()
    for v in VEREADORES:
        for al in v["aliases"]:
            if re.search(r'\b' + re.escape(al) + r'\b', cleaned):
                return v["nome"]
    return None

for vid, tj in rows:
    snippets = json.loads(tj)
    print(f"\n==========================================")
    print(f"=== TESTANDO PARSER NO VÍDEO {vid} (Janela deslizante) ===")
    print(f"==========================================")
    current_speaker = "Mesa Diretora"
    speakers_history = []
    
    n = len(snippets)
    for i in range(n):
        # Janela deslizante de 3 snippets para capturar frases quebradas pelo YouTube
        window_texts = [snippets[j]["text"] for j in range(i, min(n, i + 3))]
        window_full = " ".join(window_texts)
        s = snippets[i]
        
        # 1. Verificar passagem de palavra na janela
        for pat in PASSAGEM_PATTERNS:
            m = pat.search(window_full)
            if m:
                extracted = m.group(1).strip()
                matched = match_orador(extracted)
                if matched:
                    if matched != current_speaker:
                        current_speaker = matched
                        speakers_history.append((s["timeStr"], current_speaker, window_full[:80]))
                    break
        
        # 2. Retorno à mesa no snippet atual ou anterior
        t = s["text"].lower()
        if any(w in t for w in ["devolvo a palavra", "muito obrigado pela pela oportunidade", "muito obrigado pela oportunidade", "obrigado presidente", "obrigada presidente", "encerrado o tempo", "era o que tinha"]):
            if current_speaker != "Mesa Diretora":
                current_speaker = "Mesa Diretora"
                speakers_history.append((s["timeStr"], "Mesa Diretora", s["text"]))

    print(f"Total de transições de palavra detectadas: {len(speakers_history)}")
    for time_str, spk, text in speakers_history:
        print(f"[{time_str}] -> ORADOR: {spk} | Trecho: \"{text}\"")

conn.close()
