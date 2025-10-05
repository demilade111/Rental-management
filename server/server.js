import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import "./src/prisma/client.js";
import authRoutes from "./src/routes/authRoute.js";
import userRoutes from "./src/routes/userRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/user", userRoutes);


app.get("/", (_req, res) => {
  res.json({ message: "Rental Management API running" });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
