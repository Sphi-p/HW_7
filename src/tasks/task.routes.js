import { validate } from '../plugins/zod-validator.js';
import { createTaskSchema, updateTaskSchema, taskParamsSchema, taskQuerySchema } from '../schemas/task.schema.js';

export function registerTaskRoutes(fastify, controller) {
    fastify.post("/api/tasks", {
        preHandler: [validate({ body: createTaskSchema })],
    }, controller.create);

    fastify.get('/api/tasks', {
        preHandler: [validate({ query: taskQuerySchema })],
    }, controller.list);

    fastify.get('/api/tasks/:id', {
        preHandler: [validate({ params: taskParamsSchema })],
    }, controller.get);

    fastify.patch('/api/tasks/:id', {
        preHandler: [validate({ params: taskParamsSchema, body: updateTaskSchema })]
    }, controller.update);

    fastify.delete('/api/tasks/:id', {
        preHandler: [validate({ params: taskParamsSchema })]
    }, controller.remove);
}