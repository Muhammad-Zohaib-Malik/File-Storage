// StorageBar.jsx
import React from "react";

// Convert bytes to human-readable
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function StorageBar({ usedBytes, maxBytes }) {
  const percentage = maxBytes > 0 ? (usedBytes / maxBytes) * 100 : 0;

  return (
    <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-700">Storage Used</span>
        <span className="font-semibold text-gray-800">
          {formatBytes(usedBytes)} / {formatBytes(maxBytes)}
        </span>
      </div>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-4 rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(to right, #4f46e5, #06b6d4)`,
          }}
        />
      </div>

      <div className="text-right mt-1 text-xs font-medium text-gray-600">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
}
