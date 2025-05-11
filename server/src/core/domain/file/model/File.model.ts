import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  mimetype: { type: String, required: true },
  filesize: { type: Number, required: true },
});

export const FileModel = mongoose.model('File', FileSchema);
