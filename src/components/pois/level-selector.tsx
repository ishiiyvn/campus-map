"use client";

import { Level } from "@/server/db/schema";
import { Button } from "@/components/ui/button";
import { Layers, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface LevelSelectorProps {
  levels: Level[];
  selectedLevelId: number | null;
  onSelectLevel: (levelId: number | null) => void;
}

export function LevelSelector({
  levels,
  selectedLevelId,
  onSelectLevel,
}: LevelSelectorProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (levels.length === 0) return null;

  const selectedLevel = levels.find((l) => l.id === selectedLevelId);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "gap-2",
          selectedLevelId !== null && "bg-accent"
        )}
        onClick={() => setOpen(!open)}
      >
        <Layers className="h-4 w-4" />
        {selectedLevelId === null ? (
          "All Levels"
        ) : (
          selectedLevel?.name || "Level"
        )}
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-background border rounded-md shadow-lg p-1">
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent",
              selectedLevelId === null && "bg-accent"
            )}
            onClick={() => {
              onSelectLevel(null);
              setOpen(false);
            }}
          >
            <Layers className="h-4 w-4" />
            <span className="flex-1 text-left">All Levels</span>
            {selectedLevelId === null && <Check className="h-4 w-4" />}
          </button>
          {levels.map((level) => (
            <button
              key={level.id}
              type="button"
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent",
                selectedLevelId === level.id && "bg-accent"
              )}
              onClick={() => {
                onSelectLevel(level.id);
                setOpen(false);
              }}
            >
              <span className="flex-1 text-left">{level.name}</span>
              {selectedLevelId === level.id && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
