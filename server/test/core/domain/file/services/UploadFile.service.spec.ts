import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UploadFileServiceMock } from './UploadFile.service.mock';
import { randomUUID } from 'crypto';
import {
  MetadataTypesMock,
  UploadSessionTypesMock,
} from '../../upload_session/types/UploadSession.types.mock';

describe('Upload file', () => {
  let dbMock: any;
  let storageMock: any;
  let service: UploadFileServiceMock;

  beforeEach(() => {
    dbMock = {
      insertSession: vi.fn(),
      findSession: vi.fn(),
      updateSession: vi.fn(),
      deleteSession: vi.fn(),
      insert: vi.fn(),
    };

    storageMock = {
      saveChunk: vi.fn(),
      assembleChunks: vi.fn(),
      save: vi.fn(),
    };

    service = new UploadFileServiceMock(dbMock, storageMock);
  });

  it('when starts an upload session then metadata must be return', async () => {
    const sessionId = 'session-upload-mock-10128376';
    const metadata = {
      filename: '1837373-video.mp4',
      mimetype: 'video/mp4',
      filesize: 1000000,
      totalChunks: 3,
    } as MetadataTypesMock;

    const session = await service.startUpload(sessionId, metadata);

    expect(dbMock.insertSession).toHaveBeenCalledWith(
      sessionId,
      expect.any(Object),
    );
    expect(session.metadata).toEqual(metadata);
  });

  it('when internet connection is down then try it again', async () => {
    const sessionId = 'session-upload-mock-9384673';

    const session = {
      sessionId,
      metadata: {
        filename: '1837373-text-test.txt',
        mimetype: 'text/plain',
        filesize: 1000000,
        totalChunks: 3,
      },
      chunks: [],
      completed: false,
    } as UploadSessionTypesMock;

    dbMock.findSession.mockResolvedValue(session);

    await service.uploadChunk(sessionId, 0, Buffer.from('part 1'));

    expect(storageMock.saveChunk).toHaveBeenCalledWith(
      sessionId,
      0,
      expect.any(Buffer),
    );
    expect(dbMock.updateSession).toHaveBeenCalled();

    await service.uploadChunk(sessionId, 1, Buffer.from('part 2'));
    expect(storageMock.saveChunk).toHaveBeenCalledWith(
      sessionId,
      1,
      expect.any(Buffer),
    );
  });

  it('when assemble all chunks then complete upload', async () => {
    const sessionId = 'session-upload-mock-263532';

    const session = {
      sessionId,
      metadata: {
        originalFilename: 'succeed-test.txt',
        filename: '1837373-succeed-test.txt',
        mimetype: 'text/plain',
        filesize: 33000,
      },
      chunks: [true, true],
      completed: false,
    };

    dbMock.findSession.mockResolvedValue(session);
    storageMock.assembleChunks.mockResolvedValue(Buffer.from('part1part2'));

    const result = await service.completeUpload(sessionId);

    expect(storageMock.save).toHaveBeenCalledWith(
      result.id,
      expect.any(Buffer),
    );
    expect(dbMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: '1837373-succeed-test.txt',
      }),
    );
    expect(dbMock.deleteSession).toHaveBeenCalledWith(sessionId);
  });

  it('when upload a large file then it has to be succeed', async () => {
    const sessionId = 'session-upload-mock-382672';
    const totalSize = 5 * 1024 * 1024;
    const chhunSize = 1024 * 1024;
    const totalChunks = totalSize / chhunSize;

    const metadata = {
      originalFilename: 'largee.pdf',
      filename: '183733266-largee.pdf',
      mimetype: 'application/pdf',
      filesize: totalSize,
      totalChunks,
    } as MetadataTypesMock;

    const chunks = Array.from({ length: totalChunks }, () => true);
    const fileBuffer = Buffer.alloc(totalSize, 'x');

    dbMock.findSession.mockResolvedValue({
      sessionId,
      metadata,
      chunks,
      completed: false,
      createdAt: new Date(),
    });

    storageMock.assembleChunks.mockResolvedValue(fileBuffer);
    storageMock.save.mockResolvedValue(undefined);
    dbMock.insert.mockResolvedValue(undefined);
    dbMock.deleteSession.mockResolvedValue(undefined);

    for (let i = 0; i < totalChunks; i++) {
      await service.uploadChunk(sessionId, i, Buffer.alloc(chhunSize, 'x'));
    }

    const result = await service.completeUpload(sessionId);

    expect(result.filename).toBe('183733266-largee.pdf');
    expect(storageMock.assembleChunks).toHaveBeenCalledWith(sessionId);
  });

  it('when upload a large file and internet connection down then it must return', async () => {
    const sessionId = 'session-upload-mock-38432327';
    const totalSize = 5 * 1024 * 1024;
    const chunkSize = 1024 * 1024;
    const totalChunks = totalSize / chunkSize;

    const metadata = {
      originalFilename: 'largee-down.pdf',
      filename: '183733266-largee-down.pdf',
      mimetype: 'application/pdf',
      filesize: totalSize,
      totalChunks,
    } as MetadataTypesMock;

    const chunks = [true, true, true, false, false];

    dbMock.findSession.mockResolvedValue({
      sessionId,
      metadata,
      chunks,
      completed: false,
      createdAt: new Date(),
    });

    for (let i = 0; i < 3; i++) {
      await service.uploadChunk(sessionId, i, Buffer.alloc(chunkSize, 'y'));
    }

    for (let i = 3; i < totalChunks; i++) {
      await service.uploadChunk(sessionId, i, Buffer.alloc(chunkSize, 'y'));
    }

    const fileBuffer = Buffer.alloc(totalSize, 'y');

    dbMock.findSession.mockResolvedValue({
      sessionId,
      metadata,
      chunks: Array(totalChunks).fill(true),
      completed: false,
      createdAt: new Date(),
    });
    storageMock.assembleChunks.mockResolvedValue(fileBuffer);
    storageMock.save.mockResolvedValue(undefined);
    dbMock.insert.mockResolvedValue(undefined);
    dbMock.deleteSession.mockResolvedValue(undefined);

    const result = await service.completeUpload(sessionId);

    expect(result.filename).toBe('183733266-largee-down.pdf');
    expect(storageMock.assembleChunks).toHaveBeenCalledWith(sessionId);
  });
});
