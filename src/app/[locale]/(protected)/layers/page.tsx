import { getLayers } from "@/server/queries/layers";
import AddLayerForm from "@/components/layers/forms/add-layer-form";
import { LayersList } from "@/components/layers/layers-list";

export default async function LayersPage() {
  const layers = (await getLayers()) || [];

  return (
    <main className="flex flex-col gap-8 max-w-3xl mx-auto p-4 md:p-24">
      <div>
        <h1 className="text-2xl font-semibold">Capas de Áreas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las capas para controlar el orden de visualización de las áreas en el mapa.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4">Agregar Capa</h2>
          <AddLayerForm />
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-medium mb-4">Capas Existentes</h2>
          <LayersList layers={layers} />
        </div>
      </div>
    </main>
  );
}
