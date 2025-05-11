export interface MetadataTypesMock {
  filename: string;
  mimetype: string;
  totalChunks: number;
}

export interface UploadSessionTypesMock {
  sessionId: string;
  metadata: MetadataTypesMock;
  chunks: boolean[];
  completed: boolean;
}
