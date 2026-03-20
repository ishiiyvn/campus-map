"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Category, Level, Area } from "@/server/db/schema";
import { UseFormReturn } from "react-hook-form";
import { PointOfInterestInput } from "@/lib/validators/poi";
import { useEffect, useState } from "react";
import { IconPicker, getIconComponent } from "@/components/ui/icon-picker";
import { Image as ImageIcon, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface PoiFormFieldsProps {
  form: UseFormReturn<PointOfInterestInput>;
  categories: Category[];
  areas: Area[];
  levels: Level[];
  areaReadOnly?: boolean;
}

export default function PoiFormFields({
  form,
  categories,
  areas,
  levels = [],
  areaReadOnly = false,
}: PoiFormFieldsProps) {
  const t = useTranslations("poi");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(
    form.getValues("category_id")
  );
  const [iconOverridden, setIconOverridden] = useState(false);
  const [colorOverridden, setColorOverridden] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedIcon = form.watch("icon");
  const selectedColor = form.watch("icon_color");
  const selectedAreaId = form.watch("area_id");

  useEffect(() => {
    if (selectedCategoryId) {
      const category = categories.find((c) => c.id === selectedCategoryId);
      if (category) {
        if (!colorOverridden && category.color) {
          form.setValue("icon_color", category.color);
        }
        if (!iconOverridden) {
          if (category.icon) {
            form.setValue("icon", category.icon);
          } else {
            form.setValue("icon", null);
          }
        }
      }
    }
  }, [selectedCategoryId, categories, form, colorOverridden, iconOverridden]);

  const handleIconSelect = (iconName: string) => {
    setIconOverridden(true);
    form.setValue("icon", iconName);
  };

  const handleColorChange = (color: string) => {
    setColorOverridden(true);
    form.setValue("icon_color", color);
  };

  const handleResetToCategoryDefaults = () => {
    setIconOverridden(false);
    setColorOverridden(false);
    if (selectedCategory) {
      form.setValue("icon_color", selectedCategory.color || "#000000");
      form.setValue("icon", selectedCategory.icon || null);
    }
  };

  const selectedLevelIds = form.watch("level_ids") || [];

  const toggleLevel = (levelId: number) => {
    const current = form.getValues("level_ids") || [];
    if (current.includes(levelId)) {
      form.setValue(
        "level_ids",
        current.filter((id) => id !== levelId)
      );
    } else {
      form.setValue("level_ids", [...current, levelId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Area */}
      <FormField
        control={form.control}
        name="area_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("area")}</FormLabel>
            <Select
              onValueChange={(val) => {
                const id = val === "none" ? null : Number(val);
                field.onChange(id);
              }}
              value={field.value?.toString() ?? "none"}
              disabled={areaReadOnly}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectArea")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">-</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("name")}</FormLabel>
            <FormControl>
              <Input placeholder={t("namePlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea placeholder={t("descriptionPlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category */}
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("category")}</FormLabel>
            <Select
              onValueChange={(val) => {
                const id = Number(val);
                field.onChange(id);
                setSelectedCategoryId(id);
                setIconOverridden(false);
                setColorOverridden(false);
              }}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map((category) => {
                  const IconComp = category.icon ? getIconComponent(category.icon) : null;
                  return (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        {IconComp && (
                          <div style={{ color: category.color || undefined }}>
                            <IconComp className="w-4 h-4" />
                          </div>
                        )}
                        {category.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Icon */}
      <FormItem>
        <FormLabel className="flex items-center justify-between">
          <span>{t("icon")}</span>
          {selectedCategory && (iconOverridden || colorOverridden) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleResetToCategoryDefaults}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {t("reset")}
            </Button>
          )}
        </FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIconOverridden(true);
                setIconPickerOpen(true);
              }}
              className="w-12 h-12 p-0"
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
            {(iconOverridden || colorOverridden) && (
              <span className="text-xs text-muted-foreground">({t("customized")})</span>
            )}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>

      {/* Levels */}
      {levels.length > 0 && (
        <FormItem>
          <FormLabel>{t("levels")}</FormLabel>
          <FormControl>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <Button
                  key={level.id}
                  type="button"
                  variant={selectedLevelIds.includes(level.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLevel(level.id)}
                >
                  {level.name}
                </Button>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}

      {/* Color */}
      <FormField
        control={form.control}
        name="icon_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center justify-between">
              <span>{t("color")}</span>
              {selectedCategory && (iconOverridden || colorOverridden) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={handleResetToCategoryDefaults}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  {t("reset")}
                </Button>
              )}
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  className="w-12 p-1 h-10"
                  {...field}
                  value={field.value || "#000000"}
                  onChange={(e) => {
                    field.onChange(e);
                    setColorOverridden(true);
                  }}
                />
                <Input
                  placeholder="#RRGGBB"
                  {...field}
                  value={field.value || ""}
                  className="font-mono"
                  onChange={(e) => {
                    field.onChange(e);
                    setColorOverridden(true);
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <IconPicker
        open={iconPickerOpen}
        onOpenChange={setIconPickerOpen}
        onSelect={handleIconSelect}
        selectedIcon={selectedIcon}
      />
    </div>
  );
}
