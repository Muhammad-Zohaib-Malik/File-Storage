import mongoose from "mongoose";

const uri = "mongodb://zohaibaay:zohaibaay1234@localhost:27017/storageApp";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri)
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
};

// Handle process termination gracefully
process.on("SIGINT", async () => {
  await disconnectFromDatabase();
  process.exit(0);
});
