import sqlite3
import random

conn = sqlite3.connect("dev.db")
c = conn.cursor()

# Nomes e sobrenomes brasileiros autênticos para compor os assessores
PRIMEIROS_NOMES = [
    "Mariana", "Lucas", "Jorge", "Lúcia", "Samara", "Davi", "Camila", "Marcos",
    "Ana Beatriz", "Gabriel", "Raimunda", "Cícero", "Francisca", "João Paulo",
    "Patrícia", "Thiago", "Letícia", "Antônio Carlos", "Juliana", "Rodrigo",
    "Maria Eduarda", "Fábio", "Renata", "Marcelo", "Beatriz", "Diego",
    "Vanessa", "Leandro", "Aline", "Felipe", "Tatiana", "Danilo", "Larissa",
    "Paulo Henrique", "Fernanda", "Bruno", "Daniela", "Vinícius", "Priscila",
    "Rafael", "Amanda", "Carlos Eduardo", "Jéssica", "Everton", "Bianca", "Robson"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves",
    "Pereira", "Lima", "Gomes", "Costa", "Ribeiro", "Martins", "Carvalho",
    "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa", "Rocha",
    "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado",
    "Mendonça", "Freitas", "Cardoso", "Ramos", "Gonçalves", "Santana", "Teixeira",
    "Bezerra", "Cavalcante", "Farias", "Macedo", "Sampaio", "Pinheiro", "Monteiro"
]

CARGOS_PADRAO = [
    ("Chefe de Gabinete Parlamentar", 5500.0),
    ("Assessor Parlamentar Especial", 3800.0),
    ("Assessor Jurídico de Gabinete", 3500.0),
    ("Assessor de Comunicação e Mídias", 3000.0),
    ("Assessor de Articulação Comunitária", 2800.0),
    ("Assessor Técnico Legislativo", 2800.0),
    ("Secretário de Gabinete", 2500.0),
    ("Assessor de Apoio aos Bairros", 2500.0),
    ("Assessor de Atendimento ao Cidadão", 2500.0),
    ("Oficial de Gabinete", 2200.0),
    ("Auxiliar de Gabinete Parlamentar", 2000.0),
    ("Assessor de Políticas Setoriais", 2400.0),
    ("Assessor de Relações Institucionais", 2600.0),
    ("Assessor de Projetos e Fiscalização", 2700.0),
    ("Assessor Operacional de Gabinete", 2100.0),
    ("Assessor Parlamentar Regional (Cariri)", 2500.0),
    ("Assistente Administrativo de Gabinete", 2000.0),
    ("Secretário de Atendimento Popular", 2300.0),
]

# Buscar todos os vereadores
c.execute("SELECT id, nomeParlamentar, totalAssessores FROM Vereador")
vereadores = c.fetchall()

# Limpar assessores anteriores para recriar a lista completa
c.execute("DELETE FROM Assessor")

total_inseridos = 0
used_names = set()

for v_id, nome_parlamentar, total_assessores in vereadores:
    # Gerar exatamente total_assessores para cada vereador
    for i in range(total_assessores):
        # Gerar nome único
        while True:
            p_nome = random.choice(PRIMEIROS_NOMES)
            sob1 = random.choice(SOBRENOMES)
            sob2 = random.choice(SOBRENOMES)
            if sob1 != sob2:
                nome_completo = f"{p_nome} {sob1} {sob2}"
                if nome_completo not in used_names:
                    used_names.add(nome_completo)
                    break
        
        # Cargo baseado na posição da lista
        if i < len(CARGOS_PADRAO):
            cargo, remun = CARGOS_PADRAO[i]
        else:
            cargo, remun = ("Assessor de Gabinete Parlamentar", 2200.0)
            
        assessor_id = f"assessor-{v_id}-{i+1}"
        
        c.execute("""
            INSERT INTO Assessor (id, vereadorId, nome, cargo, remuneracaoBruta, lotacao, dataNomeacao, ativo, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, '2025-01-02 00:00:00', 1, CURRENT_TIMESTAMP)
        """, (
            assessor_id,
            v_id,
            nome_completo,
            cargo,
            remun,
            f"Gabinete do Vereador {nome_parlamentar}"
        ))
        total_inseridos += 1

conn.commit()

# Verificação
c.execute("""
    SELECT v.nomeParlamentar, v.totalAssessores, count(a.id)
    FROM Vereador v
    LEFT JOIN Assessor a ON a.vereadorId = v.id
    GROUP BY v.id
""")
print(f"Total de assessores inseridos no banco: {total_inseridos}")
for row in c.fetchall():
    print(f"  {row[0]}: Meta={row[1]} | Inseridos={row[2]}")

conn.close()
