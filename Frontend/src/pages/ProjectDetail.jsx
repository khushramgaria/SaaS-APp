import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FolderKanban,
  Kanban,
  ListTodo,
  LayoutDashboard,
  Plus,
  UserPlus,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Globe,
  Lock,
  Tag,
  Trash2,
} from "lucide-react";
import Button from "../components/ui/Button";
import SkeletonLoader from "../components/common/SkeletonLoader";
import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskTable from "../components/tasks/TaskTable";
import TaskDetailDrawer from "../components/tasks/TaskDetailDrawer";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import AddProjectMemberModal from "../components/projects/AddProjectMemberModal";
import CreateDocModal from "../components/documents/CreateDocModal";
import ConfirmModal from "../components/common/ConfirmModal";
import {
  fetchProjectById,
  clearCurrentProject,
} from "../redux/slices/projectSlice";
import { fetchTasks, setCurrentTask } from "../redux/slices/taskSlice";
import { fetchMembers } from "../redux/slices/memberSlice";
import { fetchDocuments, deleteDocument } from "../redux/slices/documentSlice";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activeWorkspace } = useSelector((state) => state.auth);
  const { currentProject, stats, isLoading: isProjectLoading } = useSelector(
    (state) => state.projects
  );
  const { tasks, currentTask, isLoading: isTasksLoading } = useSelector(
    (state) => state.tasks
  );
  const { documents, isLoading: isDocsLoading } = useSelector(
    (state) => state.documents
  );
  const { members: workspaceMembers } = useSelector((state) => state.members);

  // Default active tab is "overview"
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);

  // Delete Document Confirmation Modal State
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  const userRole = activeWorkspace?.role || "MEMBER";
  const canManage = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(fetchTasks({ projectId }));
      dispatch(fetchDocuments({ projectId }));
      dispatch(fetchMembers());
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [dispatch, projectId]);

  const handleTaskClick = (task) => {
    dispatch(setCurrentTask(task));
  };

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => {
      const pId = t.projectId?._id || t.projectId;
      return pId === projectId;
    });
  }, [tasks, projectId]);

  const projectDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const pId = doc.projectId?._id || doc.projectId;
      return pId === projectId;
    });
  }, [documents, projectId]);

  const totalTasks = stats?.TOTAL || projectTasks.length || 0;
  const completedTasks = stats?.DONE || projectTasks.filter((t) => t.status === "DONE").length || 0;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleContinueToDocEditor = (metadata) => {
    setIsCreateDocModalOpen(false);
    navigate("/documents/new", { state: { metadata: { ...metadata, projectId } } });
  };

  const handleDeleteDocConfirm = async () => {
    if (!deleteDocTarget) return;
    setIsDeletingDoc(true);
    await dispatch(deleteDocument(deleteDocTarget._id));
    setIsDeletingDoc(false);
    setDeleteDocTarget(null);
  };

  const getPlainTextSummary = (html = "") => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.trim();
  };

  if (isProjectLoading || !currentProject) {
    return (
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <SkeletonLoader variant="card" />
        <SkeletonLoader variant="table" rows={6} columns={4} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="font-mono text-sm font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl shadow-inner">
              {currentProject.key}
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {currentProject.name}
              </h1>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                {currentProject.leadId && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>Lead: {currentProject.leadId.name}</span>
                  </span>
                )}
                <span>•</span>
                <span>{currentProject.members?.length || 0} Members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={FileText}
              onClick={() => setIsCreateDocModalOpen(true)}
            >
              Add Doc
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateTaskModalOpen(true)}
            >
              Create Task
            </Button>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300">
                Project Completion Progress
              </span>
              <p className="text-[11px] text-slate-400">
                {completedTasks} of {totalTasks} tasks completed ({completionPercent}%)
              </p>
            </div>
          </div>
          <div className="w-full md:w-64 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Overview -> Board -> Tasks -> Documents */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto custom-scrollbar">
        {/* Tab 1: Overview */}
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "overview"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        {/* Tab 2: Board */}
        <button
          onClick={() => setActiveTab("board")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "board"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Kanban className="w-4 h-4" />
          <span>Kanban Board</span>
        </button>

        {/* Tab 3: Tasks */}
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "tasks"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Task Table</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300">
            {projectTasks.length}
          </span>
        </button>

        {/* Tab 4: Documents */}
        <button
          onClick={() => setActiveTab("documents")}
          className={`pb-3 px-4 font-semibold text-sm transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === "documents"
              ? "border-violet-500 text-white"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            {projectDocuments.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total Tasks
                </span>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats?.TOTAL || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  In Progress
                </span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {stats?.IN_PROGRESS || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  In Review
                </span>
                <p className="text-2xl font-bold text-indigo-400 mt-1">
                  {stats?.IN_REVIEW || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Completed
                </span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {stats?.DONE || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Description & Team Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Project Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentProject.description || "No project description specified."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-400" />
                  <span>Project Team</span>
                </h3>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={UserPlus}
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              <div className="space-y-2.5">
                {currentProject.members &&
                  currentProject.members.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/60"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">
                          {m.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {m.email}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Kanban Board */}
      {activeTab === "board" && (
        <KanbanBoard tasks={projectTasks} onTaskClick={handleTaskClick} />
      )}

      {/* Tab 3: Tasks Table */}
      {activeTab === "tasks" && (
        <TaskTable
          tasks={projectTasks}
          isLoading={isTasksLoading}
          onTaskClick={handleTaskClick}
          showProjectColumn={false}
        />
      )}

      {/* Tab 4: Documents */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Project Documents ({projectDocuments.length})
            </h3>
            <button
              onClick={() => setIsCreateDocModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project Document</span>
            </button>
          </div>

          {isDocsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse"
                >
                  <div className="h-5 bg-slate-800/80 rounded w-3/4" />
                  <div className="h-4 bg-slate-800/40 rounded w-full" />
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                    <div className="w-6 h-6 rounded-full bg-slate-800" />
                    <div className="w-16 h-4 bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : projectDocuments.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-100 mb-1">
                No documents for this project yet
              </h4>
              <p className="text-xs text-slate-400 mb-5">
                Create technical specifications, architecture diagrams, or notes linked to {currentProject.name}.
              </p>
              <button
                onClick={() => setIsCreateDocModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm shadow-md cursor-pointer mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Project Document</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectDocuments.map((doc) => {
                const author = doc.authorId || {};
                const isRestricted = doc.allowedMembers && doc.allowedMembers.length > 0;

                return (
                  <div
                    key={doc._id}
                    onClick={() => navigate(`/documents/${doc._id}`)}
                    className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Card Top: Visibility Pill */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {currentProject.key}
                        </span>

                        {isRestricted ? (
                          <div
                            className="flex items-center space-x-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"
                            title="Restricted Access"
                          >
                            <Lock className="w-3 h-3" />
                            <span>Restricted</span>
                          </div>
                        ) : (
                          <div
                            className="flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                            title="Workspace Public"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Public</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-base text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {doc.title || "Untitled Document"}
                      </h4>

                      {/* Content Summary (if available) */}
                      {Boolean(getPlainTextSummary(doc.content)) && (
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {getPlainTextSummary(doc.content)}
                        </p>
                      )}

                      {/* Tags */}
                      {doc.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {doc.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50"
                            >
                              #{tag}
                            </span>
                          ))}
                          {doc.tags.length > 3 && (
                            <span className="text-[10px] text-slate-500">
                              +{doc.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Metadata */}
                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-semibold text-indigo-300">
                          {author.avatar ? (
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            author.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]">
                          {author.name || "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[11px] text-slate-500">
                          {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>

                        <button
                          onClick={() => setDeleteDocTarget(doc)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800/80 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        projects={[currentProject]}
        members={currentProject.members || workspaceMembers}
        defaultProjectId={projectId}
      />

      {/* Create Document Modal */}
      <CreateDocModal
        isOpen={isCreateDocModalOpen}
        onClose={() => setIsCreateDocModalOpen(false)}
        projects={[currentProject]}
        members={currentProject.members || workspaceMembers}
        defaultProjectId={projectId}
        onContinue={handleContinueToDocEditor}
      />

      {/* Add Project Member Modal */}
      <AddProjectMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        project={currentProject}
        workspaceMembers={workspaceMembers}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={currentTask}
        isOpen={Boolean(currentTask)}
        onClose={() => dispatch(setCurrentTask(null))}
        members={currentProject.members || workspaceMembers}
      />

      {/* Delete Document Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteDocTarget)}
        onClose={() => setDeleteDocTarget(null)}
        onConfirm={handleDeleteDocConfirm}
        title="Delete Document?"
        description={`Are you sure you want to delete "${deleteDocTarget?.title}"?`}
        confirmText="Delete Document"
        variant="danger"
        isLoading={isDeletingDoc}
      />
    </div>
  );
};

export default ProjectDetail;
