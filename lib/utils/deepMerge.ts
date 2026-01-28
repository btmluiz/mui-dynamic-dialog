/**
 * Performs a deep merge of objects.
 * @param target The target object to merge into.
 * @param sources One or more source objects to merge.
 */
export function deepMerge<T2, T1 = unknown>(target: T1, ...sources: any[]): T2 {
  if (!sources.length) return target as unknown as T2;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key as keyof T1]) {
          Object.assign(target as any, { [key]: {} });
        }
        deepMerge(target[key as keyof T1], source[key]);
      } else {
        Object.assign(target as any, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === "object" && !Array.isArray(item);
}
