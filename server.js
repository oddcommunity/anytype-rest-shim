const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const client = require("./grpc-client");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "anytype-rest-shim" });
});

// REST GET /objects → gRPC ObjectSearch
app.get("/objects", (req, res) => {
  const searchRequest = {
    filters: [],
    sorts: [],
    limit: parseInt(req.query.limit) || 50,
    offset: parseInt(req.query.offset) || 0
  };
  
  client.ObjectSearch(searchRequest, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// REST POST /objects → gRPC ObjectCreate
app.post("/objects", (req, res) => {
  const { objectTypeUrl, details, templateId } = req.body;
  const createRequest = {
    details: details || {},
    objectTypeUrl: objectTypeUrl || "",
    templateId: templateId || ""
  };
  
  client.ObjectCreate(createRequest, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// REST GET /objects/:id → gRPC ObjectOpen
app.get("/objects/:id", (req, res) => {
  const openRequest = {
    objectId: req.params.id
  };
  
  client.ObjectOpen(openRequest, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// REST PUT /objects/:id → gRPC ObjectSetDetails
app.put("/objects/:id", (req, res) => {
  const { details } = req.body;
  const updateRequest = {
    objectId: req.params.id,
    details: details || {}
  };
  
  client.ObjectSetDetails(updateRequest, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// REST DELETE /objects/:id → gRPC ObjectListDelete
app.delete("/objects/:id", (req, res) => {
  const deleteRequest = {
    objectIds: [req.params.id]
  };
  
  client.ObjectListDelete(deleteRequest, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// REST GET /workspaces → gRPC WorkspaceGetAll
app.get("/workspaces", (req, res) => {
  client.WorkspaceGetAll({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

// REST GET /app/version → gRPC AppGetVersion
app.get("/app/version", (req, res) => {
  client.AppGetVersion({}, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`REST shim running at http://localhost:${PORT}`);
  console.log(`Connecting to anytype-heart gRPC server at 127.0.0.1:31007`);
});