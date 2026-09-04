import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { User, Mail, Lock, Building2, Users, ArrowRight } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { registerUser } from "../../redux/slices/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      workspaceName: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      toast.success(result.message || "Account & Workspace created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 my-8">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 mb-3">
            <Users className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Get started with TeamSpace
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create your account and initialize your primary workspace
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
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
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            })}
          />

          <Input
            label="Password"
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

          <Input
            label="Workspace Name"
            type="text"
            placeholder="Acme Corp"
            icon={Building2}
            error={errors.workspaceName?.message}
            {...register("workspaceName", {
              required: "Workspace Name is required",
              minLength: {
                value: 2,
                message: "Workspace name must be at least 2 characters",
              },
            })}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            fullWidth
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="mt-3"
          >
            Create Account & Workspace
          </Button>
        </form>

        {/* Footer Link to Login */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
