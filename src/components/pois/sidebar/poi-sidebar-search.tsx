"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Level } from "@/server/db/schema";
import { LevelSelector } from "@/components/pois/level-selector";

interface PoiSidebarSearchProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  levels: Level[];
  selectedLevelId: number | null;
  onSelectLevel: (levelId: number | null) => void;
}

export function PoiSidebarSearch({
  searchQuery,
  onSearch,
  levels,
  selectedLevelId,
  onSelectLevel,
}: PoiSidebarSearchProps) {
  return (
    <div className="p-2 border-b space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search POIs..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      <LevelSelector
        levels={levels}
        selectedLevelId={selectedLevelId}
        onSelectLevel={onSelectLevel}
      />
    </div>
  );
}
