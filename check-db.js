require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  console.log("URI present:", !!uri);
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db('gracemusic');
    const userCount = await db.collection('users').countDocuments();
    console.log("Users in DB:", userCount);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
  }
}
main();
