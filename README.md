# NLW Agents

Este projeto foi desenvolvido durante o evento NLW da Rocketseat.

## 📝 Descrição
API para gerenciamento de salas e agentes, utilizando Node.js, TypeScript e Drizzle ORM.

## 🚀 Tecnologias e Bibliotecas Utilizadas
- **Node.js**
- **TypeScript**
- **Drizzle ORM** (migrations e seed)
- **PostgreSQL** (banco de dados)
- **Docker** (opcional, para ambiente isolado)

## 🏗️ Padrões de Projeto
- Estrutura modular de pastas (`src/db`, `src/http/routes`, `src/schema`)
- Separação de responsabilidades (conexão, schema, rotas)

## ⚙️ Setup e Configuração

1. **Clone o repositório:**
   ```sh
   git clone <url-do-repo>
   cd nlw-agents-server
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Copie o arquivo `.env.example` para `.env`:
     ```sh
     cp .env.example .env
     ```
   - Ajuste as variáveis de ambiente no arquivo `.env` conforme necessário.

4. **Rode as migrations e seed:**
   ```sh
   npm run db:migrate
   npm run db:seed
   ```

5. **Inicie o servidor:**
   ```sh
   npm run dev
   ```

## 📡 Exemplos de chamadas aos serviços

### Health Check
```http
GET http://localhost:3334/health
```

### Listar Salas
```http
GET http://localhost:3334/rooms
```

### Criar Sala
```http
POST http://localhost:3334/rooms
Content-Type: application/json

{
  "name": "Sala de teste",
  "description": "Essa sala é de teste"
}
```

### Listar Perguntas de uma Sala
```http
GET http://localhost:3334/rooms/{roomId}/questions
```

### Enviar Texto para a Sala
```http
POST http://localhost:3334/rooms/{roomId}/text
Content-Type: application/json

{
  "text": "Eu tenho um cachorro que se chama Max."
}
```

### Criar Pergunta em uma Sala
```http
POST http://localhost:3334/rooms/{roomId}/questions
Content-Type: application/json

{
  "question": "Qual o nome do cachorro?"
}
```

## 📌 Observações
- O arquivo de configuração do Drizzle é [`drizzle.config.ts`](drizzle.config.ts).
- Scripts de seed e migrations estão em [`src/db`](src/db).

---
Projeto desenvolvido durante o NLW da Rocketseat.