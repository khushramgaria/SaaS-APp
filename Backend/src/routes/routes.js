import { Router } from "express";
import authRoutes from "./auth.routes.js";
import memberRouter from "./member.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", memberRouter);

export default router;
