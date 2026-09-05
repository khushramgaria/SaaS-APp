import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { WorkspaceMember } from "../models/workspaceMember.model.js";
import { WorkspaceInvite } from "../models/workspaceInvite.model.js";
import { sendInviteEmail } from "../services/email.service.js";
import { logActivity } from "../services/activity.service.js";
import { generateInviteToken } from "../utils/helper.js";

export const getMembers = async (req, res, next) => {
  try {
    const members = await WorkspaceMember.find({ workspaceId: req.workspaceId })
      .populate("userId", "name email avatarUrl")
      .sort({ createdAt: 1 });

    const formattedMembers = members
      .filter((m) => m.userId)
      .map((m) => ({
        membershipId: m._id,
        userId: m.userId._id,
        name: m.userId.name,
        email: m.userId.email,
        avatarUrl: m.userId.avatarUrl,
        role: m.role,
        joinedAt: m.createdAt,
      }));

    return res.status(200).json({ success: true, data: formattedMembers });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role selected." });
    }

    const targetMembership = await WorkspaceMember.findOne({
      _id: memberId,
      workspaceId: req.workspaceId,
    }).populate("userId", "name email");

    if (!targetMembership) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    if (targetMembership.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Cannot change the workspace owner's role.",
      });
    }

    // Admins cannot alter another Admin or elevate anyone to Owner
    if (req.userRole === "ADMIN" && targetMembership.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot modify other admins.",
      });
    }

    const previousRole = targetMembership.role;

    if (previousRole !== role) {
      targetMembership.role = role;
      await targetMembership.save();

      // Log Activity: Member Role Updated
      logActivity({
        workspaceId: req.workspaceId,
        userId: req.user._id,
        action: "MEMBER_ROLE_UPDATED",
        metadata: {
          targetUserName: targetMembership.userId.name,
          targetUserEmail: targetMembership.userId.email,
          fromRole: previousRole,
          toRole: role,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member role updated.",
      data: targetMembership,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    const targetMembership = await WorkspaceMember.findOne({
      _id: memberId,
      workspaceId: req.workspaceId,
    }).populate("userId", "name email");

    if (!targetMembership) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found." });
    }

    if (targetMembership.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Workspace owner cannot be removed.",
      });
    }

    if (req.userRole === "ADMIN" && targetMembership.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot remove other admins.",
      });
    }

    await mongoose.connection
      .collection("tasks")
      .updateMany(
        {
          workspaceId: req.workspaceId,
          assigneeId: targetMembership.userId._id,
        },
        { $set: { assigneeId: null } },
      );

    await WorkspaceMember.findByIdAndDelete(memberId);

    // Log Activity: Member Removed
    logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: "MEMBER_REMOVED",
      metadata: {
        targetUserName: targetMembership.userId.name,
        targetUserEmail: targetMembership.userId.email,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed and their tasks have been unassigned.",
    });
  } catch (error) {
    next(error);
  }
};

export const getInvites = async (req, res, next) => {
  try {
    const invites = await WorkspaceInvite.find({
      workspaceId: req.workspaceId,
    }).sort({ createdAt: -1 });

    const formatted = invites.map((inv) => ({
      _id: inv._id,
      email: inv.email,
      role: inv.role,
      createdAt: inv.updatedAt,
      expiresAt: inv.expiresAt,
      isExpired: new Date() > new Date(inv.expiresAt),
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const createInvite = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Email and role are required." });
    }

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role specified." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check 1: Is the email already registered anywhere in the system?
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "A user with this email is already registered in an organization.",
      });
    }

    // Check 2: Is there already an invite for this email in this workspace?
    const existingInvite = await WorkspaceInvite.findOne({
      workspaceId: req.workspaceId,
      email: normalizedEmail,
    });

    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "An invite has already been sent to this email.",
      });
    }

    const { token, expiresAt } = generateInviteToken();

    const invite = await WorkspaceInvite.create({
      workspaceId: req.workspaceId,
      email: normalizedEmail,
      role,
      token,
      inviterId: req.user._id,
      expiresAt,
    });

    const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

    await sendInviteEmail({
      toEmail: normalizedEmail,
      workspaceName: req.workspace?.name || "the workspace",
      role,
      inviteUrl,
    });

    logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: "MEMBER_INVITED",
      metadata: {
        targetUserEmail: normalizedEmail,
        role,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Invitation generated successfully.",
      data: {
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        createdAt: invite.updatedAt,
        expiresAt: invite.expiresAt,
        isExpired: false,
        inviteUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resendInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;

    const invite = await WorkspaceInvite.findOne({
      _id: inviteId,
      workspaceId: req.workspaceId,
    });

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found." });
    }

    const { token, expiresAt } = generateInviteToken();
    invite.token = token;
    invite.expiresAt = expiresAt;
    await invite.save();

    const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;

    await sendInviteEmail({
      toEmail: invite.email,
      workspaceName: req.workspace?.name || "the workspace",
      role: invite.role,
      inviteUrl,
    });

    // Log Activity: Invite Resent
    logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: "MEMBER_INVITE_RESENT",
      metadata: {
        targetUserEmail: invite.email,
        role: invite.role,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Invite refreshed and resent.",
      data: { expiresAt: invite.expiresAt, inviteUrl },
    });
  } catch (error) {
    next(error);
  }
};

export const revokeInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;

    const invite = await WorkspaceInvite.findOneAndDelete({
      _id: inviteId,
      workspaceId: req.workspaceId,
    });

    if (!invite) {
      return res
        .status(404)
        .json({ success: false, message: "Invite not found." });
    }

    // Log Activity: Invite Revoked
    logActivity({
      workspaceId: req.workspaceId,
      userId: req.user._id,
      action: "MEMBER_INVITE_REVOKED",
      metadata: {
        targetUserEmail: invite.email,
        role: invite.role,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Invite revoked successfully." });
  } catch (error) {
    next(error);
  }
};
