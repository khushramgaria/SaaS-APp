import React from "react";
import ComingSoon from "../components/ComingSoon";
import { FileText } from "lucide-react";

const Documents = () => {
  return (
    <ComingSoon
      title="Documents"
      description="Create, share, and collaborate on documents, technical specifications, and team notes."
      icon={FileText}
    />
  );
};

export default Documents;
