interface AreaControlsProps {
  isEditing: boolean;
  canUndo: boolean;
  onFinish: () => void;
  onUndo: () => void;
  onCancel: () => void;
}

export function AreaControls({ isEditing, canUndo, onFinish, onUndo, onCancel }: AreaControlsProps) {
  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-md p-2 rounded-lg flex items-center gap-2">
      <button
        className="text-xs font-medium px-3 py-1 rounded bg-blue-600 text-white"
        onClick={onFinish}
      >
        Finalizar área
      </button>
      <button
        className="text-xs font-medium px-3 py-1 rounded bg-slate-200 text-slate-700 disabled:opacity-50"
        onClick={onUndo}
        disabled={!canUndo}
      >
        Deshacer punto
      </button>
      <button
        className="text-xs font-medium px-3 py-1 rounded bg-slate-200 text-slate-700"
        onClick={onCancel}
      >
        Cancelar
      </button>
    </div>
  );
}
