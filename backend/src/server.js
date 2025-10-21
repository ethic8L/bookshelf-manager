import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://xtemalitv_db_user:6qRO1J9MVIDKoaoq@bookshelf-uni.5ioij2p.mongodb.net/?retryWrites=true&w=majority&appName=bookshelf-uni";
const PORT = process.env.PORT || 4000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Model
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  year: Number,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Book = mongoose.model("Book", bookSchema);

// Routes

// GET /books?search=abc
app.get("/books", async (req, res) => {
  try {
    const { search } = req.query;
    const q = {};
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }
    const books = await Book.find(q).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/books/:id", async (req, res) => {
  try {
    const b = await Book.findById(req.params.id);
    if (!b) return res.status(404).json({ error: "Not found" });
    res.json(b);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid data", details: err.message });
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Invalid data" });
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
