import {validators} from "./validators";

export namespace storages {

  export interface $Storage {
    /**
     * 保存数据
     * @param key {string} 关键字
     * @param value {any} 数据
     */
    save<T>(key: string, value: T): void;

    /**
     * 获取数据
     * @param key {string} 关键字
     * @return {any} 数据
     */
    get<T>(key: string): T;

    /**
     * 删除数据
     * @param key {string} 关键字
     * @return {any} 数据
     */
    remove<T>(key: string): T;

    /**
     * 清空数据
     */
    clear(): void;
  }

  export function $(storage: Storage): $Storage {
    let that: $Storage;
    return that = {
      save<T>(key: string, value: T) {
        storage.setItem(key, JSON.stringify(value))
      },
      get<T>(key: string): T {
        const v = storage.getItem(key);
        return validators.isNullOrUndefined(v) ? null : JSON.parse(v as string);
      },
      remove<T>(key: string): T {
        // @ts-ignore
        const v = that.get<T>(key);
        storage.removeItem(key);
        return v;
      },
      clear() {
        storage.clear()
      }
    }
  }

  /**Session Storage*/
  export const $session = $(sessionStorage);

  /**Local Storage*/
  export const $local = $(localStorage);

}