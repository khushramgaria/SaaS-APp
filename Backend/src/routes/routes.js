import { Router } from "express";
import authRoutes from "./auth.routes.js";
import memberRouter from "./member.routes.js";
import projectRouter from "./project.routes.js";
import taskRouter from "./task.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workspaces", memberRouter);
router.use("/projects", projectRouter);
router.use("/tasks", taskRouter);

export default router;
