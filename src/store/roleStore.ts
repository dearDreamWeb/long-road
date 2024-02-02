import { action, makeAutoObservable, observable, configure } from 'mobx';
import { TextureCacheObj, PunishEnum } from '@/typings';
import message from '@/components/message/message';
import { MINVIEWDISTANCE } from '@/const';
import * as PIXI from 'pixi.js';

configure({ enforceActions: 'never' });

export const DEDAULTVALUES = {
  coins: 100,
  purifyCount: 0,
  isReverse: false,
  viewDistance: 5,
};

class RoleStore {
  /**视野距离 */
  viewDistance = DEDAULTVALUES.viewDistance;
  /**人物textures */
  heroTextures: TextureCacheObj = { left: [], right: [], up: [], down: [] };
  /**人物组帧动画精灵图 */
  animatedSprite: PIXI.AnimatedSprite | any = {};
  /**人物方向 */
  direction: keyof TextureCacheObj = 'down';
  /**是否反向 */
  isReverse = DEDAULTVALUES.isReverse;
  /**净化次数 */
  purifyCount = DEDAULTVALUES.purifyCount;
  /**金币 */
  coins = DEDAULTVALUES.coins;
  /**主角当前位置 */
  mainPosition = {
    x: 12,
    y: 24,
  };
  /**主角一开始的位置 */
  mainInitPosition = {
    x: 0,
    y: 0,
  };
  /**终点 */
  endRect = {
    x: 12,
    y: 0,
  };
  /**每次遇怪的步数间隔 */
  duelIntervalSteps = 0;

  constructor() {
    makeAutoObservable(this);
  }

  /**新的视野范围 */
  @action
  getNewView(type: 'add' | 'reduce') {
    if (type === 'add') {
      this.viewDistance++;
      return;
    }
    this.viewDistance = Math.max(this.viewDistance - 1, MINVIEWDISTANCE);
  }

  /**初始化角色状态 */
  @action
  initRole() {
    this.viewDistance = 5;
    this.isReverse = false;
    this.purifyCount = 0;
    this.direction = 'down';
  }
}

const roleStore = new RoleStore();

export default roleStore;
