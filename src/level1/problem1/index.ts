export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */
export function serialize(value: Value): unknown {

  // Scalar value (string, number, boolean, null, undefined), return as is.
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Date object, serialize it to milliseconds.
  if (value instanceof Date) {
    return { __t: 'Date', __v: value.getTime() };
  }

  // Buffer object, serialize it to an array of numbers.
  if (value instanceof Buffer) {
    return { __t: 'Buffer', __v: Array.from(value) };
  }

  // Map object, serialize its entries.
  if (value instanceof Map) {
    const serializedMap: [unknown, unknown][] = [];
    value.forEach((val: Value, key: Value) => {
      serializedMap.push([serialize(key), serialize(val)]);
    });
    return { __t: 'Map', __v: serializedMap };
  }

  // Set object, serialize its elements.
  if (value instanceof Set) {
    return { __t: 'Set', __v: Array.from(value).map(serialize) };
  }

  // Array, recursively serialize each elemnt.
  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  // Object, recursively serialize its properties.
  const obj: { [key: string]: unknown } = {};
  for (const [key, val] of Object.entries(value)) {
    obj[key] = serialize(val);
  }
  return obj;
}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {

  // Scalar value (string, number, boolean, null, undefined), return as is.
  if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value as unknown as T;
  }

  // Array, recursively deserialize each element.
  if (Array.isArray(value)) {
    return value.map(deserialize) as unknown as T;
  }

  // Object, check if it's a serialized value.
  if (typeof value === 'object') {
    // Serialized value, deserialize based on the '__t' field.
    if ('__t' in value && '__v' in value) {
      switch (value['__t']) {
        // Date serialization, create new Date object from the milliseconds value.
        case 'Date':
          return new Date(value['__v'] as number) as unknown as T;
        // Buffer serialization, create new Buffer from the array of numbers.
        case 'Buffer':
          return Buffer.from(value['__v'] as number[]) as unknown as T;
        // Map serialization, recreate Map object and deserialize its keys and values.
        case 'Map':
          const deserializedMap = new Map<unknown, unknown>();
          for (const [key, val] of value['__v'] as [unknown, unknown][]) {
            deserializedMap.set(deserialize(key), deserialize(val));
          }
          return deserializedMap as unknown as T;
        // Set serialization, recreate Set object and deserialize its elements.
        case 'Set':
          return new Set((value['__v'] as unknown[]).map(deserialize)) as unknown as T;
        // Throw Error, type unknown
        default:
          throw new Error('Unknown type encountered during deserialization');
      }
    } else {
      // Regular Object, recursively deserialize its properties.
      const obj: { [key: string]: unknown } = {};
      for (const [key, val] of Object.entries(value as { [key: string]: unknown })) {
        obj[key] = deserialize(val);
      }
      return obj as unknown as T;
    }
  }

  // Type unknown, throw an error.
  throw new Error('Unknown value encountered during deserialization');
}