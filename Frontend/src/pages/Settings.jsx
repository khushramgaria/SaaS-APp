import React from "react";
import ComingSoon from "../components/ComingSoon";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <ComingSoon
      title="Settings"
      description="Configure workspace preferences, security settings, integrations, and billing options."
      icon={SettingsIcon}
    />
  );
};

export default Settings;
