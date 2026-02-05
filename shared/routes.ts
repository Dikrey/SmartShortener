import { z } from 'zod';
import { urls, createUrlRequestSchema, resolveUrlResponseSchema } from './schema';

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
        200: resolveUrlResponseSchema, // Use the new schema here
        404: errorSchemas.notFound, // Expired or not found
        410: errorSchemas.notFound, // Explicitly gone/expired
      },
    },
    verifyPassword: { // New endpoint for password verification
      method: 'POST' as const,
      path: '/api/resolve/:code/verify-password',
      input: z.object({
        password: z.string(),
      }),
      responses: {
        200: z.object({ message: z.string() }), // Success message
        401: z.object({ message: z.string() }), // Unauthorized (wrong password)
        404: errorSchemas.notFound, // URL not found
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
      } else if (path.includes(`:${key}`)) { // Handle case where path is just a param like :code
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// === TYPE EXPORTS ===
export type CreateUrlInput = z.infer<typeof api.urls.create.input>;
export type CreateUrlResponse = z.infer<typeof api.urls.create.responses[201]>; // Renamed from UrlResponse
export type ResolveUrlResponse = z.infer<typeof api.urls.resolve.responses[200]>; // New type for resolve response
export type VerifyPasswordInput = z.infer<typeof api.urls.verifyPassword.input>;
export type VerifyPasswordResponse = z.infer<typeof api.urls.verifyPassword.responses[200]>;
