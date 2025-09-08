const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://tycoonUser:<db_password>@peli.vasxr5v.mongodb.net/?retryWrites=true&w=majority&appName=peli";
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const col = client.db("roskatycoon").collection("scores");

  app.get("/leaderboard", async (req, res) => {
    const top = await col.find().sort({ score: -1 }).limit(10).toArray();
    res.json(top);
  });

  app.post("/submit", async (req, res) => {
    await col.insertOne({
      name: req.body.name,
      score: req.body.score,
      prestige: req.body.prestige,
      date: new Date()
    });
    res.json({ ok: true });
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log("Server running...");
  });
}
main().catch(console.error);