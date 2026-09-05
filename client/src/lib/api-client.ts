import { z } from 'zod';

class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit
): Promise<T> {
  // /api/* paths are Next.js proxy routes — call them same-origin (relative).
  // Everything else goes directly to the backend.
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';
  const fullUrl = url.startsWith('/api/') ? url : `${backendBase}${url}`;
  const response = await fetch(fullUrl, { credentials: 'include', ...options });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const rawData = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      rawData?.message || `HTTP Error: ${response.status}`,
      response.status,
      rawData
    );
  }
  const validation = schema.safeParse(rawData);
  if (!validation.success) {
    console.error('Schema Validation Failed:', validation.error);
    throw new Error('Server returned unexpected data format');
  }

  return validation.data;
}