import Redis from "ioredis";

const redisUrl = process.env.REDIS_DATABASE_URL;
if (!redisUrl) {
  throw new Error("REDIS_DATABASE_URL environment variable is not defined.");
}

const redis = new Redis(redisUrl);
export default redis;
