import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Lock,
  Camera,
  Shield,
  Palette,
  Loader2,
  Save,
  Key,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ThemeToggle from "../components/common/ThemeToggle";
import { updateProfile, updateAvatar, changePassword } from "../redux/slices/authSlice";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const SettingsPage = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  // Form State: Profile
  const [name, setName] = useState(user?.name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Form State: Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (name.trim() === user?.name) return;

    setIsUpdatingProfile(true);
    await dispatch(updateProfile({ name: name.trim() }));
    setIsUpdatingProfile(false);
  };

  // Handle Avatar Select & Upload
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPEG, WebP).");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUpdatingAvatar(true);
    await dispatch(updateAvatar(formData));
    setIsUpdatingAvatar(false);

    // Reset input value
    e.target.value = "";
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setIsChangingPassword(true);
    const resultAction = await dispatch(
      changePassword({ currentPassword, newPassword })
    );
    setIsChangingPassword(false);

    if (changePassword.fulfilled.match(resultAction)) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const isProfileChanged = name.trim() !== "" && name.trim() !== user?.name;

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-8 min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <span>Account Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your personal profile, security credentials, and interface preferences.
        </p>
      </div>

      {/* Section 1: Profile & Avatar Details */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl space-y-6 transition-colors duration-200">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Profile Details
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar Uploader */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              onClick={handleAvatarClick}
              className="w-20 h-20 rounded-full ring-2 ring-indigo-500/30 overflow-hidden relative group cursor-pointer bg-slate-100 dark:bg-slate-900 flex items-center justify-center transition-all hover:ring-indigo-500/60 shadow-md"
              title="Click to update avatar"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-bold text-xl flex items-center justify-center">
                  {getInitials(user?.name)}
                </div>
              )}

              {/* Hover Overlay / Loading Spinner */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold space-y-0.5">
                {isUpdatingAvatar ? (
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Change</span>
                  </>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              PNG, JPG or WebP
            </span>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                />
              </div>

              {/* Email Input (Read-Only) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <span
                    className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1"
                    title="Email cannot be modified"
                  >
                    <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span>Locked</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    readOnly
                    className="w-full bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed rounded-lg px-3.5 py-2.5 text-sm outline-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!isProfileChanged || isUpdatingProfile}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all font-medium text-white px-4 py-2 rounded-lg text-sm shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Section 2: Security & Password */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl space-y-6 transition-colors duration-200">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Change Password
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ensure your account is using a strong, unique password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5 w-full">
          {/* Full-width responsive password layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 text-slate-900 dark:text-white rounded-lg px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all font-medium text-white px-4 py-2 rounded-lg text-sm shadow-sm inline-flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Appearance Preferences */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl space-y-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Interface Appearance
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select how Teamflow looks to you on this device.
              </p>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
