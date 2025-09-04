const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createSimpleClient } = require("./simple-client");
const { testConnection, searchObjects, createObject, updateObject, deleteObject } = require("./working-grpc-client");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "anytype-rest-shim" });
});

// Test gRPC connection endpoint
app.get("/test-connection", async (req, res) => {
  try {
    const response = await testConnection();
    res.json({ status: "connected", message: "gRPC working", data: response });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// In-memory storage for journal entries with proper JSON format
let journalEntries = [
  { 
    id: "1", 
    title: "First Entry", 
    content: "Hello World! This is my first journal entry.",
    createdAt: 1725451200000
  },
  { 
    id: "2", 
    title: "Second Entry", 
    content: "Day 2 test entry - building the SwiftUI interface.",
    createdAt: 1725454800000
  }
];

// GET /objects - Try gRPC first, fallback to mock data
app.get("/objects", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    // Try gRPC first
    try {
      const response = await searchObjects([], limit, offset);
      
      // Transform gRPC response to consistent JSON format
      const entries = response.records?.map(record => ({
        id: record.objectId,
        title: record.details?.title || "Untitled",
        content: record.details?.description || record.details?.content || "",
        createdAt: Date.now() // Use current time if no timestamp from gRPC
      })) || [];
      
      console.log('✅ Using real gRPC data');
      res.json(entries);
      return;
    } catch (grpcError) {
      console.log('⚠️ gRPC failed, using mock data:', grpcError.message);
    }
    
    // Fallback to mock data
    const start = offset;
    const end = offset + limit;
    const paginatedEntries = journalEntries.slice(start, end);
    
    res.json(paginatedEntries);
  } catch (error) {
    console.error('Error in GET /objects:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /objects - Try gRPC first, fallback to mock data
app.post("/objects", async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    // Try gRPC first
    try {
      const details = {
        title: title,
        description: content
      };
      
      const response = await createObject("", details, "");
      
      const newEntry = {
        id: response.objectId,
        title: title,
        content: content,
        createdAt: Date.now()
      };
      
      console.log('✅ Created via real gRPC');
      res.status(201).json(newEntry);
      return;
    } catch (grpcError) {
      console.log('⚠️ gRPC create failed, using mock:', grpcError.message);
    }
    
    // Fallback to mock creation
    const newEntry = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: Date.now()
    };
    
    journalEntries.push(newEntry);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error in POST /objects:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /objects/:id - Update journal entry (mock implementation)
app.put("/objects/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const objectId = req.params.id;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    
    // Find and update entry in mock data
    const entryIndex = journalEntries.findIndex(entry => entry.id === objectId);
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: "Entry not found" });
    }
    
    // Update the entry
    journalEntries[entryIndex] = {
      ...journalEntries[entryIndex],
      title,
      content,
      updatedAt: Date.now() // Add updated timestamp
    };
    
    console.log('📝 Updated entry via mock data');
    res.json(journalEntries[entryIndex]);
  } catch (error) {
    console.error('Error in PUT /objects:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /objects/:id - Delete journal entry (mock implementation)
app.delete("/objects/:id", async (req, res) => {
  try {
    const objectId = req.params.id;
    
    // Find and remove entry from mock data
    const entryIndex = journalEntries.findIndex(entry => entry.id === objectId);
    
    if (entryIndex === -1) {
      return res.status(404).json({ error: "Entry not found" });
    }
    
    // Remove the entry
    const deletedEntry = journalEntries.splice(entryIndex, 1)[0];
    
    console.log('🗑️ Deleted entry via mock data');
    res.json({ 
      message: "Entry deleted successfully", 
      id: objectId,
      deletedEntry: deletedEntry 
    });
  } catch (error) {
    console.error('Error in DELETE /objects:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Simple REST shim running at http://localhost:${PORT}`);
  console.log(`Testing connection to anytype-heart gRPC server at 127.0.0.1:31007`);
});