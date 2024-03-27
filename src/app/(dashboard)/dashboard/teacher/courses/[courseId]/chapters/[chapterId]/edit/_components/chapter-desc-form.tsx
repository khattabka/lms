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
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { toast } from "react-hot-toast";
import { api } from "~/trpc/react";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";
import TextEditor from "./text-editor";
import TextPreview from "./text-preview";

interface ChapterDescFormProps {
  courseId: string;
  chapter: Chapter;
}

const formSchema = z.object({
  description: z
    .string()
    .min(20, {
      message: "Chapter Description is required",
    })
    .max(500, {
      message: "Chapter Description must be less than 500 characters",
    }),
});

const ChapterDescForm = ({ courseId, chapter }: ChapterDescFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: chapter?.description || "",
    },
  });
  // * FORM STATES
  const { isSubmitting, isValid } = form.formState;

  // * TITLE CHNAGE API MUTATION
  const utils = api.useUtils();
  const { mutate, status } = api.course.editChapterDescription.useMutation({
    onSuccess: (data: Chapter) => {
      toast("Chapter description updated", {
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
      description: values.description,
      courseId,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Chapter Description
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
        <div
          className={cn(
            "mt-2 ",
            !chapter?.description && "line-clamp-3 text-center italic",
          )}
        >
          {!chapter?.description && "No description yet"}
          {chapter?.description && <TextPreview value={chapter?.description} />}
        </div>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <TextEditor
                        disabled={isSubmitting || status === "pending"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Description of the chapter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-x-2">
                <Button
                  disabled={!isValid || isSubmitting || status === "pending"}
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

export default ChapterDescForm;
