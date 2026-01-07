"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CirclePlus } from 'lucide-react';
import AreaForm from './area-form';



export default function AddAreaButton() {
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
            <AreaForm onSubmitCallback={() => { setIsOpen(false) }} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
