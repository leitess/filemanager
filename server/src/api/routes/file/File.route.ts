import { FastifyInstance, FastifyServerOptions } from 'fastify';
import fileController from '../../controllers/file';

export const fileRoute = (
  app: FastifyInstance,
  opts: FastifyServerOptions,
  done: (err?: Error) => void,
) => {
  app.post('/upload/start', async (request, reply) => {
    await fileController.startUpload(request, reply);
  });

  app.post('/upload/chunk/:sessionId/:chunkIndex', async (request, reply) => {
    await fileController.uploadChunk(request, reply);
  });

  app.post('/upload/complete', async (request, reply) => {
    await fileController.completeUpload(request, reply);
  });

  app.get('/', async (request, reply) => {
    await fileController.allFiles(request, reply);
  });

  app.get('/:id', async (request, reply) => {
    await fileController.getFileById(request, reply);
  });

  app.get('/:id/download', async (request, reply) => {
    await fileController.getFileStream(request, reply);
  });

  app.delete('/:id', async (request, reply) => {
    await fileController.deleteFile(request, reply);
  });

  app.patch('/:id', async (request, reply) => {
    await fileController.updateFileMetadata(request, reply);
  });

  done();
};
