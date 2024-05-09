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
import level5 from '@/assets/levels/level-5.json';
import { encrypt, randomRange, rangeCoins, sleep } from '@/utils';
import { GlowFilter } from '@pixi/filter-glow';
import { buyStage } from '@/utils/stage';
import dbStore from './dbStore';
import { TypeEnum } from '@/db/db';
import { createdLevel } from '@/utils/createdLevel';
import { digital } from '@/api/api';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export type AudioResources = Record<keyof Audios, Sound>;
interface Settings {
  switchAudio: boolean;
  volume: number;
  bgVolume: number;
  clickVolume: number;
}

configure({ enforceActions: 'never' });

const levelMap: Record<number, BgLayoutItemType[][]> = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
};

class GlobalStore {
  weeks = 1;
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
  isRender = false;
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
  // userId
  userId = '';

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

  @action
  async initUserId() {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    this.userId = result.visitorId;
  }

  /**初始化游戏场景 */
  @action
  async init(_app?: PIXI.Application, isStart?: boolean) {
    try {
      roleStore.direction = 'down';
      roleStore.mainPosition = { x: 12, y: 24 };
      roleStore.duelIntervalSteps = 0;
      this.status = Status.stop;
      // if (this.level >= Object.keys(levelMap).length) {
      //   message.success('恭喜你，通关完成！！！');
      //   return true;
      // }
      const app = _app || this.gameApp;
      if (app) {
        await buyStage({ app });
        app.stage.removeChildren();
      }

      // await sleep(50000000);
      let dataJson = JSON.parse(JSON.stringify(levelMap[this.level]));
      if (this.weeks === 1) {
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
      } else {
        const [list, mainP] = createdLevel(this.level);
        dataJson = list;
        roleStore.mainPosition = mainP;
        roleStore.mainInitPosition = mainP;
      }
      this.bgLayout = dataJson;
      this.status = Status.normal;

      if (isStart) {
        digital({
          gameName: 'longRoad',
          subName: 'all',
          score: encrypt(`${this.weeks}${this.level}`),
          userId: this.userId,
          nickName: this.userId,
        });
      }

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
      this.isRender = false;
      this.loadResourcesProgress = 0;
      this.loadingText = '本地配置加载中';
      this.initConfig();
      await sleep(200);
      this.loadResourcesProgress = randomRange(3, 10);
      this.loadingText = '字体资源加载中';
      await this.loadFontResource();
      this.loadResourcesProgress = randomRange(45, 65);
      this.loadingText = '音频资源加载中';
      await this.loadAudioResources();
      this.loadResourcesProgress = randomRange(70, 95);
      await sleep(200);
      this.loadingText = '进度数据加载中';
      await dbStore.init();
      if (this.level === 1) {
        dbStore.addLogger({
          type: TypeEnum.Info,
          content: `欢迎来到异世界，找到异世界的出口回到自己的世界吧。`,
        });
      }
      this.loadResourcesProgress = 100;
      this.loadingText = '资源加载完成';
      await sleep(200);
      this.loadResources = false;
      this.isRender = true;
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

  /**失败处理 */
  failHandler() {
    if (roleStore.purifyCount) {
      message.warning('保护罩抵消本次处罚');
      roleStore.purifyCount--;
      dbStore.addLogger({
        type: TypeEnum.LoseDuel,
        content: `游戏失败，保护罩抵消本次处罚`,
        focus: `保护罩`,
      });
      return;
    }
    let valuesArr = Object.values(PunishEnum);
    valuesArr.splice(0, valuesArr.length / 2);

    if (roleStore.viewDistance <= MINVIEWDISTANCE) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reduceView), 1);
    }
    if (roleStore.isReverse) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reverse), 1);
    }
    if (roleStore.coins <= 0) {
      valuesArr.splice(valuesArr.indexOf(PunishEnum.reduceCoins), 1);
    }
    console.log(valuesArr, roleStore.isReverse);
    if (!valuesArr.length) {
      message.error('游戏结束');
      // TODO 后续根据每关的死亡情况扣除，每一关第一次扣除10%，第二次20%，第三次30%，后续都是30%
      const coins = Math.max(Math.floor(roleStore.coins * 0.8), 0);
      roleStore.coins = coins;
      dbStore.addLogger({
        type: TypeEnum.LoseLevel,
        content: `游戏失败，扣除${coins}金币`,
      });
      dbStore.addLogger({
        type: TypeEnum.LoseLevel,
        content: `被噶腰子死了，重新开始本关`,
      });
      roleStore.initRole();
      dbStore.saveProgress();
      this.init();
      return;
    }
    const len = valuesArr.length;
    const index = Math.floor(Math.random() * len);
    const value = valuesArr[index];

    if (value === PunishEnum.reduceView) {
      roleStore.getNewView('reduce');
      message.warning('视野范围减小');
      dbStore.addLogger({
        type: TypeEnum.LoseDuel,
        content: `游戏失败，失败惩罚：视野范围减小`,
        focus: `视野范围减小`,
      });
    } else if (value === PunishEnum.reverse) {
      message.warning('方向混乱');
      roleStore.isReverse = true;
      dbStore.addLogger({
        type: TypeEnum.LoseDuel,
        content: `游戏失败，失败惩罚：方向混乱`,
        focus: `方向混乱`,
      });
    } else if (value === PunishEnum.reduceCoins) {
      const coins =
        roleStore.coins <= 30 ? roleStore.coins : rangeCoins(30, 80);
      message.warning(`扣除 ${coins} 金币`);
      roleStore.coins = roleStore.coins - coins;
      dbStore.addLogger({
        type: TypeEnum.LoseDuel,
        content: `游戏失败，失败惩罚：${`扣除 ${coins} 金币`}`,
        focus: `${`${coins} 金币`}`,
      });
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
      dbStore.addLogger({
        type: TypeEnum.WinDuel,
        content: `游戏胜利，胜利奖励：视野范围增大`,
        focus: `视野范围增大`,
      });
    } else if (value === AwardEnum.reverse) {
      message.warning('方向恢复正常');
      roleStore.isReverse = false;
      dbStore.addLogger({
        type: TypeEnum.WinDuel,
        content: `游戏胜利，胜利奖励：方向恢复正常`,
        focus: `方向恢复正常`,
      });
    } else if (value === AwardEnum.purify) {
      message.warning('获得保护罩');
      roleStore.purifyCount++;
      dbStore.addLogger({
        type: TypeEnum.WinDuel,
        content: `游戏胜利，胜利奖励：获得保护罩`,
        focus: `保护罩`,
      });
    } else if (value === AwardEnum.addCoins) {
      const coins = rangeCoins();
      message.warning(`增加 ${coins} 金币`);
      roleStore.coins += coins;
      dbStore.addLogger({
        type: TypeEnum.WinDuel,
        content: `游戏胜利，胜利奖励：${`增加 ${coins} 金币`}`,
        focus: `${coins} 金币`,
      });
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
    } else {
      dbStore.addLogger({
        type: TypeEnum.TieDuel,
        content: `游戏平局！`,
      });
    }
    this.isEnd = true;
    // this.showGameModal = false;
    this.status = Status.normal;
  }

  /**游戏过关 */
  @action
  async winGame() {
    const coins = Math.min(40 + this.level * 10, 200);
    roleStore.coins += coins;
    await dbStore.addLogger({
      type: TypeEnum.WinLevel,
      content: `恭喜过关，关卡${this.level}过关成功，奖励${coins}金币！！！`,
      focus: `关卡${this.level}`,
    });
    await message.success('恭喜过关', 1200);
    this.level++;
    if (this.level > Object.keys(levelMap).length && this.weeks === 1) {
      this.weeks++;
      this.level = 1;
    }
    await dbStore.saveProgress();
    roleStore.isRoad = false;
    this.init(void 0, true);
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
