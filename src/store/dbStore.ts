import {
  action,
  makeAutoObservable,
  observable,
  configure,
  computed,
} from 'mobx';
import { TextureCacheObj, PunishEnum } from '@/typings';
import message from '@/components/message/message';
import { MINVIEWDISTANCE } from '@/const';
import { db, ProgressTableItem, LoggerTableItem, TypeEnum } from '@/db/db';
import roleStore from '@/store/roleStore';
import globalStore from '@/store/store';
import dayjs from 'dayjs';

configure({ enforceActions: 'never' });

class DbStore {
  /**日志列表 */
  loggerList: LoggerTableItem[] = [];
  /**进度列表*/
  progressList: ProgressTableItem[] = [];

  currentProgressIndex = -1;

  constructor() {
    makeAutoObservable(this);
  }

  /** 获取日志*/
  @action
  async getLogger() {
    try {
      const res = await db.logger.orderBy('createdAt').toArray();
      this.loggerList = res || [];
      return;
    } catch (e) {
      console.error('getLogger', e);
      this.loggerList = [];
      return;
    }
  }

  /**添加日志 */
  @action
  async addLogger(
    data:
      | Omit<LoggerTableItem, 'level' | 'createdAt' | 'updateAt'>
      | LoggerTableItem[]
  ) {
    const now = dayjs();
    await db.logger.bulkAdd(
      Array.isArray(data)
        ? JSON.parse(JSON.stringify(data))
        : JSON.parse(
            JSON.stringify([
              {
                ...data,
                level: globalStore.level,
                createdAt: now,
                updateAt: now,
              },
            ])
          )
    );
    await this.getLogger();
    return;
  }

  /**清除日志 */
  @action
  async clearLogger() {
    await db.logger.clear();
    await this.getLogger();
    return;
  }

  /** 获取进度*/
  @action
  async getProgress() {
    try {
      const res = await db.progress.orderBy('createdAt').toArray();
      if (!res.length) {
        await this.addProgress(dayjs().format('YYYYMMDDHHmmss'));
      } else {
        this.progressList = res || [];
      }
    } catch (e) {
      console.error('getLogger', e);
      this.progressList = [];
    }
    return;
  }

  /**添加进度 */
  @action
  async addProgress(name: string) {
    const nowDate = new Date();
    const data: ProgressTableItem = {
      name,
      level: globalStore.level,
      coins: roleStore.coins,
      purifyCount: roleStore.purifyCount,
      isReverse: roleStore.isReverse,
      viewDistance: roleStore.viewDistance,
      createdAt: nowDate,
      updateAt: nowDate,
      logger: this.loggerList,
    };
    await db.progress.bulkAdd(JSON.parse(JSON.stringify([data])));
    await this.getProgress();
    return;
  }

  /**清除进度 */
  @action
  async clearProgress() {
    await db.progress.clear();
    await this.getProgress();
    return;
  }

  /**保存进度 */
  @action
  async saveProgress() {
    const nowDate = new Date();
    const data: Omit<ProgressTableItem, 'name' | 'createdAt'> = {
      coins: roleStore.coins,
      level: globalStore.level,
      purifyCount: roleStore.purifyCount,
      isReverse: roleStore.isReverse,
      viewDistance: roleStore.viewDistance,
      updateAt: nowDate,
      logger: this.loggerList,
    };
    try {
      const id = this.progressList[this.currentProgressIndex]?.id;
      if (!id) {
        message.error('保存进度失败');
        return;
      }
      await db.progress.update(id, JSON.parse(JSON.stringify(data)));
    } catch (e) {
      console.error(e);
      message.error('保存进度失败');
    }
    return;
  }

  /**读取进度 */
  @action
  async loadingProgress(id?: number) {
    if (typeof id === 'number') {
      this.currentProgressIndex = id;
    }

    const data = this.progressList[this.currentProgressIndex];
    const { level, coins, purifyCount, isReverse, viewDistance, logger } = data;
    await this.clearLogger();
    if (logger.length) {
      await this.addLogger(logger);
    }
    globalStore.level = level;
    roleStore.coins = coins;
    roleStore.purifyCount = purifyCount;
    roleStore.isReverse = isReverse;
    roleStore.viewDistance = viewDistance;
    return;
  }

  /**初始化配置 */
  async init() {
    await this.getProgress();
    const currentProgressIdLocal = localStorage.getItem('currentProgressIndex');
    if (
      typeof currentProgressIdLocal === 'string' &&
      typeof Number(currentProgressIdLocal) === 'number'
    ) {
      this.currentProgressIndex = Number(currentProgressIdLocal);
    } else {
      localStorage.setItem('currentProgressIndex', '0');
      this.currentProgressIndex = 0;
    }

    await this.loadingProgress();
    return;
  }
}

const dbStore = new DbStore();

export default dbStore;
