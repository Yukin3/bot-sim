import { Link } from "react-router-dom";
import { LogOut, MoveUpRight, Settings, CreditCard, FileText } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface ProfileMenuProps {
  name: string;
  role: string;
  avatar: string;
  subscription?: string;
}

export default function ProfileMenu({
  name = "John Doe",
  role = "Bot Enthusiast",
  avatar = "/default-avatar.png",
  subscription = "Free Trial",
}: Partial<ProfileMenuProps>) {
    const { logout } = useAuthStore();
  const menuItems: MenuItem[] = [
    {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Appearance",
      value: subscription,
      href: "/subscription",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
        label: "Playground",
        href: "/terms",
        icon: <FileText className="w-4 h-4" />,
        external: true,
    },
    {
        label: "Send Feedback",
        value: subscription,
        href: "/subscription",
        icon: <CreditCard className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt={name}
                className="rounded-full w-14 h-14 ring-4 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">{role}</p>
            </div>
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-4" />

          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                {item.external && <MoveUpRight className="w-4 h-4" />}
              </Link>
            ))}

            <button
              type="button"
              className="w-full flex items-center justify-between p-2 
                                hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                rounded-lg transition-colors duration-200"
              onClick={() => {
                logout(); //Call Zustand logout 
                window.location.href = "/login"; // Redirect to login
              }}
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
