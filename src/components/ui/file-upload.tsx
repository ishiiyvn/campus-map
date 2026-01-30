"use client";

import { UploadButton } from "@/lib/uploadthing";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";
import { toast } from "sonner";

interface FileUploadProps {
  endpoint: "imageUploader";
  value: string;
  onChange: (url?: string) => void;
}

export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  if (value) {
    return (
      <div className="relative h-40 w-full max-w-sm rounded-md overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
        <Image
          src={value}
          alt="Uploaded file"
          fill
          className="object-contain"
        />
        <Button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-2 right-2 h-6 w-6 shadow-sm hover:bg-rose-600"
          type="button"
          size="icon"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm border-2 border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
      <UploadButton
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          // Use ufsUrl if available (new version) or fallback to url (deprecated but still returned sometimes)
          const url = res?.[0]?.ufsUrl || res?.[0]?.url;
          onChange(url);
          toast.success("Image uploaded!");
        }}
        onUploadError={(error: Error) => {
          console.error(error);
          toast.error(`Error: ${error.message}`);
        }}
        appearance={{
          button: "bg-slate-900 text-white hover:bg-slate-800 text-sm py-2 px-4 rounded-md w-auto",
          container: "flex flex-col items-center justify-center gap-2",
          allowedContent: "text-xs text-slate-500",
        }}
      />
    </div>
  );
};
