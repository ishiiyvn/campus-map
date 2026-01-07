import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner"
import { Loader2 } from "lucide-react";

import { Category } from "@/server/db/schema";
import { createArea } from "@/server/actions/areas";
import { AreaInput, AreaOutput, areaSchema } from "@/lib/validators";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

export interface AddCategoryFormProps {
  category?: Category,
  onSubmitCallback?: () => void,
}

export default function AddCategoryForm({ category, onSubmitCallback }: AddCategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<Category>({});
}

