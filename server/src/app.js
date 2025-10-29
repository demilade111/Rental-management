import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createRequire } from "module";
import "./prisma/client.js";
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoute.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoute.js";
import { specs } from "./config/swagger.js";
import leaseRoutes from "./routes/leaseRoute.js";
import requestApplicationRoutes from "./routes/requestApplicationRoute.js";

const require = createRequire(import.meta.url);
const swaggerUi = require("swagger-ui-express");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/maintenance", maintenanceRoutes);
app.use("/api/v1/leases", leaseRoutes);
app.use("/api/v1/applications", requestApplicationRoutes);

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (_req, res) => {
  res.json({
    message: "Rental Management API running",
    documentation: "Visit /api-docs for API documentation",
  });
});

export { app };
