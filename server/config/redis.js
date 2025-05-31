import { createClient } from "redis";

const redisClient = await createClient();


redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();

export default redisClient;
