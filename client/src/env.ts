import z from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "production"])
})

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
})
