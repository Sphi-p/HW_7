import { NotFoundError } from "../errors/index.js";

export function createTaskService({ taskRepository }) {
    return {
        async createTask(data) {
            return taskRepository.create(data);
        },

        async getTasks({ status, priority, page = 1, limit = 20 }) {
            let tasks = await taskRepository.findAll();

            if (status) {
                tasks = tasks.filter((item) => item.status === status);
            }

            if (priority) {
                tasks = tasks.filter((item) => item.priority === priority);
            }

            const total = tasks.length;
            const offset = (page - 1) * limit;
            const items = tasks.slice(offset, offset + limit);

            return { items, total, page, limit };
        },

        async getTask(id) {
            const task = taskRepository.findById(id);

            if (!task) {
                throw new NotFoundError("Task Not Found");
            }

            return task;
        },

        async updateTask(id, data) {
            const task = taskRepository.update(id, data);

            if (!task) {
                throw new NotFoundError("Task Not Found");
            }

            return task;
        },

        async deleteTask(id) {
            const task = taskRepository.delete(id);

            if (!task) {
                throw new NotFoundError("Task Not Found");
            }
        }
    }
}