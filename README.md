# Gerenciamento de Carga

Sistema web para gerenciamento de cargas, agendamentos e frotas, com controle de usuários e integração com APIs externas.

## Funcionalidades

- Cadastro, edição, exclusão e visualização de cargas
- Importação de cargas via planilha Excel ou API externa
- Exportação de dados para Excel
- Filtros, busca e ordenação de cargas
- Dashboard com estatísticas e gráficos
- Controle de usuários com permissões (admin, operador, visualizador)
- Cadastro de novos usuários (admin)
- Configuração da URL da API externa (admin)
- Detecção de conflitos de BOX-D
- Tema claro/escuro
- Suporte offline (PWA)
- Interface responsiva

## Tecnologias utilizadas

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Como rodar o projeto localmente

1. **Clone o repositório:**
   ```sh
   git clone https://github.com/CarlosTh0/gerenciamentobox.git
   cd gerenciamentobox
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```sh
   npm run dev
   ```
   O sistema estará disponível em [http://localhost:5173](http://localhost:5173) (ou porta exibida no terminal).

## Como atualizar o projeto no GitHub

Após fazer alterações locais:
```sh
git add .
git commit -m "Descreva suas alterações"
git push origin main
```

## Como configurar a integração com API externa

1. Faça login como administrador.
2. No menu lateral, acesse "Administração" e clique em "Configurar API Externa".
3. Informe a URL da API e salve.

## Permissões de usuário

- **Admin:** acesso total, pode cadastrar usuários e configurar API.
- **Operador:** pode editar cargas.
- **Visualizador:** apenas visualiza dados.

## Licença

Este projeto é de uso interno. Para uso comercial, consulte o autor.

---
Desenvolvido por CarlosTh0
