---
sidebar_position: 6
---

# Testes de Integração

Os testes de integração, visam em verificar como o frontend e o backend podem se integrar. Para isso, não será
usado a API real, mas sim um mock dela, afim de simular o comportamento da funcionalidade e se está conforme o
cenário definido anteriormente. Os testes de integração ajudaram a entender os disparo de eventos (clique no botão, clique no link), para poder ter uma noção de como seria, mais ou menos, se este projeto estivesse em produção.

Não será mostrado todas as funções que estão sendo chamadas e todos os algoritmos por trás
dessas funções. Contudo, em suma o que acontece é que o componente (ou página), faz uso de
um hook, no qual usa a biblioteca `axios` para poder realizar a requisição (se comunicar)
com o backend. Por sua vez, no backend há as rotas que chamam as controllers, as controllers
chamam as services e as services chamam os repositories. De forma, linear a requisição vai
e a resposta vêm e permite renderizar os dados na página.

## Visualização de arquivos

O teste abaixo, visa acessar página de principal e realizar uma requisição na endpoint:

`GET`:`files/`

E obtém todos os arquivos cadastrados:

```ts title="cypress/e2e/Home.page.spec.cy.ts"
     cy.intercept('GET', '/files/', { fixture: 'files.json' }).as('getFiles');
    cy.visit('/');

    ...

  it('when there are file then it renders a table', () => {
    cy.wait('@getFiles');
    cy.contains('documento.pdf').should('exist');
    cy.contains('imagem.jpg').should('exist');
  });
```

O teste abaixo, verifica o comportamento do sistema, quando não há arquivos salvos no
backend.

```ts title=""
it("when there are not files store then it tells that there are files saved", () => {
  cy.intercept("GET", "/files/", []).as("emptyFiles");
  cy.visit("/");
  cy.wait("@emptyFiles");
  cy.contains("Não há arquivos cadastrados").should("exist");
});
```

Estes dois testes serviram para verificar se a visualização está funcionando como esperado.

## Upload de um arquivo

Abaixo está um teste quando o upload de um arquivo vai com sucesso:

```ts title=""
it("when it sends a file then it is uploaded in backend", () => {
  const fileName = "test.txt";
  const fileContent = "Arquivo de teste";
  const file = new File([fileContent], fileName, { type: "text/plain" });

  cy.intercept("POST", "/files/upload/start", {}).as("startUpload");
  cy.intercept("POST", /\/files\/upload\/chunk\/.*/, {}).as("uploadChunk");
  cy.intercept("POST", "/files/upload/complete", { body: { id: "123" } }).as(
    "completeUpload"
  );
  cy.intercept("GET", "/files/123/download", {
    statusCode: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="test.txt"',
    },
    body: new Blob(["Arquivo de teste"], { type: "text/plain" }),
  }).as("download");
  cy.intercept("GET", "/files/", { fixture: "files_after_upload.json" }).as(
    "refreshFiles"
  );

  cy.get('input[type="file"]').selectFile({ contents: file, fileName });
  cy.contains("Enviar").click();

  cy.wait("@startUpload");
  cy.wait("@uploadChunk");
  cy.wait("@completeUpload");
  cy.wait("@download");
  cy.wait("@refreshFiles");
});
```

Abaixo está um teste de integração, onde o upload de um arquivo falhou:

```ts title=""
it("when it sends a file then the upload failed", () => {
  const fileName = "erro.txt";
  const fileContent = "conteúdo de teste";
  const file = new File([fileContent], fileName, { type: "text/plain" });

  cy.intercept("POST", "/files/upload/start", {
    statusCode: 500,
    body: { message: "Request failed with status code 500" },
  }).as("uploadStartFail");

  cy.get('input[type="file"]').selectFile({ contents: file, fileName });
  cy.contains("Enviar").click();

  cy.wait("@uploadStartFail");

  cy.contains("Request failed with status code 500").should("exist");
});
```

