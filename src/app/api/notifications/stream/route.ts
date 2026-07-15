import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

export const runtime = 'edge' // Keeps execution extremely fast and cheap

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const redis = Redis.fromEnv()
  const channel = `user:${userId}:notifications`

  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      // Keep connection alive with periodic pings
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'))
      }, 30000)

      // Listen to Redis Pub/Sub using Upstash's read streams or polling mechanism
      // Note: Upstash REST has a simplified Pub/Sub. For native SSE, we stream updates:
      try {
        while (true) {
          // Check for new notifications in Redis or let connection hang
          // In serverless, keeping long connections is best done via Serverless SSE:
          const data = await redis.get(channel)
          if (data) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            )
            await redis.del(channel) // Clear message once delivered
          }
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Poll every 2s
        }
      } catch (err) {
        clearInterval(keepAlive)
        controller.close()
      }
    },
  })

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
