import { GridFSStorage } from './GridFsStorage.impl';
import mongoose from 'mongoose';

let instance: GridFSStorage;

export function getGridFSStorage(): GridFSStorage {
  if (!instance) {
    throw new Error(
      'GridFSStorage não foi inicializado. Chame initGridFSStorage() antes.',
    );
  }
  return instance;
}

export async function initGridFSStorage(): Promise<void> {
  if (!instance) {
    const db = mongoose.connection.db;
    if (!db) throw new Error('mongoose.connection.db ainda está indefinido');

    instance = new GridFSStorage(db);
  }
}
