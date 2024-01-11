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
import { db, ProgressTableItem, LoggerTableItem } from '@/db/db';
import roleStore from '@/store/roleStore';
import globalStore from '@/store/store';
import dayjs from 'dayjs';

configure({ enforceActions: 'never' });

class DbStore {
  /**日志列表 */
  loggerList: LoggerTableItem[] = [];
  /**进度列表*/
  progressList: ProgressTableItem[] = [];

  currentProgressId = -1;

  constructor() {
    makeAutoObservable(this);
  }

  /** 获取日志*/
  @action
  async getLogger() {
    try {
      const res = await db.logger.orderBy('createdAt').reverse().toArray();
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
  async addLogger(data: LoggerTableItem | LoggerTableItem[]) {
    await db.transaction('rw', [db.logger], async () => {
      await db.logger.bulkAdd(Array.isArray(data) ? data : [data]);
    });
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
      const res = await db.progress.orderBy('createdAt').reverse().toArray();
      if (!res.length) {
        this.addProgress(dayjs().format('YYYYMMDDHHmmss'));
      }
      this.progressList = res || [];
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
    await db.progress.bulkAdd([data]);
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
      await db.progress.update(this.currentProgressId, data);
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
      this.currentProgressId = id;
    }
    const data = this.progressList[this.currentProgressId];
    const { level, coins, purifyCount, isReverse, viewDistance, logger } = data;
    await this.clearLogger();
    await this.addLogger(logger);
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
    const currentProgressIdLocal = localStorage.getItem('currentProgressId');
    if (typeof Number(currentProgressIdLocal) === 'number') {
      this.currentProgressId = Number(currentProgressIdLocal);
    } else {
      localStorage.setItem('currentProgressId', '0');
      this.currentProgressId = 0;
    }
    await this.loadingProgress();
  }
}

const dbStore = new DbStore();

export default dbStore;
