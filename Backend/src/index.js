import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config.js";
import { connectDB } from "./config/db.config.js";
import routes from "./routes/routes.js";
import { initSocket } from "./config/socket.config.js";

const app = express();

const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Mount Swagger interactive explorer
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_, res) => {
  res.json({ message: "Everything is good" });
});

app.use("/api/v1", routes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting DB instance: ", error);
  });
