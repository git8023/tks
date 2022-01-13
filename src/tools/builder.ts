// 函数构造器
import {AttachHandler, NumberGenerator, Processor, PropertyExtractor, SortHandler} from "@/type/types";

export namespace builder {

  /**
   * 构建数组排序接口
   * @param [toNum] {NumberGenerator<T>} 对象到数值转换器
   * @return {SortHandler<T>} 排序转换器
   */
  export function sort<T>(toNum: NumberGenerator<T>): SortHandler<T> {
    return (a: T, b: T) => toNum(a) - toNum(b);
  }

  /**
   * 属性提取接口
   * @param [prop='id'] {string} 属性名称
   * @return {PropertyExtractor<T, R>} 属性提取函数
   */
  export function extra<T, R>(prop = 'id'): PropertyExtractor<T, R> {
    // @ts-ignore
    return (e: StringKeysJson<any>) => (e[prop] as R);
  }

  /**
   * 字符串属性值提取接口
   * @param [prop='id'] {string} 属性名称
   * @return {PropertyExtractor<T, string>} 属性提取函数
   */
  export function extraString<T>(prop = 'id'): PropertyExtractor<T, string> {
    return extra<T, string>(prop);
  }

  /**
   * 属性附加处理接口
   * @param v {V} 附加值
   * @param prop {string} 索引
   * @return {AttachHandler<T, V>} 属性附加接口
   */
  export function attach<T, V>(v: V, prop: string): AttachHandler<T, V> {
    return (e: T) => {
      // @ts-ignore
      e[prop] = v;
      return e;
    };
  }

  /**
   * 懒加载
   * @param action {Function} 动作. 要使用this必须手动绑定 action.bind(this)
   * @param [wait=3000] {number} 等待时长, 单位毫秒
   * @param [times=1] {number} 执行次数. 小于1无限制
   * @return {Processor} 过程处理(无参数, 无返回值)
   */
  export function lazy(action: Function, wait = 1000, times = 1): Processor {
    const infinity = (0 >= times);
    return () => {
      setTimeout(() => {
        action();
        if (!infinity && (--times <= 0)) {
          return;
        }
        lazy(action, wait, times);
      }, wait);
    };
  }
}