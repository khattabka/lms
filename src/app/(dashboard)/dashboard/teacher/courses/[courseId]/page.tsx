import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
} from "lucide-react";
import TitleForm from "~/app/(dashboard)/dashboard/teacher/courses/create/_components/title-form";

import DescriptionForm from "../create/_components/desc-form";
import { api } from "~/trpc/server";
import ImageForm from "../create/_components/image-form";
import { CategoryForm } from "../create/_components/categories-form";
import PriceForm from "../create/_components/price-form";
import Attachments from "../create/_components/attachments-form";
import { db } from "~/server/db";
import ChaptersForm from "../create/_components/chapters-form";
import AlertBanner from "./chapters/[chapterId]/edit/_components/alert-banner";
import CourseActions from "./_components/course-actions";
import { Progress } from "~/components/ui/progress";

const Page = async ({ params }: any) => {
  const { courseId } = params;
  const course = await api.course.getCourseById(courseId);
  const categories = await api.course.getCategories();

  if (!course) {
    return (
      <div className="text-clip p-6 text-center text-muted-foreground">
        Course not found
      </div>
    );
  }

  const requiredFields = [
    course?.title,
    course?.description,
    course?.imageUrl,
    course?.price,
    course?.categoryId,
    course?.chapters.some((chapter) => chapter.isPublished),
  ];
  const total = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionPercentage = Math.floor((completedFields / total) * 100);
  const completionText = `${completedFields}/${total} fields completed (${completionPercentage}%)`;
  
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished ? (
        <AlertBanner
          label="This course is not published yet"
          variant="warning"
        />
      ) : (
        <AlertBanner
        label="This course is published and visible to students"
        variant={'success'}
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-3xl font-medium">
              Course Setup For {course?.title}
            </h1>

            {!course.isPublished ? (
              <div>
                <span className="text-sm text-muted-foreground">
                  {completionText}
                </span>
                <Progress value={completionPercentage} />
              </div>
            ) : (
              ""
            )}
          </div>

          <div>
            <CourseActions
              courseId={courseId}
              course={course}
              disabled={!isComplete}
              isCourseComplete={isComplete}
              isPublished={course.isPublished}
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/*//* COLUMN 1 COURSE DETAILS */}
          <div>
            <div className="justify-left flex items-center gap-x-2">
              <LayoutDashboard size={24} className="text-purple-700" />
              <h2 className="text-xl font-medium">Customize Course Details</h2>
            </div>
            <TitleForm course={course!} courseId={courseId} />
            <DescriptionForm course={course!} courseId={courseId} />
            <ImageForm course={course!} courseId={courseId} />
            <CategoryForm
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              course={course!}
              courseId={courseId}
            />
          </div>
          {/*//* COLUMN 2  */}

          <div className="space-y-6">
            {/*//* COURSE CHAPTERS  */}
            <div>
              <div className="justify-left flex items-center gap-x-2">
                <ListChecks size={24} className="text-purple-700" />
                <h2 className="text-xl font-medium">Course Chapters</h2>
              </div>
              <div>
                <ChaptersForm course={course} courseId={courseId} />
              </div>
            </div>

            {/*//* COURSE PRICE  */}

            <div className=" flex items-center gap-x-2">
              <CircleDollarSign size={24} className="text-purple-700" />
              <h2 className="text-xl font-medium">Pricing</h2>
            </div>
            <PriceForm course={course!} courseId={courseId} />
            <div>
              {/*//* COURSE ATTACHMENTS */}

              <div className="justify-left flex  items-center gap-x-2">
                <File size={24} className="text-purple-700" />
                <h2 className="text-xl font-medium">Course Attachments</h2>
              </div>
              <Attachments courseId={courseId} course={course!} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
