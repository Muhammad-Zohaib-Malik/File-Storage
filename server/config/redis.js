import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config()

const redisClient = await createClient({
  password: process.env.REDIS_PASSWORD,

});


redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();
console.log("Redis Client Connected Successfully");
export default redisClient;
