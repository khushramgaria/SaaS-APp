import React from "react";
import ComingSoon from "../components/ComingSoon";
import { Users } from "lucide-react";

const Members = () => {
  return (
    <ComingSoon
      title="Members"
      description="Manage workspace team members, role assignments, invite links, and user access levels."
      icon={Users}
    />
  );
};

export default Members;
