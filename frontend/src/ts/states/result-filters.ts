import { createRoot } from "solid-js";
import { ResultFilters, ResultFiltersSchema } from "@monkeytype/schemas/users";

import defaultResultFilters from "../constants/default-result-filters";
import { typedKeys } from "@monkeytype/util/objects";
import { useLocalStorageStore } from "../hooks/useLocalStorageStore";
import { isObject } from "../utils/misc";
import { sanitize } from "../utils/sanitize";

export const [filters, setFilters] = createRoot(() =>
  useLocalStorageStore({
    key: "resultFilters",
    schema: ResultFiltersSchema,
    fallback: defaultResultFilters,
    migrate: migrateFilterStorage,
  }),
);

function mergeWithDefaultFilters(
  filters: Partial<ResultFilters>,
): ResultFilters {
  try {
    const merged = {} as ResultFilters;
    for (const groupKey of typedKeys(defaultResultFilters)) {
      if (groupKey === "_id") {
        let id = filters._id ?? defaultResultFilters._id;
        if (id === "default-result-filters-id" || id === "") {
          id = "default";
        }
        merged._id = id;
      } else if (groupKey === "name") {
        merged.name = filters.name ?? defaultResultFilters.name;
      } else {
        // @ts-expect-error upstream's own type gymnastics
        merged[groupKey] = {
          ...defaultResultFilters[groupKey],
          ...filters[groupKey],
        };
      }
    }
    return merged;
  } catch {
    return defaultResultFilters;
  }
}

function migrateFilterStorage(input: unknown): ResultFilters {
  if (!isObject(input)) {
    return defaultResultFilters;
  }
  const filters = sanitize(
    ResultFiltersSchema.partial().strip(),
    input as ResultFilters,
  );
  return mergeWithDefaultFilters(filters);
}

export function updateTagsInFilterStorage(tagsIds: string[]): void {
  setFilters((filters) => {
    const result = mergeWithDefaultFilters(filters);
    const existingTags = new Set(["none", ...tagsIds]);

    //remove tags that no longer exist.
    let newTags = new Map(
      Object.entries(result.tags).filter(([id]) => existingTags.has(id)),
    );

    //add new tags added
    tagsIds
      .filter((id) => !newTags.has(id))
      .forEach((newId) => newTags.set(newId, true));

    result.tags = Object.fromEntries(newTags.entries());
    return result;
  });
}
