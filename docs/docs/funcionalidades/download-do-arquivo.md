---
sidebar_position: 5
---

# Download do arquivo

## Historia de Usuario
Para essa funcionalidade foi escrito a historia de usuário abaixo:

```
Funcionalidade: Download do arquivo

Como usuário
Eu quero poder realizar o download do arquivo
De modo que eu possa ter o arquivo de volta, salvo na minha maquina
```

## Cenário de Testes

O primeiro cenário de testes verifica se o download foi feito:
```
Cenário: Download direto com sucesso

Dado a lista de arquivos
Quando optar por baixar o arquivo direto
Então o download começará e o arquivo será salvo com o nome original do arquivo
```

O segundo cenário de testes verifica se o usuário teve acesso ao link para baixar o arquivo:
```
Cenário: Download

Dado a lista de arquivos
Quando optar por baixar o arquivo
Então aparecerá uma mensagem dizendo que houve um erro na hora de realizar o download
```