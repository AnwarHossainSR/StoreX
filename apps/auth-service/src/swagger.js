const swaggerAutogen = require("swagger-autogen");

// Define output file and the endpoints
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.routes.ts"];
const doc = {
  info: {
    title: "Auth Service API",
    description: "Authentication and Authorization Service",
    version: "1.0.0",
  },
  host: "localhost:6001",
  basePath: "/api",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  definitions: {
    User: {
      type: "object",
      properties: {
        name: { type: "string", example: "John Doe" },
        email: { type: "string", example: "johndoe@example.com" },
        password: { type: "string", example: "password123" },
      },
    },
  },
};

// Generate Swagger documentation
swaggerAutogen()(outputFile, endpointsFiles, doc);
