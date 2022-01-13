// 数组工具
import {ArrayOrNull, IdableConvertor, StringKeysJson, StringOrIdableConvertor, TypeOrNull} from "@/type/types";
import {funcs} from "@/type/InterfaceDeclarer";
import {validators} from "./validators";
import {utils} from "./utils";
import {strings} from "./strings";
import IDataProcessor = funcs.IDataProcessor;

export namespace $def {

  /**
   * StringOrIdableConvertor 转 IdableConvertor
   * @param fn {StringOrIdableConvertor} 字符串或处理函数
   * @return IdableConvertor<T>
   */
  export function toIdableConvertor<T>(fn: StringOrIdableConvertor<T>): IdableConvertor<T> {
    if (validators.is(fn, 'String')) {
      // @ts-ignore
      return (e: T) => e[fn as string];
    }
    return fn as IdableConvertor<T>;
  }
}

export namespace arrays {

  /**
   * 对象数组通过指定属性名转换为JSON对象
   * @param arr 目标数组
   * @param toKey 转换接口
   * @param [recover=true] 是否允许覆盖重复值
   * @param [recursion=()=>null] 子属性递归函数, 默认不递归
   */
  export function toMap<T>(arr: Array<T>,
                           toKey: StringOrIdableConvertor<T> = 'id',
                           recover = true,
                           recursion: (el: T) => Array<T> | any = () => null): StringKeysJson<T> {

    const result: StringKeysJson<T> = {};
    if (validators.nullOrUndefined(arr, toKey)) {
      return result;
    }

    const fn = $def.toIdableConvertor(toKey);
    arr.forEach(el => {

      const key = fn(el);
      if (result[key]) {
        if (!recover) {
          throw new Error(`不允许重复Key [${key}]`);
        }
      }
      result[key] = el;

      const children = utils.or<Array<T>>(recursion(el), []);
      if (undefined !== children && !!children.length) {
        const childrenMap = toMap<T>(children, toKey, recover, recursion);
        utils.mergeJson<StringKeysJson<T>>(childrenMap, result, recover);
      }

    });

    return result;
  }

  /**
   * 获取所有数组交集元素
   * @param args
   */
  export function intersection<T>(...args: Array<T[]>): T[] {
    if (validators.isNullOrUndefined(args)) {
      return [];
    }

    // 仅一个数组
    const first = args[0];
    if (1 === args.length) {
      return first;
    }

    // 获取最大数组长度
    args.sort((a, b) => a.length - b.length);
    const maxLenArr = args.pop();

    // 使用最长的数组与其他数组取交集
    // @ts-ignore
    return maxLenArr.filter(el => {
      let isInclude = true;
      args.forEach(oel => {
        if (isInclude) {
          isInclude = isInclude && oel.includes(el);
        }
      });
      return isInclude;
    });
  }

  /**
   * 查找元素(或递归满足条件的数组元素属性值)
   * @param arr 数组或元素(数组)属性值
   * @param observer {Function} 值观察者. 成功true否则返回false.
   * @param recursion {Function} 递归属性提取检视器. 没有递归属性返回null否则返回需要递归的数组属性值
   * @returns {TypeOrNull} 查询成功返回目标数据, 否则返回null
   */
  export function seek<T>(arr: Array<T>,
                          observer = (el: T, index?: number) => true,
                          recursion = (el: T, index?: number) => null as ArrayOrNull<T>): TypeOrNull<{ el: T, index: number }> {

    let result: TypeOrNull<{ el: T, index: number }> = null;
    foreach(arr, (el, index) => {

      // 已经查询到需要的元素
      if (observer(el, index)) {
        result = {el, index};
        return false;
      }

      // 检测是否需要递归查询
      const children = recursion(el, index);
      if (validators.is(children, 'Array')) {
        result = seek(<T[]>children, observer, recursion);
        if (null != result) {
          return false;
        }
      }

      return true;
    });

    return result;
  }

  /**
   * 数组遍历
   * @param arr 数组
   * @param func 回调函数, 返回false停止遍历
   * @return {Array<T>} 原始数组
   */
  export function foreach<T>(arr: Array<T>,
                             func: (e: T, i: number) => (false | any)) {
    if (!validators.is(arr, 'Array')) {
      return arr;
    }

    for (let i = 0, len = arr.length; i < len; i++) {
      const f1 = func(arr[i], i);
      if (false === f1) {
        break;
      }
    }

    return arr;
  }

