import { useState, useCallback } from "react";
import { WillFormData } from "../hooks/useWillForm";

/**
 * Provides snapshot-based undo for "Copy from Client 1" actions.
 *
 * Usage:
 *   const { snapshot, saveSnapshot, undo, hasSnapshot } = useCopyUndo(data, onChange);
 *
 *   // Before copying:
 *   saveSnapshot(["client2Executors", "client2ReservedExecutors"]);
 *   onChange({ client2Executors: ..., client2ReservedExecutors: ... });
 *
 *   // Undo button (visible while hasSnapshot):
 *   <button onClick={undo}>Undo Copy</button>
 */
export function useCopyUndo(
  data: WillFormData,
  onChange: (updates: Partial<WillFormData>) => void,
) {
  const [snapshot, setSnapshot] = useState<Partial<WillFormData> | null>(null);

  /** Call this with the list of keys you are about to overwrite, BEFORE calling onChange. */
  const saveSnapshot = useCallback(
    (keys: (keyof WillFormData)[]) => {
      const snap: Partial<WillFormData> = {};
      for (const k of keys) {
        // Deep-copy arrays so the snapshot is independent of further edits
        const v = data[k];
        (snap as Record<string, unknown>)[k] = Array.isArray(v)
          ? (v as unknown[]).map((item) =>
              item && typeof item === "object" ? { ...(item as object) } : item,
            )
          : v;
      }
      setSnapshot(snap);
    },
    [data],
  );

  const undo = useCallback(() => {
    if (snapshot) {
      onChange(snapshot);
      setSnapshot(null);
    }
  }, [snapshot, onChange]);

  const clearSnapshot = useCallback(() => setSnapshot(null), []);

  return { hasSnapshot: snapshot !== null, saveSnapshot, undo, clearSnapshot };
}
