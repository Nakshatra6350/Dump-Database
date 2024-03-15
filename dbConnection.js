const { MongoClient } = require("mongodb");
require("dotenv").config();

const getObjectId = async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  console.log("Connected to MongoDB");

  const collection = client
    .db(process.env.DB_NAME)
    .collection(process.env.COLLECTION_NAME);
  const cursor = collection.find({});
  const documents = await cursor.toArray();
  const objectIds = documents.map((doc) => doc._id);
  console.log(objectIds);
  return objectIds;
};

module.exports = getObjectId;
