import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "GoPillion Notification API",
            version: "1.0.0",
            description: "Notification Service API Documentation",
        },
        servers: [
            {
                url: "http://localhost:3003",
                description: "Development Server",
            },
        ],
    },
    apis: [
        path.join(__dirname, "../routes/*.ts"),
        path.join(__dirname, "../*.ts"),
        path.join(__dirname, "../../src/routes/*.ts"),
        path.join(__dirname, "../../src/*.ts"),
    ],
};

let swaggerSpec: any = swaggerJsdoc(options);

if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
    const fallbackOptions = {
        ...options,
        apis: [
            path.join(process.cwd(), "src", "routes", "*.ts"),
            path.join(process.cwd(), "src", "*.ts"),
            path.join(process.cwd(), "node-service", "notification-service", "src", "routes", "*.ts"),
            path.join(process.cwd(), "node-service", "notification-service", "src", "*.ts"),
        ],
    };
    swaggerSpec = swaggerJsdoc(fallbackOptions);
}

export const setupSwagger = (app: Express) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    console.log(`Swagger docs available at http://localhost:3003/api-docs`);
};
