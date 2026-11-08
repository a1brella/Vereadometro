import sqlite3
import random

conn = sqlite3.connect("dev.db")
c = conn.cursor()

# Temas e projetos específicos por área de atuação e vereador
PROJETOS_CATALOGO = {
    "rafael-cearense": [
        ("PL-12/2026", "Fiscalização Contínua de Obras de Drenagem e Pavimentação", "Institui vistoria técnica obrigatória e divulgação pública do cronograma de obras nos bairros Limoeiro e Frei Damião.", "TRAMITANDO"),
        ("PL-18/2026", "Transparência em Reformas e Laudos dos Postos de Saúde (PSF)", "Obriga a Prefeitura a publicar no portal oficial os laudos estruturais e prazo de reabertura de unidades básicas de saúde.", "APROVADO"),
        ("PL-24/2026", "Abertura dos Custos Unitários de Asfaltamento e Recapeamento", "Estabelece a discriminação detalhada dos gastos com massa asfáltica e empreiteiras contratadas pela Seinfra.", "TRAMITANDO"),
        ("PL-31/2026", "QR Code Cidadão em Placas de Obras Públicas", "Determina a inclusão de código QR Code nas placas de obras para acesso imediato a medições e pagamentos.", "APROVADO"),
        ("PL-39/2026", "Combate ao Desperdício na Distribuição de Medicamentos", "Cria sistema informatizado de controle de validade e remanejamento de remédios na rede municipal de saúde.", "TRAMITANDO"),
        ("PL-44/2026", "Canal Direto de Denúncias sobre Buracos e Iluminação Pública", "Institui atendimento oficial via WhatsApp para protocolo de queixas comunitárias de infraestrutura urbana.", "TRAMITANDO"),
        ("PL-52/2026", "Sanções Administrativas a Empreiteiras que Abandonarem Contratos", "Veda contratação de empresas com histórico de paralisação e abandono de obras no município por 5 anos.", "TRAMITANDO"),
        ("PL-58/2026", "Monitoramento e Segurança no Entorno de Escolas Periféricas", "Determina rondas prioritárias da Guarda Civil e instalação de câmeras de vigilância nos polos educacionais.", "TRAMITANDO"),
        ("PL-67/2026", "Programa Juazeiro Transparente: Dados Abertos de Contratos", "Regulamenta o acesso irrestrito da população às notas fiscais e medições de serviços terceirizados.", "APROVADO"),
        ("PL-73/2026", "Prestação de Contas Trimestral das Secretarias na Câmara", "Obriga titulares de pastas estratégicas (Saúde, Obras e Finanças) a comparecerem em plenário para sabatina.", "TRAMITANDO"),
        ("PL-82/2026", "Diretrizes de Fiscalização Sanitária em Mercados Públicos", "Normatiza inspeções de higiene e infraestrutura nos mercados e feiras livres do Centro e Pirajá.", "TRAMITANDO"),
    ],
    "professora-pg": [
        ("PL-05/2026", "Cumprimento Integral do Piso Salarial do Magistério Municipal", "Garante a atualização automática e incorporação imediata dos reajustes salariais aos professores de Juazeiro.", "APROVADO"),
        ("PL-14/2026", "Climatização Universal das Salas de Aula da Rede Municipal", "Estabelece cronograma vinculante de instalação de aparelhos de ar-condicionado nas escolas públicas do Cariri.", "TRAMITANDO"),
        ("PL-22/2026", "Auditoria Nutricional e Compra da Agricultura Familiar na Merenda", "Determina aquisição de no mínimo 45% dos alimentos escolares de pequenos produtores rurais de Juazeiro.", "APROVADO"),
        ("PL-29/2026", "Programa de Apoio Psicológico e Psicopedagógico a Alunos Atípicos", "Cria núcleos de suporte a crianças com TDAH e autismo nas escolas de ensino infantil e fundamental.", "TRAMITANDO"),
        ("PL-36/2026", "Ampliação de Vagas em Creches de Tempo Integral nos Bairros", "Prioriza investimentos em creches para mães trabalhadoras dos bairros Franciscanos, Timbaúbas e Novo Juazeiro.", "TRAMITANDO"),
        ("PL-48/2026", "Segurança e Conforto no Transporte Escolar Universitário e Rural", "Regulamenta vistorias mecânicas semestrais na frota de ônibus e vans que transportam estudantes.", "TRAMITANDO"),
        ("PL-55/2026", "Valorização dos Servidores da Educação Não-Docentes", "Cria plano de capacitação e incentivo salarial a merendeiras, porteiros e auxiliares de secretaria escolar.", "TRAMITANDO"),
        ("PL-63/2026", "Programa Livro Aberto: Bibliotecas Comunitárias em Juazeiro", "Incentiva a criação de pontos de leitura e doação de acervos didáticos em centros comunitários.", "TRAMITANDO"),
        ("PL-71/2026", "Combate à Evasão Escolar no Ensino Fundamental II", "Institui busca ativa e acompanhamento multidisciplinar de jovens com frequência escolar irregular.", "APROVADO"),
    ],
    "jacqueline-gouveia": [
        ("PL-08/2026", "Castramóvel Permanente e Controle Populacional de Animais", "Institui unidade móvel gratuita de castração e vacinação de cães e gatos em bairros vulneráveis.", "APROVADO"),
        ("PL-17/2026", "Banco de Ração e Medicamentos Veterinários para Protetores", "Cria programa de captação e repasse de suprimentos a ONGs e cuidadores independentes cadastrados.", "APROVADO"),
        ("PL-25/2026", "Hospital Veterinário Público Regional do Cariri", "Autoriza convênio intermunicipal para implantação de hospital público para animais de famílias de baixa renda.", "TRAMITANDO"),
        ("PL-33/2026", "Penalidades Severas e Multas Municipais contra Maus-Tratos", "Regulamenta aplicação de multas pesadas e apreensão de animais mantidos em situação degradante.", "APROVADO"),
        ("PL-41/2026", "Acolhimento e Suporte Especializado a Mulheres Vítimas de Violência", "Fortalece a rede de proteção e atendimento psicossocial a mulheres no Cariri.", "TRAMITANDO"),
        ("PL-50/2026", "Proibição de Fogos de Artifício com Estopim Sonoro Ruidoso", "Protege animais, idosos e pessoas no espectro autista contra poluição sonora de artefatos pirotécnicos.", "APROVADO"),
        ("PL-62/2026", "Campanha Permanente de Adoção Responsável de Cães e Gatos", "Obriga realização mensal de feiras públicas de adoção em parceria com entidades de proteção animal.", "TRAMITANDO"),
        ("PL-69/2026", "Censo Animal de Juazeiro do Norte e Microchipagem Gratuita", "Institui mapeamento da população canina e felina e cadastro digital de animais domiciliados.", "TRAMITANDO"),
        ("PL-78/2026", "Espaço Pet Comunitário em Praças Públicas de Juazeiro", "Autoriza a instalação de parques cercados com obstáculos para socialização de animais em áreas verdes.", "TRAMITANDO"),
    ],
}

