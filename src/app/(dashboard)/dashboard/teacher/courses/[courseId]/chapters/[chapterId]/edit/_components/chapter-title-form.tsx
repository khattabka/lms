"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Chapter, Course } from "@prisma/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";
import { Check, Pencil, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

interface ChapterTitleFormProps {
  courseId: string;
  chapter: Chapter;
}

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Chapter Title is required",
    })
    .max(100, {
      message: "Chapter Title must be less than 100 characters",
    }),
});

const ChapterTitleForm = ({ courseId, chapter }: ChapterTitleFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: chapter?.title || "",
    },
  });
  // * FORM STATES
  const { isLoading, isSubmitting, isValidating, isValid } = form.formState;

  // * TITLE CHNAGE API MUTATION
  const utils = api.useUtils();
  const { mutate, status } = api.course.editChapterTitle.useMutation({
    onSuccess: (data: Chapter) => {
      toast("Chapter title updated", {
        position: "top-center",
        icon: "👏",
      });

      setEditing(false);
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
    mutate({
      chapterId: chapter.id,
      title: values.title,
      courseId,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Chapter Title
        <Button variant={"ghost"} onClick={toggleEditing}>
          {editing && <X className="h-4 w-4" onClick={toggleEditing} />}
          {!editing && (
            <>
              <Pencil className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {!editing && (
        <p
          className={cn(
            "mt-2 text-sm text-muted-foreground",
            !chapter?.title && "line-clamp-3 text-center italic",
          )}
        >
          {chapter?.title}
        </p>
      )}
      {editing && (
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
                    {/* <FormLabel>Title</FormLabel> */}
                    <FormControl>
                      <Input
                        disabled={isSubmitting || status === "pending"}
                        placeholder={chapter?.title}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Title of the chapter</FormDescription>
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
                  Change
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default ChapterTitleForm;
