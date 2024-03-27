"use client";
import * as z from "zod";

import { useRouter } from "next/navigation";
import { Chapter, MuxData } from "@prisma/client";

import { Button } from "~/components/ui/button";
import { toast } from "react-hot-toast";

import { api } from "~/trpc/react";
import { Pencil, Plus, VideoIcon, X } from "lucide-react";
import { useState } from "react";

import Image from "next/image";
import { FileUpload } from "~/components/uploadthing/file-upload";
import MuxPlayer from "@mux/mux-player-react";

interface ChapterVideoFormProps {
  courseId: string;
  chapter: Chapter & {
    muxData?: MuxData | null;
  };
}

const formSchema = z.object({
  videoUrl: z.string({}).min(1, {
    message: "Video is required",
  }),
});

const ChapterVideoForm = ({ courseId, chapter }: ChapterVideoFormProps) => {
  const [editing, setEditing] = useState(false);
  const toggleEditing = () => {
    setEditing(!editing);
  };
  const router = useRouter();

  // *IMAGE UPLOAD API MUTATION
  const utils = api.useUtils();
  const { mutate } = api.course.addChapterVideoUrl.useMutation({
    onSuccess: (data) => {
      toast("Video uploaded successfully", {
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
      utils.invalidate();
      router.refresh()
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    mutate({
      chapterId: chapter.id,
      courseId: courseId,
      videoUrl: values.videoUrl,
    });
  };
  return (
    <div className="mt-6 rounded-md border  bg-muted px-1 py-6">
      <div className="flex items-center justify-between font-medium">
        Chapter Video
        <Button variant={"ghost"} onClick={toggleEditing}>
          {editing && (
            <X
              className="h-4 w-4"
              onClick={() => {
                toggleEditing();
              }}
            />
          )}
          {!editing && !!chapter?.videoUrl && (
            <>
              <Pencil className="h-4 w-4" />
            </>
          )}
          {!editing && !chapter?.videoUrl && <Plus className="h-5 w-5" />}
        </Button>
      </div>

      {!editing &&
        (!chapter?.videoUrl ? (
          <div className="flex h-40 w-full flex-col items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900">
            <VideoIcon className="h-12 w-12 text-purple-500 dark:text-purple-300" />
            <p className="text-sm text-muted-foreground">No video</p>
          </div>
        ) : (
          <div className="mt-2 flex  aspect-video h-full w-full ">
            <MuxPlayer
              src={chapter.videoUrl}
              playbackId={chapter.muxData?.playbackId!}
              accent-color="limegreen"
              primary-color="yellow"
              secondary-color="#242628"
              thumbnail-time="10"
              forward-seek-offset="5"
              backward-seek-offset="5"
              metadata={{
                video_title: `${chapter.title}`,
              }}
            />
          </div>
        ))}

      {editing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(res) => {
              console.log(res);
              if (res) {
                onSubmit({
                  videoUrl: res?.[0]?.url,
                });
              }
            }}
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-center text-sm text-muted-foreground">
              Please be patient and wait for the video to upload.
            </p>
            <span className="text-xs text-muted-foreground">Max 512GB</span>
          </div>
        </div>
      )}

      {chapter.videoUrl && !editing && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Videos can take a few minutes to upload. Refresh the page if video is
          not showing.
        </div>
      )}
    </div>
  );
};

export default ChapterVideoForm;
