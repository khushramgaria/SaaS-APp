import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "TeamFlow SaaS API Documentation",
    version: "1.0.0",
    description: "REST API documentation for TeamFlow SaaS backend",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT}/api/v1`,
      description: "Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
