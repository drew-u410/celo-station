export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function deepEquals(v1: any, v2: any) {
  return JSON.stringify(v1) === JSON.stringify(v2);
}

export function deepCopy(v: any) {
  return JSON.parse(JSON.stringify(v));
}

export type ValueOf<T> = T[keyof T];

export function objLength(obj: Record<any, any>) {
  return Object.keys(obj).length;
}

// Useful for maintaining type safety when using Object.keys
export function objKeys<T extends string | number>(obj: Record<T, any>): T[] {
  return Object.keys(obj) as T[];
}

export function objMapEntries<M extends Record<K, I>, K extends keyof M, O, I = ValueOf<M>>(
  obj: M,
  func: (k: K, v: I) => O,
): [K, O][] {
  return Object.entries<I>(obj).map(([k, v]) => [k as K, func(k as K, v)]);
}

// Map over the values of the object
export function objMap<M extends Record<K, I>, K extends keyof M, O, I = ValueOf<M>>(
  obj: M,
  func: (k: K, v: I) => O,
): Record<K, O> {
  return Object.fromEntries<O>(objMapEntries(obj, func)) as Record<K, O>;
}

export function objFilter<K extends string, I, O extends I>(
  obj: Record<K, I>,
  func: (k: K, v: I) => v is O,
): Record<K, O> {
  return Object.fromEntries(Object.entries<I>(obj).filter(([k, v]) => func(k as K, v))) as Record<
    K,
    O
  >;
}

// promiseObjectAll :: {k: Promise a} -> Promise {k: a}
export function promiseObjAll<K extends string, V>(obj: {
  [key in K]: Promise<V>;
}): Promise<Record<K, V>> {
  const promiseList = Object.entries(obj).map(([name, promise]) =>
    (promise as Promise<V>).then((result) => [name, result]),
  );
  return Promise.all(promiseList).then(Object.fromEntries);
}

// Get the subset of the object from key list
export function pick<K extends string, V = any>(obj: Record<K, V>, keys: K[]) {
  const ret: Partial<Record<K, V>> = {};
  const objKeys = Object.keys(obj);
  for (const key of keys) {
    if (objKeys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret as Record<K, V>;
}

// Recursively merges b into a
// Where there are conflicts, b takes priority over a
export function objMerge(a: Record<string, any>, b: Record<string, any>, max_depth = 10): any {
  if (max_depth === 0) {
    throw new Error('objMerge tried to go too deep');
  }
  if (isObject(a) && isObject(b)) {
    const ret: Record<string, any> = {};
    const aKeys = new Set(Object.keys(a));
    const bKeys = new Set(Object.keys(b));
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const key of allKeys.values()) {
      if (aKeys.has(key) && bKeys.has(key)) {
        ret[key] = objMerge(a[key], b[key], max_depth - 1);
      } else if (aKeys.has(key)) {
        ret[key] = a[key];
      } else {
        ret[key] = b[key];
      }
    }
    return ret;
  } else {
    return b ? b : a;
  }
}
