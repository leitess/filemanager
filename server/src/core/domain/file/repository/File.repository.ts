import { FileModel } from '../model/File.model';
import { FileMetadataTypes } from '../types/FileMetadata.types';

export default class FileRepository {
  public async insert(fileData: FileMetadataTypes) {
    await FileModel.create(fileData);
  }

  public async list() {
    return await FileModel.find().sort({ createdAt: -1 }).lean();
  }

  public async deleteFile(fileId: string) {
    await FileModel.deleteOne({ id: fileId });
  }

  public async findFileById(fileId: string) {
    return await FileModel.findOne({ id: fileId }).lean();
  }

  public async updateFileMetadata(
    fileId: string,
    updates: Partial<FileMetadataTypes>,
  ) {
    await FileModel.updateOne(
      { id: fileId },
      { $set: { ...updates, updatedAt: new Date() } },
    );
  }
}
