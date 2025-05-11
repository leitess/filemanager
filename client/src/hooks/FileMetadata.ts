export interface FileMetadata {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
}
