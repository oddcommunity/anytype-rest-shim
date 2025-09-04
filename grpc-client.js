const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Load the service proto file
const packageDefinition = protoLoader.loadSync("./protos/service/service.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: ["./protos"] // Include the protos directory for imports
});

const anytypeProto = grpc.loadPackageDefinition(packageDefinition).anytype;

// Connect to Heart gRPC server
const client = new anytypeProto.ClientCommands(
  "127.0.0.1:31007",
  grpc.credentials.createInsecure()
);

module.exports = client;