import { connectToDatabase, disconnectFromDatabase } from "./db.js";

const db = await connectToDatabase();

const command = "collMod";
// Creating 'users' collection
await db.command({
  [command]: "users",
  validationLevel: "strict",
  validationAction: "error",
  validator: {
    $jsonSchema: {
      required: ["name", "email", "password", "rootDirId"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 3,
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        },
        password: {
          bsonType: "string",
          minLength: 4,
        },
        rootDirId: {
          bsonType: "objectId",
        },
      },
      additionalProperties: false,
    },
  },
});

// Creating 'directories' collection
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
        },
        userId: {
          bsonType: "objectId",
        },
        parentDirId: {
          bsonType: ["objectId", "null"],
        },
      },
      additionalProperties: false,
    },
  },
});

// Creating 'files' collection
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
        },
        name: {
          bsonType: "string",
        },
        userId: {
          bsonType: "objectId",
        },
        parentDirId: {
          bsonType: ["objectId", "null"],
        },
      },
      additionalProperties: false,
    },
  },
});

await disconnectFromDatabase();
