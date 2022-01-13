// 函数接口方式定义
export namespace funcs {

  /**
   * 数据消费者
   *
   * 处理完成后不需要处理结果
   *
   * T - 待处理数据类型
   *
   * @param res {?} 待处理数据
   */
  export interface IDataConsumer<T> {
    (res: T): void
  }

  /**
   * 数据处理器<br>
   * 处理完成后需要返回处理结果<br>
   * I - 输入数据类型<br>
   * O - 输出数据类型<br>
   * @param res 输入数据
   */
  export interface IDataProcessor<I, O> {
    (res: I): O
  }

  /**
   * 过程处理器
   *
   * 过程处理不需要输入/输出数据
   */
  export interface IProcessor {
    (): void
  }

  /**
   * 数据生产者
   *
   * @param T 产品类型
   */
  export interface IProducer<T> {
    (): T
  }
}

// 接口定义
export namespace ifacer {


  /**
   * 可被查询接口
   */
  export interface IFetchable<K, V> {

    /**
     * 通过关键字查询目标值
     * @param key 关键字
     * @param [def] 查询失败默认值
     * @return 查询结果处理器
     */
    fetch(key: K, def: V): IFetchHandler<V>;
  }

  /**
   * 查询结果处理器
   *
   * T - 数据类型
   */
  export interface IFetchHandler<T> {

    /**
     * 获取原始数据对象
     */
    value(): T;

    /**
     * 处理数据
     * @param proc 数据处理接口
     */
    handle<R>(proc: funcs.IDataProcessor<T, R>): R;
  }

  /**
   * 事件注册中心
   *
   * 实现类需要自定义事件处理器缓存仓库
   */
  export interface IEventRegistry<K> {

    /**
     * 注册事件
     * @param type 事件类型
     * @param proc 事件数据处理器. 处理成功返回true, 其余返回值认为处理失败
     * @return 注册中心
     */
    register<T>(type: K, proc: funcs.IDataConsumer<T>): IEventRegistry<K>;

  }

  /**
   * 日志等级
   */
  export enum LogLevel {
    TRACE,
    DEBUG,
    INFO,
    WARN,
    ERROR,
    FATAL,
    OFF,
  }

  /**
   * 日志记录接口
   */
  export interface ILogger {

    /**
     * 日志等级
     *
     * 屏蔽当前等级以下的日志:
     *
     * TRACE > DEBUG > INFO > WARN > ERROR > FATAL
     *
     * 默认: DEBUG
     */
    level: LogLevel;

    /**
     * 消息缓存数量
     *
     * 默认: 200
     */
    cacheSize: number;

    /**
     * 是否打印调用堆栈
     *
     * 默认: false, level==LogLevel.DEBUG 时默认true
     */
    enableTrace: boolean;

    trace(...args: any[]): void;

    debug(...args: any[]): void;

    info(...args: any[]): void;

    warn(...args: any[]): void;

    error(...args: any[]): void;

    fatal(...args: any[]): void;

  }
}
