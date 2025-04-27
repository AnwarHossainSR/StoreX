const swaggerAutogen = require("swagger-autogen");

// Define output file and the endpoints
const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/product.routes.ts"];
const doc = {
  info: {
    title: "Product Service API",
    description: "Product Management Service",
    version: "1.0.0",
  },
  host: "localhost:6002",
  basePath: "/api",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

// Generate Swagger documentation
swaggerAutogen()(outputFile, endpointsFiles, doc);
