export function createTaskController({ taskService }) {
    return {
        async create(request, reply) {
            const task = await taskService.createTask(request.body);
            return reply.status(201).send(task);
        },

        async list(request, reply) {
            const tasks = await taskService.getTasks(request.query);
            return reply.send(tasks);
        },

        async get(request, reply) {
            const task = await taskService.getTask(request.params.id);
            return reply.send(task);
        },

        async update(request, reply) {
            const updated = await taskService.updateTask(request.params.id, request.body);
            return reply.send(updated);
        },

        async remove(request, reply) {
            const deleted = await taskService.deleteTask(request.params.id);
            return reply.status(204).send();
        }
    }
}