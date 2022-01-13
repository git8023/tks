// 校验工具
import {PrimaryTypeString} from "@/type/types";
import {utils} from "./utils";

export namespace validators {

  /**
   * 校验一系列值是否为不可用的值(null/undefined)
   * @param vs 值列表
   * @returns true-全部都是null/undefined, false-当找到至少一个不是null/undefined
   */
  export function nullOrUndefined(...vs: any[]): boolean {
    for (const vsKey in vs) {
      if (!isNullOrUndefined(vs[vsKey])) {
        return false;
      }
    }
    return true;
  }

  /**
   * 校验单个值是否为null/undefined
   * @param v 目标值
   * @returns true-目标值是null/undefined, false-目标值不是null/undefined
   */
  export function isNullOrUndefined(v: any): boolean {
    return null === v || undefined === v;
  }

  /**
   * 校验指定值是否已定义(非null/undefined)
   * @param v 目标值
   * @returns true-值已定义, false-值未定义
   */
  export function notNullOrUndefined(v: any): boolean {
    return !isNullOrUndefined(v);
  }

  /**
   * 校验目标值是否真值
   * @param v 目标值
   * @returns true-目标值为真值, false-目标值为假值
   */
  export function isTruthy(v: any): boolean {
    return !isFalsy(v);
  }

  /**
   * 校验目标值是否假值
   * @param v 目标值
   * @returns true-目标值为假值 false-目标值为真值,
   */
  export function isFalsy(v: any): boolean {
    return !v;
  }

  /**
   * 校验是否为指定类型
   * @param v 目标值
   * @param type 类型
   */
  export function is(v: any, type: PrimaryTypeString): boolean {
    return (`[object ${type}]` === Object.prototype.toString.call(v));
  }

  /**
   * 校验是否不是指定类型
   * @param v {any} 值
   * @param type {PrimaryTypeString} 类型
   * @return 如果是指定类型返回true, 否则返回false
   */
  export function isNot(v: any, type: PrimaryTypeString): boolean {
    return !is(v, type);
  }

  /**
   * 校验对象是否为: null/undefined/空字符串/空数组/空对象
   * @param o {T} 被校验对象
   * @return {boolean}
   */
  export function isEmpty<T>(o: T): boolean {
    if (isNullOrUndefined(o)) {
      return true;
    }

    if (utils.or(is(o, 'Array'), is(o, 'String'))) {
      // @ts-ignore
      return 0 === o.length;
    }

    if (is(o, 'Object')) {
      // @ts-ignore
      return 0 === Object.keys(o).length;
    }

    return false;
  }

  /**
   * 校验对象是否不为: null/undefined/空字符串/空数组/空对象
   * @param o {T} 被校验对象
   * @return {boolean}
   * @see validators.isEmpty
   */
  export function notEmpty<T>(o: T): boolean {
    return !isEmpty(o);
  }

  /**
   * 校验两个对象是否具有相同属性
   * <pre>
   * isEq(null, null);        // true
   * isEq(null, undefined);   // true
   *
   * let b = a;
   * isEq(a, b);    // true
   *
   * leb b = JSON.parse(JSON.stringify(a));
   * isEq(a, b);    // true
   *
   * </pre>
   * @param a 对象a
   * @param b 对象b
   * @return 校验通过返回true, 否则返回false
   */
  export function isEq(a: any, b: any): boolean {

    // same reference or primary value
    if (a === b) {
      return true;
    }

    // null or undefined
    if (null == a || null == b) {
      return a == b;
    }

    // other
    return JSON.stringify(a) == JSON.stringify(b);
  }
}