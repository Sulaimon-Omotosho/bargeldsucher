import { Redis } from '@upstash/redis'

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error('Missing Upstash Redis environment variables in .env')
}

const globalForRedis = global as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ||
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}
