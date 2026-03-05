interface AreaContextMenuProps {
  x: number;
  y: number;
  onEditPolygon: () => void;
  onEditInfo: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AreaContextMenu({
  x,
  y,
  onEditPolygon,
  onEditInfo,
  onDelete,
  onClose,
}: AreaContextMenuProps) {
  return (
    <div
      className="absolute z-20 bg-white/95 border border-slate-200 rounded shadow-md px-2 py-1 text-sm"
      style={{ left: x, top: y }}
    >
      <button
        className="block w-full text-left px-2 py-1 hover:bg-slate-100"
        onClick={onEditPolygon}
      >
        Editar polígono
      </button>
      <button
        className="block w-full text-left px-2 py-1 hover:bg-slate-100"
        onClick={onEditInfo}
      >
        Editar información
      </button>
      <button
        className="block w-full text-left px-2 py-1 hover:bg-slate-100 text-red-600"
        onClick={onDelete}
      >
        Eliminar área
      </button>
      <button
        className="block w-full text-left px-2 py-1 hover:bg-slate-100"
        onClick={onClose}
      >
        Cancelar
      </button>
    </div>
  );
}
