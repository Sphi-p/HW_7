import { ZodError } from 'zod';
import { ValidationError } from '../errors/index.js';

// Fastify preHandler plugin — validates body/params/query via Zod schemas
export function validate(schemas) {
    return async (request) => {
        for (const [target, schema] of Object.entries(schemas)) {
            if (!schema) continue;
            try {
                request[target] = schema.parse(request[target]);
            } catch (err) {
                if (err instanceof ZodError) {
                    const message = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
                    throw new ValidationError(message);
                }
                throw err;
            }
        }
    };
}