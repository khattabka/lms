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
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "react-hot-toast";

import { api } from "~/trpc/react";
import { Pencil, X } from "lucide-react";
import { useState } from "react";
import { cn, formatPrice } from "~/lib/utils";
import { Input } from "~/components/ui/input";

interface PriceFormProps {
  courseId: string;
  course: Course;
}

const formSchema = z.object({
  price: z.coerce.number({ invalid_type_error: "Price is required" }),
});

const PriceForm = ({ courseId, course }: PriceFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: course?.price || undefined,
    },
  });
  // * FORM STATES
  const { isLoading, isSubmitting, isValidating, isValid } = form.formState;

  // * PRICE CHANGE API MUTATION
  const utils = api.useUtils();
  const { mutate, status } = api.course.setCoursePrice.useMutation({
    onSuccess: (data: Course) => {
      toast("Course price updated", {
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
      id: courseId,
      price: values.price,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Price
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
            !course?.price && "line-clamp-3 text-center italic",
          )}
        >
          {formatPrice(course?.price) || "No price set"}
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Description</FormLabel> */}
                    <FormControl>
                      <Input
                        type="number"
                        step={0.01}
                        disabled={isSubmitting}
                        placeholder={"Set price for your course"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Min 20 characters</FormDescription>
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
        </div>
      )}
    </div>
  );
};

export default PriceForm;
