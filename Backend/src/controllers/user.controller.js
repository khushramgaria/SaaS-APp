import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../services/Cloudinary.service.js";
import { logActivity } from "../services/activity.service.js";

// 1. Get Current User Profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// 2. Update Name
export const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const previousName = user.name;
    const trimmedName = name.trim();

    if (previousName !== trimmedName) {
      user.name = trimmedName;
      await user.save();

      // Log activity
      logActivity({
        workspaceId: req.workspaceId,
        userId: user._id,
        action: "USER_PROFILE_UPDATED",
        metadata: {
          previousName,
          updatedName: trimmedName,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Update Avatar via Cloudinary
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No avatar image provided." });
    }

    // Upload memory buffer to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "teamflow-avatars",
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatarUrl: result.secure_url } },
      { new: true },
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Log activity
    logActivity({
      workspaceId: req.workspaceId,
      userId: user._id,
      action: "USER_AVATAR_UPDATED",
      metadata: {
        avatarUrl: result.secure_url,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      data: { avatarUrl: user.avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      return res.status(400).json({
        success: false,
        message: "New password must be between 6 and 20 characters.",
      });
    }

    // Find the user document
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // 1. Use your schema instance method:
    const isMatch = await user.isPasswordCorrect(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password.",
      });
    }

    // 2. Assign the plain text password:
    user.password = newPassword;

    // 3. user.save() triggers your pre("save") hook to hash it automatically!
    await user.save();

    // Log the activity
    logActivity({
      workspaceId: req.workspaceId,
      userId: user._id,
      action: "USER_PASSWORD_CHANGED",
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
