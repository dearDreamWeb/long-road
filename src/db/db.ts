import Dexie, { Table } from 'dexie';

export enum TypeEnum {
  /**购买 */
  Buy = 0,
  /**保护罩 */
  FindProtect = 1,
  /**回到过去 */
  FindBackTo = 2,
  /** 遇怪 */
  FindDuel = 3,
  /**日志 */
  Info = 4,
  /**过了一关 */
  WinLevel = 5,
  /**游戏赢了 */
  WinDuel = 6,
  /**游戏输了 */
  LoseDuel = 7,
  /**游戏结束 */
  LoseLevel = 8,
  /**平局 */
  TieDuel = 9,
}

export interface LoggerTableItem {
  id?: number;
  type: TypeEnum;
  content: string;
  weeks: number;
  level: number;
  createdAt: Date;
  updateAt: Date;
  focus?: string;
}

export interface ProgressTableItem {
  id?: number;
  name: string;
  coins: number;
  weeks: number;
  level: number;
  viewDistance: number;
  purifyCount: number;
  isReverse: boolean;
  // isRoad: boolean;
  createdAt: Date;
  updateAt: Date;
  logger: LoggerTableItem[];
}

export class DB extends Dexie {
  progress!: Table<ProgressTableItem>;
  logger!: Table<LoggerTableItem>;

  constructor() {
    super('LongLoad');

    this.version(1.1).stores({
      progress: '++id,createdAt,updateAt',
      logger: '++id,createdAt,updateAt',
    });
  }
}

export const db = new DB();
