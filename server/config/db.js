import { MongoClient } from "mongodb";

const uri = "mongodb://zohaibaay:zohaibaay1234@localhost:27017/storageApp";
export const client = new MongoClient(uri); 

export const connectToDatabase = async () => {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log(`Connected to database ${uri}`);
    }
    return client.db();
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  if (client) {
    await client.close();
    console.log("Database connection closed.");
  }
};

// Handle process termination gracefully
process.on("SIGINT", async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
