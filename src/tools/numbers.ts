// 数值工具
export namespace numbers {

  export enum NumberFormatType {
    CURRENCY,
  }

  /**
   * 数字格式化
   * @param num 数字值
   * @param type 格式类型
   */
  export function format(num: number, type: NumberFormatType = NumberFormatType.CURRENCY): string {
    switch (type) {
      case numbers.NumberFormatType.CURRENCY: {
        return num.toLocaleString('zh-Hans-CN', {currency: 'CNY'});
      }
    }
  }

}