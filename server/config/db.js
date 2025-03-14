import { MongoClient } from "mongodb";

const uri = "mongodb://127.0.0.1:27017/storageApp";
let client; 

export const connectToDatabase = async () => {
  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      console.log(`Connected to database ${uri}`);
    }
    return client.db(); 
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error; 
  }
};

// Handle process termination gracefully
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("Database connection closed.");
  }
  process.exit(0);
});
