import { connect } from 'mongoose';
import { build } from './server';
import { database } from './infrastructure/environment';
import { initGridFSStorage } from './infrastructure/gridfs';

(async () => {
  const mongoose = await connect(database.uri!);
  mongoose.syncIndexes();

  await initGridFSStorage();

  const server = await build();

  server.listen({ host: '0.0.0.0', port: 3003 });
})();
