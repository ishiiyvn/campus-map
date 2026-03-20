"use client";

import { useState, useEffect, useTransition } from "react";
import { Level } from "@/server/db/schema";
import {
  getLevelsByArea,
  createLevel,
  updateLevel,
  deleteLevel,
  reorderLevels,
} from "@/server/actions/levels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LevelItemProps {
  level: Level;
  onUpdate: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}

function SortableLevelItem({ level, onUpdate, onDelete }: LevelItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(level.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: level.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editName.trim() && editName !== level.name) {
      onUpdate(level.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(level.name);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md border bg-background",
        isDragging && "opacity-50 shadow-md"
      )}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {isEditing ? (
        <>
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="h-7 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
          />
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-7 px-2">
            <Check className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 px-2">
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm">{level.name}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-7 px-2"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(level.id)}
            className="h-7 px-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

interface LevelManagementProps {
  areaId: number;
  className?: string;
}

export function LevelManagement({ areaId, className }: LevelManagementProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [newLevelName, setNewLevelName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadLevels();
  }, [areaId]);

  async function loadLevels() {
    try {
      setIsLoading(true);
      const data = await getLevelsByArea(areaId);
      setLevels(data);
    } catch (error) {
      console.error("Error loading levels:", error);
      toast.error("Failed to load levels");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddLevel() {
    if (!newLevelName.trim()) return;

    startTransition(async () => {
      try {
        const newLevel = await createLevel({
          area_id: areaId,
          name: newLevelName.trim(),
          display_order: levels.length,
        });
        setLevels([...levels, newLevel]);
        setNewLevelName("");
        setIsAdding(false);
        toast.success("Level added");
      } catch (error) {
        console.error("Error adding level:", error);
        toast.error("Failed to add level");
      }
    });
  }

  async function handleUpdateLevel(id: number, name: string) {
    startTransition(async () => {
      try {
        await updateLevel(id, { area_id: areaId, name });
        setLevels(levels.map((l) => (l.id === id ? { ...l, name } : l)));
        toast.success("Level updated");
      } catch (error) {
        console.error("Error updating level:", error);
        toast.error("Failed to update level");
      }
    });
  }

  async function handleDeleteLevel(id: number) {
    if (!confirm("Delete this level?")) return;

    startTransition(async () => {
      try {
        await deleteLevel(id);
        setLevels(levels.filter((l) => l.id !== id));
        toast.success("Level deleted");
      } catch (error) {
        console.error("Error deleting level:", error);
        toast.error("Failed to delete level");
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = levels.findIndex((i) => i.id === active.id);
      const newIndex = levels.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(levels, oldIndex, newIndex);

      setLevels(newItems);

      startTransition(async () => {
        try {
          await reorderLevels(areaId, newItems.map((l) => l.id));
        } catch (error) {
          console.error("Error reordering levels:", error);
          toast.error("Failed to save order");
        }
      });
    }
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading levels...</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Levels</h3>
        {!isAdding && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdding(true)}
            className="h-7"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex items-center gap-2">
          <Input
            value={newLevelName}
            onChange={(e) => setNewLevelName(e.target.value)}
            placeholder="Level name (e.g., Ground, Floor 1)"
            className="h-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddLevel();
              if (e.key === "Escape") {
                setIsAdding(false);
                setNewLevelName("");
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={handleAddLevel} disabled={isPending} className="h-8">
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAdding(false);
              setNewLevelName("");
            }}
            className="h-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {levels.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={levels.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {levels.map((level) => (
                <SortableLevelItem
                  key={level.id}
                  level={level}
                  onUpdate={handleUpdateLevel}
                  onDelete={handleDeleteLevel}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        !isAdding && (
          <p className="text-sm text-muted-foreground">No levels defined yet.</p>
        )
      )}
    </div>
  );
}
