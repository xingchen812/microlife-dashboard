import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './typings.d';

export class typeInstantiation {
  static readonly integer: number = 0;
  static readonly string: string = '';
  static readonly user: User = {
    uuid: '',
    username: '',
    encryptType: '',
    encryptKey: '',
    meta: {
      nickname: '',
      avatar: '',
    },
  };
}

export async function configSet(group: string, key: string, value: string): Promise<void> {
  await localforage.setItem(`${group}.${key}`, value);
}

export async function configGet(group: string, key: string): Promise<string> {
  const str = await localforage.getItem(`${group}.${key}`);
  if (typeof str === 'string') {
    return str;
  }
  return '';
}

export async function configDelete(group: string, key: string): Promise<void> {
  await localforage.removeItem(`${group}.${key}`);
}

export async function groupDelete(group: string): Promise<void> {
  await localforage.iterate(
    (value, key) => key.startsWith(`${group}.`) && localforage.removeItem(key),
  );
}

export async function groupGet(): Promise<string[]> {
  const resultSet = new Set<string>();
  await localforage.iterate((value, key) => {
    if (key.includes('.')) {
      resultSet.add(key.split('.')[0]);
    }
  });
  return Array.from(resultSet);
}

export async function valuesGet(group: string): Promise<{ key: string; value: string }[]> {
  const result: { key: string; value: string }[] = [];
  await localforage.iterate((value, key) => {
    if (key.startsWith(`${group}.`) && typeof value === 'string') {
      result.push({ key: key.substring(group.length + 1), value });
    }
  });
  return result;
}

export function serialize<T>(template: T): string {
  // null/undefined
  if (template === null || template === undefined) {
    throw new Error('Unsupported null/undefined type during serialization');
  }
  // number
  else if (typeof template === 'number') {
    if (!Number.isInteger(template) || template < 0) {
      throw new Error('Unsupported number type during serialization');
    }
    return template === 0 ? ' ' : template.toString(16).toUpperCase() + ' ';
  }
  // string
  else if (typeof template === 'string') {
    return serialize(template.length) + template;
  }
  // array
  else if (Array.isArray(template)) {
    return serialize(template.length) + template.map(serialize).join('');
  }
  // set
  else if (template instanceof Set) {
    return serialize(Array.from(template));
  }
  // map
  else if (template instanceof Map) {
    return (
      serialize(template.size) +
      Array.from(template.entries())
        .map((key, value) => serialize(key) + serialize(value))
        .join('')
    );
  }
  // object
  else if (typeof template === 'object') {
    const entries = Object.entries(template);
    return (
      serialize(entries.length) +
      Object.entries(template).map(([key, value]) => serialize(key) + serialize(value))
    );
  }

  throw new Error('Unsupported template type');
}

// @type: 仅用于类型推导
export function deserialize<T>(serialized: string, type: T): { value: T; remaining: string } {
  // null/undefined
  if (type === null || type === undefined) {
    throw new Error('Unsupported null/undefined type during deserialization');
  }
  // number
  else if (typeof type === 'number') {
    const firstSpace = serialized.indexOf(' ');
    if (firstSpace === -1) {
      throw new Error('Invalid serialized number');
    }
    if (firstSpace === 0) {
      return { value: 0 as T, remaining: serialized.substring(1) };
    }
    return {
      value: parseInt(serialized.substring(0, firstSpace), 16) as T,
      remaining: serialized.substring(firstSpace + 1),
    };
  }
  // string
  else if (typeof type === 'string') {
    const { value: length, remaining } = deserialize(serialized, typeInstantiation.integer);
    const value = remaining.substring(0, length);
    return { value: value as T, remaining: remaining.substring(length) };
  }
  // array
  else if (Array.isArray(type)) {
    let { value: length, remaining } = deserialize(serialized, typeInstantiation.integer);
    const result: any[] = [];
    for (let i = 0; i < length; i++) {
      const { value, remaining: newRemaining } = deserialize(remaining, type[i]);
      result.push(value);
      remaining = newRemaining;
    }
    return { value: result as T, remaining };
  }
  // set
  else if (type instanceof Set) {
    const { value, remaining } = deserialize(serialized, type.values());
    return { value: new Set(value) as T, remaining };
  }
  // map
  else if (type instanceof Map) {
    const entries = Array.from(type.entries());
    let { value: length, remaining } = deserialize(serialized, typeInstantiation.integer);
    if (length !== entries.length) {
      throw new Error('Invalid serialized map');
    }
    const result: any = new Map();
    for (let i = 0; i < length; i++) {
      const { value: key, remaining: newRemaining } = deserialize(remaining, entries[0][0]);
      const { value, remaining: newNewRemaining } = deserialize(newRemaining, entries[0][1]);
      result.set(key, value);
      remaining = newNewRemaining;
    }
    return { value: result as T, remaining };
  }
  // object
  else if (typeof type === 'object') {
    let { value: length, remaining } = deserialize(serialized, typeInstantiation.integer);
    if (length !== Object.entries(type).length) {
      throw new Error('Invalid serialized object');
    }
    const result: any = {};
    for (let i = 0; i < length; i++) {
      const { value: key, remaining: newRemaining } = deserialize(
        remaining,
        typeInstantiation.string,
      );
      const { value, remaining: newNewRemaining } = deserialize(newRemaining, (type as any)[key]);
      result[key] = value;
      remaining = newNewRemaining;
    }
    return { value: result as T, remaining };
  }

  throw new Error('Unsupported template type');
}

export async function currentUser(): Promise<User | undefined> {
  const config = await configGet('dashboard', 'userCurrent');
  if (config.length === 0) {
    return undefined;
  }
  const { value } = deserialize(config, typeInstantiation.user);
  return value;
}

export async function listUser(): Promise<User[]> {
  const config = await valuesGet('dashboard_listUser');
  if (config.length === 0) {
    return [];
  }
  return config.map(({ value }) => {
    const { value: user } = deserialize(value, typeInstantiation.user);
    return user;
  });
}

export async function addUser(user: User): Promise<void> {
  user.uuid = uuidv4();
  await configSet('dashboard_listUser', user.uuid, serialize(user));
}
