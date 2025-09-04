const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Try to load just the service proto without the problematic imports
let client = null;

async function getGrpcClient() {
  if (client) return client;
  
  try {
    // Load the service proto file with minimal dependencies
    const PROTO_PATH = path.join(__dirname, "protos/service/service.proto");
    
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [path.join(__dirname, "protos")],
      // Skip problematic imports
      ignore: [
        "pkg/lib/pb/model/protos/models.proto",
        "pkg/lib/pb/model/protos/localstore.proto"
      ]
    });

    const anytypeProto = grpc.loadPackageDefinition(packageDefinition).anytype;

    // Connect to Heart gRPC server  
    client = new anytypeProto.ClientCommands(
      "127.0.0.1:31007",
      grpc.credentials.createInsecure()
    );

    // Test the connection
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      client.waitForReady(deadline, (error) => {
        if (error) {
          console.error('Failed to connect to gRPC server:', error.message);
          reject(error);
        } else {
          console.log('Successfully connected to Anytype gRPC server');
          resolve(client);
        }
      });
    });

  } catch (error) {
    console.error('Error creating gRPC client:', error);
    throw error;
  }
}

// Test function to check if gRPC connection works with a simple call
async function testConnection() {
  const grpcClient = await getGrpcClient();
  
  return new Promise((resolve, reject) => {
    // Try AppGetVersion - a simple call that shouldn't need authentication
    grpcClient.AppGetVersion({}, (error, response) => {
      if (error) {
        console.error('AppGetVersion error:', error);
        reject(error);
      } else {
        console.log('AppGetVersion success:', response);
        resolve(response);
      }
    });
  });
}

// Wrapper functions for the main operations we need
async function searchObjects(filters = [], limit = 50, offset = 0) {
  const grpcClient = await getGrpcClient();
  
  return new Promise((resolve, reject) => {
    const request = {
      spaceId: "", // Empty string for default space
      filters,
      sorts: [],
      limit,
      offset
    };

    grpcClient.ObjectSearch(request, (error, response) => {
      if (error) {
        console.error('ObjectSearch error:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function createObject(objectTypeUrl = "", details = {}, templateId = "") {
  const grpcClient = await getGrpcClient();
  
  return new Promise((resolve, reject) => {
    const request = {
      spaceId: "", // Empty string for default space
      details,
      objectTypeUniqueKey: objectTypeUrl,
      templateId
    };

    grpcClient.ObjectCreate(request, (error, response) => {
      if (error) {
        console.error('ObjectCreate error:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function updateObject(objectId, details) {
  const grpcClient = await getGrpcClient();
  
  return new Promise((resolve, reject) => {
    const request = {
      contextId: objectId,
      details: Object.entries(details).map(([key, value]) => ({
        key,
        value: { stringValue: value.toString() }
      }))
    };

    grpcClient.ObjectSetDetails(request, (error, response) => {
      if (error) {
        console.error('ObjectSetDetails error:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

async function deleteObject(objectIds) {
  const grpcClient = await getGrpcClient();
  
  return new Promise((resolve, reject) => {
    const request = {
      objectIds: Array.isArray(objectIds) ? objectIds : [objectIds]
    };

    grpcClient.ObjectListDelete(request, (error, response) => {
      if (error) {
        console.error('ObjectListDelete error:', error);
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

module.exports = {
  getGrpcClient,
  testConnection,
  searchObjects,
  createObject,
  updateObject,
  deleteObject
};