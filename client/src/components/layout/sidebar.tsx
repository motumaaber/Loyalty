import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/context/language-context";
import { 
  University, BarChart3, Settings, Megaphone, Trophy, 
  Users, TrendingUp, Code, LogOut 
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
}

export default function Sidebar({ activeSection }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navigation = [
    { name: t("nav.overview"), href: "/admin/overview", icon: BarChart3, section: "overview" },
    { name: t("nav.rules"), href: "/admin/rules", icon: Settings, section: "rules" },
    { name: t("nav.campaigns"), href: "/admin/campaigns", icon: Megaphone, section: "campaigns" },
    { name: t("nav.tiers"), href: "/admin/tiers", icon: Trophy, section: "tiers" },
    { name: t("nav.users"), href: "/admin/users", icon: Users, section: "users" },
    { name: t("nav.analytics"), href: "/admin/analytics", icon: TrendingUp, section: "analytics" },
    { name: t("nav.api"), href: "/admin/api", icon: Code, section: "api" },
  ];

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <University className="text-primary-foreground" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-foreground" data-testid="sidebar-title">CBO Loyalty</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = activeSection === item.section;
            const Icon = item.icon;
            
            return (
              <li key={item.section}>
                <Link href={item.href}>
                  <a className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  data-testid={`nav-${item.section}`}>
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-secondary-foreground text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground" data-testid="user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