  /**
   * 追加唯一目标值, 如果校验存在则跳过
   * @param {Array<T>} a 数组
   * @param {T} e 新元素
   * @param {string | ((el: T, i: number) => boolean)} c 唯一值属性名或比较器函数(返回true表示存在)
   * @return {number} 与e匹配的元素索引
   */
  export function pushUnique<T>(a: Array<T>,
                                e: T,
                                c?: string | ((el: T, i: number) => boolean)): number {
    const foundIndex = indexA(a, e, c);
    if (-1 !== foundIndex) {
      return foundIndex;
    }
    return a.push(e) - 1;
  }

  /**
   * 查找索引
   * @param {Array<T>} a 数组
   * @param {T} e 查找条件
   * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
   * @return {number} 索引, -1表示未找到
   */
  export function indexA<T extends { [key: string]: any }>(
    a: Array<T>,
    e: T,
    k?: string | ((el: T, i: number) => boolean)
  ): number {
    let fn: (el: T, i: number) => boolean;
    if (!(k instanceof Function)) {
      if (validators.isNullOrUndefined(k)) {
        fn = (el => el === e);
      } else if (validators.is(k, 'String')) {
        fn = (el => el[k + ''] === e[k + '']);
      }
    }

    let foundIdx = -1;
    foreach<T>(a, (el: T, i: number) => {
      if (fn(el, i)) {
        foundIdx = i;
        return false;
      }
    });
    return foundIdx;
  }

