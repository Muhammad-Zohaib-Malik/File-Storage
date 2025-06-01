import { createClient } from "redis";

const redisClient = await createClient();


redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();
console.log("Redis Client Connected Successfully");
export default redisClient;
