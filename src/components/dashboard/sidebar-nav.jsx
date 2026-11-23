"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  Library,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/teacher-applications", label: "Pengajuan Teacher", icon: UserCheck, badgeKey: "pendingApplications" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/categories", label: "Kategori", icon: FolderTree },
    { href: "/admin/certificates", label: "Sertifikat", icon: Award },
  ],
  teacher: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/teacher/courses", label: "Course Saya", icon: BookOpen },
    { href: "/teacher/students", label: "Progress Student", icon: GraduationCap },
  ],
  student: [
    { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/student/courses", label: "Kelas Saya", icon: BookOpen },
    { href: "/student/certificates", label: "Sertifikat", icon: Award },
  ],
};

const TEACHER_LEARNING_ITEMS = [
  { href: "/student/courses", label: "Kelas Saya", icon: Library },
  { href: "/student/certificates", label: "Sertifikat", icon: Award },
];

export function SidebarNav({ role, badges = {}, showLearning = false, onNavigate }) {
  const pathname = usePathname();
  const items = [
    ...(NAV_ITEMS[role] ?? []),
    ...(role === "teacher" && showLearning ? TEACHER_LEARNING_ITEMS : []),
    { href: "/notifications", label: "Notifikasi", icon: Bell, exact: true, badgeKey: "unreadNotifications" },
    { href: "/profile", label: "Profil", icon: UserRound, exact: true },
  ];

  return (
    <nav aria-label="Menu dashboard" className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon, exact, badgeKey }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        const badge = badgeKey ? badges[badgeKey] : 0;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/8 hover:text-white",
              active && "bg-white text-ink hover:bg-white hover:text-ink",
            )}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className={cn("rounded-full px-2 py-0.5 text-[0.7rem] font-semibold", active ? "bg-ink text-white" : "bg-white text-ink")}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