TEMAS_GERAIS = [
    ("Infraestrutura Urbana", "Dispõe sobre pavimentação e melhorias urbanas na malha viária de Juazeiro do Norte."),
    ("Saúde Básica", "Estabelece diretrizes para fortalecimento do atendimento nas Unidades Básicas de Saúde."),
    ("Iluminação e Eficiência", "Determina a substituição gradativa do parque de iluminação pública por lâmpadas de LED."),
    ("Apoio ao Comércio Local", "Incentiva feiras livres e pequenos empreendedores no município de Juazeiro."),
    ("Saneamento e Drenagem", "Prioriza investimentos em galerias pluviais para prevenção de alagamentos periódicos."),
    ("Cultura e Tradição Popular", "Reconhece manifestações culturais e incentiva festividades tradicionais do Cariri."),
    ("Mobilidade e Acessibilidade", "Obriga adaptação de calçadas e prédios públicos para pessoas com deficiência ou mobilidade reduzida."),
    ("Sustentabilidade e Meio Ambiente", "Cria ações de arborização urbana e preservação de áreas de recarga hídrica."),
]

# Deletar projetos anteriores
c.execute("DELETE FROM Projeto")

c.execute("SELECT id, slug, nomeParlamentar, totalProjetos FROM Vereador")
vereadores = c.fetchall()

total_projetos_criados = 0

for v_id, slug, nome_parlamentar, total_projetos in vereadores:
    if total_projetos == 0:
        continue
    
    # Se houver catálogo customizado
    custom_list = PROJETOS_CATALOGO.get(slug, [])
    
    for i in range(total_projetos):
        proj_id = f"proj-{v_id}-{i+1}"
        
        if i < len(custom_list):
            num, tit, emen, st = custom_list[i]
        else:
            tema, desc = TEMAS_GERAIS[i % len(TEMAS_GERAIS)]
            num = f"PL-{10 + i * 7}/{2026}"
            tit = f"Programa Municipal de {tema}"
            emen = f"{desc} Proposição legislativa do gabinete do vereador {nome_parlamentar} em tramitação ordinária na Câmara Municipal."
            st = "TRAMITANDO" if i % 3 != 0 else "APROVADO"
        
        c.execute("""
            INSERT INTO Projeto (
                id, vereadorId, tipo, numero, ano, titulo, ementa, status, dataApresentacao, linkOficial, createdAt
            )
            VALUES (?, ?, 'PROJETO_DE_LEI', ?, 2026, ?, ?, ?, '2026-02-10 00:00:00', 'https://camarajuazeiro.ce.gov.br/transparencia', CURRENT_TIMESTAMP)
        """, (
            proj_id,
            v_id,
            num,
            tit,
            emen,
            st
        ))
        total_projetos_criados += 1

conn.commit()

# Verificação
c.execute("""
    SELECT v.nomeParlamentar, v.totalProjetos, count(p.id)
    FROM Vereador v
    LEFT JOIN Projeto p ON p.vereadorId = v.id
    GROUP BY v.id
""")
print(f"Total de projetos inseridos no banco: {total_projetos_criados}")
for r in c.fetchall():
    print(f"  {r[0]}: Total Cadastrado={r[1]} | Projetos no Banco={r[2]}")

conn.close()
