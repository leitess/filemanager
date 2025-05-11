---
sidebar_position: 4
---

Esse projeto usa uma arquitetura `onion` simples e é estilo arquitetural  "REST" significa "Representational State Transfer". 
É um estilo arquitetural para desenvolver Application Programming Interfaces - APIs, que define como os clientes podem se comunicar com os servidores para acessar e manipular dados. É uma série de princípios e não um protocolo específico. Sendo assim, será usado
as boas práticas do REST para expor as endpoint, rotas ou funcionalidade para os lado do cliente ou Frontend.

# Endpoints

|Código HTTP | Descrição | Endpoint |
|------------|-----------|----------|
|`POST` | Rota que inicializa a sessão de upload | `files/upload/start` | 
|`POST` | Rota para envio das partes do arquivo  | `files/upload/chunk/:sessionId/:chunkIndex` |
|`POST` | Rota que junta todas as partes do arquivo e conclui o upload | `files/upload/complete`|
|`GET` | Rota que lista todos os arquivos que foram armazenado na aplicação | `files/` |
|`GET` | Rota que retorna os metadados de um determinado arquivo | `files/:id` |
|`GET` | Rota que retorna os binarios de um determinado arquivo para que esse seja baixado | `files/:id/download` | 
|`DELETE` | Rota que deleta um determinado arquivo | `files/:id` |
|`PATCH` | Rota que atualiza partes de um arquivo | `files/:id` |

## Considerações
Nem todas as rotas foram testadas, apenas aquelas que são são cruciais para o upload de arquivos. 
