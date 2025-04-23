import swaggerAutogen from "swagger-autogen";

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.routes.ts"];
const doc = {
  info: {
    title: "Auth Service API",
    description: "Authentication and Authorization Service",
  },
  host: "http://localhost:6001",
  basePath: "/",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Auth",
      description: "Authentication and Authorization",
    },
  ],
  definitions: {
    User: {
      id: 1,
      name: "johndoe",
      email: "6Mn4o@example.com",
      password: "password123",
    },
  },
};

swaggerAutogen()(outputFile, endpointsFiles, doc);
