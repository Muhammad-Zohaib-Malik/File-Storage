import { createClient } from "redis";
import logger from "./../utils/logger.js";

const redisClient = await createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: 'redis-17725.c15.us-east-1-2.ec2.cloud.redislabs.com',
    port: 17725
}
});

redisClient.on("error", (err) => {
  logger.error("Redis Client Error", err);
  process.exit(1);
});

await redisClient.connect();
logger.info("Redis Client Connected Successfully");
export default redisClient;
