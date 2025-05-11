---
sidebar_position: 2
---

# Edição de registros

## Historia de Usuario
Para essa funcionalidade foi escrito a historia de usuário abaixo:

```
Funcionalidade: Edição dos metadados de um arquivo

Como usuário
Eu quero poder editar os metadados de um arquivo e poder substituir um arquivo já existente
De modo que corrija o conteúdo de um arquivo ou seus metadados
```

## Cenário de Testes


O primeiro cenário de testes verifica se os metadados foram editado com sucesso:
```
Cenário: Metadados atualizados com sucesso

Dado a tabela de arquivos
Quando optar por editar os metadados de um arquivo
E preencher todos os campos corretamente
Então os metadados do arquivo estarão atualizado
```