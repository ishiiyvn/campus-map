"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import EditMapForm from "../forms/edit-map-form";
import { Map } from "@/server/db/schema";

interface EditMapButtonProps {
  map: Map;
}

export default function EditMapButton({ map }: EditMapButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Pencil className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Mapa</DialogTitle>
          </DialogHeader>
          <EditMapForm map={map} onSubmitCallback={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
