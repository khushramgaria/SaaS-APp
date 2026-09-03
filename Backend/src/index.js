import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.config.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get("/health", (_, res) => {
  res.json({ message: "Everything is good" });
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting DB instance: ", error);
  })