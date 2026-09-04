import React from "react";
import ComingSoon from "../components/ComingSoon";
import { CheckSquare } from "lucide-react";

const Tasks = () => {
  return (
    <ComingSoon
      title="Tasks"
      description="Track sprint progress, assign tasks, prioritize backlog items, and boost team productivity."
      icon={CheckSquare}
    />
  );
};

export default Tasks;
