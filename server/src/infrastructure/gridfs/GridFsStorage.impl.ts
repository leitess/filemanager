import { Db, GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fs } from 'fs';

export class GridFSStorage {
  private bucket: GridFSBucket;

  constructor(db: Db) {
    this.bucket = new GridFSBucket(db, { bucketName: 'uploads' });
  }

  public async saveChunk(sessionId: string, index: number, chunk: Buffer) {
    const dir = join(tmpdir(), sessionId);
    await fs.mkdir(dir, { recursive: true });
    const chunkPath = join(dir, `${index}`);
    await fs.writeFile(chunkPath, chunk);
  }

  public async assembleChunks(sessionId: string): Promise<Buffer> {
    const dir = join(tmpdir(), sessionId);
    const files = await fs.readdir(dir);
    const buffers: Buffer[] = [];

    const sortedFiles = files.map(Number).sort((a, b) => a - b);
    for (const i of sortedFiles) {
      const chunk = await fs.readFile(join(dir, `${i}`));
      buffers.push(chunk);
    }

    await fs.rm(dir, { recursive: true, force: true });
    return Buffer.concat(buffers);
  }

  public async save(fileId: string, data: Buffer) {
    const stream = this.bucket.openUploadStream(fileId);
    const readable = Readable.from(data);
    readable.pipe(stream);
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  public async read(fileId: string): Promise<Readable> {
    return this.bucket.openDownloadStreamByName(fileId);
  }

  public async delete(fileId: string) {
    const file = await this.bucket.find({ filename: fileId }).toArray();
    if (!file.length) return;

    await this.bucket.delete(file[0]._id);
  }
}
