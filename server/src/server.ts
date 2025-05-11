import fastify, { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { routes } from './api/routes';
import fastifyCors from '@fastify/cors';

async function build(): Promise<FastifyInstance> {
  const server = fastify({
    logger: true,
    bodyLimit: 1024 * 1024 * 1024,
  });

  server.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposedHeaders: ['Content-Disposition'],
  });

  const fileType = [
    /^application\/([\w-]+);?/,
    /^image\/([\w-]+);?/,
    /^video\/([\w-]+);?/,
    /^text\/([\w-]+);?/,
    /^audio\/([\w-]+);?/,
    /^multipart\/([\w-]+);?/,
  ];

  fileType.forEach((type) => {
    server.addContentTypeParser(
      type,
      { parseAs: 'buffer' },
      (_request, payload, done) => {
        if (typeof payload === 'object' && payload instanceof Buffer) {
          const arrayBuffer = payload.buffer.slice(
            payload.byteOffset,
            payload.byteOffset + payload.byteLength,
          );
          return done(null, arrayBuffer);
        }
        return done(null, payload);
      },
    );
  });

  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'File manager API',
        description: 'Documentação interativa Swagger',
        contact: {
          email: 'leite.silassantos@gmail.com',
          name: 'Silas S. Leite',
          url: 'www.github.com/leitess',
        },
        version: '1.0.0',
      },
      tags: [{ name: 'Files', description: 'Endpoints de arquivo' }],
    },
    hideUntagged: true,
  });

  server.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  server.register(routes, { prefix: '/api/v1' });

  return server;
}

export { build };
