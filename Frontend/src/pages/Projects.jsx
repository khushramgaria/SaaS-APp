import React from "react";
import ComingSoon from "../components/ComingSoon";
import { FolderKanban } from "lucide-react";

const Projects = () => {
  return (
    <ComingSoon
      title="Projects"
      description="Organize team workflows, manage active repositories, and track project timelines."
      icon={FolderKanban}
    />
  );
};

export default Projects;
