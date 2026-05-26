import Link from "next/link";
import { BarChart3, PlusCircle, Users } from "lucide-react";

interface QuickActionsProps {
  viewAllHref?: string;
  createNewHref?: string;
  viewAnalyticsHref?: string;
}

export function QuickActions({
  viewAllHref = "/admin/publishers",
  createNewHref = "/admin/publishers?action=create",
  viewAnalyticsHref = "/admin/analytics",
}: QuickActionsProps) {
  const actions = [
    { href: viewAllHref, label: "View All Publishers", icon: Users },
    { href: createNewHref, label: "Create Publisher (Manual)", icon: PlusCircle },
    { href: viewAnalyticsHref, label: "View Analytics", icon: BarChart3 },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-white/5 bg-bg-elevated p-4 transition-colors hover:border-primary/40 hover:bg-bg-muted"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-medium text-white">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
