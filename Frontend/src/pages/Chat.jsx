import React from "react";
import ComingSoon from "../components/ComingSoon";
import { MessageSquare } from "lucide-react";

const Chat = () => {
  return (
    <ComingSoon
      title="Chat"
      description="Connect with your teammates in real-time with direct messages and channel discussions."
      icon={MessageSquare}
    />
  );
};

export default Chat;
