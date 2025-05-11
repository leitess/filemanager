import { UploadSessionModel } from '../model/UploadSession.model';

export default class UploadSessionRepository {
  public async insertSession(sessionId: string, session: any) {
    await UploadSessionModel.create({ ...session, sessionId });
  }

  public async findSession(sessionId: string) {
    return UploadSessionModel.findOne({ sessionId }).lean();
  }

  public async updateSession(sessionId: string, session: any) {
    await UploadSessionModel.updateOne({ sessionId }, { $set: session });
  }

  public async deleteSession(sessionId: string) {
    await UploadSessionModel.deleteOne({ sessionId });
  }
}
