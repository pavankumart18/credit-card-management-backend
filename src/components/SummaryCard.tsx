import React from "react";
import { motion } from "framer-motion";

interface SummaryCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  actionLabel?: string;
  onAction?: () => void;
  badge?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  subtitle,
  value,
  icon,
  color = "yellow-400",
  actionLabel,
  onAction,
  badge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 rounded-3xl bg-gray-900/60 border border-gray-700/50 shadow-lg flex flex-col justify-between hover:shadow-yellow-400/10 transition"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className="text-3xl font-bold mt-2 text-white">{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
        {icon && <div className={`p-3 rounded-full bg-${color}/10 text-${color}`}>{icon}</div>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {actionLabel && (
          <button
            onClick={onAction}
            className={`px-4 py-2 rounded-lg bg-${color} text-black text-sm font-semibold hover:scale-105 transition`}
          >
            {actionLabel}
          </button>
        )}
        {badge && <div className="px-2 py-1 border border-gray-700 rounded-lg text-sm text-gray-400">{badge}</div>}
      </div>
    </motion.div>
  );
};

export default SummaryCard;
