"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CirclePlus } from 'lucide-react';
import AddAreaForm from './add-area-form';

interface AddAreaButtonProps {
  mapId: number;
  polygonCoordinates?: { x: number; y: number }[];
}

export default function AddAreaButton({ mapId, polygonCoordinates }: AddAreaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex justify-end">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Añadir área<CirclePlus className="w-4 h-4" /></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='h-8'>Nueva área</DialogTitle>
            <AddAreaForm 
              mapId={mapId} 
              polygonCoordinates={polygonCoordinates}
              onSuccess={() => setIsOpen(false)} 
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
