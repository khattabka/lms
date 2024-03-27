"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Course, Attachment } from "@prisma/client";

import { Button } from "~/components/ui/button";
import { toast } from "react-hot-toast";

import { api } from "~/trpc/react";
import { ImageIcon, Pencil, Plus, X, File, Trash, Loader } from "lucide-react";
import { useState } from "react";

import Image from "next/image";
import { FileUpload } from "~/components/uploadthing/file-upload";
import Link from "next/link";
import { truncateText } from "~/lib/utils";

interface AttachmentsProps {
  courseId: string;
  course: Course & {
    attachments: Attachment[];
  };
}

const formSchema = z.object({
  attachmentUrl: z.string().min(1),
  attachmentType: z.string().min(1),
  attachmentName: z.string().min(1),
});

const Attachments = ({ courseId, course }: AttachmentsProps) => {
  const [editing, setEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  // *ATTACHMENT UPLOAD API MUTATION
  const utils = api.useUtils();
  const { mutate, status } = api.course.uploadCourseAttachment.useMutation({
    onSuccess: (data: Attachment) => {
      toast("Course attachment uploaded successfully", {
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

  // * ATTACHMENT DELETE API MUTATION
  const { mutate: deleteAttachment } =
    api.course.deleteSingleAttachment.useMutation({
      onSuccess: (data: Attachment) => {
        toast(`${data.name} deleted`, {
          position: "top-center",
          icon: "👏",
        });

        setDeletingId(null);
        utils.invalidate();
        router.refresh();
      },
      onSettled: () => {
        utils.invalidate();
        setDeletingId(null);
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
      attachmentUrl: values.attachmentUrl,
      attachmentType: values.attachmentType,
      attachmentName: values.attachmentName,
      courseId: courseId,
    });
  };

  const handleSingleDelete = (id: string) => {
    setDeletingId(id);

    deleteAttachment({
      attachmentId: id,
      courseId: courseId,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Attachments & Resources
        <Button variant={"ghost"} onClick={toggleEditing}>
          {editing && (
            <X
              className="h-4 w-4"
              onClick={() => {
                toggleEditing();
              }}
            />
          )}
          {!editing && (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Add a file
            </>
          )}
        </Button>
      </div>

      {!editing &&
        (course?.attachments.length === 0 ? (
          <div className="flex h-40 w-full flex-col items-center justify-center rounded-md bg-purple-100">
            <p className="text-sm text-muted-foreground">Add an attachment</p>
          </div>
        ) : (
          <div className="justify-left flex flex-col-reverse items-center space-y-2 ">
            {course?.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="items-left flex w-full flex-col rounded-md border bg-muted p-3 px-2 py-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <Link
                      target="_blank"
                      className="ml-2 line-clamp-1 underline"
                      href={attachment.url}
                    >
                      {truncateText(attachment.name, 15)}
                    </Link>
                  </div>
                  {deletingId === attachment.id && (
                    <Loader className="mr-3 h-4 w-4 animate-spin cursor-pointer" />
                  )}
                  {deletingId !== attachment.id && (
                    <Button
                      onClick={() => handleSingleDelete(attachment.id)}
                      variant={"ghost"}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <span className="text-sm">{attachment.type}</span>
              </div>
            ))}
          </div>
        ))}

      {editing && (
        <div>
          <FileUpload
            endpoint="courseAttachments"
            onChange={(res) => {
              console.log(res);
              if (res) {
                onSubmit({
                  attachmentUrl: res[0].url,
                  attachmentType: res[0].type,
                  attachmentName: res[0].name,
                });
              }
            }}
          />

          <p className="text-center text-sm text-muted-foreground">
            Add audio, pdf , image or any video file you want
          </p>
        </div>
      )}
    </div>
  );
};

export default Attachments;
// {
//   name:
//     'Deeply hydrates the skin, leaving it plump, supple, and glowing.(1).png',
//   size: 457446,
//   type: 'image/png',
//   key: '4b070609-9789-4c60-a26c-199cb609361a-b0x0d.(1).png',
//   url: 'https://utfs.io/f/4b070609-9789-4c60-a26c-199cb609361a-b0x0d.(1).png',
//   serverData: { uploadedBy: 'user_2dzhTNaEof6AhnaUDu0N9jyaQ7k' },
//   customId: null
// }
