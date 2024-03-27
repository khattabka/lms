"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Attachment, Chapter, Course } from "@prisma/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "react-hot-toast";

import { api } from "~/trpc/react";
import { Loader, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import ChaptersList from "./chapters-list";

interface ChaptersFormProps {
  courseId: string;
  course: Course & {
    chapters: Chapter[];
    attachments: Attachment[];
  };
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
});

const ChaptersForm = ({ courseId, course }: ChaptersFormProps) => {
  const [creating, setCreating] = useState(false);

  //   * UPDATING VALUES AFTER DRAG AND DROP
  const [updating, setUpdating] = useState(false);

  const toggleCreating = () => {
    setCreating(!creating);
  };
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  // * FORM STATES
  const { isLoading, isSubmitting, isValidating, isValid } = form.formState;

  // * CHAPTER TITLE CHNAGE API MUTATION
  const utils = api.useUtils();
  const { mutate, status } = api.course.createChapterTitle.useMutation({
    onSuccess: (data: Chapter) => {
      toast("Chapter created", {
        position: "top-center",
        icon: "👏",
      });

      toggleCreating();
      utils.invalidate();
      router.refresh();
    },
    onSettled: () => {
      utils.invalidate();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error(`You don't have permission to edit this course`);
        return;
      }
      if (error.data?.code === "NOT_FOUND") {
        toast.error(`It appears that this course doesn't exist anymore`);
        return;
      }
      //  Handle if errors are something else other than unauthorized and not found
      toast.error("Something went wrong");
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);

    mutate({
      courseId,
      title: values.title,
    });
  };

  //   * REORDERING CHAPTER API MUTATION
  const { mutate: reorder, status: reorderStatus } =
    api.course.updateChaptersAfterReorder.useMutation({
      onSuccess: (data: any) => {
        toast("Chapter reordered", {
          position: "top-center",
          icon: "👏",
          duration: 1000,
        });

        setUpdating(false);
        utils.invalidate();
        router.refresh();
      },
      onSettled: () => {
        utils.invalidate();
      },
      onError: (error) => {
        if (error.data?.code === "FORBIDDEN") {
          toast.error(`You don't have permission to edit this course`);
          return;
        }
        if (error.data?.code === "NOT_FOUND") {
          toast.error(`It appears that this course doesn't exist anymore`);
          return;
        }
        //  Handle if errors are something else other than unauthorized and not found
        toast.error("Something went wrong");
      },
    });
  const onReorder = (updateData: { id: string; position: number }[]) => {
    setUpdating(true);
    reorder({ courseId, chapterList: updateData });
  };


//   * ON CHAPTER TITLE EDIT API MUTATION

const {mutate:updateChapterTitle, status:updateChapterTitleStatus} = api.course.editChapterTitle.useMutation({
  onSuccess: (data: Chapter) => {
    toast("Chapter title updated", {
      position: "top-center",
      icon: "👏",
    });
    utils.invalidate();
    router.refresh();
  },
  onSettled: () => {
    utils.invalidate();
  },
  onError: (error) => {
    if (error.data?.code === "UNAUTHORIZED") {
      toast.error(`You don't have permission to edit this course`);
      return;
    }
    if (error.data?.code === "NOT_FOUND") {
      toast.error(`It appears that this course doesn't exist anymore`);
      return;
    }
    //  Handle if errors are something else other than unauthorized and not found
    toast.error("Something went wrong");
  },
})
  const onChapterTitleEdit = (chapterId: string) => {
    router.push(`/dashboard/teacher/courses/${courseId}/chapters/${chapterId}/edit`)
    router.refresh()
  }
  return (
    <div className="relative mt-6 rounded-md border  bg-muted px-1 py-6">
      {reorderStatus === "pending" && (
        <div
          className="absolute right-0 top-0
        flex h-full w-full items-center justify-center rounded-md bg-purple-300/50
        "
        >
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Chapters
        <Button variant={"ghost"} onClick={toggleCreating}>
          {creating && <X className="h-4 w-4" onClick={toggleCreating} />}
          {!creating && (
            <>
              <Plus className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {!creating && (
        <div
          className={cn(
            "mb-3  mt-2  px-1",
            !course.chapters.length && "italic text-muted-foreground",
          )}
        >
          {course?.chapters.length === 0 && "No chapters yet"}
          {course?.chapters.length > 0 && (
            <ChaptersList
              onEdit={onChapterTitleEdit}
              onReorder={onReorder}
              items={course.chapters || []}
            />
          )}
        </div>
      )}
      {!creating && (
        <p className=" mb-3 text-sm text-muted-foreground">
          {" "}
          Drag and drop chapters in the correct order
        </p>
      )}
      {creating && (
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-8"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Description</FormLabel> */}
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder={
                          course?.chapters[0]?.title ||
                          "e.g Introduction to Programming"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Min 1 character</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Button
                  disabled={
                    !isValid ||
                    isSubmitting ||
                    status === "pending" ||
                    status === "error"
                  }
                  type="submit"
                >
                  Create
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default ChaptersForm;
