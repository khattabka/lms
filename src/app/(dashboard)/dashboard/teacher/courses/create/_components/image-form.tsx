"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";

import { Button } from "~/components/ui/button";
import { toast } from "react-hot-toast";

import { api } from "~/trpc/react";
import { ImageIcon, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";

import Image from "next/image";
import { FileUpload } from "~/components/uploadthing/file-upload";

interface ImageFormProps {
  courseId: string;
  course: Course;
}

const formSchema = z.object({
  imageUrl: z.string({}).min(1, {
    message: "Image is required",
  }),
});

const ImageForm = ({ courseId, course }: ImageFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: course?.imageUrl || "",
    },
  });

  // *IMAGE UPLOAD API MUTATION
  const utils = api.useUtils();
  const { mutate } = api.course.uploadCourseImage.useMutation({
    onSuccess: (data: Course) => {
      toast("Course image uploaded successfully", {
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
    console.log(values);

    mutate({
      id: courseId,
      imageUrl: values.imageUrl,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Cover Image
        <Button variant={"ghost"} onClick={toggleEditing}>
          {editing && (
            <X
              className="h-4 w-4"
              onClick={() => {
                toggleEditing();
              }}
            />
          )}
          {!editing && !!course?.imageUrl && (
            <>
              <Pencil className="h-4 w-4" />
            </>
          )}
          {!editing && !course?.imageUrl && <Plus className="h-5 w-5" />}
        </Button>
      </div>

      {!editing &&
        (!course?.imageUrl ? (
          <div className="flex h-40 w-full flex-col items-center justify-center rounded-md bg-purple-100">
            <ImageIcon className="h-12 w-12 text-purple-500" />
            <p className="text-sm text-muted-foreground">No image set</p>
          </div>
        ) : ( 
          <div className="mt-2 w-full  h-full flex items-center justify-center">
            <Image
              width={100}
              height={100}
              className="rounded-md object-cover h-full w-full"
              src={course?.imageUrl || ""}
              alt={""}
            />
          </div>
        ))}

      {editing && (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(res) => {
              console.log(res);
              if (res) {
                onSubmit({
                  imageUrl: res?.[0]?.url,
                });
              }
            }}
          />

          <p className="text-center text-sm text-muted-foreground">
            16:9 aspect ratio recommended
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageForm;
