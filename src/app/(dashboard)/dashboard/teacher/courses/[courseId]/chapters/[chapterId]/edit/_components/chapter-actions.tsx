"use client";
import { Chapter } from "@prisma/client";
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

interface ChapterActionsProps {
  courseId: string;
  chapter: Chapter;
  disabled: boolean;
  isPublished: boolean;
  isChapterComplete: boolean;
}

const ChapterActions = ({
  isPublished,
  courseId,
  chapter,
  disabled,
  isChapterComplete,
}: ChapterActionsProps) => {
  const router = useRouter();

  // * CHAPTER DELETE API MUTATION
  const utils = api.useUtils();
  const { mutate: deleteChapter, status: statusDelete } =
    api.course.deleteChapterById.useMutation({
      onSuccess: (data: Chapter) => {
        toast("Chapter deleted", {
          position: "top-center",
          icon: "👏",
        });

        utils.invalidate();
        router.push(`/dashboard/teacher/courses/${courseId}`);
      },
      onSettled: () => {
        utils.invalidate();
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          toast.error(`You don't have permission to edit this chapter`);
          return;
        }
        if (error.data?.code === "NOT_FOUND") {
          toast.error(`It appears that this chapter doesn't exist anymore`);
          return;
        }
        toast.error("Something went wrong");
      },
    });

  const handleChapterDelete = () => {
    deleteChapter({ chapterId: chapter.id, courseId: courseId });
  };

  // * CHAPTER PUBLISH UNPUBLISH API MUTATION
  const {
    mutate: publish,
    status: statusPublish,
    data,
  } = api.course.publishChapter.useMutation({
    onSuccess: () => {
      {
        chapter.isPublished
          ? toast.success("Chapter unPublished", {
              position: "top-center",
              icon: "👏",
            })
          : toast.success("Chapter Published", {
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
        toast.error(`You don't have permission to edit this chapter`);
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
      chapterId: chapter.id,
      courseId,
      isPublished,
    });
  };
  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={handlePublish}
        variant={chapter.isPublished ? 'destructive' : 'default'}
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
              This action cannot be undone. This will permanently delete this
              chapter and all of its content.
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

export default ChapterActions;
