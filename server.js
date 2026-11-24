const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: "./config.env" });
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const API_URL = "https://m01038115-skillnest.onrender.com";

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(function (request, response, next) {
  console.log(`Incoming ${request.method} request to ${request.url}`);
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));

const uri =
  process.env.MONGODB_PREFIX +
  process.env.MONGODB_USERNAME +
  ":" +
  process.env.MONGODB_PASSWORD +
  process.env.MONGODB_URL;
const client = new MongoClient(uri);
const db = client.db("LessonData");

// Test connection
client
  .connect()
  .then(() => console.log("Successfully connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

//get
app.get("/lessons", async function (request, response) {
  try {
    const collection = db.collection("lessons");
    const results = await collection.find({}).toArray();
    response.json(results);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/teachers", async function (request,  response) {
  try {
    const collection = db.collection("teachers");
    const result = await collection.find({}).toArray();
    response.json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/search/:term", async function (request, response) {
  try {
    const term = request.params.term;
    const regex = new RegExp(term, "i");

    const collection = db.collection("lessons");
    const results = await collection.find({
      $or: [
        { topic: regex },
        { location: regex },
        { price: regex },
        { space: regex },
        { category: regex }
      ]
    }).toArray();
    response.json(results);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.get("/erolment/:lessonid", async function (request, response) {
  try{
    const lessonId = request.params.lessonid;
    const collection = db.collection("orders");

    const orders = await collection.find({ lessonIds: lessonId }).toArray();
    let count = 0;
    orders.forEach(order => {
      order.lessonIds.forEach(id => { if (id === lessonId) count++; });
    });
    response.json({ lessonId: lessonId, enrolled: count });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
})

//post
app.post("/orders", async function (request, response) {
  try {
    const orderData = request.body;
    const collection = db.collection("orders");
    const results = await collection.insertOne(orderData);
    response.json(results);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

//put
app.put('/lessons/:id', async function (request, response) {
  try {
    const collection = db.collection('lessons');

    const query = { id: request.params.id };
    const updates = { $set: request.body };
    const result = await collection.updateOne(query, updates);
    response.json(result);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// 404 Handler
app.use(function(request, response) {
    response.status(404).json({ error: 'Route not found: ' + request.url });
});

// Global Error Handler 
app.use(function(error, request, response, next) {
    console.error(error.stack);
    response.status(500).json({ error: 'Server error' });
});

app.listen(port, function () {
  console.log("app started on port " + port);
});
