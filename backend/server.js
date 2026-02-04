const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Simple CORS configuration
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/kanban")
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
  });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  points: { type: Number, default: 0, min: 0, max: 20 }
});

const Task = mongoose.model("Task", TaskSchema);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Kanban API is running" });
});

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title, status, priority, points } = req.body;
    const newTask = new Task({
      title: title || "Untitled Task",
      status: status || 'todo',
      priority: priority || 'medium',
      points: points || 0
    });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { title, status, priority, points } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, status, priority, points },
      { new: true, runValidators: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }
    
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});