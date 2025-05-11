export interface MetadataTypes {
  filename: string;
  mimetype: string;
  totalChunks: number;
}

export interface UploadSessionTypes {
  sessionId: string;
  metadata: MetadataTypes;
  chunks: boolean[];
  completed: boolean;
}
