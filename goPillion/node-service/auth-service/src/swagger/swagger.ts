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
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
            ,
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid", example: "3fa85f64-5717-4562-b3fc-2c963f66afa6" },
                        mobile: { type: "string", example: "9876543210" },
                        name: { type: "string", example: "Md Khalilul Rahman" },
                        role: { type: "string", enum: ["USER", "DRIVER"], example: "DRIVER" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    },
                    required: ["id", "mobile", "role"]
                }
            }
        },
        servers: [
            {
                url: "/",
                description: "API Gateway",
            },
        ],
    },
    apis: [
        // Standard paths for both local and Docker
        path.join(__dirname, "../routes/*.ts"),
        path.join(__dirname, "../*.ts"),
        path.join(__dirname, "../../src/routes/*.ts"),
        path.join(__dirname, "../../src/*.ts"),
    ],
};

let swaggerSpec: any = swaggerJsdoc(options);

// If no paths were discovered, try absolute paths relative to execution root
if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
    const fallbackOptions = {
        ...options,
        apis: [
            path.join(process.cwd(), "src", "routes", "*.ts"),
            path.join(process.cwd(), "src", "*.ts"),
            path.join(process.cwd(), "node-service", "auth-service", "src", "routes", "*.ts"),
            path.join(process.cwd(), "node-service", "auth-service", "src", "*.ts"),
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
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    app.get("/api/auth/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    console.log(
        `Swagger docs available at http://${process.env.API_HOST || "localhost"}:${process.env.APP_DOCKER_PORT || 3000
        }/api-docs`
    );
};