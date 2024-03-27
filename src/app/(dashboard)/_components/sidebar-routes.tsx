"use client";
import { BarChart, Compass, Layout, List } from "lucide-react";
import SidebarItem from "./sidebar-item";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "~/components/global/mode-toggle";

const studentRoutes = [
  {
    icon: Layout,
    label: "Dashboard",
    href: "/dashboard",
  },

  {
    icon: Compass,
    label: "Browse",
    href: "/dashboard/search",
  },
];
const teacherRoutes = [
  {
    icon: List,
    label: "Courses",
    href: "/dashboard/teacher/courses",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/dashboard/teacher/analytics",
  },
];
const SidebarRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();
  const routes = studentRoutes;

  const isTeacher = pathname?.includes("teacher");


  return (
    <>
      {/* //* TEACHER ROUTES */}
      {isTeacher ? (
        <div className=" flex w-full flex-col gap-y-3">
          {teacherRoutes.map((route) => (
            <SidebarItem
              key={route.label}
              icon={route.icon}
              label={route.label}
              href={route.href}
            />
          ))}
          <ModeToggle/>
        </div>
      ) : (
        <div className=" flex w-full flex-col gap-y-3">
          {/* //* STUDENT ROUTES */}
          {routes.map((route) => (
            <SidebarItem
              key={route.label}
              icon={route.icon}
              label={route.label}
              href={route.href}
            />
          ))}
          <ModeToggle/>
        </div>
      )}
    </>
  );
};

export default SidebarRoutes;
