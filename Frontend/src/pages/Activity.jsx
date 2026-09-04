import React from "react";
import ComingSoon from "../components/ComingSoon";
import { Activity as ActivityIcon } from "lucide-react";

const Activity = () => {
  return (
    <ComingSoon
      title="Activity"
      description="View recent workspace activities, audit logs, updates, and event histories."
      icon={ActivityIcon}
    />
  );
};

export default Activity;
