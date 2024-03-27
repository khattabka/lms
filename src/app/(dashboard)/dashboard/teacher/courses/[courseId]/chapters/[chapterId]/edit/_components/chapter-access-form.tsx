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
import { Checkbox } from "~/components/ui/checkbox";

interface ChapterAccessFormProps {
  courseId: string;
  chapter: Chapter;
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

const ChapterAccessForm = ({ courseId, chapter }: ChapterAccessFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!chapter?.isFree || false,
    },
  });
  // * FORM STATES
  const { isLoading, isSubmitting, isValidating, isValid } = form.formState;

  // * TITLE CHNAGE API MUTATION
  const utils = api.useUtils();
  const { mutate, status } = api.course.editChapterStatus.useMutation({
    onSuccess: (data: Chapter) => {
      if (data.isFree) {
        toast("Chapter is now free", {
          position: "top-center",
          icon: "🚀",
        });
      } else {
        toast("Chapter is now paid", {
          position: "top-center",
          icon: "$",
        });
      }

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
      status: values.isFree,
      courseId,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Chapter Access
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
            !chapter?.isFree && "line-clamp-3 text-center italic",
          )}
        >
          {chapter?.isFree ? "This chapter is Free" : "This chapter is paid"}
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
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-1 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormDescription>
                        {chapter?.isFree === true
                          ? "Uncheck to make chapter paid"
                          : "Check to make chapter free"}
                      </FormDescription>
                    </div>
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

export default ChapterAccessForm;
