#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monitor & Transcritor Automático de Sessões Plenárias
Câmara Municipal de Juazeiro do Norte / CE
Consome transmissões públicas do YouTube e transcreve falas, presenças e votações.
100% Gratuito - Sem necessidade de chave de API.
"""

import os
import sys
import json
import re
import sqlite3
import urllib.request
from datetime import datetime
from pathlib import Path
from youtube_transcript_api import YouTubeTranscriptApi
from jev_speech_classifier import classify_speech_with_jev

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROJECT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_DIR / "dev.db"
CHANNEL_URL = "https://www.youtube.com/@camaramunicipaldejuazeirod6521/streams"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Metadados oficiais das sessões reais transmitidas
METADADOS_SESSOES = {
    "d6nPVCdSyvw": {
        "numero": "Audiência Pública Extraordinária",
        "tipo": "AUDIENCIA_PUBLICA",
        "titulo": "Audiência Pública: Zoneamento Urbano e Atração de Empresas em Juazeiro do Norte",
        "dataStr": "19 de Outubro de 2026 (Segunda-feira)",
        "horario": "09:30",
        "dataIso": "2026-10-19 09:30:00"
    },
    "EYCz2CQkeNA": {
        "numero": "Audiência Pública Regional",
        "tipo": "AUDIENCIA_PUBLICA",
        "titulo": "Audiência Pública: Mapeamento de Obras, Drenagem e Saúde do Bairro Limoeiro",
        "dataStr": "16 de Outubro de 2026 (Sexta-feira)",
        "horario": "09:00",
        "dataIso": "2026-10-16 09:00:00"
    },
    "tIEqhvVmThU": {
        "numero": "42ª Sessão Ordinária",
        "tipo": "ORDINARIA",
        "titulo": "42ª Sessão Ordinária da 19ª Legislatura (2º Período de 2026)",
        "dataStr": "15 de Outubro de 2026 (Quinta-feira)",
        "horario": "09:00",
        "dataIso": "2026-10-15 09:00:00"
    },
    "B9-R11tTB4Y": {
        "numero": "41ª Sessão Ordinária",
        "tipo": "ORDINARIA",
        "titulo": "41ª Sessão Ordinária da 19ª Legislatura (2º Período de 2026)",
        "dataStr": "13 de Outubro de 2026 (Terça-feira)",
        "horario": "09:00",
        "dataIso": "2026-10-13 09:00:00"
    }
}
VEREADORES_KEYWORDS = {
    "felipe-vasques": ["felipe vasques", "presidente felipe", "vasques"],
    "lukao": ["lukão", "lucas alves", "vereador lukão"],
    "chagas-moura": ["chagas moura", "francisco moura", "vereador chagas"],
    "vinicius-duarte": ["vinícius duarte", "vinicius duarte", "vereador vinícius"],
    "jullian-de-cielio": ["jullian", "cielio", "jullian de cielio"],
    "rita-monteiro": ["rita monteiro", "vereadora rita"],
    "cicinho-cabeleireiro": ["cicinho", "cicinho cabeleireiro", "cícero josé"],
    "jacqueline-gouveia": ["jacqueline", "jacqueline gouveia", "vereadora jacqueline"],
    "capitao-vieira": ["capitão vieira", "vieira neto", "antonio vieira"],
    "raimundo-jr": ["raimundo jr", "raimundo junior", "raimundo farias"],
    "auricelia-bezerra": ["auricelia", "auricélia", "auricelia bezerra"],
    "cleilson-moveis": ["cleilson", "cleilson móveis", "cleilson moveis"],
    "rafael-cearense": ["rafael cearense", "rafael rolim", "vereador rafael"],
    "alexandre-sobreira": ["alexandre sobreira", "sobreira"],
    "marcio-joias": ["márcio jóias", "marcio joias", "márcio andré"],
    "barbosa-neto": ["barbosa neto", "barbosa"],
    "boaz-das-rotatorias": ["boaz", "boaz das rotatórias", "boaz david"],
    "professora-pg": ["professora pg", "pergentina", "vereadora pg"],
    "vandinho-pereira": ["vandinho", "vandinho pereira", "vanderlucio"],
    "bilinha": ["bilinha", "william bazilio"],
    "badu": ["badú", "badu", "luiz bezerra"],
}

TEMAS_KEYWORDS = {
    "Orçamento & Finanças": ["orçamento", "suplementação", "recurso", "crédito", "finanças", "loas", "ldo"],
    "Saúde Pública": ["saúde", "upa", "hospital", "posto de saúde", "médico", "medicamento", "remédio"],
    "Infraestrutura & Obras": ["asfalto", "calçamento", "buraco", "iluminação", "lâmpada", "drenagem", "saneamento"],
    "Educação": ["escola", "creche", "professor", "piso salarial", "merenda", "educação"],
    "Transporte & Trânsito": ["transporte", "demutran", "rotatória", "ônibus", "tarifa", "trânsito"],
    "Requerimentos Parlamentares": ["requerimento", "moção", "projeto de lei", "urgência", "pedido de vista", "comissão"],
    "Causa Animal": ["castração", "animal", "animais", "cachorro", "gato", "veterinário"],
}


def log(msg):
    print(f"[YouTube Monitor] {msg}")


def get_recent_stream_ids():
    """Varre as transmissões recentes do canal oficial da Câmara de Juazeiro."""
    try:
        req = urllib.request.Request(CHANNEL_URL, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode("utf-8")
            video_ids = list(dict.fromkeys(re.findall(r'"videoId":"([a-zA-Z0-9_\-]{11})"', html)))
            return video_ids[:6]
    except Exception as e:
        log(f"Erro ao consultar canal: {e}")
        return ["d6nPVCdSyvw"] # Fallback para sessão validada


def analyze_transcript(snippets):
    """Analisa o texto da sessão e extrai presenças, falas e temas."""
    full_text = " ".join([s.get("text", "") for s in snippets]).lower()

    # Identificar vereadores citados ou que discursaram
    presentes = []
    for slug, aliases in VEREADORES_KEYWORDS.items():
        for alias in aliases:
            if re.search(r'\b' + re.escape(alias) + r'\b', full_text):
                presentes.append(slug)
                break

    # Identificar temas
    temas = []
    for tema, keywords in TEMAS_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in full_text)
        if score >= 2:
            temas.append({"tema": tema, "relevancia": score})

    temas.sort(key=lambda x: x["relevancia"], reverse=True)

    # Classificação inteligente com Jev (TypeSafe AI) em sub-segundo
    jev_analysis = None
    if len(snippets) > 10:
        sample_speech = " ".join([s.get("text", "") for s in snippets[20:60]])
        jev_analysis = classify_speech_with_jev(sample_speech)
        log(f"Jev Classificação: Alinhamento={jev_analysis['posicionamento']} | Beligerância={jev_analysis['tom_agressividade']:.1f}/5 | Denúncia={jev_analysis['tem_denuncia']*100:.0f}%")

    # Gerar um resumo automático dos assuntos prioritários
    temas_nomes = [t["tema"] for t in temas[:3]]
    resumo_base = f"Sessão plenária com {len(snippets)} intervenções registradas. "
    if jev_analysis and jev_analysis.get("posicionamento") == "oposicao_critica":
        resumo_base += f"🔥 Clima de forte tensão e cobrança contra a prefeitura (Nível {jev_analysis['tom_agressividade']:.1f}/5). "
    elif jev_analysis and jev_analysis.get("posicionamento") == "apoio_situacao":
        resumo_base += f"✅ Bancada governista articulada em defesa dos projetos do Executivo. "

    resumo = (
        f"{resumo_base}"
        f"Principais pautas em debate: {', '.join(temas_nomes) if temas_nomes else 'Debates gerais e requerimentos de bairro'}. "
        f"Presença ou menção ativa de {len(presentes)} dos 21 vereadores."
    )

    return presentes, [t["tema"] for t in temas], resumo, len(snippets)


def format_timestamp(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hrs > 0:
        return f"{hrs:02d}:{mins:02d}:{secs:02d}"
    return f"{mins:02d}:{secs:02d}"


def tag_snippet(text: str):
    text_lower = text.lower()
    for tema, keywords in TEMAS_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                return tema
    return "Debates Gerais"


VEREADORES_CATALOG = [
    {"slug": "felipe-vasques", "nome": "Felipe Vasques", "partido": "AGIR", "aliases": ["felipe vasques", "felipe", "vasques"]},
    {"slug": "lukao", "nome": "Lukão", "partido": "PSDB", "aliases": ["lukão", "lukao", "lucas alves", "lucas ferreira"]},
    {"slug": "chagas-moura", "nome": "Chagas Moura", "partido": "PSD", "aliases": ["chagas moura", "chagas", "benjamim de moura"]},
    {"slug": "vinicius-duarte", "nome": "Vinícius Duarte", "partido": "PSD", "aliases": ["vinícius duarte", "vinicius duarte", "vinícius", "vinicius"]},
    {"slug": "jullian-de-cielio", "nome": "Jullian de Cielio", "partido": "PSB", "aliases": ["jullian de cielio", "julian de cielio", "jullian", "julian", "cielio"]},
    {"slug": "rita-monteiro", "nome": "Rita Monteiro", "partido": "PSB", "aliases": ["rita monteiro", "rita"]},
    {"slug": "cicinho-cabeleireiro", "nome": "Cicinho Cabeleireiro", "partido": "PSD", "aliases": ["cicinho cabeleireiro", "cicinho", "cícero josé", "cicero jose"]},
    {"slug": "jacqueline-gouveia", "nome": "Jacqueline Gouveia", "partido": "PT", "aliases": ["jacqueline gouveia", "jacqueline", "jaqueline"]},
    {"slug": "capitao-vieira", "nome": "Capitão Vieira", "partido": "MDB", "aliases": ["capitão vieira", "capitao vieira", "vieira neto", "antonio vieira"]},
    {"slug": "raimundo-jr", "nome": "Raimundo Jr", "partido": "MDB", "aliases": ["raimundo jr", "raimundo junior", "raimundo farias"]},
    {"slug": "auricelia-bezerra", "nome": "Auricelia Bezerra", "partido": "PSB", "aliases": ["auricelia bezerra", "auricélia bezerra", "auricelia", "auricélia"]},
    {"slug": "cleilson-moveis", "nome": "Cleilson Móveis", "partido": "AGIR", "aliases": ["cleilson móveis", "cleilson moveis", "cleilson"]},
    {"slug": "rafael-cearense", "nome": "Rafael Cearense", "partido": "PODE", "aliases": ["rafael cearense", "rafael rolim", "rafael"]},
    {"slug": "alexandre-sobreira", "nome": "Alexandre Sobreira", "partido": "DC", "aliases": ["alexandre sobreira", "sobreira"]},
    {"slug": "marcio-joias", "nome": "Márcio Jóias", "partido": "PRD", "aliases": ["márcio jóias", "marcio joias", "márcio andré", "marcio andre"]},
    {"slug": "barbosa-neto", "nome": "Barbosa Neto", "partido": "PT", "aliases": ["barbosa neto", "barbosa"]},
    {"slug": "boaz-das-rotatorias", "nome": "Boaz das Rotatórias", "partido": "PL", "aliases": ["boaz das rotatórias", "boaz das rotatorias", "boaz", "boaz david"]},
    {"slug": "professora-pg", "nome": "Professora PG", "partido": "PODE", "aliases": ["professora pg", "professora pegê", "pegê", "pergentina", "vereadora pg", "dra. pergentina", "pg"]},
    {"slug": "vandinho-pereira", "nome": "Vandinho Pereira", "partido": "PP", "aliases": ["vandinho pereira", "vandinho", "vanderlucio"]},
    {"slug": "bilinha", "nome": "Bilinha", "partido": "PT", "aliases": ["bilinha", "william bazilio", "william"]},
    {"slug": "badu", "nome": "Badú", "partido": "MOBILIZA", "aliases": ["badú", "badu", "luiz bezerra"]},
    {"slug": "dr-saulo", "nome": "Dr. Saulo Santana (Comissão de Saúde)", "partido": "Suplente/Comissão", "aliases": ["saulo santana", "dr. saulo", "doutor saulo"]},
    {"slug": "dra-rebeca", "nome": "Dra. Rebeca (Convidada Especial)", "partido": "Palestrante", "aliases": ["rebeca"]},
]

PATTERNS_PASSAGEM = [
    re.compile(r'(?:passo|passamos|vou\s+passar(?:\s+logo)?|passar(?:\s+logo)?|concedo|conceder|tem|com)\s+(?:a|a\s+nobre)?\s*(?:palavra)?\s*(?:ao|à|a|para|pro|pra|para\s+o|para\s+a)?\s*(.*)', re.IGNORECASE),
    re.compile(r'(?:ouvir|ouviremos|chamo|convido|convidamos)\s+(?:agora\s+)?(?:a\s+tribuna\s+)?(?:o|a)?\s*(?:nobre|senhor|senhora|dr\.|dra\.)?\s*(.*)', re.IGNORECASE),
    re.compile(r'pela\s+ordem\s+(?:o|a)?\s*(?:nobre|senhor|senhora)?\s*(.*)', re.IGNORECASE),
    re.compile(r'(?:assuma|ocupar|na)\s+tribuna\s+(?:o|a)?\s*(.*)', re.IGNORECASE),
    re.compile(r'vereador(?:a)?\s+([a-zA-ZÀ-ÖØ-öø-ÿ\s]+?)\s+(?:com\s+a\s+palavra|vai\s+falar|pela\s+ordem|dispõe|tem\s+\d+\s+minutos)', re.IGNORECASE),
]

PATTERNS_RETORNO_MESA = [
    re.compile(r'(?:devolvo|devolvendo|retorno|passo\s+de\s+volta)\s+a\s+palavra\s+(?:à|a|ao|para\s+a|para\s+o)?\s*(?:mesa|presidente|presidência)', re.IGNORECASE),
    re.compile(r'(?:muito\s+)?(?:obrigado|obrigada|agradeço)\s*,?\s*(?:senhor\s+)?presidente', re.IGNORECASE),
    re.compile(r'(?:encerrado|finalizado|esgotado)\s+(?:o\s+tempo|a\s+fala|o\s+prazo)', re.IGNORECASE),
    re.compile(r'(?:vamos|passamos)\s+ao\s+próximo\s+(?:orador|requerimento|item)', re.IGNORECASE),
    re.compile(r'era\s+o\s+que\s+tinha\s+(?:para\s+o\s+momento|a\s+dizer)', re.IGNORECASE),
]


def find_matching_vereador(candidate_text: str):
    candidate_clean = candidate_text.lower().strip()
    for v in VEREADORES_CATALOG:
        for alias in v["aliases"]:
            if re.search(r'\b' + re.escape(alias) + r'\b', candidate_clean):
                return v["nome"]
    return None


def parse_plenary_speakers(snippets):
    """
    Método 1: Máquina de estados parlamentar com janela deslizante.
    Atribui oradores com base nas passagens de palavra formais da Mesa Diretora,
    superando a fragmentação de legendas automáticas do YouTube.
    """
    current_speaker = "Mesa Diretora"
    enriched = []
    speakers_found = set()
    n = len(snippets)

    for i in range(n):
        s = snippets[i]

        # Janela deslizante de 3 snippets para capturar frases quebradas pelo YouTube
        window_texts = [snippets[j].get("text", "") for j in range(i, min(n, i + 3))]
        window_full = " ".join(window_texts)

        # 1. Verificar passagem regimental de palavra na janela
        for pat in PATTERNS_PASSAGEM:
            m = pat.search(window_full)
            if m:
                extracted = m.group(1).strip()
                matched = find_matching_vereador(extracted)
                if matched:
                    if matched != current_speaker:
                        current_speaker = matched
                        speakers_found.add(current_speaker)
                    break

        # 2. Retorno formal à Mesa no snippet atual
        t = s.get("text", "").lower()
        if any(w in t for w in [
            "devolvo a palavra", "retorno a palavra à mesa",
            "muito obrigado pela pela oportunidade", "muito obrigado pela oportunidade",
            "obrigado presidente", "obrigada presidente", "encerrado o tempo", "era o que tinha"
        ]):
            if current_speaker != "Mesa Diretora":
                current_speaker = "Mesa Diretora"

        entry = dict(s)
        entry["orador"] = current_speaker
        enriched.append(entry)

    return enriched, list(speakers_found)


def process_video(video_id):
    log(f"Processando vídeo https://www.youtube.com/watch?v={video_id} ...")
    try:
        api = YouTubeTranscriptApi()
        fetched = api.fetch(video_id, languages=["pt", "pt-BR"])
        
        # Enriquecer cada snippet com timestamp legível e tema
        rich_snippets = []
        for entry in fetched:
            text = entry.text.strip()
            if not text:
                continue
            start_sec = entry.start
            theme = tag_snippet(text)
            rich_snippets.append({
                "text": text,
                "start": start_sec,
                "timeStr": format_timestamp(start_sec),
                "duration": entry.duration,
                "tema": theme,
                "youtubeLink": f"https://www.youtube.com/watch?v={video_id}&t={int(start_sec)}s"
            })

        # Aplicar Método 1: Máquina de estados parlamentar (Passagem regimental da palavra)
        rich_snippets, speakers_identified = parse_plenary_speakers(rich_snippets)

        log(f"Transcrição obtida com sucesso: {len(rich_snippets)} trechos de fala enriquecidos!")
        log(f"Oradores identificados na tribuna ({len(speakers_identified)}): {', '.join(speakers_identified) if speakers_identified else 'Mesa Diretora'}")

        snippets_raw = [{"text": s["text"]} for s in rich_snippets]
        presentes, temas, resumo, total_falas = analyze_transcript(snippets_raw)

        # Adicionar oradores identificados à lista de presentes se não estiverem
        for spk in speakers_identified:
            for v in VEREADORES_CATALOG:
                if v["nome"] == spk and v["slug"] not in presentes:
                    presentes.append(v["slug"])

        if speakers_identified:
            resumo += f" 🎙️ Oradores identificados na tribuna: {', '.join(speakers_identified)}."

        log(f"Vereadores identificados ({len(presentes)}): {', '.join(presentes[:6])}...")
        log(f"Temas detectados: {', '.join(temas[:4])}")

        # Salvar no banco SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        meta = METADADOS_SESSOES.get(video_id, {
            "numero": "Sessão Plenária Ordinária",
            "tipo": "ORDINARIA",
            "titulo": f"Sessão Plenária da Câmara Municipal de Juazeiro do Norte",
            "dataStr": "Outubro de 2026",
            "horario": "09:00",
            "dataIso": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })

        sessao_id = f"yt-{video_id}"
        titulo = meta["titulo"]
        numero_sessao = meta["numero"]
        tipo_sessao = meta["tipo"]
        data_formatada = meta["dataStr"]
        horario = meta["horario"]
        data_sessao = meta["dataIso"]
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        presentes_json = json.dumps(presentes)
        temas_json = json.dumps(temas)
        transcricao_json = json.dumps(rich_snippets, ensure_ascii=False)

        cursor.execute("""
            INSERT INTO SessaoPlenaria (
                id, videoId, numeroSessao, tipoSessao, titulo, dataSessao, dataFormatada, horario,
                youtubeUrl, resumo, vereadoresPresentes, temasDiscutidos, transcricaoJson, totalFalas, createdAt
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(videoId) DO UPDATE SET
                numeroSessao = excluded.numeroSessao,
                tipoSessao = excluded.tipoSessao,
                titulo = excluded.titulo,
                dataFormatada = excluded.dataFormatada,
                horario = excluded.horario,
                resumo = excluded.resumo,
                vereadoresPresentes = excluded.vereadoresPresentes,
                temasDiscutidos = excluded.temasDiscutidos,
                transcricaoJson = excluded.transcricaoJson,
                totalFalas = excluded.totalFalas
        """, (
            sessao_id, video_id, numero_sessao, tipo_sessao, titulo, data_sessao, data_formatada, horario,
            youtube_url, resumo, presentes_json, temas_json, transcricao_json, total_falas
        ))

        # Atualizar presença nos vereadores identificados
        for slug in presentes:
            cursor.execute("""
                UPDATE Vereador 
                SET taxaPresenca = MIN(100.0, taxaPresenca + 0.5)
                WHERE slug = ?
            """, (slug,))

        conn.commit()
        conn.close()
        log(f"✅ Sessão gravada no banco com {len(rich_snippets)} falas indexadas por tema!")
        return True
    except Exception as e:
        log(f"Aviso ao processar vídeo {video_id}: {e}")
        return False


def main():
    log("================================================================")
    log("🎥 MONITOR DE SESSÕES PLENÁRIAS: TV CÂMARA JUAZEIRO DO NORTE")
    log("================================================================")

    video_ids = get_recent_stream_ids()
    log(f"Transmissões localizadas no canal: {len(video_ids)}")

    sucesso = 0
    for vid in video_ids[:2]: # Processa os 2 vídeos mais recentes
        if process_video(vid):
            sucesso += 1

    log(f"Varredura concluída! {sucesso} sessões transcritas e integradas.")


if __name__ == "__main__":
    main()
