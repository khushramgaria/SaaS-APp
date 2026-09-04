import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Workspace } from "../models/workspace.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";
import jwt from "jsonwebtoken";

// Cookie options for secure Refresh Token handling
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req, res, next) => {
  const { name, email, password, workspaceName } = req.body;

  if (!name || !email || !password || !workspaceName) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered." });
    }

    const [user] = await User.create([{ name, email, password }], {
      session,
    });

    // 2. Generate workspace slug and create Workspace
    const slugBase = workspaceName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;
    const [workspace] = await Workspace.create(
      [{ name: workspaceName, slug, ownerId: user._id }],
      { session },
    );

    // 3. Assign OWNER role in WorkspaceMember
    await WorkspaceMember.create(
      [{ workspaceId: workspace._id, userId: user._id, role: "OWNER" }],
      { session },
    );

    // 4. Issue tokens
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ session });

    await session.commitTransaction();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return res.status(201).json({
      success: true,
      message: "Workspace and account created successfully.",
      data: {
        accessToken,
        user,
        activeWorkspace: {
          id: workspace._id,
          name: workspace.name,
          slug: workspace.slug,
          role: "OWNER",
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    const isMatch = await user.isPasswordCorrect(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect Password." });
    }

    // Fetch workspaces the user is a member of
    const memberships = await WorkspaceMember.find({ userId: user._id })
      .populate("workspaceId", "name slug ownerId")
      .lean();

    const workspaces = memberships.map((m) => ({
      id: m.workspaceId._id,
      name: m.workspaceId.name,
      slug: m.workspaceId.slug,
      role: m.role,
    }));

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user,
        workspaces,
        activeWorkspace: workspaces[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token missing." });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid or revoked refresh token." });
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return res.status(200).json({ success: true, data: { accessToken } });
  } catch (error) {
    return res
      .status(403)
      .json({ success: false, message: "Invalid refresh token." });
  }
};

export const getMe = async (req, res) => {
  const memberships = await WorkspaceMember.find({ userId: req.user._id })
    .populate("workspaceId", "name slug ownerId")
    .lean();

  const workspaces = memberships.map((m) => ({
    id: m.workspaceId._id,
    name: m.workspaceId.name,
    slug: m.workspaceId.slug,
    role: m.role,
  }));

  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
      workspaces,
    },
  });
};
