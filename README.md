# Anytype REST Shim

A REST API shim that provides HTTP endpoints for the Anytype Heart gRPC server, enabling easy integration with web and mobile applications.

## What This Project Does

This project bridges the gap between Anytype's gRPC-based Heart server and applications that need REST API access. It provides a simple HTTP server that translates REST calls into gRPC calls to the Anytype Heart service.

## Features

- **REST API Endpoints**: Simple HTTP endpoints that proxy to Anytype Heart gRPC services
- **Health Check**: `/health` endpoint for service monitoring
- **Connection Testing**: `/test-connection` endpoint to verify gRPC connectivity
- **CORS Support**: Configured for cross-origin requests
- **Express.js Server**: Fast and lightweight HTTP server
- **Proto Definitions**: Includes Anytype service proto files for gRPC communication

## Project Structure

```
├── simple-server.js      # Main REST server (recommended for development)
├── server.js            # Full-featured server with object endpoints
├── simple-client.js     # Simple gRPC client for connection testing
├── grpc-client.js       # Full gRPC client with proto loading
├── protos/             # Protocol buffer definitions
│   ├── service/        # Main service definitions
│   ├── commands.proto  # Command definitions
│   ├── events.proto    # Event definitions
│   └── ...
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Quick Start

1. **Prerequisites**
   - Node.js installed
   - Anytype Heart gRPC server running on `127.0.0.1:31007`

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the REST Shim**
   ```bash
   node simple-server.js
   ```
   Server will start on `http://localhost:3001`

4. **Test the Connection**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/test-connection
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and basic information.

### Connection Test
```
GET /test-connection
```
Tests connectivity to the Anytype Heart gRPC server.

### Objects (Placeholder)
```
GET /objects
```
Placeholder endpoint for future object operations.

## Development Setup

### For iOS/Swift Development

If you're developing an iOS app that needs to connect to this REST shim:

1. Update your base URL in Swift:
   ```swift
   private let baseURL = "http://127.0.0.1:3001"  // For simulator
   // or use your Mac's IP address for physical devices
   ```

2. Test endpoints:
   - Health: `GET /health`
   - Connection: `GET /test-connection`

### Running Anytype Heart Server

To run the Anytype Heart gRPC server that this shim connects to:

```bash
# In your anytype-heart directory
make run-server
```

This will start:
- gRPC server on `127.0.0.1:31007`
- gRPC Web proxy on `127.0.0.1:31008`

## Why This Project Exists

Anytype Heart uses gRPC for communication, which is excellent for performance but can be challenging to integrate with web browsers and some mobile applications. This REST shim provides:

1. **Easy HTTP Integration**: Standard REST endpoints that any HTTP client can use
2. **Development Convenience**: Simple testing with curl, Postman, or browser
3. **Mobile App Support**: iOS and Android apps can easily consume REST APIs
4. **Rapid Prototyping**: Quick iteration without dealing with gRPC complexities

## Built With

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **@grpc/grpc-js** - gRPC client library
- **@grpc/proto-loader** - Protocol buffer loader
- **cors** - Cross-origin resource sharing

## Development Notes

This project was built as a development tool to enable easier testing and integration with Anytype Heart services. The `simple-server.js` provides a minimal working implementation, while `server.js` includes more comprehensive endpoint examples.

## License

This project is for development and testing purposes with Anytype Heart.