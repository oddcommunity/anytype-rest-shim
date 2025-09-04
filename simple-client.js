const grpc = require("@grpc/grpc-js");

// Create a simple gRPC client for basic connection testing
function createSimpleClient() {
  return new Promise((resolve, reject) => {
    try {
      // Create a basic client just to test connectivity
      const client = new grpc.Client('127.0.0.1:31007', grpc.credentials.createInsecure());
      
      // Use waitForReady with a longer timeout
      const deadline = Date.now() + 10000; // 10 second timeout
      
      client.waitForReady(deadline, (error) => {
        if (error) {
          console.error('Failed to connect to gRPC server:', error.message);
          reject(new Error('Connection failed: ' + error.message));
        } else {
          console.log('Successfully established connection to gRPC server');
          resolve(client);
        }
      });

    } catch (error) {
      console.error('Error creating gRPC client:', error.message);
      reject(error);
    }
  });
}

module.exports = { createSimpleClient };