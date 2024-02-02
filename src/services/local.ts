import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './typings.d';

export class typeInstantiation {
  static readonly integer: number = 0;
  static readonly string: string = '';
  static readonly user: User = {
    uuid: '',
    host: '',
    username: '',
    encryptType: '',
    encryptKey: '',
    meta: {
      avatar: {
        type: 'none',
        data: '',
      },
      nickname: '',
      description: '',
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

export function serialize<T>(value: T): string {
  function do_serialize<T>(value: T): string {
    // null/undefined
    if (value === null || value === undefined) {
      throw new Error('Unsupported null/undefined type during serialization: ' + value);
    }
    // number
    else if (typeof value === 'number') {
      if (!Number.isInteger(value) || value < 0) {
        throw new Error('Unsupported number type during serialization');
      }
      return value === 0 ? ' ' : value.toString(16).toUpperCase() + ' ';
    }
    // string
    else if (typeof value === 'string') {
      return do_serialize(value.length) + value;
    }
    // array
    else if (Array.isArray(value)) {
      return do_serialize(value.length) + value.map(do_serialize).join('');
    }
    // set
    else if (value instanceof Set) {
      return do_serialize(Array.from(value));
    }
    // map
    else if (value instanceof Map) {
      return (
        do_serialize(value.size) +
        Array.from(value.entries())
          .map((key, value) => do_serialize(key) + do_serialize(value))
          .join('')
      );
    }
    // object
    else if (typeof value === 'object') {
      const entries = Object.entries(value);
      return (
        do_serialize(entries.length) +
        Object.entries(value)
          .map(([key, value]) => do_serialize(key) + do_serialize(value))
          .join('')
      );
    }

    throw new Error('Unsupported template type: ' + value.toString());
  }

  try {
    return do_serialize(value);
  } catch (e) {
    console.error('serialize value error: ', value);
    throw e;
  }
}

// @type: 仅用于类型推导
export function deserialize<T>(str: string, type: T): { value: T; remaining: string } {
  function do_deserialize<T>(str: string, type: T): { value: T; remaining: string } {
    // null/undefined
    if (type === null || type === undefined) {
      throw new Error('Unsupported null/undefined type during deserialization: ' + type);
    }
    // number
    else if (typeof type === 'number') {
      const firstSpace = str.indexOf(' ');
      if (firstSpace === -1) {
        throw new Error('Invalid serialized number');
      }
      if (firstSpace === 0) {
        return { value: 0 as T, remaining: str.substring(1) };
      }
      return {
        value: parseInt(str.substring(0, firstSpace), 16) as T,
        remaining: str.substring(firstSpace + 1),
      };
    }
    // string
    else if (typeof type === 'string') {
      const { value: length, remaining } = do_deserialize(str, typeInstantiation.integer);
      const value = remaining.substring(0, length);
      return { value: value as T, remaining: remaining.substring(length) };
    }
    // array
    else if (Array.isArray(type)) {
      let { value: length, remaining } = do_deserialize(str, typeInstantiation.integer);
      const result: any[] = [];
      for (let i = 0; i < length; i++) {
        const { value, remaining: newRemaining } = do_deserialize(remaining, type[i]);
        result.push(value);
        remaining = newRemaining;
      }
      return { value: result as T, remaining };
    }
    // set
    else if (type instanceof Set) {
      const { value, remaining } = do_deserialize(str, type.values());
      return { value: new Set(value) as T, remaining };
    }
    // map
    else if (type instanceof Map) {
      const entries = Array.from(type.entries());
      let { value: length, remaining } = do_deserialize(str, typeInstantiation.integer);
      if (length !== entries.length) {
        throw new Error('Invalid serialized map');
      }
      const result: any = new Map();
      for (let i = 0; i < length; i++) {
        const { value: key, remaining: newRemaining } = do_deserialize(remaining, entries[0][0]);
        const { value, remaining: newNewRemaining } = do_deserialize(newRemaining, entries[0][1]);
        result.set(key, value);
        remaining = newNewRemaining;
      }
      return { value: result as T, remaining };
    }
    // object
    else if (typeof type === 'object') {
      let { value: length, remaining } = do_deserialize(str, typeInstantiation.integer);
      if (length !== Object.entries(type).length) {
        throw new Error('Invalid serialized object');
      }
      const result: any = {};
      for (let i = 0; i < length; i++) {
        const { value: key, remaining: newRemaining } = do_deserialize(
          remaining,
          typeInstantiation.string,
        );
        const valueTypeValue = (type as any)[key];
        if (valueTypeValue === undefined) {
          console.error('deserialize object error: key: ', key, ', object: ', type);
          throw new Error('Invalid serialized object');
        }
        const { value, remaining: newNewRemaining } = do_deserialize(newRemaining, valueTypeValue);
        result[key] = value;
        remaining = newNewRemaining;
      }
      return { value: result as T, remaining };
    }

    throw new Error('Unsupported template type: ' + type.toString());
  }

  try {
    return do_deserialize(str, type);
  } catch (e) {
    console.error('deserialize value error: ', type);
    console.error(str);
    throw e;
  }
}

// convert type1 to type2
export function convertType<T1>(type1: T1, type2: any): T1 {
  if (type1 === undefined || type1 === null) {
    throw new Error('Unsupported template type');
  }

  if (type2 === undefined || type2 === null) {
    return type1;
  }

  if (typeof type1 !== typeof type2) {
    throw new Error('convertType not support different type');
  }

  if (typeof type1 === 'object') {
    const result: T1 = { ...type1 };
    for (const key in type1) {
      if (type1.hasOwnProperty(key)) {
        const value = type2[key];
        if (value !== undefined) {
          if (typeof value !== typeof result[key]) {
            throw new Error('Unsupported template type');
          }
          result[key] = convertType(result[key], value);
        }
      }
    }
    return result;
  }

  return type2;
}

export async function listUser(): Promise<User[]> {
  const config = await valuesGet('dashboard_listUser');
  if (config.length === 0) {
    return [];
  }
  return config.map(({ key, value }) => {
    const { value: user } = deserialize(value, typeInstantiation.user);
    user.uuid = key;
    return user;
  });
}

export async function addUser(user: User): Promise<void> {
  user.uuid = uuidv4();
  await configSet(
    'dashboard_listUser',
    user.uuid,
    serialize(convertType(typeInstantiation.user, user)),
  );
}

export async function setUser(uuid: string, user: User): Promise<void> {
  user.uuid = uuid;
  await configSet('dashboard_listUser', uuid, serialize(convertType(typeInstantiation.user, user)));
}

export async function getUser(uuid: string): Promise<User> {
  const config = await configGet('dashboard_listUser', uuid);
  if (config.length === 0) {
    return typeInstantiation.user;
  }
  const { value } = deserialize(config, typeInstantiation.user);
  return value;
}

export async function deleteUser(uuid: string): Promise<void> {
  await configDelete('dashboard_listUser', uuid);
}

export async function currentUser(): Promise<User> {
  const config = await configGet('dashboard', 'userCurrent');
  const guestUser: User = {
    uuid: 'guest',
    host: '',
    username: 'guest',
    encryptType: '',
    encryptKey: '',
    meta: {
      avatar: {
        type: 'none',
        data: '',
      },
      nickname: 'guest',
      description: '',
    },
  };
  if (config.length === 0) {
    return guestUser;
  }
  const { value } = deserialize(config, typeInstantiation.string);
  const getedUser = await getUser(value);
  return getedUser.uuid === '' ? guestUser : getedUser;
}

export async function setCurrentUser(uuid: string | undefined): Promise<void> {
  if (uuid === undefined) {
    await configDelete('dashboard', 'userCurrent');
  } else {
    await configSet('dashboard', 'userCurrent', serialize(uuid));
  }
}
