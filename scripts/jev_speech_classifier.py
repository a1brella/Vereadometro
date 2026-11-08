#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Classificador de Falas Parlamentares com Jev (TypeSafe AI)
Classificação ultra-rápida (<150ms) sem geração de texto ou desperdício de tokens.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Carregar credencial global do Jev
GLOBAL_JEV_ENV = Path(r"C:\Users\rafae\.gemini\config\skills\typesafe\.env")
if GLOBAL_JEV_ENV.exists():
    load_dotenv(GLOBAL_JEV_ENV)

try:
    from typesafe_sdk import TypeSafeClient, Choice, Score, Noul
    JEV_AVAILABLE = True
except ImportError:
    JEV_AVAILABLE = False


def get_jev_client():
    if not JEV_AVAILABLE:
        return None
    api_key = os.environ.get("TYPESAFE_API_KEY") or os.environ.get("JEV_API_KEY")
    if not api_key:
        return None
    return TypeSafeClient(api_key=api_key)


def classify_speech_with_jev(speech_text: str, vereador_nome: str = ""):
    """
    Classifica um trecho de discurso parlamentar utilizando o Jev (TypeSafe AI).
    Retorna alinhamento político, grau de contundência e presença de denúncias.
    """
    client = get_jev_client()
    if not client:
        return {
            "posicionamento": "pauta_comunitaria",
            "tom_agressividade": 2.0,
            "tem_denuncia": 0.1,
            "tema_macro": "Geral",
            "modo": "FALLBACK_LOCAL"
        }

    try:
        resp = client.system_one(
            state={
                "fala_parlamentar": speech_text[:1200],
                "orador": vereador_nome or "Vereador de Juazeiro do Norte",
                "casa_legislativa": "Câmara Municipal de Juazeiro do Norte / CE"
            },
            questions={
                "posicionamento": Choice(
                    instructions="Classifique o alinhamento da fala em relação à prefeitura e gestão executiva municipal de Juazeiro do Norte.",
                    criteria={
                        "oposicao_critica": "Cobrança contundente, denúncia ou crítica severa à prefeitura ou secretarias",
                        "apoio_situacao": "Elogio, defesa ou aprovação expressa dos atos da gestão municipal",
                        "pauta_comunitaria": "Pedido rotineiro de serviços de bairro (calçamento, lâmpada, poda) sem teor partidário",
                        "institucional_rito": "Questão regimental de ordem, leitura de atas, votação de pauta ou procedimentos internos"
                    }
                ),
                "tom_agressividade": Score(
                    instructions="Avalie o nível de agressividade, contundência ou beligerância política da fala (escala 1 a 5).",
                    criteria=[
                        "1: Fala calma, formal e polida",
                        "2: Reclamação moderada ou pedido cortês",
                        "3: Cobrança veemente com elevação de tom",
                        "4: Ataque direto a adversários ou acusação de incompetência",
                        "5: Bate-boca furioso, ameaça de CPI ou denúncia de crime"
                    ]
                ),
                "tem_denuncia": Noul(
                    instructions="Esta fala denuncia indício de corrupção, desvio de verba, negligência com vidas ou irregularidade grave em Juazeiro do Norte?"
                ),
                "tema_macro": Choice(
                    instructions="Qual a principal área de interesse público desta intervenção?",
                    criteria={
                        "saude": "Hospitais, UPAs, remédios, postos de saúde ou médicos",
                        "infraestrutura": "Pavimentação, asfalto, buracos, lâmpadas, praças ou saneamento",
                        "educacao": "Escolas, creches, merenda ou salário de professores",
                        "orcamento_taxas": "Impostos, taxa do lixo, créditos suplementares ou finanças",
                        "outro": "Outros assuntos administrativos ou homenagens"
                    }
                )
            }
        )

        ans = resp.answers
        return {
            "posicionamento": ans["posicionamento"].choice,
            "tom_agressividade": ans["tom_agressividade"].score,
            "tem_denuncia": ans["tem_denuncia"].noul,
            "tema_macro": ans["tema_macro"].choice,
            "modo": "JEV_1.13_FAST"
        }
    except Exception as e:
        print(f"[Jev Error]: {e}")
        return {
            "posicionamento": "pauta_comunitaria",
            "tom_agressividade": 2.0,
            "tem_denuncia": 0.05,
            "tema_macro": "outro",
            "modo": "FALLBACK_ERROR"
        }


if __name__ == "__main__":
    teste = "A taxa de lixo em Juazeiro do Norte foi cobrada de forma ilegal e o secretário precisa ser convocado imediatamente nesta Casa para prestar esclarecimentos sobre esse contrato milionário!"
    resultado = classify_speech_with_jev(teste, "Capitão Vieira")
    print("Classificação do Jev:")
    print(resultado)
