---
sidebar_position: 1
---

# MongoDB

Foi usado o mongoDB (versão 8.0.0), banco de dados não SQL. Se não tiver o banco de dados instalado, mas
tiver o Docker, use o comando abaixo:

```bash
docker run -d --name files_db -p 27017:27017 mongo:8.0
```

O banco de dados possui as coleções:

`files`: Onde são armazenado os metadados dos arquivos (nome, tipo de mime, tamanho e id que é dado ao arquivo).

`uploadsessions`: Onde são armazenada as sessões de upload (além do ID da sessão, as partes, se upload concluiu; é armazenado também os metadados - nome, tamanho, quantidade de partes que o arquivo possui).

Além disso, possui mais duas coleções criadas pelo GridFS.