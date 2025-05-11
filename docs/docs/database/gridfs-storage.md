---
sidebar_position: 2
---

# GridFS Storage
O GridFS é um sistema de armazenamento de arquivos usado pelo MongoDB para lidar com arquivos grandes.

O gridFs cria mais duas coleções no banco:

`uploads.files`: Armazena os metadados de cada arquivo (nome, tamanho, tipo, data de upload, etc.).

`upload.chunks`: Armazena os pedaços binários do arquivo. Cada chunk contém parte do conteúdo do arquivo e está associado a um documento em `uploads.files` via `filesId`.

Em outras palavras, `uploads.files` representa o arquivo como um todo, e `upload.chunks` armazena seu conteúdo fragmentado.

Ou seja, não está sendo salvo o arquivo em uma pasta no backend. Por conveniência, o GridFS
não é o melhor dos dois mundos, quando se trata de performance e aumenta o uso do banco de
dados. Entretanto, pode ser uma excelente opção, quando quer evitar usar o disco local. 