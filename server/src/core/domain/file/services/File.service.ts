import { randomUUID } from 'crypto';
import { FileMetadataTypes } from '../types/FileMetadata.types';
import {
  MetadataTypes,
  UploadSessionTypes,
} from '../../upload_session/types/UploadSession.types';
import FileRepository from '../repository/File.repository';
import UploadSessionRepository from '../../upload_session/repository/UploadSession.repository';
import { getGridFSStorage } from '../../../../infrastructure/gridfs';

export default class FileService {
  constructor(
    private uploadSessionRepository: UploadSessionRepository,
    private fileRepository: FileRepository,
  ) {}

  public async startUpload(sessionId: string, metadata: MetadataTypes) {
    const session = {
      sessionId,
      metadata,
      chunks: [],
      completed: false,
    } as UploadSessionTypes;
    await this.uploadSessionRepository.insertSession(sessionId, session);
    return session;
  }

  public async uploadChunk(
    sessionId: string,
    chunkIndex: number,
    chunk: Buffer,
  ) {
    const storage = getGridFSStorage();
    const session = await this.uploadSessionRepository.findSession(sessionId);
    if (!session) throw new Error('Upload session not found');

    await storage.saveChunk(sessionId, chunkIndex, chunk);
    session.chunks[chunkIndex] = true;
    await this.uploadSessionRepository.updateSession(sessionId, session);
  }

  public async completeUpload(sessionId: string): Promise<FileMetadataTypes> {
    const storage = getGridFSStorage();
    const session = await this.uploadSessionRepository.findSession(sessionId);
    if (!session) throw new Error('Upload session not found');

    const allChunks = await storage.assembleChunks(sessionId);
    const id = randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    await storage.save(id, allChunks);

    const fileData: FileMetadataTypes = {
      id,
      filename: session.metadata.filename,
      mimetype: session.metadata.mimetype,
      filesize: allChunks.length,
      createdAt,
      updatedAt,
    };

    await this.fileRepository.insert(fileData);
    await this.uploadSessionRepository.deleteSession(sessionId);

    return fileData;
  }

  async getFileMetadata(fileId: string) {
    const file = await this.fileRepository.findFileById(fileId);
    return file;
  }

  public async getFileStream(fileId: string): Promise<NodeJS.ReadableStream> {
    const storage = getGridFSStorage();
    return storage.read(fileId);
  }

  public async deleteFile(fileId: string): Promise<void> {
    const storage = getGridFSStorage();
    await storage.delete(fileId);
    await this.fileRepository.deleteFile(fileId);
  }

  public async updateFileMetadata(
    fileId: string,
    updates: Partial<Omit<FileMetadataTypes, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    return this.fileRepository.updateFileMetadata(fileId, updates);
  }

  public async listFiles() {
    const files = await this.fileRepository.list();
    return files;
  }
}
