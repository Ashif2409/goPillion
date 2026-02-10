import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "GoPillion Trip API",
            version: "1.0.0",
            description: "Trip Service API Documentation",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                Trip: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        driverId: { type: "string" },
                        passengerId: { type: "string" },
                        source: {
                            type: "object",
                            properties: {
                                lat: { type: "number" },
                                lng: { type: "number" },
                                address: { type: "string" }
                            }
                        },
                        destination: {
                            type: "object",
                            properties: {
                                lat: { type: "number" },
                                lng: { type: "number" },
                                address: { type: "string" }
                            }
                        },
                        status: { type: "string", enum: ["OPEN", "REQUESTED", "CONFIRMED", "STARTED", "COMPLETED", "CANCELLED"] },
                        fare: { type: "number" },
                        createdAt: { type: "string", format: "date-time" }
                    }
                }
            }
        },
        servers: [
            {
                url: "http://localhost:3005",
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
            path.join(process.cwd(), "node-service", "trip-service", "src", "routes", "*.ts"),
            path.join(process.cwd(), "node-service", "trip-service", "src", "*.ts"),
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
    console.log(`Swagger docs available at http://localhost:3005/api-docs`);
};
