import { FastifyReply, FastifyRequest } from 'fastify';
import FileService from '../../../core/domain/file/services/File.service';
import { MetadataTypes } from '../../../core/domain/upload_session/types/UploadSession.types';

export default class FileController {
  constructor(private fileService: FileService) {}

  public async startUpload(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { sessionId, metadata } = request.body as {
      sessionId: string;
      metadata: MetadataTypes;
    };

    const session = await this.fileService.startUpload(sessionId, metadata);
    return reply.code(200).send(session);
  }

  public async uploadChunk(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { sessionId, chunkIndex } = request.params as any;
    const chunkBuffer = (await request.body) as ArrayBuffer;
    const buffer = this.convertArrayBufferToBuffer(chunkBuffer);
    await this.fileService.uploadChunk(sessionId, Number(chunkIndex), buffer);
    return reply.code(200).send({ ok: true });
  }

  public async completeUpload(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { sessionId } = request.body as any;
    const file = await this.fileService.completeUpload(sessionId);
    return reply.code(200).send(file);
  }

  public async allFiles(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const files = await this.fileService.listFiles();
    return reply.code(200).send(files);
  }

  public async getFileById(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { id } = request.params as { id: string };
    const file = await this.fileService.getFileMetadata(id);
    if (!file) return reply.code(404).send({ error: 'File not found' });
    return reply.code(200).send(file);
  }

  public async getFileStream(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { id } = request.params as { id: string };
    const file = await this.fileService.getFileMetadata(id);
    if (!file) return reply.code(404).send({ error: 'File not found' });

    const stream = await this.fileService.getFileStream(file.id);

    reply.header('Content-Type', file.mimetype);
    reply.header(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`,
    );
    return reply.code(200).send(stream);
  }

  public async deleteFile(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { id } = request.params as { id: string };
    await this.fileService.deleteFile(id);
    return reply.code(200).send({ success: true });
  }

  public async updateFileMetadata(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const { id } = request.params as { id: string };
    const body = request.body as MetadataTypes;

    await this.fileService.updateFileMetadata(id, body);
    return reply.code(200).send({ success: true });
  }

  private convertArrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }
}
