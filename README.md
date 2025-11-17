# api-horario

API para gerenciamento de horários e grades curriculares.

## Funcionalidades

- ✅ Sistema de autenticação e autorização (JWT + Roles)
- ✅ Gerenciamento de usuários e perfis
- ✅ Gestão de professores e disciplinas
- ✅ Controle de salas e células
- ✅ Criação e gerenciamento de grades horárias
- ✅ Controle de disponibilidade

## Documentação

- [Sistema de Autenticação e Autorização](./AUTHENTICATION.md) - Documentação completa sobre login, registro e controle de acesso

## Configuração

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (veja `.env.example`)
4. Execute o schema do banco de dados: `database/schema_auth.sql`
5. Execute em desenvolvimento: `npm run dev`
6. Ou compile e execute: `npm run build && npm start`

## Variáveis de Ambiente Obrigatórias

```env
JWT_SECRET=seu_segredo_jwt_aqui_minimo_32_caracteres
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_DATABASE=api_horario
```

## Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa versão compilada
- `npm run typecheck` - Verifica tipos TypeScript sem compilar

