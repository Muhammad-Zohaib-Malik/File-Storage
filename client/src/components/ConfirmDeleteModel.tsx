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
      case "file":
        return `file "${item.name}"`;
      case "directory":
        return `folder "${item.name}"`;
      case "user":
      default:
        return `user "${item.email}"`;
    }
  };

  let title = "Confirm Deletion";
  let message = `Do you want to delete this ${getItemLabel()}?`;
  let info = "";
  let buttonText = "Yes, Delete";
  let buttonClass = "bg-yellow-500 hover:bg-yellow-600";

  if (isPermanent) {
    title = "Permanent Delete";
    message = `Do you want to permanently delete this ${getItemLabel()}?`;
    info = "This action is permanent and cannot be undone.";
    buttonText = "Yes, Permanently Delete";
    buttonClass = "bg-red-600 hover:bg-red-700";
  }

  if (isRecover) {
    title = "Recover User";
    message = `Do you want to recover ${getItemLabel()}?`;
    info = "";
    buttonText = "Yes, Recover";
    buttonClass = "bg-green-600 hover:bg-green-700";
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>

        <p className="text-gray-800 text-base mb-2">{message}</p>

        {info && <p className="text-sm mb-6 text-gray-500">{info}</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-sm bg-gray-200 hover:bg-gray-300 text-black transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(item)}
            className={`px-4 py-2 rounded-md text-sm text-white transition ${buttonClass}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
