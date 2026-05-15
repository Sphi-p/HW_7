import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { AppError } from './errors/index.js';
import { validate } from './plugins/zod-validator.js';
import { createTaskSchema, taskParamsSchema, taskQuerySchema, updateTaskSchema } from './schemas/task.schema.js';
import { createTaskRepository } from './tasks/task.repository.js';
import { createTaskService } from './tasks/task.service.js';
import { createTaskController } from './tasks/task.controller.js';
import { registerTaskRoutes } from './tasks/task.routes.js';

const fastify = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
    },
});

fastify.register(cors, { origin: process.env.CORS_ORIGIN || '*' });

fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
        request.log.warn({ err: error, statusCode: error.statusCode }, error.message);
        return reply.status(error.statusCode).send({ error: error.message });
    }

    if (error instanceof ZodError) {
        const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        request.log.warn({ err: error }, message);
        return reply.status(400).send({ error: message });
    }

    request.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({ error: 'Internal Server Error' });
});

const taskRepository = createTaskRepository();
const taskService = createTaskService({ taskRepository });
const taskController = createTaskController({ taskService });
registerTaskRoutes(fastify, taskController);

// ---- Запуск ----
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

try {
    await fastify.listen({ port, host });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}