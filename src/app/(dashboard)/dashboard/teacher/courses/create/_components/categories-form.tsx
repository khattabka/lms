"use client";

import * as z from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

import { Combobox } from "./combo-box";
import { api } from "~/trpc/react";





interface CategoryFormProps {
  course: Course;
  courseId: string;
  options: { label: string; value: string; }[];
};

const formSchema = z.object({
  categoryId: z.string().min(1),
});

export const CategoryForm = ({
  course,
  courseId,
  options,
}: CategoryFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEdit = () => setEditing((current) => !current);


  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: course?.categoryId || ""
    },
  });
// * FORM STATES
  const { isSubmitting, isValid } = form.formState;

  // * CATEGORY UPDATE API MUTATION
  const utils = api.useUtils();
  const {mutate, status} = api.course.setCategory.useMutation({
    onSuccess: (data: Course) => {
      toast(`Course category updated to ${data.categoryId}`, {
        position: "top-center",
        icon: "👏",
      });
      setEditing(false)
      utils.invalidate();
      router.refresh()
    },
    onSettled: () => {
      utils.invalidate();
    },
    onError: (error) => {
      if(error.data?.code === 'UNAUTHORIZED'){
        toast.error(`You don't have permission to edit this course`);
        return
      }
      if(error.data?.code === 'NOT_FOUND'){
        toast.error(`It appears that this course doesn't exist anymore`);
        return
      }
    //  Handle if errors are something else other than unauthorized and not found
     toast.error('Something went wrong');
    }
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
   console.log(values);

   mutate({
    id: courseId,
    categoryId: values.categoryId
   })
   
  }

  const selectedOption = options.find((option) => option.value === course.categoryId);

  return (
    <div className="mt-6 border bg-muted  py-6 px-1 rounded-md">
      <div className="font-medium flex items-center justify-between">
        Category
        <Button onClick={toggleEdit} variant="ghost">
          {editing ? (
            <><X className="h-4 w-4"/></>
          ) : (
            <>
              <Pencil className="h-4 w-4 " />
            </>
          )}
        </Button>
      </div>
      {!editing && (
        <p className={cn(
          " mt-2 text-sm text-muted-foreground",
          !course.categoryId && "text-muted-foreground "
        )}>
          {selectedOption?.label || "No category"}
        </p>
      )}
      {editing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox
                    // @ts-ignore
                    onChange={()=> {
                      console.log(field.value);
                    }}
                      options={...options}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting || status === 'pending' || status === 'error'}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}