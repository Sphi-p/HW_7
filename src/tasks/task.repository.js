export function createTaskRepository() {
    // ---- Данные (хранилище) ----
    const tasks = new Map();
    let idCounter = 1;

    return {
        async findAll() {
            return Array.from(tasks.values());
        },

        async findById(id) {
            return tasks.get(id) || null;
        },

        async create(data) {
            const now = new Date().toISOString();
            const item = {
                ...data,
                id: String(idCounter++),
                status: data.status || "todo",
                createdAt: now,
                updatedAt: now
            };

            tasks.set(item.id, item);

            return item;
        },

        async update(id, data) {
            const old = tasks.get(id);
            if (!old) return null;

            const item = { ...old, ...data, updatedAt: new Date().toISOString() };
            tasks.set(id, item);

            return item;
        },

        async delete(id) {
            return tasks.delete(id);
        }
    }
}