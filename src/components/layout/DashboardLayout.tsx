import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, type NotificationItem } from '@/hooks/use-notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Pill,
  Search,
  Stethoscope,
  TestTube,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Stethoscope, label: 'Connect', path: '/connect' },
  { icon: Search, label: 'Know Your Disease', path: '/symptoms' },
  { icon: User, label: 'Personal Info', path: '/onboarding' },
  { icon: AlertTriangle, label: 'Emergency', path: '/emergency' },
];

function getPriorityBadgeClass(notification: NotificationItem) {
  if (notification.priority === 'critical') {
    return 'status-critical';
  }

  if (notification.priority === 'reminder') {
    return 'status-warning';
  }

  return 'status-good';
}

function getPriorityLabel(notification: NotificationItem) {
  if (notification.priority === 'critical') {
    return 'Critical';
  }

  if (notification.priority === 'reminder') {
    return 'Reminder';
  }

  return 'Info';
}

function getNotificationIcon(notification: NotificationItem) {
  switch (notification.category) {
    case 'appointment':
      return CalendarDays;
    case 'medicine':
      return Pill;
    case 'test':
      return TestTube;
    case 'symptom':
      return AlertTriangle;
    default:
      return User;
  }
}

function getRelativeTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Updated recently';
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    criticalUnreadCount,
    loading: notificationsLoading,
    refreshing: notificationsRefreshing,
    isRead,
    markAsRead,
    markAllAsRead,
    snooze,
    clearHistory,
    refresh,
  } = useNotifications(user?.id || null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const openNotification = (notification: NotificationItem) => {
    markAsRead(notification.id);
    setNotificationsOpen(false);

    if (notification.href && location.pathname !== notification.href) {
      navigate(notification.href);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold text-sidebar-foreground">HealthHub</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "nav-item",
                    isActive && "active"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-muted-foreground">Patient</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-3">
              <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
                  >
                    <Bell className="h-5 w-5" />
                    {criticalUnreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive animate-ping" />}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[11px] font-semibold leading-5 text-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[360px] p-0 overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-muted-foreground">
                          {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
                        </p>
                      </div>
                      {notificationsRefreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={notificationsRefreshing}>
                        Refresh
                      </Button>
                      <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                        Mark all read
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearHistory}>
                        Clear old
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-[420px]">
                    {notificationsLoading ? (
                      <div className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="font-medium text-sm">No active notifications</p>
                        <p className="text-xs text-muted-foreground mt-1">Everything looks up to date.</p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map((notification) => {
                          const Icon = getNotificationIcon(notification);
                          const unread = !isRead(notification.id);

                          return (
                            <div
                              key={notification.id}
                              className={cn(
                                'border-b border-border/80 p-3 transition-colors',
                                unread ? 'bg-secondary/35' : 'bg-background',
                              )}
                            >
                              <div className="flex gap-3 items-start">
                                <div className={cn('h-8 w-8 rounded-md flex items-center justify-center', getPriorityBadgeClass(notification))}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                                    <Badge variant="outline" className={cn('text-[10px] px-2 py-0', getPriorityBadgeClass(notification))}>
                                      {getPriorityLabel(notification)}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                                  <p className="text-[11px] text-muted-foreground mt-1">{getRelativeTime(notification.timestamp)}</p>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {notification.href && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openNotification(notification)}
                                      >
                                        View
                                      </Button>
                                    )}
                                    {unread && (
                                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                        Mark read
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => snooze(notification.id, 60)}>
                                      Snooze 1h
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
