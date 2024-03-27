"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
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
import { db } from "~/server/db";
import { useUser } from "@clerk/nextjs";

const formSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Title is required",
    })
    .max(100, {
      message: "Title must be less than 100 characters",
    }),
});

const CreateCoursePage = () => {

  const user = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });
  //* FORM STATES
  const { isLoading, isSubmitting, isValidating, isValid } = form.formState;

  //* COURSE CREATION API MUTATION
  const { data: course, mutate, status } = api.course.createCourse.useMutation({

    onSuccess: (data: Course) => {
      console.log(data);
     

      router.push(`/dashboard/teacher/courses/${data?.id}`);
      toast("Course created", {
        position: "top-center",
        icon: "👏",
      });

      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message);
      console.log(error.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate({
      title: values.title,
    });
  };

  const { data: courses } = api.course.getAllCourses.useQuery();

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col p-6 md:items-center md:justify-center">
      <div>
        <h1 className="text-3xl font-bold">Name your course</h1>
        <p className="w-fit text-sm text-muted-foreground">
          Create a title that describes your course.{" "}
          <span className="font-semibold">You can always change it later</span>
        </p>
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="Title"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Title of the course</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading || isSubmitting || !isValid || isValidating || status === "pending"}
                type="submit"
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </div>
      {courses?.length === 0 && (
        <div>
          No Courses
        </div>
      )}
      {courses && <pre>{JSON.stringify(courses, null, 2)}</pre>}
      {!user && <div>Not signed in</div>}
      {user.user?.id}
    </div>
  );
};

export default CreateCoursePage;
