import Link from "next/link";
import React from "react";
import { buttonVariants } from "~/components/ui/button";


const CoursesPage = async () => {
 
  return (
    <div>
      <Link
        href={"/dashboard/teacher/courses/create"}
        className={buttonVariants({ variant: "default" })}
      >
        Create Course
      </Link>
    </div>
  );
};

export default CoursesPage;
