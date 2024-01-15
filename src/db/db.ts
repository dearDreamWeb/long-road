import Dexie, { Table } from 'dexie';

export enum TypeEnum {
  Buy = 0,
  FindProtect = 1,
  FindBackTo = 2,
  FindDuel = 3,
  Logger = 4,
  WinLevel = 5,
  WinDuel = 6,
  LoseDuel = 7,
  LoseLevel = 8,
  TieDuel = 9,
}

export interface LoggerTableItem {
  id?: number;
  type: TypeEnum;
  content: string;
  level: number;
  createdAt: Date;
  updateAt: Date;
}

export interface ProgressTableItem {
  id?: number;
  name: string;
  coins: number;
  level: number;
  viewDistance: number;
  purifyCount: number;
  isReverse: boolean;
  createdAt: Date;
  updateAt: Date;
  logger: LoggerTableItem[];
}

export class DB extends Dexie {
  progress!: Table<ProgressTableItem>;
  logger!: Table<LoggerTableItem>;

  constructor() {
    super('LongLoad');

    this.version(1).stores({
      progress: '++id,createdAt',
      logger: '++id,createdAt',
    });
  }
}

export const db = new DB();
