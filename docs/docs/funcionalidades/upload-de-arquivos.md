---
sidebar_position: 1
---

# Upload de Arquivos

## Historia de Usuario
Para essa funcionalidade foi escrito a historia de usuário abaixo:

```
Funcionalidade: Upload de Arquivos

Como usuário
Eu quero poder realizar upload de arquivos de qualquer tipo e tamanho
De modo que os meus arquivos fiquem armazenado na nuvem e eu possa acessar de qualquer lugar
```

## Cenário de Testes
Dado a historia de usuário, os testes de comportamento ajudaram a pensar na implementação da funcionalidade, pois este foi 
um desafio novo para o autor, sendo assim os testes seguem um fluxo que permite  pensar em cada etapa para iniciar a sessão de
upload, armazenar as partes do arquivo, juntar as partes novamente e completar o upload e permitir que o usuario baixe o arquivo
novamente:

```
Cenário: Sessão de upload inicia

Dado um arquivo inserido para upload
Quando iniciar uma sessão de upload
E o nome do arquivo for identificado, o mimetype, o tamanho do arquivo e a quantidade de partes que o arquivo possui
Então a sessão será armazenada no banco de dados e os metadados retornado para o usuário
```

O segundo cenario, verifica o envio das partes do arquivo e a queda de internet no meio do envio:

```
Cenário: Upload continua após a queda de conexão

Dado uma sessão de upload que começou
Quando for feito o upload de uma parte do arquivo
E a conexão de internet do usuário cair
E o backend tentar realizar o upload das partes restantes novamente
Então a parte que deveria ser salva quando a internet caiu, é salva; assim como as demais partes
```

O terceiro cenário visa em verificar o comportamento do upload, após todas as partes do arquivo ter sido salva:

```
Cenário: Upload conclui após receber todas as partes do arquivo


Dado uma sessão de upload que começou
Quando todos as partes do arquivo forem montadas
E o nome do arquivo que foi armazenado tiver o mesmo nome do arquivo que foi armazenado no banco de dados
Então o upload deve ser concluido
```

O quarto cenário, é similar ao anterior, mas visa em verificar o comportamento do upload de um arquivo grande
com sucesso:

```
Cenário: Upload conclui após receber todas as partes de um arquivo grande


Dado uma sessão de upload de um arquivo grande que começou
Quando todos as partes do arquivo forem montadas
E o nome do arquivo que foi armazenado tiver o mesmo nome do arquivo que foi armazenado no banco de dados
Então o upload deve ser concluido
```

O quinto cenario visa em verificar o comportamento do upload, após ocorrer a queda de conexão de internet no meio
de um upload de um arquivo grande:

```
Cenário: Upload de um arquivo grande continua após a queda de conexão

Dado uma sessão de upload de um arquivo grande que começou
Quando for feito o upload de partes do arquivo
E a conexão de internet do usuário cair
E o backend tentar realizar o upload das partes restantes novamente
Então o upload do arquivo grande conclui
```
