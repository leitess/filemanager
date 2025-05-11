# 📁 Aplicação de Gerenciamento de Arquivos

FileManager é uma aplicação para gerenciamento de arquivos que permite o cadastro, edição, exclusão, 
listagem e download de arquivos, junto com seus metadados. O sistema oferece flexibilidade ao usuário, 
permitindo tanto uploads diretos com metadados automáticos quanto cadastros manuais com upload opcional.

Acesse a documentação completa [clicando aqui](https://leitess.github.io/filemanager/)

## 🚀 Funcionalidades
 - **Upload de arquivos e salvamento de seus metadados**
    - Nome do arquivo
    - Tipo (MIME)
    - Tamanho
    - Data de envio
    - etc.

- **Edição de registros**
    - Atualização do arquivo e/ou seus metadados

- **Exclusão de registros**
    - Remove o arquivo e seus metadados do sistema

- **Listagem dos arquivos**
    - Interface com visualização resumida dos arquivos

- **Download do arquivo**
    - Ao selecionar um registro, é exibida a URL para download direto

## Como rodar?
O projeto está dividido em três partes: backend, frontend e a documentação (gerada usando o [Docusaurus](http://docusaurus.io/)).

### Backend
Para inicializar o backend, use o comando:
```bash
cd server
npm run start
```

Para testar o backend, use o comando:

```bash
cd server
npm run test
```

### Frontend
Para inicializar o frontend, use o comando:
```bash
cd client
npm run dev
```

E a aplicação estará funcionando em [http://localhost:5173/](http://localhost:5173/).

Com o frontend inicializado, é possivel testa-lo usando o comando em outro terminal:

```bash
cd client
npm run test
```

### Documentação completa
Para ter acesso a documentação completa, use o comando:

```bash
cd docs
npm run start
```

E depois acesse a documentação por meio desse link: [http://localhost:3000/filemanager/](http://localhost:3000/filemanager/).