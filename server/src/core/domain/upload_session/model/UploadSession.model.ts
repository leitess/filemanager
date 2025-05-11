import mongoose from 'mongoose';

const MetadataSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    mimetype: { type: String, required: true },
    totalChunks: { type: Number, required: true },
  },
  { _id: false },
);

const UploadSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  metadata: { type: MetadataSchema, required: true },
  chunks: { type: [Boolean], default: [] },
  completed: { type: Boolean, default: false },
});

export const UploadSessionModel = mongoose.model(
  'UploadSessions',
  UploadSessionSchema,
);
