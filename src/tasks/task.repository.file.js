import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export function createTaskFileRepository({ filePath = './data/tasks.json' }) {
    let idCounter = 1;

    async function readData() {
        try {
            const raw = await readFile(filePath, 'utf-8');
            const data = JSON.parse(raw);
            idCounter = data.idCounter || 1;
            return new Map(Object.entries(data.tasks));
        } catch {
            return new Map();
        }
    }

    async function writeData(tasks, counter) {
        const dir = dirname(filePath);
        await mkdir(dir, { recursive: true });
        const data = { tasks: Object.fromEntries(tasks), idCounter: counter };
        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    }

    return {
        async findAll() {
            const tasks = await readData();
            return Array.from(tasks.values());
        },

        async findById(id) {
            const tasks = await readData();
            return tasks.get(id) || null;
        },

        async create(data) {
            const tasks = await readData();
            const now = new Date().toISOString();
            const item = {
                ...data,
                id: String(idCounter++),
                status: data.status || "todo",
                createdAt: now,
                updatedAt: now
            };

            tasks.set(item.id, item);
            await writeData(tasks, idCounter);

            return item;
        },

        async update(id, data) {
            const tasks = await readData();
            const old = tasks.get(id);
            if (!old) return null;

            const item = { ...old, ...data, updatedAt: new Date().toISOString() };
            tasks.set(id, item);
            await writeData(tasks, idCounter);

            return item;
        },

        async delete(id) {
            const tasks = await readData();
            const deleted = tasks.delete(id);
            if (deleted) await writeData(tasks, idCounter);
            return deleted;
        }
    }
}