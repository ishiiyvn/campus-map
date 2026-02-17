"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPlus } from "lucide-react";
import AddMapForm from "../forms/add-map-form";

export default function AddMapButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            Nuevo Mapa
            <MapPlus className="w-4 h-4 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Mapa</DialogTitle>
          </DialogHeader>
          <AddMapForm onSubmitCallback={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
