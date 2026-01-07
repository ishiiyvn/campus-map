
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MapInput } from "@/lib/validators/map";

interface MapFormFieldsProps {
  form: UseFormReturn<MapInput>;
}

export function MapFormFields({ form }: MapFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre del Mapa</FormLabel>
            <FormControl>
              <Input placeholder="Ej: Campus FPUNA"  {...field} />
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
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Input placeholder="Descripción breve..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="map_image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL de la Imagen</FormLabel>
            <FormControl>
              <Input placeholder="https://..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="map_width"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Ancho (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1920"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="map_height"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Alto (px)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1080"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
