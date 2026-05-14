import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { AppError } from './errors/index.js';
import { validate } from './plugins/zod-validator.js';
import { createTaskSchema, taskParamsSchema, taskQuerySchema, updateTaskSchema } from './schemas/task.schema.js';

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

// ---- Данные (хранилище) ----
const tasks = new Map();
let idCounter = 1;

// ---- Хелперы ----
function generateId() {
    return String(idCounter++);
}

function findById(id) {
    return tasks.get(id) || null;
}

// ---- POST /api/tasks ----
fastify.post("/api/tasks", {
    preHandler: [validate({ body: createTaskSchema })],
}, async (request, reply) => {
    const { title, description, priority } = request.body || {};

    const now = new Date().toISOString();
    const task = {
        id: generateId(),
        title,
        description: description || undefined,
        status: 'todo',
        priority: taskPriority,
        createdAt: now,
        updatedAt: now,
    };
    tasks.set(task.id, task);

    return reply.status(201).send(task);
});

// ---- GET /api/tasks ----
fastify.get('/api/tasks', {
    preHandler: [validate({ query: taskQuerySchema })],
}, async (request, reply) => {
    const { status, priority, page = '1', limit = '20' } = request.query || {};

    return reply.send({ items, total: result.length, page: p, limit: l });
});

// ---- GET /api/tasks/:id ----
fastify.get('/api/tasks/:id', {
    preHandler: [validate({ params: taskParamsSchema })],
}, async (request, reply) => {
    const { id } = request.params;
    const task = findById(id);
    if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
    }
    return reply.send(task);
});

// ---- PATCH /api/tasks/:id ----
fastify.patch('/api/tasks/:id', {
    preHandler: [validate({ params: taskParamsSchema, body: updateTaskSchema })]
}, async (request, reply) => {
    const { id } = request.params;
    const task = findById(id);
    if (!task) {
        return reply.status(404).send({ error: 'Task not found' });
    }

    const { title, description, status, priority } = request.body || {};

    task.updatedAt = new Date().toISOString();

    return reply.send(task);
});

// ---- DELETE /api/tasks/:id ----
fastify.delete('/api/tasks/:id', {
    preHandler: [validate({ params: taskParamsSchema })]
}, async (request, reply) => {
    const { id } = request.params;
    if (!tasks.delete(id)) {
        return reply.status(404).send({ error: 'Task not found' });
    }
    return reply.status(204).send();
});

// ---- Запуск ----
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

try {
    await fastify.listen({ port, host });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}