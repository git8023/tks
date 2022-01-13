export type StringKeysJson<T> = { [key: string]: T };
export type ArrayOrNull<T> = Array<T> | null;
export type TypeOrNull<T> = T | null;
export type PrimaryTypeString =
  'Undefined'
  | 'Null'
  | 'Object'
  | 'Function'
  | 'Array'
  | 'Symbol'
  | 'String'
  | 'Date'
  | 'Number';
export type IdableConvertor<T> = (e: T) => string;
export type StringOrIdableConvertor<T> = string | IdableConvertor<T>;
export type NumberGenerator<T> = (e: T) => number;
export type SortHandler<T> = (a: any, b: any) => number;
export type PropertyExtractor<T, R> = (e: StringKeysJson<T>) => R;
export type AttachHandler<T, V> = (e: T) => T;
export type EqualsHandler<T> = (a: T, b: T) => boolean;
export type Processor = () => void;
export type EachHandler = (av: any, bv: any, key: string) => boolean | any;
export type DoneHandler = (a?: StringKeysJson<any>, b?: StringKeysJson<any>) => void;
export type WithKeysHandler = {
  each: (func: EachHandler) => WithKeysHandler,
  over: (func: DoneHandler) => WithKeysHandler,
  [s: string]: any
};