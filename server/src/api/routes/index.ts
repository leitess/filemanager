import { FastifyInstance, FastifyServerOptions } from 'fastify';
import { fileRoute } from './file/File.route';

const routes = (
  server: FastifyInstance,
  opts: FastifyServerOptions,
  done: (err?: Error) => void,
) => {
  server.register(fileRoute, { prefix: '/files' });

  done();
};

export { routes };
