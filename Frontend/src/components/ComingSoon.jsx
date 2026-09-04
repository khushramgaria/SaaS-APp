import React from "react";
import { Clock, Sparkles } from "lucide-react";

const ComingSoon = ({ title, description, icon: Icon }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950 text-slate-100 min-h-screen">
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-violet-400 shadow-2xl">
          {Icon ? <Icon className="w-10 h-10" /> : <Clock className="w-10 h-10" />}
        </div>
      </div>
      
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Coming Soon</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
        {title}
      </h1>
      <p className="text-slate-400 max-w-md text-base leading-relaxed mb-8">
        {description || `We are hard at work building the ${title} page. Stay tuned for exciting updates!`}
      </p>

      <div className="flex items-center gap-3">
        <button className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/25 cursor-pointer">
          Notify Me
        </button>
        <button className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-sm transition-all cursor-pointer">
          Explore Workspace
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
