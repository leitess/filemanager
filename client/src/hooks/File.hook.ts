import { useState, useEffect } from 'react';
import type { FileMetadata } from './FileMetadata';
import { api } from '../services/api';

const CHUNK_SIZE = 1024 * 1024 * 5;

export function useFileUploadHook() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadUri, setDownloadUri] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [files, setFiles] = useState<FileMetadata[]>([]);

  const uploadFile = async (file: File) => {
    setProgress(0);
    setError(null);
    setUploading(true);
    setDownloadUrl(null);

    const sessionId = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      await api.post('files/upload/start', {
        sessionId,
        metadata: {
          filename: file.name,
          mimetype: file.type,
          filesize: file.size,
          totalChunks,
        },
      });

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const buffer = await chunk.arrayBuffer();

        await api.post(`files/upload/chunk/${sessionId}/${i}`, buffer, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });

        setProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      const res = await api.post('files/upload/complete', {
        sessionId,
      });

      const fileId = res.data.id;
      const response = await api.get(`files/${fileId}/download`, {
        responseType: 'blob',
      });
      const blob = response.data;
      const uri = URL.createObjectURL(blob);
      setDownloadUrl(uri);
      await listFiles();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const listFiles = async () => {
    const res = await api.get<FileMetadata[]>('files/');
    setFiles(res.data);
  };

  const getFileUrl = async (fileId: string) => {
    const response = await api.get(`files/${fileId}/download`, {
      responseType: 'blob',
    });
    const blob = response.data;

    const contentDisposition = response.headers['content-disposition'];
    const fileNamePart = contentDisposition.split('filename=')[1];
    const filename = fileNamePart.replace(/["']/g, '').trim();

    const uri = URL.createObjectURL(blob);

    setDownloadUri(uri);
    setFilename(filename);
  };

  const deleteFile = async (id: string) => {
    await api.delete(`files/${id}`);
    await listFiles();
  };

  const editMetadata = async (
    id: string,
    newData: Partial<Pick<FileMetadata, 'filename' | 'mimetype'>>,
  ) => {
    await api.patch(`files/${id}`, newData);
    await listFiles();
  };

  useEffect(() => {
    listFiles();
  }, []);

  return {
    uploadFile,
    uploading,
    progress,
    error,
    downloadUrl,
    downloadUri,
    files,
    filename,
    listFiles,
    deleteFile,
    editMetadata,
    getFileUrl,
  };
}
