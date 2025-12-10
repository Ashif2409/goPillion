import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GoPillion Auth API",
      version: "1.0.0",
      description: "Authentication Service API Documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development Server",
      },
    ],
  },
  apis: [
    // For development (TypeScript source files)
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../*.ts"),
    // For production/compiled (JavaScript files in dist)
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../*.js"),
  ],
};

let swaggerSpec: any = swaggerJsdoc(options);

// If no paths were discovered (e.g. when running compiled output that lost JSDoc comments),
// try a fallback that points to the workspace source files using absolute paths.
if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
  const fallbackOptions = {
    ...options,
    apis: [
      path.join(process.cwd(), "auth-service", "src", "routes", "*.ts"),
      path.join(process.cwd(), "auth-service", "src", "*.ts"),
      path.join(process.cwd(), "auth-service", "dist", "routes", "*.js"),
      path.join(process.cwd(), "auth-service", "dist", "*.js"),
    ],
  };

  const altSpec: any = swaggerJsdoc(fallbackOptions);
  if (altSpec && altSpec.paths && Object.keys(altSpec.paths).length > 0) {
    swaggerSpec = altSpec;
  }
}

// Serve Swagger UI
export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(
    `Swagger docs available at http://${process.env.API_HOST || "localhost"}:${
      process.env.APP_DOCKER_PORT || 3000
    }/api-docs`
  );
};