"use client";
import { Chapter, Course } from "@prisma/client";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import toast from "react-hot-toast";

interface CourseActionsProps {
  courseId: string;
  course: Course;
  disabled: boolean;
  isPublished: boolean;
  isCourseComplete: boolean;
}

const CourseActions = ({
  isPublished,
  courseId,
  course,
  disabled,
  isCourseComplete,
}: CourseActionsProps) => {
  const router = useRouter();

  // * COURSE  DELETE API MUTATION
  const utils = api.useUtils();
  const { mutate: deleteCourse, status: statusDelete } =
    api.course.deleteCourseById.useMutation({
      onSuccess: (data) => {
        toast("Course deleted", {
          position: "top-center",
          icon: "👏",
        });

        utils.invalidate();
        router.push(`/dashboard/teacher/courses/`);
      },
      onSettled: () => {
        utils.invalidate();
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          toast.error(`You don't have permission to delete this course`);
          return;
        }
        if (error.data?.code === "NOT_FOUND") {
          toast.error(`It appears that this course doesn't exist anymore`);
          return;
        }
        toast.error("Something went wrong");
      },
    });

  const handleChapterDelete = () => {
    deleteCourse({
      courseId
    })
  };

  // * CHAPTER PUBLISH UNPUBLISH API MUTATION
  const {
    mutate: publish,
    status: statusPublish,
    data,
  } = api.course.publishCourse.useMutation({
    onSuccess: () => {
      {
        course.isPublished
          ? toast.success("Course Unpublished", {
              position: "top-center",
              icon: "👏",
            })
          : toast.success("Course Published", {
              position: "top-center",
              icon: "👏",
            });
      }

      utils.invalidate();
      router.refresh();
    },
    onSettled: () => {
      utils.invalidate();
      router.refresh();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error(`You don't have permission to edit this course`);
        return;
      }
      if (error.data?.code === "BAD_REQUEST") {
        toast.error(`You are missing required fields`);
        return;
      }
      toast.error("Something went wrong");
    },
  });
  const handlePublish = () => {
    publish({
      courseId,
      isPublished,
    });
  };
  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={handlePublish}
        variant={course.isPublished ? 'destructive' : 'default'}
        disabled={disabled || statusPublish === "pending"}
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            disabled={statusDelete === "pending"}
            variant={"ghost"}
            size={"icon"}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {!!isPublished ? (
                <div>
                  This action cannot be undone. This will permanently unpublish, delete this
                  course and all of its content.
                </div>
              )
              : (
<>

              This action cannot be undone. This will permanently delete this
              course and all of its content.
</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChapterDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CourseActions;