Upload pode ser um grande desafio, por isso foi decidido verificar o comportamento e como o frontend se integra com o backend para poder realizar o envio e armazamento de arquivos.

## Edição de metadados

Abaixo está um exemplo de teste de integração de edição de metadados de um arquivo:

```ts title=""
it("when it edits file metadada then it store the new information", () => {
  cy.wait("@getFiles");

  cy.intercept("PATCH", "**/files/1", {
    statusCode: 200,
    body: { filename: "novo_nome.pdf", mimetype: "application/pdf" },
  }).as("editFile");

  cy.contains("documento.pdf")
    .should("exist")
    .then(($el) => {
      cy.wrap($el)
        .closest("tr")
        .within(() => {
          cy.contains("Editar").click();
          cy.get('[data-testid="filename-edit-1"]')
            .clear()
            .type("novo_nome.pdf");
          cy.get('[data-testid="mimetype-edit-1"]')
            .clear()
            .type("application/pdf");
          cy.contains("Salvar").click();
        });
    });

  cy.wait("@editFile");
});
```

Esse teste serviu para verificar como ocorre a edição de metadados dos arquivos, quando estes já estão armazenados no banco de dados.

## Exclusão de arquivos

Abaixo está um teste que visa excluir um determinado arquivo da tabela:

```ts title=""
it("when it delete a file then it is remove from backend and table", () => {
  cy.wait("@getFiles");

  cy.intercept("DELETE", "/files/1", {}).as("deleteFile");
  cy.intercept("GET", "/files/", { fixture: "files_after_delete.json" }).as(
    "refreshFiles"
  );

  cy.contains("documento.pdf")
    .parent()
    .within(() => {
      cy.contains("Excluir").click();
    });

  cy.wait("@deleteFile");
  cy.wait("@refreshFiles");
});
```

Este teste serviu para verificar o que deve acontecer quando um arquivo for deletado do banco de dados, no caso, deve haver uma atualização quase que imediata da tabela.

## Download de um arquivo

Abaixo está o download de um arquivo:

```ts title=""
it("when there are a file in table then it can be downloaded", () => {
  cy.wait("@getFiles");

  cy.intercept("GET", "/files/1/download", {
    statusCode: 200,
    headers: {
      "Content-Disposition": 'attachment; filename="documento.pdf"',
    },
    body: new Blob(["%PDF-1.4 ..."], { type: "application/pdf" }),
  }).as("downloadFile");

  cy.contains("documento.pdf")
    .parent()
    .within(() => {
      cy.contains("Baixar").click();
    });

  cy.wait("@downloadFile");
});
```

Abaixo está o primeiro teste de integração que falhou, mostrando que deve ser necessario
refatorar o hook para melhor tratamento de erros de requisição:

```ts title=""
it("when there are files store then a download of a file failed", () => {
  Cypress.on("uncaught:exception", (err, runnable) => {
    if (err.message.includes("Cannot read properties of undefined")) {
      return false;
    }

    return true;
  });
  cy.wait("@getFiles");

  cy.intercept("GET", "/files/1/download", {
    statusCode: 500,
    headers: {
      "Content-Disposition": 'attachment; filename="documento.pdf"',
    },
    body: { message: "Request failed with status code 500" },
  }).as("downloadFail");

  cy.contains("documento.pdf")
    .parent()
    .within(() => {
      cy.contains("Baixar").click();
    });

  cy.wait(5000);
  cy.wait("@downloadFail");

  cy.contains("Request failed with status code 500").should("exist");
});
```

Esses dois testes, visaram em ajudar a entender como deveria ser o download de arquivos, embora o ultimo não tenha passado; a ideia era simular um caso onde não foi retornado os binarios do arquivo, mas sim um erro. Realizar o download de arquivos pode ser tão desafiador quando o upload, essa funcionalidade e a funcionalidade de upload merecem bastante atenção, pois estas funcionalidades, normalmente, são diferenciais nos sistemas e aplicações.
