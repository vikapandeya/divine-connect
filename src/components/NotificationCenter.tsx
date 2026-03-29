import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ShoppingBag, Calendar, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'booking' | 'system';
  read: boolean;
  createdAt: any;
}

export default function NotificationCenter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications/${user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          setUnreadCount(data.filter((n: Notification) => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'booking': return <Calendar className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-orange-500 dark:hover:text-orange-500 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center border-2 border-white dark:border-stone-900">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-800/50">
                <h3 className="text-sm font-bold text-stone-900 dark:text-white">{t('notifications.title')}</h3>
                <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <Bell className="w-12 h-12 text-stone-200 dark:text-stone-800 mx-auto mb-3" />
                    <p className="text-sm text-stone-500">{t('notifications.empty')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`px-4 py-4 flex gap-3 transition-colors ${n.read ? 'opacity-60' : 'bg-orange-50/30 dark:bg-orange-900/10'}`}
                      >
                        <div className="mt-1 flex-shrink-0">
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-stone-600 dark:text-stone-400' : 'text-stone-900 dark:text-white'}`}>
                              {n.title}
                            </h4>
                            {!n.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                          {!n.read && (
                            <button 
                              onClick={() => markAsRead(n.id)}
                              className="text-[10px] font-bold text-orange-500 hover:text-orange-600 mt-2 uppercase tracking-wider flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              {t('notifications.markAsRead')}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
