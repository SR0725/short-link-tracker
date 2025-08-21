import Redis from 'redis'

const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

redis.on('error', (err) => console.log('Redis Client Error', err))

export const connectRedis = async () => {
  if (!redis.isOpen) {
    await redis.connect()
  }
  return redis
}

export { redis }