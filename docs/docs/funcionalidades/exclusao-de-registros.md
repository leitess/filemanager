---
sidebar_position: 3
---

# Exclusão de Registros

## Historia de Usuario
Para essa funcionalidade foi escrito a historia de usuário abaixo:

```
Funcionalidade: Exlusão de registros

Como usuário
Eu quero poder excluir um arquivo e seu registro que eu havia feito upload 
De modo que esse arquivo seja completamente eliminado
```

## Cenário de Testes

O primeiro cenário verifica, se o arquivo escolhido foi deletado:
```
Cenário: Exclusão de um determinado arquivo com sucesso

Dado a tabela de arquivos
Quando for optado por deletar um arquivo da lista
Então o arquivo e seu registro deve ser apagado
```