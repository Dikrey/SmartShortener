import { z } from 'zod';
import { urls, createUrlRequestSchema } from './schema';

// === SHARED ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  urls: {
    create: {
      method: 'POST' as const,
      path: '/api/shorten',
      input: createUrlRequestSchema,
      responses: {
        201: z.custom<typeof urls.$inferSelect>(),
        400: errorSchemas.validation,
        409: errorSchemas.conflict, // For duplicate custom codes
      },
    },
    resolve: {
      method: 'GET' as const,
      path: '/api/resolve/:code',
      responses: {
        200: z.custom<typeof urls.$inferSelect>(),
        404: errorSchemas.notFound, // Expired or not found
        410: errorSchemas.notFound, // Explicitly gone/expired
      },
    },
  },
};

// === HELPER ===
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// === TYPE EXPORTS ===
export type CreateUrlInput = z.infer<typeof api.urls.create.input>;
export type UrlResponse = z.infer<typeof api.urls.create.responses[201]>;