  /**
   * 查找目标值
   * @param {Array<T>} a 数组
   * @param {T} e 查找条件
   * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
   * @return {T | null} 查找成功返回目标值, 否则返回null
   */
  export function findA<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): T | null {
    const i = indexA(a, e, k);
    return -1 !== i ? a[i] : null;
  }

  /**
   * 删除
   * @param {Array<T>} a 数组
   * @param {T} e 查找条件
   * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
   * @return {T | null} 删除成功返回被删除目标值, 否则返回null
   */
  export function remove<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): T | null {
    const i = indexA(a, e, k);
    if (-1 === i) {
      return null;
    }
    return a.splice(i, 1)[0];
  }

  /**
   * 数组减法运算
   * @param a {Array<T>} 被修改数据
   * @param b {Array<T>} 目标数组
   * @return {Array<T>} 被修改数据
   */
  export function removeAll<T>(a: Array<T>, b: Array<T>): Array<T> {
    return a.filter(av => !b.includes(av));
  }

  /**
   * 合并
   * @param {Array<T>} dist 目标数组
   * @param {Array<T>} src 元素组
   * @return {Array<T>} 目标数组
   */
  export function concat<T>(dist: Array<T>, src: Array<T>): Array<T> {
    if (!validators.is(dist, 'Array') || !validators.is(src, 'Array')) {
      throw new Error('无效数组参数');
    }
    Array.prototype.push.apply(dist, src);
    return dist;
  }

  /**
   * 是否包含指定值
   * @param {Array<T>} a 数组
   * @param {T} e 数组元素
   * @param {string | ((el: T, i: number) => boolean)} k 唯一值属性名或比较器函数(返回true表示找到)
   * @return {boolean} true-已包含, false-未包含
   */
  export function contains<T>(a: Array<T>, e: T, k?: string | ((el: T, i: number) => boolean)): boolean {
    return -1 !== indexA(a, e, k);
  }

  /**
   * 数组过滤
   * @param a {Array<any>} 目标数组
   * @param cb {(v: T, k: number) => boolean } 回调函数, false-删除, 其他-保留
   */
  export function filter<T>(a: Array<T>, cb: (v: T, k?: number) => boolean | null) {
    let delKeys: number[] = [];
    foreach(a, (v: T, k: number) => {
      if (false === cb(v, k)) {
        delKeys.push(k);
      }
    });

    delKeys = delKeys.reverse();
    foreach(delKeys, (id: number) => a.splice(id, 1));
  }

  /**
   * 数组按指定关键字分组
   * @param a 数组
   * @param k 关键字, 仅支持一级属性名
   */
  export function group<T extends StringKeysJson<any>>(a: Array<T>, k: StringOrIdableConvertor<T>): { [s: string]: Array<T> } {
    const ret: StringKeysJson<T[]> = {};

    const fn = $def.toIdableConvertor(k);
    foreach(a, (e: T) => {
      const rk = fn(e);
      const arr = ret[rk] || [];
      arr.push(e);
      ret[rk] = arr;
    });
    return ret;
  }

  /**
   * 提取数组中每个元素的指定属性值到一个数组中
   * @param a {Array<T>} 数组
   * @param k {string} 元素中的属性名
   * @return {Array<P>} 属性值数组
   */
  export function mapProp<T extends StringKeysJson<any>, P>(a: Array<T>, k: string): Array<P> {
    const pa: P[] = [];
    foreach(a, (e: T) => {
      if (validators.notNullOrUndefined(e[k])) {
        pa.push(e[k] as P);
      }
    });
    return pa;
  }

  /**
   * 去重复
   * @param arr {Array<T>>} 数组
   * @param [cover=true] 是否对arr产生副作用
   * @return arr数组
   */
  export function unique<T>(arr: Array<T>, cover = true): Array<T> {
    const tmp = utils.or(arr, []);
    if (undefined === tmp) {
      return [];
    }

    const uniqueArr: T[] = [];
    arr.forEach(e => !uniqueArr.includes(e) && uniqueArr.push(e));

    if (cover) {
      arr.length = 0;
      concat(arr, uniqueArr);
    }

    return arr;
  }

  /**
   * 按指定属性值去重复
   * @param arr {Array<T>} 目标数组
   * @param func {StringOrIdableConvertor<T>} 属性名或ID提取器函数
   * @return {Array<T>} 处理后无序数组
   */
  export function uniqueBy<T>(arr: Array<T>, func: StringOrIdableConvertor<T>): Array<T> {
    return Object.values(toMap(arr, func));
  }

  /**
   * 数组合并
   * @param dist {Array<T>} 目标数组
   * @param otherArr {Array<Array<T>>} 源数组
   * @return {Array<T>} 目标数组
   */
  export function merge<T>(dist: Array<T>, ...otherArr: Array<Array<T>>): Array<T> {
    if (!validators.isEmpty(otherArr)) {
      foreach(otherArr, arr => concat<T>(dist, arr));
    }
    return dist;
  }

  /**
   * 元素查找
   * @param arr 数组
   * @param proc 匹配器
   */
  export function fetch<T>(arr: Array<T>, proc: IDataProcessor<T, boolean>): { element: T, index: number } {
    const data = {element: arr[arr.length - 1], index: arr.length - 1};
    foreach(arr, (e, i) => {
      if (proc(e)) {
        data.element = e;
        data.index = i;
        return false;
      }
    });
    return data;
  }

  /**
   * 把对象按值对键进行分组
   * @param obj 对象
   * @param mapper 值映射器, 返回的数据key
   */
  export function groupByValue<T>(obj: StringKeysJson<T>,
                                  mapper?: funcs.IDataProcessor<T, string>): StringKeysJson<string[]> {
    const ret: StringKeysJson<string[]> = {};

    const $mapper: Function = mapper || strings.toString;
    utils.foreach(obj, (v, k) => {
      const sv = $mapper(v);
      const group = ret[sv] || [];
      group.push(k);
      ret[sv] = group;
    });

    return ret;
  }

  /**
   * 生成一组连续值数组. 如果 <i> start >= end</i> 总是返回0长度数组.
   * @param start 开始值(包含)
   * @param end 结束值(包含)
   * @return 数组长度: end - start + 1
   */
  export function genNums(start: number, end: number): number[] {
    if (0 >= end - start) {
      return [];
    }

    let keyIter = new Array(end + 1).keys();
    return [...keyIter].slice(start);
  }

  /**
   * 树形映射
   * @param arr 目标数组(会被直接改变)
   * @param [childKey = 'children'] 子节点在父节点的属性名, 覆盖现有属性名会报错.
   * @param [parentIndex = 'parent'] 子节点指向父节点属性名.
   * @param [parentKey = 'id'] 被子节点指向的父节点属性名.
   * @param [onlyRoot=false] 是否从根节点移除所有子节点.
   */
  export function tree<T>(arr: T[],
                          childKey = 'children',
                          parentIndex = 'parent',
                          parentKey = 'id',
                          onlyRoot = false): T[] {

    // 按parentKey映射所有节点
    let keyMapper: { [s: string]: T } = arrays.toMap(arr, parentKey);

    // 所有子节点映射值
    let childrenIds: string[] = [];

    arrays.foreach(arr, (e: any) => {
      let pid = e[parentIndex];
      let parent: any = keyMapper[pid];
      if (!parent) return;

      childrenIds.push(e[parentKey]);
      let children = parent[childKey] || [];
      children.push(e);
      parent[childKey] = arrays.unique(children);
    });

    // 移除子节点
    if (onlyRoot) {
      arrays.foreach(childrenIds, idKey => {
        delete keyMapper[idKey];
      });
    }

    return Object.values(keyMapper);
  }
}