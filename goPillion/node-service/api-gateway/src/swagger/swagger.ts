import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export const setupCentralSwagger = (app: Express) => {
    console.log("Setting up Central Swagger UI...");

    const options = {
        explorer: true,
        swaggerOptions: {
            urls: [
                {
                    url: "http://localhost:3001/api-docs.json",
                    name: "Auth Service"
                },
                {
                    url: "http://localhost:3005/api-docs.json",
                    name: "Trip Service"
                },
                {
                    url: "http://localhost:3004/api-docs.json",
                    name: "Driver Service"
                },
                {
                    url: "http://localhost:3006/api-docs.json",
                    name: "Map Service"
                },
                {
                    url: "http://localhost:3003/api-docs.json",
                    name: "Notification Service"
                }
            ]
        }
    };

    // Standard Swagger UI setup for multiple URLs
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, options));

    // Simple verify route
    app.get("/swagger-health", (req, res) => {
        res.json({ status: "Swagger setup is active", options_urls_count: options.swaggerOptions.urls.length });
    });

    console.log(`Central Swagger docs configured at /api-docs`);
};
