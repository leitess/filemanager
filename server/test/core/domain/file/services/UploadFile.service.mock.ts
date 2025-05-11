import {
  MetadataTypesMock,
  UploadSessionTypesMock,
} from '../../upload_session/types/UploadSession.types.mock';
import { FileMetadataTypesMock } from '../types/FileMetadata.types.mock';

export class UploadFileServiceMock {
  constructor(
    private _db: any,
    private _storage: any,
  ) {}

  public async startUpload(sessionId: string, metadata: MetadataTypesMock) {
    const session = {
      sessionId,
      metadata,
      chunks: [],
      completed: false,
      createdAt: new Date(),
    } as UploadSessionTypesMock;

    await this._db.insertSession(sessionId, session);
    return session;
  }

  public async uploadChunk(
    sessionId: string,
    chunkIndex: number,
    chunk: Buffer,
  ) {
    const session = await this._db.findSession(sessionId);

    if (!session) throw new Error('Upload session not found');

    await this._storage.saveChunk(sessionId, chunkIndex, chunk);
    session.chunks[chunkIndex] = true;
    await this._db.updateSession(sessionId, session);
  }

  public async completeUpload(
    sessionId: string,
  ): Promise<FileMetadataTypesMock> {
    const session = await this._db.findSession(sessionId);
    if (!session) throw new Error('Upload session not found');

    const { totalChunks } = session.metadata;
    const receivedChunks = session.chunks ?? [];

    const missing: number[] = [];
    for (let i = 0; i < totalChunks; i++) {
      if (!receivedChunks[i]) missing.push(i);
    }

    if (missing.length > 0) {
      throw new Error(
        `Upload incompleto: chunks faltando [${missing.join(', ')}]`,
      );
    }

    const allChunks = await this._storage.assembleChunks(sessionId);
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();
    const downloadUrl = `/download/${id}`;

    await this._storage.save(id, allChunks);
    const fileData: FileMetadataTypesMock = {
      ...session.metadata,
      id,
      createdAt,
      updatedAt,
      downloadUrl,
    };

    await this._db.insert(fileData);
    await this._db.deleteSession(sessionId);

    return fileData;
  }
}
