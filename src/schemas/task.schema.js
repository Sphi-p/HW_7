// import { z } from "zod";

// export const createTaskSchema = z.object({
//     title: z.string().min(1, "Должно быть название").max(200, "Длина названия не должна превышать 200 символов"),
//     description: z.string().max(1000, "Длина описания не должна превышать 200 символов"),
//     priority: z.enum(["low", "medium", "high"]).default("medium"),
//     dueDate: z.string().datetime('Дата должна быть в формате ISO datetime').optional(),
// });

// export const updateTaskSchema = z.object({
//     title: z.string().min(1, "Должно быть название").max(200, "Длина названия не должна превышать 200 символов").optional(),
//     description: z.string().max(1000, "Длина описания не должна превышать 200 символов").optional(),
//     status: z.enum(["todo", "in_progress", "done"]).optional(),
//     priority: z.enum(["low", "medium", "high"]).default("medium").optional(),
//     dueDate: z.string().datetime('Дата должна быть в формате ISO datetime').optional(),
// });

// export const taskParamsSchema = z.object({
//     id: z.number()
// });

// export const taskQuerySchema = z.object({
//     status: z.enum(['todo', 'in_progress', 'done']).optional(),
//     priority: z.enum(['low', 'medium', 'high']).optional(),
//     page: z.coerce.number().int().positive().default(1),
//     limit: z.coerce.number().int().positive().max(100).default(20),
// });

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200, 'Максимум 200 символов'),
  description: z.string().max(1000, 'Максимум 1000 символов').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().datetime('Некорректная дата (ожидается ISO datetime)').optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const taskParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID должен быть числом'),
});

export const taskQuerySchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});