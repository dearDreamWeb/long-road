import {
  action,
  makeAutoObservable,
  observable,
  configure,
  computed,
} from 'mobx';
import {
  BgLayoutItemType,
  Status,
  GameResultStatus,
  PunishEnum,
  AwardEnum,
} from '@/typings';
import message from '@/components/message/message';
import { GRIDROWS, MINVIEWDISTANCE, MAXEWDISTANCE } from '@/const';
import * as PIXI from 'pixi.js';
import { sound, Sound, SoundMap, SoundSourceMap } from '@pixi/sound';
import roleStore from './roleStore';
import config, { Audios, Config } from '@/config';
import level1 from '@/assets/levels/level-1.json';
import level2 from '@/assets/levels/level-2.json';
import level3 from '@/assets/levels/level-3.json';
import level4 from '@/assets/levels/level-4.json';
import { sleep } from '@/utils';
import { GlowFilter } from '@pixi/filter-glow';
import { buyStage } from '@/utils/stage';

export type AudioResources = Record<keyof Audios, Sound>;
interface Settings {
  switchAudio: boolean;
  volume: number;
  bgVolume: number;
  clickVolume: number;
}

configure({ enforceActions: 'never' });

const levelMap: any = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
};

class GlobalStore {
  // 关卡
  level = 1;
  // 游戏状态
  status: Status = 0;
  // 二维数组
  bgLayout: BgLayoutItemType[][] = [[]];
  // 对局显示
  showGameModal = false;
  // 对局是否结束
  isEnd = false;
  // 文件资源
  audioResources: AudioResources = {} as any;
  // 加载文案
  loadingText = '';
  // 显示加载
  loadResources = false;
  // 加载进度
  loadResourcesProgress = 0;
  // 道具材质
  toolsTextures: PIXI.Texture<PIXI.Resource>[] = [];
  // 游戏设置
  settings: Settings = {
    switchAudio: false,
    volume: 0.5,
    bgVolume: 0.5,
    clickVolume: 0.5,
  };
  // 主画布
  gameApp: PIXI.Application | null = null;
  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  /**更新设置 */
  @action
  setSettings(value: Settings) {
    this.settings = value;
    localStorage.setItem('settings', JSON.stringify(value || {}));
  }

  /**初始化游戏场景 */
  @action
  async init(_app?: PIXI.Application) {
    try {
      if (this.level >= Object.keys(levelMap).length) {
        message.success('恭喜你，通关完成！！！');
        console.log('通关了');
        return true;
      }

      const app = _app || this.gameApp;
      if (app) {
        await buyStage({ app });
        app.stage.removeChildren();
      }

      // await sleep(50000000);
      const dataJson = levelMap[this.level];
      for (let i = 0; i < dataJson.length; i++) {
        for (let j = 0; j < dataJson[i].length; j++) {
          if (dataJson[i][j] === BgLayoutItemType.main) {
            const position = { x: j, y: i };
            roleStore.mainPosition = position;
            roleStore.mainInitPosition = position;
          } else if (dataJson[i][j] === BgLayoutItemType.end) {
            roleStore.endRect = { x: j, y: i };
          }
        }
      }
      this.bgLayout = dataJson;
      return true;
    } catch (e) {
      this.status = Status.stop;
      message.error('哎呀，关卡加载失败，QAQ...');
      console.error('init error', e);
      return false;
    }
  }

  /**本地配置同步 */
  initConfig() {
    const settingsLocal = JSON.parse(localStorage.getItem('settings') || '{}');
    this.settings = { ...this.settings, ...settingsLocal };
  }

  /**加载资源文件 */
  async loadResource() {
    try {
      this.status = Status.stop;
      this.loadResources = true;
      this.loadResourcesProgress = 0;
      this.loadingText = '本地配置加载中';
      this.initConfig();
      await sleep(500);
      this.loadResourcesProgress = 5;
      this.loadingText = '字体资源加载中';
      await this.loadFontResource();
      this.loadResourcesProgress = 50;
      this.loadingText = '音频资源加载中';
      await this.loadAudioResources();
      this.loadResourcesProgress = 100;
      this.loadingText = '资源加载完成';
      await sleep(500);
      this.loadResources = false;
      this.status = Status.normal;
      return true;
    } catch (e) {
      message.error('加载资源错误');
      return false;
    }
  }

  /**加载音频资源 */
  loadAudioResources() {
    // https://resource.blogwxb.cn/longLoad/audios/%E8%BF%B7%E5%AE%AB%E4%B9%8B%E6%A2%A6_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.mp3
    const len = Object.keys(config.audios).length;
    let loadedIndex = 0;
    return new Promise((resolve) => {
      const audioResources = sound.add(config.audios as any as SoundSourceMap, {
        autoPlay: false,
        preload: true,
        loaded: (err, sound) => {
          console.log(loadedIndex, sound);
          // 背景音乐
          if (sound?.url === config.audios.bgAudio) {
            sound.volume = this.settings.bgVolume;
            sound.loop = true;
            if (this.settings.switchAudio) {
              sound?.play();
            }
          } else if (sound?.url === config.audios.buttonClickAudio) {
            sound.volume = this.settings.clickVolume;
          }
          loadedIndex++;
          if (loadedIndex === len) {
            console.log('audio loaded');
            resolve(null);
          }
        },
      });
      this.audioResources = audioResources as AudioResources;
    });
  }

