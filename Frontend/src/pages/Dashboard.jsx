import React from "react";
import ComingSoon from "../components/ComingSoon";
import { LayoutDashboard } from "lucide-react";

const Dashboard = () => {
  return (
    <ComingSoon
      title="Dashboard"
      description="Your centralized overview for workspace analytics, project metrics, and key performance indicators."
      icon={LayoutDashboard}
    />
  );
};

export default Dashboard;
