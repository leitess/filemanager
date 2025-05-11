import { useState } from 'react';
import { useFileUploadHook } from '../hooks/File.hook';
import type { FileMetadata } from '../hooks/FileMetadata';
import {
  ActionButton,
  Container,
  FileInput,
  FileTable,
  TableCell,
  TableHeader,
  UploadButton,
} from './Home.page.styles';

export const HomePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filenameEdit, setFilenameEdit] = useState('');
  const [mimetypeEdit, setMimetypeEdit] = useState('');

  const {
    uploadFile,
    progress,
    uploading,
    error,
    downloadUrl,
    downloadUri,
    filename,
    files,
    deleteFile,
    editMetadata,
    getFileUrl,
  } = useFileUploadHook();

  const handleUpload = () => {
    if (file) uploadFile(file);
  };

  const handleEdit = (file: FileMetadata) => {
    setEditingId(file.id);
    setFilenameEdit(file.filename);
    setMimetypeEdit(file.mimetype);
  };

  const handleDownload = async (fileId: string) => {
    await getFileUrl(fileId);

    if (downloadUri === '') {
      return;
    }
    const link = document.createElement('a');
    link.href = downloadUri;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
  };

  const saveEdit = async () => {
    if (editingId) {
      await editMetadata(editingId, {
        filename: filenameEdit,
        mimetype: mimetypeEdit,
      });
      setEditingId(null);
    }
  };

  return (
    <Container>
      <h1>📁 File Manager</h1>
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <FileInput
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <UploadButton onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? `Enviando... (${progress}%)` : 'Enviar'}
        </UploadButton>
      </Container>
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {downloadUrl && (
          <p>
            Download:{' '}
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              Clique aqui
            </a>
          </p>
        )}
        {error && <p style={{ color: 'red' }}>Erro: {error}</p>}
      </Container>
      {files && files.length > 0 ? (
        <FileTable>
          <thead>
            <tr>
              <TableHeader>Arquivo</TableHeader>
              <TableHeader>Mimetype</TableHeader>
              <TableHeader>Ações</TableHeader>
            </tr>
          </thead>

          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <TableCell>
                  {editingId === file.id ? (
                    <input
                      data-testid={`filename-edit-${file.id}`}
                      value={filenameEdit}
                      onChange={(e) => setFilenameEdit(e.target.value)}
                    />
                  ) : (
                    file.filename
                  )}
                </TableCell>
                <TableCell>
                  {editingId === file.id ? (
                    <input
                      data-testid={`mimetype-edit-${file.id}`}
                      value={mimetypeEdit}
                      onChange={(e) => setMimetypeEdit(e.target.value)}
                    />
                  ) : (
                    file.mimetype
                  )}
                </TableCell>
                <TableCell>
                  {editingId === file.id ? (
                    <>
                      <ActionButton onClick={saveEdit}>Salvar</ActionButton>
                      <ActionButton onClick={() => setEditingId(null)}>
                        Cancelar
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton
                        data-testid={`edit-button-${file.id}`}
                        onClick={() => handleEdit(file)}
                      >
                        Editar
                      </ActionButton>
                      <ActionButton onClick={() => deleteFile(file.id)}>
                        Excluir
                      </ActionButton>
                      <ActionButton onClick={() => handleDownload(file.id)}>
                        Baixar
                      </ActionButton>
                    </>
                  )}
                </TableCell>
              </tr>
            ))}
          </tbody>
        </FileTable>
      ) : (
        <h3>Não há arquivos cadastrados</h3>
      )}
    </Container>
  );
};
