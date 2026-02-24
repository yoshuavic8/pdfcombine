"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { FileItem } from "@/components/file-item";
import type { PdfFile } from "@/hooks/use-pdf-files";

interface FileListProps {
  files: PdfFile[];
  onRemove: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
  disabled?: boolean;
}

export function FileList({
  files,
  onRemove,
  onReorder,
  disabled,
}: FileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = files.findIndex((f) => f.id === active.id);
    const newIndex = files.findIndex((f) => f.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  }

  const totalPages = files.reduce((sum, f) => sum + f.page_count, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {files.length} {files.length === 1 ? "file" : "files"} &middot;{" "}
          {totalPages} {totalPages === 1 ? "page" : "pages"} total
        </p>
        {!disabled && (
          <p className="text-xs text-muted-foreground">
            Drag to reorder
          </p>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={files.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1.5">
            {files.map((file, index) => (
              <FileItem
                key={file.id}
                file={file}
                index={index}
                onRemove={onRemove}
                disabled={disabled}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
