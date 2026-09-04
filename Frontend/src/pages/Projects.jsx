import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  FolderPlus,
  Search,
  Users,
  User,
  ArrowRight,
  Shield,
} from "lucide-react";
import Button from "../components/ui/Button";
import SkeletonLoader from "../components/common/SkeletonLoader";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import { fetchProjects } from "../redux/slices/projectSlice";
import { fetchMembers } from "../redux/slices/memberSlice";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Projects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeWorkspace } = useSelector((state) => state.auth);
  const { projects, isLoading } = useSelector((state) => state.projects);
  const { members } = useSelector((state) => state.members);

  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const userRole = activeWorkspace?.role || "MEMBER";
  const canCreate = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchMembers());
  }, [dispatch]);

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.key?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Projects
            </h1>
            <p className="text-sm text-slate-400">
              Manage repositories, track deliverables, and organize team workflows
            </p>
          </div>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            icon={FolderPlus}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Project
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, key, or description..."
            className="w-full bg-slate-950 text-white text-xs placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-violet-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="group rounded-2xl p-6 bg-slate-900/80 border border-slate-800/80 hover:border-violet-500/50 shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Header: Key & Lead */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded">
                    {project.key}
                  </span>

                  {project.leadId && (
                    <div
                      className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800"
                      title={`Lead: ${project.leadId.name}`}
                    >
                      <User className="w-3 h-3 text-violet-400" />
                      <span className="truncate max-w-[100px]">
                        {project.leadId.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6">
                  {project.description || "No project description provided."}
                </p>
              </div>

              {/* Footer: Team Avatars & View Action */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center -space-x-2 overflow-hidden">
                  {project.members &&
                    project.members.slice(0, 4).map((m, idx) => (
                      <div
                        key={m._id || idx}
                        className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-violet-300 shadow"
                        title={m.name}
                      >
                        {getInitials(m.name)}
                      </div>
                    ))}
                  {project.members && project.members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-12 text-center text-slate-400">
          <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No projects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Get started by initializing a new project workspace for your team.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              icon={FolderPlus}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create First Project
            </Button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        members={members}
      />
    </div>
  );
};

export default Projects;
