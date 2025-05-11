describe('File Manager', () => {
  beforeEach(() => {
    cy.intercept('GET', '/files/', { fixture: 'files.json' }).as('getFiles');
    cy.visit('/');
  });

  it('when there are file then it renders a table', () => {
    cy.wait('@getFiles');
    cy.contains('documento.pdf').should('exist');
    cy.contains('imagem.jpg').should('exist');
  });

  it('when it edits file metadada then it store the new information', () => {
    cy.wait('@getFiles');

    cy.intercept('PATCH', '**/files/1', {
      statusCode: 200,
      body: { filename: 'novo_nome.pdf', mimetype: 'application/pdf' },
    }).as('editFile');

    cy.contains('documento.pdf')
      .should('exist')
      .then(($el) => {
        cy.wrap($el)
          .closest('tr')
          .within(() => {
            cy.contains('Editar').click();
            cy.get('[data-testid="filename-edit-1"]')
              .clear()
              .type('novo_nome.pdf');
            cy.get('[data-testid="mimetype-edit-1"]')
              .clear()
              .type('application/pdf');
            cy.contains('Salvar').click();
          });
      });

    cy.wait('@editFile');
  });

  it('when it delete a file then it is remove from backend and table', () => {
    cy.wait('@getFiles');

    cy.intercept('DELETE', '/files/1', {}).as('deleteFile');
    cy.intercept('GET', '/files/', { fixture: 'files_after_delete.json' }).as(
      'refreshFiles',
    );

    cy.contains('documento.pdf')
      .parent()
      .within(() => {
        cy.contains('Excluir').click();
      });

    cy.wait('@deleteFile');
    cy.wait('@refreshFiles');
  });

  it('when it sends a file then it is uploaded in backend', () => {
    const fileName = 'test.txt';
    const fileContent = 'Arquivo de teste';
    const file = new File([fileContent], fileName, { type: 'text/plain' });

    cy.intercept('POST', '/files/upload/start', {}).as('startUpload');
    cy.intercept('POST', /\/files\/upload\/chunk\/.*/, {}).as('uploadChunk');
    cy.intercept('POST', '/files/upload/complete', { body: { id: '123' } }).as(
      'completeUpload',
    );
    cy.intercept('GET', '/files/123/download', {
      statusCode: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="test.txt"',
      },
      body: new Blob(['Arquivo de teste'], { type: 'text/plain' }),
    }).as('download');
    cy.intercept('GET', '/files/', { fixture: 'files_after_upload.json' }).as(
      'refreshFiles',
    );

    cy.get('input[type="file"]').selectFile({ contents: file, fileName });
    cy.contains('Enviar').click();

    cy.wait('@startUpload');
    cy.wait('@uploadChunk');
    cy.wait('@completeUpload');
    cy.wait('@download');
    cy.wait('@refreshFiles');
  });

  it('when there are a file in table then it can be downloaded', () => {
    cy.wait('@getFiles');

    cy.intercept('GET', '/files/1/download', {
      statusCode: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="documento.pdf"',
      },
      body: new Blob(['%PDF-1.4 ...'], { type: 'application/pdf' }),
    }).as('downloadFile');

    cy.contains('documento.pdf')
      .parent()
      .within(() => {
        cy.contains('Baixar').click();
      });

    cy.wait('@downloadFile');
  });

  it('when there are not files store then it tells that there are files saved', () => {
    cy.intercept('GET', '/files/', []).as('emptyFiles');
    cy.visit('/');
    cy.wait('@emptyFiles');
    cy.contains('Não há arquivos cadastrados').should('exist');
  });

  it('when there are files store then a download of a file failed', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Cannot read properties of undefined')) {
        return false;
      }

      return true;
    });
    cy.wait('@getFiles');

    cy.intercept('GET', '/files/1/download', {
      statusCode: 500,
      headers: {
        'Content-Disposition': 'attachment; filename="documento.pdf"',
      },
      body: { message: 'Request failed with status code 500' },
    }).as('downloadFail');

    cy.contains('documento.pdf')
      .parent()
      .within(() => {
        cy.contains('Baixar').click();
      });

    cy.wait(5000);
    cy.wait('@downloadFail');

    cy.contains('Request failed with status code 500').should('exist');
  });

  it('when it sends a file then the upload failed', () => {
    const fileName = 'erro.txt';
    const fileContent = 'conteúdo de teste';
    const file = new File([fileContent], fileName, { type: 'text/plain' });

    cy.intercept('POST', '/files/upload/start', {
      statusCode: 500,
      body: { message: 'Request failed with status code 500' },
    }).as('uploadStartFail');

    cy.get('input[type="file"]').selectFile({ contents: file, fileName });
    cy.contains('Enviar').click();

    cy.wait('@uploadStartFail');

    cy.contains('Request failed with status code 500').should('exist');
  });
});
