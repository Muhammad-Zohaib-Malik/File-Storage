import { connectToDatabase, disconnectFromDatabase } from "./db.js";

const db = await connectToDatabase();

const command = "collMod";

try {
  await db.command({
    [command]: "users",
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: {
        required: ["name", "password", "rootDirId"],
        properties: {
          name: {
            bsonType: "string",
            minLength: 4,
            description: "User's full name, must be a string with at least 3 characters.",
          },
          email: {
            bsonType: "string",
            pattern:
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", 
            description: "User's email address, must follow a valid email format.",
          },
          password: {
            bsonType: "string",
            minLength: 8,
            description: "User's password, must be a string with at least 4 characters.",
          },
          rootDirId: {
            bsonType: "objectId",
            description: "Reference to the root directory of the user, must be an ObjectId.",
          },
        },
        additionalProperties: false,
      },
    },
  });

  await db.command({
    [command]: "directories",
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: {
        required: ["name", "userId", "parentDirId"],
        properties: {
          name: {
            bsonType: "string",
            description: "Name of the directory, must be a string.",
          },
          userId: {
            bsonType: "objectId",
            description: "Reference to the user who owns the directory, must be an ObjectId.",
          },
          parentDirId: {
            bsonType: ["objectId", "null"],
            description: "Reference to the parent directory, can be an ObjectId or null if it's a root directory.",
          },
        },
        additionalProperties: false,
      },
    },
  });

  await db.command({
    [command]: "files",
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: {
        required: ["extension", "name", "userId", "parentDirId"],
        properties: {
          extension: {
            bsonType: "string",
            description: "File extension (e.g., .txt, .jpg), must be a string.",
          },
          name: {
            bsonType: "string",
            description: "Name of the file, must be a string.",
          },
          userId: {
            bsonType: "objectId",
            description: "Reference to the user who owns the file, must be an ObjectId.",
          },
          parentDirId: {
            bsonType: ["objectId", "null"],
            description: "Reference to the directory containing the file, can be an ObjectId or null if it's a root-level file.",
          },
        },
        additionalProperties: false,
      },
    },
  });
} catch (error) {
  console.log("Error setting up the database", error);
} finally {
  await disconnectFromDatabase();
}
