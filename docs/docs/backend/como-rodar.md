---
sidebar_position: 2
---

# Como rodar?
Antes de rodar o backend crie um arquivo `.env` com o seguinte conteúdo:

```title=".env"
DATABASE_URI="string de conexão"
```

Exemplo:
```title=".env"
DATABASE_URI=mongodb://localhost:27017/files
```

Para rodar o backend use o comando:
```bash
cd server
npm run start
```

