function ConfirmDeleteModal({
  item,
  onConfirm,
  onCancel,
  isPermanent,
  isRecover,
  type = "user",
}) {
  if (!item) return null;

  const getItemLabel = () => {
    switch (type) {
      case "file": return `file "${item.name}"`;
      case "directory": return `folder "${item.name}"`;
      default: return `user "${item.email}"`;
    }
  };

  let title = "Confirm Delete";
  let message = `Delete this ${getItemLabel()}?`;
  let info = "";
  let buttonText = "Yes, Delete";
  let btnCls = "bg-[#facc15] text-black border-black";

  if (isPermanent) {
    title = "Permanent Delete";
    message = `Permanently delete this ${getItemLabel()}?`;
    info = "This action cannot be undone.";
    buttonText = "Permanently Delete";
    btnCls = "bg-red-600 text-white border-red-900";
  }

  if (isRecover) {
    title = "Recover Item";
    message = `Recover ${getItemLabel()}?`;
    buttonText = "Yes, Recover";
    btnCls = "bg-green-500 text-black border-green-900";
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#111] border-2 border-[#facc15] shadow-[6px_6px_0px_0px_#facc15] w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-black uppercase tracking-wide text-white mb-3">
          {title}
        </h2>
        <p className="text-sm text-white/70 mb-2 font-medium">{message}</p>
        {info && (
          <p className="text-xs text-red-400 font-bold mb-4 border-l-4 border-red-500 pl-3">
            ⚠ {info}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-black uppercase tracking-wide bg-transparent border-2 border-white/20 text-white/60 hover:border-white hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item)}
            className={`px-5 py-2.5 text-sm font-black uppercase tracking-wide border-2 shadow-brutal-sm hover:-translate-x-px hover:-translate-y-px hover:shadow-brutal transition-all duration-150 ${btnCls}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
