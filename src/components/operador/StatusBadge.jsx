import React from "react";
import { Clock, Wrench, CheckCircle, XCircle } from "lucide-react";

const config = {
  "Pendente":     { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", icon: Clock },
  "Em Andamento": { bg: "bg-blue-500/15",   text: "text-blue-400",   border: "border-blue-500/30",   icon: Wrench },
  "Resolvido":    { bg: "bg-green-500/15",  text: "text-green-400",  border: "border-green-500/30",  icon: CheckCircle },
  "Cancelado":    { bg: "bg-gray-500/15",   text: "text-gray-400",   border: "border-gray-500/30",   icon: XCircle },
};

export default function StatusBadge({ status, size = "sm" }) {
  const c = config[status] || config["Pendente"];
  const Icon = c.icon;
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-inter font-500 ${c.bg} ${c.text} ${c.border} ${padding}`}>
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      {status}
    </span>
  );
}