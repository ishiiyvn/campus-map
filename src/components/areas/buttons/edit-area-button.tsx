"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import EditAreaForm from './edit-area-form';
import { Area } from '@/server/db/schema';

interface EditAreaButtonProps {
    area: Area;
}

export default function EditAreaButton({ area }: EditAreaButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='h-8'>Editar área</DialogTitle>
                    <EditAreaForm area={area} onSuccess={() => setIsOpen(false)} />
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