  /**加载字体资源 */
  loadFontResource() {
    return new Promise((resolve) => {
      const font = new window.FontFace('IPix', `url(${config.font})`);
      document.fonts.add(font);

      font
        .load()
        .then((info) => {
          document.body.style.fontFamily = 'IPix';
          console.log('font loaded');
          resolve(null);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  /**
   * 是否可以走
   * @param x
   * @param y
   * @returns
   */
  isCanWalk = (x: number, y: number) => {
    if (!this.bgLayout[y]) {
      return false;
    }
    const type = this.bgLayout[y][x];
    return typeof type === 'number' && type !== BgLayoutItemType.obstacle;
  };

  /**加减金币 */
  rangeCoins(min = 40, max = 200) {
    const random = Math.random();
    let coinsRate = 1;
    if (random < 0.65) {
      coinsRate = 0;
    } else if (random < 0.8) {
      coinsRate = 0.3;
    } else if (random < 0.9) {
      coinsRate = 0.5;
    } else if (random < 0.95) {
      coinsRate = 0.8;
    } else {
      return max;
    }
    return Math.floor((max - min) * coinsRate + min);
  }

  /**失败处理 */
  failHandler() {
    if (roleStore.purifyCount) {
      message.warning('保护罩抵消本次处罚');
      roleStore.purifyCount--;
      return;
    }
    let valuesArr = Object.values(PunishEnum);
    valuesArr.splice(0, valuesArr.length / 2);
    console.log(3333, [...valuesArr]);
    if (roleStore.viewDistance <= MINVIEWDISTANCE) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reduceView), 1);
    }
    if (roleStore.isReverse) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reverse), 1);
    }
    console.log(valuesArr, roleStore.isReverse);
    if (!valuesArr.length) {
      message.error('游戏结束');
      // TODO 后续根据每关的死亡情况扣除，每一关第一次扣除10%，第二次20%，第三次30%，后续都是30%
      roleStore.coins = Math.max(Math.floor(roleStore.coins * 0.8), 0);
      roleStore.initRole();
      this.init();
      return;
    }
    const len = valuesArr.length;
    const index = Math.floor(Math.random() * len);
    const value = valuesArr[index];

    if (value === PunishEnum.reduceView) {
      roleStore.getNewView('reduce');
      message.warning('视野范围减小');
    } else if (value === PunishEnum.reverse) {
      message.warning('方向混乱');
      roleStore.isReverse = true;
    } else if (value === PunishEnum.reduceCoins) {
      const coins = this.rangeCoins(30, 80);
      message.warning(`扣除 ${coins} 金币`);
      roleStore.coins = Math.min(roleStore.coins - coins, 0);
    }
    console.log('Punish---', value);
  }

  /**胜利处理 */
  winHandler() {
    let valuesArr = Object.values(AwardEnum);
    valuesArr.splice(0, valuesArr.length / 2);
    if (roleStore.viewDistance >= MAXEWDISTANCE) {
      valuesArr.splice(valuesArr.indexOf(AwardEnum.addView), 1);
    }
    if (!roleStore.isReverse) {
      valuesArr.splice(valuesArr.indexOf(AwardEnum.reverse), 1);
    }
    console.log(valuesArr, roleStore.isReverse);
    if (!valuesArr.length) {
      return;
    }
    const len = valuesArr.length;
    const index = Math.floor(Math.random() * len);
    const value = valuesArr[index];
    if (value === AwardEnum.addView) {
      roleStore.getNewView('add');
      message.warning('视野范围增大');
    } else if (value === AwardEnum.reverse) {
      message.warning('方向恢复正常');
      roleStore.isReverse = false;
    } else if (value === AwardEnum.purify) {
      message.warning('获得保护罩');
      roleStore.purifyCount++;
    } else if (value === AwardEnum.addCoins) {
      const coins = this.rangeCoins();
      message.warning(`增加 ${coins} 金币`);
      roleStore.coins += coins;
    }
    console.log('Award---', value);
  }

  /**游戏结算 */
  @action
  gameSettlement(status: GameResultStatus) {
    console.log('status', status);
    if (status === GameResultStatus.win) {
      this.winHandler();
    } else if (status === GameResultStatus.loss) {
      this.failHandler();
    }
    this.isEnd = true;
    // this.showGameModal = false;
    this.status = Status.normal;
  }

  /**游戏通关 */
  @action
  winGame() {
    // this.status = Status.stop;
    message.success('恭喜通关', 2000, () => {
      this.level++;
      this.init();
    });
  }

  /**回到原点，清除走过的路径 */
  @action
  backToLevelOrigin() {
    this.bgLayout.forEach((rows, rowIndex) => {
      rows.forEach((item, columnIndex) => {
        if (item === BgLayoutItemType.route) {
          this.bgLayout[rowIndex][columnIndex] = BgLayoutItemType.empty;
        }
      });
    });
    this.bgLayout[roleStore.mainInitPosition.y][roleStore.mainInitPosition.x] =
      BgLayoutItemType.main;
    this.bgLayout = JSON.parse(JSON.stringify(this.bgLayout));
    roleStore.direction = 'down';
    roleStore.mainPosition = { ...roleStore.mainInitPosition };
  }

  /**获取保护道具 */
  @action
  getProtectTool() {
    roleStore.purifyCount++;
  }
}

const globalStore = new GlobalStore();

export default globalStore;
