import Redis from "ioredis";

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB) || 0,
});

redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err: any) => console.error("❌ Redis error:", err));

export default redis;
