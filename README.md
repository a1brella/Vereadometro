# 🏛️ Vereadômetro Juazeiro do Norte

Plataforma cívica e independente de auditoria, transparência política e mobilização popular fiscalizando os 21 vereadores da Câmara Municipal de Juazeiro do Norte / Ceará.

---

## ⚡ Principais Funcionalidades

1. **Ranking Geral de Gastos & Custo por Projeto**:
   - Salário base oficial (Lei Municipal nº 5.568/2024 - R$ 18.000 a R$ 24.000).
   - Discriminação dos gastos de gabinete e verba indenizatória (CEAP).
   - Cálculo automático do custo por projeto apresentado.

2. **Auditoria Nominal de Gabinete (251 Assessores)**:
   - Exibição de 100% dos assessores nomeados por vereador com cargo e remuneração bruta.
   - Lista integral de projetos de lei protocolados no SAPL (Sistema de Apoio ao Processo Legislativo).

3. **Monitor & Transcrição Automática da Tribuna (TV Câmara YouTube)**:
   - Pipeline de extração e transcrição contínua de sessões e audiências públicas.
   - **Máquina de Estados Regimental**: Identifica o orador no púlpito através das passagens formais da Mesa Diretora.
   - **Modo Parágrafos Fluídos**: Agrupamento em blocos coerentes de fala para leitura humana natural.
   - Filtros cruzados por **Orador** e **Pautas Temáticas** (Saúde, Obras, Educação, etc.) com timestamps clicáveis para o vídeo oficial.
   - Classificação instantânea com **Jev (TypeSafe AI)** para detecção de tom, alinhamento político e denúncias sem custo de tokens generativos.

4. **Hub de Mobilização & Lei de Iniciativa Popular (Trava-Salário)**:
   - Coletor de assinaturas populares com validação de Título de Eleitor e Zona Eleitoral (28ª e 119ª Zonas do Cariri).
   - Termômetro em tempo real visando 5.000 assinaturas para protocolo formal.

5. **Funil de Alertas Cívicos via WhatsApp**:
   - Inscrição por bairro de Juazeiro do Norte e vereador de interesse para recebimento de extrato mensal e alertas de votação.

---

## 🛠️ Stack Tecnológica

- **Frontend & SSR**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19) + [Tailwind CSS](https://tailwindcss.com/)
- **Ícones & UI**: [Lucide React](https://lucide.dev/)
- **Banco de Dados & ORM**: [Prisma ORM 7](https://www.prisma.io/) com SQLite via `@prisma/adapter-libsql`
- **Classificador de IA**: Jev Model (`typesafe_sdk`) para inferência em sub-segundo (<120ms)
- **ETL & Transcrições**: Python (`youtube-transcript-api`, `playwright`, `sqlite3`)
- **Dados Oficiais**: TSE (Eleições 2024), Portal da Transparência de Juazeiro do Norte, TCE-CE (SIM 2.0 - Município 094).

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório e instalar dependências
```bash
git clone https://github.com/a1brella/Vereadometro.git
cd Vereadometro
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
DATABASE_URL="file:./dev.db"
```

### 3. Gerar client do Prisma e popular o banco de dados
```bash
npx prisma generate --config prisma7.config.ts
npx tsx prisma/seed.ts
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse em seu navegador: [http://localhost:3000](http://localhost:3000)

### 5. Executar o Monitor de Sessões do YouTube (Opcional)
```bash
python scripts/monitor_sessao_youtube.py
```

---

## ⚖️ Licença e Responsabilidade

Projeto cívico de código aberto desenvolvido com respaldo na **Lei de Acesso à Informação (Lei Federal nº 12.527/2011)** e na **Lei de Responsabilidade Fiscal (LC nº 101/2000)**. Todos os dados financeiros e registros funcionais são de domínio público.
