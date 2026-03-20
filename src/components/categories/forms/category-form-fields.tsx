"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CategoryInput } from "@/lib/validators/category";
import { useState } from "react";
import { IconPicker, getIconComponent } from "@/components/ui/icon-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface CategoryFormFieldsProps {
  form: UseFormReturn<CategoryInput>;
  disabled?: boolean;
}

export default function CategoryFormFields({ form, disabled }: CategoryFormFieldsProps) {
  const t = useTranslations("categories");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const selectedIcon = form.watch("icon");
  const selectedColor = form.watch("color");
  const selectedDisplayType = form.watch("display_type");

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
            <FormControl>
              <Input placeholder={t("namePlaceholder")} {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea placeholder={t("descriptionPlaceholder")} {...field} disabled={disabled} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="display_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("displayType")}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("displayTypePlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="icon">{t("displayTypeIcon")}</SelectItem>
                <SelectItem value="text">{t("displayTypeText")}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="icon"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("icon")}</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIconPickerOpen(true)}
                  className="w-12 h-12 p-0"
                  disabled={disabled}
                  style={
                    selectedColor
                      ? { borderColor: selectedColor || undefined }
                      : undefined
                  }
                >
                  {selectedIcon ? (
                    (() => {
                      const IconComp = getIconComponent(selectedIcon);
                      return IconComp ? (
                        <div style={{ color: selectedColor || undefined }}>
                          <IconComp className="w-6 h-6" />
                        </div>
                      ) : (
                        <ImageIcon className="w-6 h-6" />
                      );
                    })()
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedIcon || t("selectIcon")}
                </span>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("color")}</FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="w-12 p-1 h-10"
                  {...field}
                  value={field.value || "#000000"}
                  disabled={disabled}
                />
                <Input
                  placeholder="#RRGGBB"
                  {...field}
                  value={field.value || ""}
                  className="font-mono"
                  disabled={disabled}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_map_level_default"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center gap-2 space-y-0">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4"
              />
            </FormControl>
            <FormLabel className="font-normal cursor-pointer">
              {t("mapLevelDefault")}
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      <IconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        onSelect={(iconName) => {
          form.setValue("icon", iconName);
        }}
        selectedIcon={selectedIcon}
      />
    </>
  );
}
