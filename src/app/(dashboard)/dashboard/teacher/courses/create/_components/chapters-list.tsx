"use client";

import { Chapter } from "@prisma/client";
import { useEffect, useState } from "react";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { cn, truncateText } from "~/lib/utils";
import { Grip, Pencil } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
interface ChaptersListProps {
  items: Chapter[];
  onReorder: (
    updateData: {
      id: string;
      position: number;
    }[],
  ) => void;
  onEdit: (id: string, ) => void;
}

const ChaptersList = ({ items, onReorder, onEdit }: ChaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>(items);
  useEffect(() => {
    setChapters(items);
  }, [items]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(chapters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem!);
    
    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);
    const updatedChapters = items.slice(startIndex, endIndex + 1);
    setChapters(items);

    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }));
    onReorder(bulkUpdateData);
  };

  if (!isMounted) return null;
  return (
    <div>
      <DragDropContext
        onDragEnd={onDragEnd}
      >
        <Droppable direction="vertical" droppableId="chapters">
          {(provided) => (
            <div
              className="grid grid-cols-1 gap-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {chapters.map((chapter, index) => (
                <Draggable
                  key={chapter.id}
                  draggableId={chapter.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className={cn(
                        "mb-4 flex items-center gap-x-3 rounded-md border bg-muted text-sm",
                        chapter.isPublished &&
                          "border-sky-300 bg-sky-200 text-sky-700",
                      )}
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      <div
                        className={cn(
                          "rounded-l-md border-r px-2 py-3 transition hover:bg-muted",
                          chapter.isPublished &&
                            "border-r-sky-300 hover:bg-sky-200",
                        )}
                        {...provided.dragHandleProps}
                      >
                        <Grip className="h-4 w-4" />
                      </div>
                      <h2 className="text-sm">{truncateText( chapter.title, 25)}</h2>
                      <div className=" ml-auto justify-end flex">
                        {chapter.isPublished ? (
                          <Badge>Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                        {chapter.isFree ? (
                          <Badge  variant="outline" className="ml-2">
                            Free
                          </Badge>
                        ) : (
                          <Badge className="ml-2">Paid</Badge>
                        )
                      }
                        <Button variant={'ghost'} size={'icon'}  onClick={() => onEdit(chapter.id)} >

                        <Pencil className="m-2 h-4 w-4 "/>
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ChaptersList;
