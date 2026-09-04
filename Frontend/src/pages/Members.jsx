import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Users,
  UserPlus,
  Mail,
  Clock,
  Trash2,
  RefreshCw,
  XCircle,
  Shield,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import InviteMemberModal from "../components/members/InviteMemberModal";
import ConfirmModal from "../components/common/ConfirmModal";
import {
  fetchMembers,
  updateMemberRole,
  removeMember,
  fetchInvites,
  resendInvite,
  revokeInvite,
} from "../redux/slices/memberSlice";

// Helper for formatting date strings cleanly
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper for initials
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

// Role badge component
const RoleBadge = ({ role }) => {
  const roleStyles = {
    OWNER: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    ADMIN: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    MEMBER: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    VIEWER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
        roleStyles[role] || roleStyles.VIEWER
      }`}
    >
      {role}
    </span>
  );
};

const Members = () => {
  const dispatch = useDispatch();
  const { user, activeWorkspace } = useSelector((state) => state.auth);
  const { members, invites, isLoadingMembers, isLoadingInvites } = useSelector(
    (state) => state.members
  );

  const [activeTab, setActiveTab] = useState("members");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    variant: "danger",
    isLoading: false,
    onConfirm: null,
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
  };

  const currentUserRole = activeWorkspace?.role || "MEMBER";
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  useEffect(() => {
    dispatch(fetchMembers());
    if (canManage) {
      dispatch(fetchInvites());
    }
  }, [dispatch, canManage]);

  // Handle Role Change
  const handleRoleChange = async (memberId, targetRole, currentTargetRole) => {
    if (targetRole === currentTargetRole) return;
    try {
      await dispatch(updateMemberRole({ memberId, role: targetRole })).unwrap();
      toast.success("Member role updated successfully.");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to update role.");
    }
  };

  // Trigger Remove Member Modal
  const handleRemoveMemberClick = (memberId, memberName) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Member",
      description: `Are you sure you want to remove ${memberName} from this workspace? Their assigned tasks will be unassigned.`,
      confirmText: "Remove Member",
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const result = await dispatch(removeMember(memberId)).unwrap();
          toast.success(result.data?.message || "Member removed successfully.");
          closeConfirmModal();
        } catch (error) {
          toast.error(typeof error === "string" ? error : "Failed to remove member.");
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Handle Resend Invite
  const handleResendInvite = async (inviteId, email) => {
    try {
      await dispatch(resendInvite(inviteId)).unwrap();
      toast.success(`Invitation resent to ${email}`);
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to resend invite.");
    }
  };

  // Trigger Revoke Invite Modal
  const handleRevokeInviteClick = (inviteId, email) => {
    setConfirmModal({
      isOpen: true,
      title: "Revoke Invitation",
      description: `Are you sure you want to revoke the invitation for ${email}? They will no longer be able to use this link to join.`,
      confirmText: "Revoke Invite",
      variant: "danger",
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await dispatch(revokeInvite(inviteId)).unwrap();
          toast.success(`Invitation for ${email} revoked.`);
          closeConfirmModal();
        } catch (error) {
          toast.error(typeof error === "string" ? error : "Failed to revoke invite.");
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Columns for Active Members Table
  const memberColumns = [
    {
      header: "Member",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-semibold text-sm shrink-0">
            {getInitials(row.name)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white flex items-center gap-1.5">
              {row.name}
              {row.userId === user?._id && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                  You
                </span>
              )}
            </span>
            <span className="text-xs text-slate-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (row) => {
        const isSelf = row.userId === user?._id;
        const isTargetOwner = row.role === "OWNER";
        const isTargetAdmin = row.role === "ADMIN";
        const isCurrentAdmin = currentUserRole === "ADMIN";

        // Disable role edit if target is owner, or target is self, or current user is admin modifying an admin
        const cannotEdit =
          !canManage || isSelf || isTargetOwner || (isCurrentAdmin && isTargetAdmin);

        if (cannotEdit) {
          return <RoleBadge role={row.role} />;
        }

        return (
          <select
            value={row.role}
            onChange={(e) =>
              handleRoleChange(row.membershipId, e.target.value, row.role)
            }
            className="bg-slate-950 text-slate-200 border border-slate-800 focus:border-violet-500 rounded-lg py-1 px-2.5 text-xs font-medium cursor-pointer outline-none"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="MEMBER">MEMBER</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        );
      },
    },
    {
      header: "Joined Date",
      cell: (row) => (
        <span className="text-xs text-slate-400">{formatDate(row.joinedAt)}</span>
      ),
    },
    ...(canManage
      ? [
          {
            header: "Actions",
            className: "text-right",
            cell: (row) => {
              const isSelf = row.userId === user?._id;
              const isTargetOwner = row.role === "OWNER";
              const isTargetAdmin = row.role === "ADMIN";
              const isCurrentAdmin = currentUserRole === "ADMIN";

              const cannotRemove =
                isSelf || isTargetOwner || (isCurrentAdmin && isTargetAdmin);

              if (cannotRemove) return null;

              return (
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      handleRemoveMemberClick(row.membershipId, row.name)
                    }
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  // Columns for Pending Invites Table
  const inviteColumns = [
    {
      header: "Email",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <span className="font-medium text-white text-sm">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Assigned Role",
      cell: (row) => <RoleBadge role={row.role} />,
    },
    {
      header: "Sent At",
      cell: (row) => (
        <span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Expires At",
      cell: (row) => (
        <span className="text-xs text-slate-400">{formatDate(row.expiresAt)}</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => {
        const isExpired =
          row.isExpired || (row.expiresAt && new Date() > new Date(row.expiresAt));

        return isExpired ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Expired</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Pending</span>
          </span>
        );
      },
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => {
        const isExpired =
          row.isExpired || (row.expiresAt && new Date() > new Date(row.expiresAt));

        return (
          <div className="flex items-center justify-end gap-2">
            {isExpired && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleResendInvite(row._id, row.email)}
                icon={RefreshCw}
              >
                Resend
              </Button>
            )}
            <button
              onClick={() => handleRevokeInviteClick(row._id, row.email)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Revoke invitation"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Workspace Members
              </h1>
              <p className="text-sm text-slate-400">
                Manage active team members, roles, and pending invitations
              </p>
            </div>
          </div>
        </div>

        {canManage && (
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === "members"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Members</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
            {members.length}
          </span>
        </button>

        {canManage && (
          <button
            onClick={() => setActiveTab("invites")}
            className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "invites"
                ? "border-violet-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Pending Invitations</span>
            {invites.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-violet-600/30 text-violet-300 border border-violet-500/30">
                {invites.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === "members" && (
        <DataTable
          columns={memberColumns}
          data={members}
          isLoading={isLoadingMembers}
          emptyMessage="No active members in this workspace."
        />
      )}

      {activeTab === "invites" && canManage && (
        <DataTable
          columns={inviteColumns}
          data={invites}
          isLoading={isLoadingInvites}
          emptyMessage="No pending invitations found."
        />
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};

export default Members;
