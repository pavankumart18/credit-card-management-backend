import React from "react";
import { motion } from "framer-motion";

type Notification = { id: number; title: string; body?: string; date: string; read?: boolean };

interface NotificationsCenterProps {
  notifications?: Notification[];
  onMarkRead?: (id: number) => void;
  onClear?: () => void;
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({ notifications = [], onMarkRead, onClear }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="p-6 rounded-3xl bg-gray-900/60 border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-400">Notifications</div>
          <div className="text-xl font-bold mt-1">Activity & alerts</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClear} className="px-3 py-2 rounded-md border border-gray-700 text-sm">Clear</button>
        </div>
      </div>

      <div className="space-y-2">
        {notifications.length === 0 && <div className="text-sm text-gray-400">No notifications</div>}
        {notifications.map((n) => (
          <div key={n.id} className={`p-3 rounded-lg border ${n.read ? 'border-gray-700 bg-gray-800/30' : 'border-yellow-400/40 bg-gray-800/50'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{n.title}</div>
                {n.body && <div className="text-xs text-gray-400">{n.body}</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-gray-400">{n.date}</div>
                {!n.read && <button onClick={() => onMarkRead?.(n.id)} className="px-2 py-1 rounded-md bg-yellow-400 text-black text-xs">Mark read</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-400">Tip: Toggle notification preferences in Settings to control what you receive.</div>
    </motion.div>
  );
};

export default NotificationsCenter;
