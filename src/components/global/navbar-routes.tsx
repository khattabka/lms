"use client";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { Button, buttonVariants } from "../ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

const NavbarRoutes = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isTeacherPage = pathname?.startsWith("/dashboard/teacher");
  const isPlayerPage = pathname?.includes("/chapter");
  return (
    <div className="ml-auto flex gap-x-3 bg-white dark:bg-slate-900 p-4">
      {isTeacherPage || isPlayerPage ? (
        <Link
          className={buttonVariants({ variant: "ghost" })}
          href="/dashboard"
          onClick={() => router.push("/dashboard")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Exit
        </Link>
      ) : (
        <Link
          className={buttonVariants({ variant: "ghost" })}
          href="/dashboard/teacher/courses"
          onClick={() => router.push("/dashboard/teacher/courses")}
        >
          Teacher Mode
        </Link>
      )}
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default NavbarRoutes;
