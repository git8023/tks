// 字符串工具类
import {utils} from "./utils";
import {arrays} from "./arrays";
import {validators} from "./validators";

export namespace strings {

  /**
   * 字符串替换
   * @param s {string} 字符串
   * @param cfg {[s:string]:string} 属性名:正则表达式分组字符串, 属性值:要替换的值
   */
  export function replaceAll(s = '', cfg: { [s: string]: string } = {}): string {
    let tmp = s;
    utils.foreach(cfg, (v, k) => {
      const regExp = new RegExp(k, 'g');
      tmp = tmp.replace(regExp, v);
    });
    return tmp;
  }

  /**
   * 校验是否包含空字符串
   * @param [useTrim=true] {boolean}
   * @param arr {string[]} 被检测字符串
   * @return {boolean} 包含至少一个空字符串返回true, 否则返回false
   */
  export function hasBlank(useTrim = true, ...arr: string[]): boolean {
    let isFoundBlank = false;
    arrays.foreach(arr, e => {
      if (isBlank(e, useTrim)) {
        isFoundBlank = true;
        return false;
      }
    });
    return isFoundBlank;
  }

  /**
   * 空字符串校验
   * @param s {string} 字符串
   * @param [useTrim=true] {boolean} 是否去除两端空格
   * @return {boolean} 空字符串返回true, 否则返回false
   */
  export function isBlank(s: string, useTrim = true): boolean {
    if (!validators.is(s, 'String')) {
      return false;
    }

    if (validators.isNullOrUndefined(s)) {
      return true;
    }

    if (useTrim) {
      s = s.trim();
    }
    return 0 === s.length;
  }

  /**
   * 生成唯一ID
   * @return {string} 唯一字符串
   */
  export function guid(): string {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  }

  /**
   * 对象转string
   * @param o 对象
   */
  export function toString(o: any): string {
    return `${o}`;
  }

  /**
   * 去掉两端空格, s为null/undefined时返回''
   * @param s 源字符串
   */
  export function trimToEmpty(s: string): string {
    if (validators.isNullOrUndefined(s)) {
      return '';
    }
    return s.toString().trim();
  }

  /**
   * HTML内容转义为普通文本
   * @param html HTML内容
   * @return HTML转义后字符串
   */
  export function html2text(html: any): string {
    let temp: any = document.createElement("div");
    (temp.textContent != null) ? (temp.textContent = html) : (temp.innerText = html);
    const output = temp.innerHTML;
    temp = null;
    return output
  }

  /**
   * 普通文本转HTML内容
   * @param text 普通文本
   * @return HTML标签(转义后)还原
   */
  export function text2html(text: any): string {
    let temp: any = document.createElement("div");
    temp.innerHTML = text;
    const output = temp.innerText || temp.textContent;
    temp = null;
    return output;
  }
}