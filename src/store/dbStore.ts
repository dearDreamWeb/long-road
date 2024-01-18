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
import { sleep } from '@/utils';

configure({ enforceActions: 'never' });

class DbStore {
  /**日志列表 */
  loggerList: LoggerTableItem[] = [];
  /**进度列表*/
  progressList: ProgressTableItem[] = [];
  /**当前进度的id */
  currentProgressId = -1;

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
    const now = dayjs().toDate();
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
      const res = await db.progress.orderBy('updateAt').reverse().toArray();
      if (!res.length) {
        await this.addProgress();
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
  async addProgress(name?: string) {
    const nowDate = new Date();
    const data: ProgressTableItem = {
      name: name || dayjs().format('YYYYMMDDHHmmss'),
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

  @action
  async updateProgress(id: number, data: Partial<ProgressTableItem> = {}) {
    try {
      await db.progress.update(
        id,
        JSON.parse(JSON.stringify({ ...data, updateAt: dayjs().toDate() }))
      );
      await this.getProgress();
    } catch (e) {
      console.error('updateProgress error', e);
    }
    return;
  }

  /**清除进度 */
  // @action
  // async clearProgress() {
  //   await db.progress.clear();
  //   await this.getProgress();
  //   return;
  // }

  /**删除进度 */
  @action
  async deleteProgress(id: number) {
    await db.progress.delete(id);
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
      const id = this.currentProgressId;
      if (id < 0) {
        message.error('保存进度失败');
        return;
      }
      await db.progress.update(id, JSON.parse(JSON.stringify(data)));
      await this.getProgress();
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

    const data = this.progressList.find(
      (item) => item.id === this.currentProgressId
    );
    if (!data) {
      console.error('读取进度失败...');
      return;
    }
    const { level, coins, purifyCount, isReverse, viewDistance, logger } = data;

    await this.clearLogger();

    if (logger.length) {
      await this.addLogger(logger);
    }

    await this.updateProgress(this.currentProgressId);

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
    if (!this.progressList.length) {
      await sleep(1000);
    }
    const currentProgressIdLocal = localStorage.getItem('currentProgressId');
    if (
      typeof currentProgressIdLocal === 'string' &&
      typeof Number(currentProgressIdLocal) === 'number'
    ) {
      this.currentProgressId = Number(currentProgressIdLocal);
    } else {
      localStorage.setItem(
        'currentProgressId',
        String(this.progressList[0].id!)
      );
      this.currentProgressId = this.progressList[0].id!;
    }

    await this.loadingProgress();
    return;
  }
}

const dbStore = new DbStore();

export default dbStore;
