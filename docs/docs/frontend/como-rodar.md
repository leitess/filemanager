---
sidebar_position: 2
---

# Como rodar?
Antes de rodar o frontend crie um arquivo `.env` com o seguinte conteúdo:

```title=".env"
APP_API_URL="URL da API"
APP_MODE="Modo dev ou test"
```
Exemplo:
```title=".env"
APP_API_URL=http://localhost:3003/ 
APP_MODE="test"
```

É de suma importância que haja o APP_MODE no `.env`, pois este muda o projeto de
desenvolvimento para testes. 

Para rodar o frontend, use o comando abaixo:

```bash
cd client
npm run dev
```

E a aplicação estará rodando em [http://localhost:5173/](http://localhost:5173/)