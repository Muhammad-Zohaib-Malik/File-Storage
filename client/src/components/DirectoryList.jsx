// DirectoryList.js
import { useDirectoryContext } from "../context/DirectoryContext";
import DirectoryItem from "./DirectoryItem";

function DirectoryList({ items, viewMode = "list" }) {
  const { progressMap } = useDirectoryContext();

  const isGrid = viewMode === "grid";

  return (
    <div
      className={
        isGrid
          ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          : "space-y-2"
      }
    >
      {items.map((item) => {
        const uploadProgress = progressMap[item.id] || 0;
        return (
          <DirectoryItem
            key={item.id}
            item={item}
            uploadProgress={uploadProgress}
            viewMode={viewMode}
          />
        );
      })}
    </div>
  );
}

export default DirectoryList;
