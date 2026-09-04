import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  Users,
  User,
  Lock,
  Mail,
  Building2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [inviteError, setInviteError] = useState(null);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      password: "",
    },
  });

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setIsLoadingDetails(false);
      setInviteError("No invitation token found. Please check the invitation link sent to your email.");
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoadingDetails(true);
        const response = await apiClient.get(
          API_ENDPOINTS.AUTH.INVITE_DETAILS(token)
        );
        setInviteDetails(response.data.data);
        setInviteError(null);
      } catch (error) {
        setInviteError(
          typeof error.message === "string"
            ? error.message
            : "This invitation link has expired or has already been used. Please contact your workspace admin for a new invite."
        );
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) return;
    try {
      setIsSubmitting(true);
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.ACCEPT_INVITE(token),
        {
          name: data.name,
          password: data.password,
        }
      );

      const { accessToken, user, activeWorkspace } = response.data.data || {};

      // Save credentials & state
      if (accessToken) localStorage.setItem("token", accessToken);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (activeWorkspace) {
        localStorage.setItem("activeWorkspace", JSON.stringify(activeWorkspace));
        if (activeWorkspace.id) {
          localStorage.setItem("activeWorkspaceId", activeWorkspace.id);
        }
      }

      toast.success(response.data.message || "Joined workspace successfully!");

      // Refresh page or navigate directly to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(
        typeof error.message === "string"
          ? error.message
          : "Failed to accept invite. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 my-8">
        {/* Loading State */}
        {isLoadingDetails && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">
              Verifying invitation link...
            </p>
          </div>
        )}

        {/* Error / Expired State */}
        {!isLoadingDetails && inviteError && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Invitation Link Invalid
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {inviteError}
            </p>
            <Button onClick={() => navigate("/login")} variant="secondary" fullWidth>
              Back to Login
            </Button>
          </div>
        )}

        {/* Valid Invitation Accept Form */}
        {!isLoadingDetails && !inviteError && inviteDetails && (
          <div>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 mb-3">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-2">
                Workspace Invitation
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Join {inviteDetails.workspaceName}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                You have been invited to collaborate as a{" "}
                <span className="font-semibold text-violet-300">
                  {inviteDetails.role}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Invited Email"
                type="email"
                value={inviteDetails.email}
                disabled
                icon={Mail}
              />

              <Input
                label="Full Name"
                type="text"
                placeholder="Alex Morgan"
                icon={User}
                error={errors.name?.message}
                {...register("name", {
                  required: "Full Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />

              <Input
                label="Set Password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                icon={ArrowRight}
                iconPosition="right"
                className="mt-2"
              >
                Accept Invitation & Join
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-violet-400 hover:text-violet-300 font-medium underline"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
