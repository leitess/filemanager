---
sidebar_position: 4
---

# Listagem dos arquivos

## Historia de Usuario
Para essa funcionalidade foi escrito a historia de usuário abaixo:

```
Funcionalidade: Listagem de Arquivos

Como usuário
Eu quero poder visualizar todos os arquivos que eu fiz upload
De modo que os eu saiba quais arquivos estão salvos no gerenciador de arquivos
```

## Cenário de Testes


Para essa funcionalidade, foi pensado em verificar se há arquivos e as linhas e colunas estão preenchidas de forma correta:
```
Cenário: Listagem correta dos arquivos

Dado a tabela de arquivos
Quando houver arquivos cadastrados
E as linhas e colunas for preenchidas
E estiverem preenchidas corretamente
Então a lista de arquivos vai está correta e haverá arquivos armazenados na aplicação
```

O segundo cenario visa em verificar o comportamento da listagem, quando não há arquivos cadastrados:
```
Cenário: Não há arquivos cadastrados na aplicação

Dado a tabela de arquivos
Quando não houver arquivos
Então deve ser mostrado um aviso dizendo que o usuário não fez upload de arquivos ainda
```