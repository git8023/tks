// 日期工具
import {arrays} from "./arrays";
import {utils} from "./utils";
import {validators} from "./validators";

export namespace dates {

  /**
   * 解析日期字符串或格式化为另一种日期规则字符串
   * @param {string} dateStr 源日期字符串
   * @param {string} inFmt 源日期字符串格式
   * @param {string} [outFmt=undefined] 输出日期字符串格式
   * @return {Date | string} 当指定outFmt时输出日期字符串, 否则返回日期对象
   */
  export function datePoF(dateStr: string, inFmt: string, outFmt?: string): Date | string | null {
    const d = dateParse(dateStr, inFmt);
    // @ts-ignore
    if (d && validators.is(outFmt, "String") && outFmt.trim().length) {
      return dateFmt(d, <string>outFmt);
    }
    return d;
  }

  /**
   * 解析日期字符串
   * @param {string} dateStr 源日期字符串
   * @param {string} pattern 解析规则(yMDhmsS)
   * @return {Date | null} 解析成功返回日期对象, 否则返回null
   */
  export function dateParse(dateStr: string, pattern: string): Date | null {
    let metaPatterns = {
      /**
       * 元规则决策表, 每项决策中会新增三个属性:
       * <p>
       * beginIndex: {Number}<br>
       * pLength: {Number}<br>
       * original: {String}
       * </p>
       */
      metas: {
        /** 年规则 */
        y: <any>{
          name: "Year",
          setYear: function (date: Date) {
            date.setFullYear(this.original || 0);
          }
        },
        /** 月规则 */
        M: <any>{
          name: "Month",
          setMonth: function (date: Date) {
            date.setMonth(isNaN(this.original) ? 0 : (this.original - 1));
          }
        },
        /** 月中的天数规则 */
        d: <any>{
          name: "Day",
          setDay: function (date: Date) {
            date.setDate(this.original || 0);
          }
        },
        /** 小时规则 */
        h: <any>{
          name: "Hour",
          setHour: function (date: Date) {
            date.setHours(this.original || 0);
          }
        },
        /** 分钟规则 */
        m: <any>{
          name: "Minute",
          setMinute: function (date: Date) {
            date.setMinutes(this.original || 0);
          }
        },
        /** 秒规则 */
        s: <any>{
          name: "Second",
          setSecond: function (date: Date) {
            date.setSeconds(this.original || 0);
          }
        },
        /** 毫秒规则 */
        S: <any>{
          name: "Millisecond",
          setMillisecond: function (date: Date) {
            date.setMilliseconds(this.original || 0);
          }
        }
      },

      /**
       * 设值
       * @param date {Date|*} 目标日期
       * @returns {Date} 修改后日期
       */
      setValues: function (date: Date) {
        this.metas.y.setYear(date);
        this.metas.M.setMonth(date);
        this.metas.d.setDay(date);
        this.metas.h.setHour(date);
        this.metas.m.setMinute(date);
        this.metas.s.setSecond(date);
        this.metas.S.setMillisecond(date);
        return date;
      },

      /**
       * 校验器
       * @param orgiDateStr {String} 日期字符串
       * @param tgtPattern {String} 解析规则
       * @returns {Boolean} true-解析成功, false-规则不能匹配日期字符串
       */
      validate: function (orgiDateStr: string, tgtPattern: string) {
        let
          NUMBER_PATTERN = "\\d",
          MX_PATTERN = "\\d+",
          replacedPattern = (tgtPattern || "") + "";
        if (!replacedPattern) return false;

        // 记录当前所能支持的所有元字符
        let metasStr: string[] = [];
        utils.foreach(this.metas, (opt, key) => {
          metasStr.push(key);
        });

        // 替换pattern中年月日时分秒的字符为\d
        replacedPattern = replacedPattern.replace(/\//g, "\\/");
        arrays.foreach(metasStr, meta => {
          replacedPattern = replacedPattern.replace(eval("(/" + meta + "/g)"), "S" === meta ? MX_PATTERN : NUMBER_PATTERN);
        });
        replacedPattern = replacedPattern.replace(/\\\\/g, "\\").replace(/[\/]/g, "\/");

        // 使用替换后的pattern校验dateStr是否有效
        let result = eval("(/^" + replacedPattern + "$/)").test(orgiDateStr);
        if (result) {
          let _this: any = this;
          // 校验通过, 按顺序设置元规则开始索引和值
          // > 按元规则分组
          let metasGroup = metasStr.join("");
          // /([yMdhms])\1*/g: 提取的元规则
          let groupRegExp = eval("(/([" + metasGroup + "])\\1*/g)");
          // 替换掉日期字符串分隔符字符
          let onlyNumberDateStr = orgiDateStr.replace(/[^\d]+/g, "");
          // 把原pattern中的年月日时分秒解为有序的正则表达式数组,
          let originValueIndex = 0;
          utils.foreach(tgtPattern.match(groupRegExp), function (metaGroup) {
            // :> 设置每个组的 beginIndex, pLength, original
            let meta = _this.metas[metaGroup[0]];
            meta.beginIndex = tgtPattern.indexOf(metaGroup);
            meta.pLength = metaGroup.length;
            if ("S" !== metaGroup[0])
              meta.original = onlyNumberDateStr.substring(originValueIndex, (originValueIndex + meta.pLength));
            else
              meta.original = onlyNumberDateStr.substring(originValueIndex);
            originValueIndex += meta.pLength;
          });
        }
        return result;
      }
    };

    let success = metaPatterns.validate(dateStr, pattern);
    return success ? metaPatterns.setValues(new Date()) : null;
  }

  /**
   * 日期格式化
   * @param {Date | number} date 日期对象或毫秒值
   * @param [format] {string} 格式化规则, 默认: yyyy-MM-dd HH:mm:ss
   * @return {string | undefined} 成功返回日期字符串, 否则返回undefined
   */
  export function dateFmt(date: Date | number | string, format?: string): string {
    function formatter(format: string) {
      // @ts-ignore
      const $this: Date = <Date>this;
      format = (format || 'yyyy-MM-dd HH:mm:ss');
      const time = $this.getTime();
      if (isNaN(time)) {
        return;
      }
      const o: { [s: string]: number } = {
        'M+': $this.getMonth() + 1,
        'd+': $this.getDate(),
        'H+': $this.getHours(),
        'm+': $this.getMinutes(),
        's+': $this.getSeconds(),
        'q+': Math.floor(($this.getMonth() + 3) / 3),
        'S': $this.getMilliseconds()
      };

      if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, ($this.getFullYear() + '').substr(4 - RegExp.$1.length));
      }

      for (const k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
          if (RegExp.$1['length'] === 1) {
            format = format.replace(RegExp.$1, o[k].toString());
          } else {
            format = format.replace(RegExp.$1, ('00' + o[k]).substr(o[k].toString().length));
          }
        }
      }
      return format;
    }

    if (validators.isNullOrUndefined(date)) {
      return '';
    }
    if (validators.is(date, 'Number')) {
      date = new Date(date);
    } else if (validators.is(date, 'String')) {
      date = new Date(date);
    }
    if (!validators.is(date, 'Date')) {
      throw 'Error Type: Parameters \'date\' must be a Date type';
    }
    // @ts-ignore
    return formatter.call(date, format);
  }

  /**
   * 比较两个日期
   * @param {Date} d1 第一个日期
   * @param {Date} d2 第二个日期
   * @return {number} 正数:d1>d2, 0:d1=d2, 负数:d1<d2, NaN:d1无效
   */
  export function dateDiff(d1: Date, d2 = new Date()): number {
    if (!(validators.is(d1, 'Date') && validators.is(d2, 'Date'))) {
      return NaN;
    }
    return (d1.getTime() - d2.getTime());
  }

  /**
   * 格式化输出当前时间
   * @param format 日期格式
   * @return 日期格式字符串
   */
  export function nowFmt(format?: string): string {
    return dateFmt(new Date(), format);
  }
}