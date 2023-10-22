import { action, makeAutoObservable, observable, configure } from 'mobx';
import {
  BgLayoutItemType,
  Status,
  GameResultStatus,
  PunishEnum,
} from '@/typings';
import message from '@/components/message/message';
import { GRIDROWS, MINVIEWDISTANCE } from '@/const';
import * as PIXI from 'pixi.js';
import { sound, Sound, SoundMap, SoundSourceMap } from '@pixi/sound';
import roleStore from './roleStore';
import config, { Audios, Config } from '@/config';
import level1 from '@/assets/levels/level-1.json';
import level2 from '@/assets/levels/level-2.json';
import { sleep } from '@/utils';

export type AudioResources = Record<keyof Audios, Sound>;
interface Settings {
  switchAudio: boolean;
  volume: number;
}

configure({ enforceActions: 'never' });

const levelMap: any = {
  1: level1,
  2: level2,
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
  // 游戏设置
  settings: Settings = { switchAudio: false, volume: 0.5 };

  constructor() {
    makeAutoObservable(this);
    this.init();
  }

  @action
  setSettings(value: Settings) {
    this.settings = value;
    localStorage.setItem('settings', JSON.stringify(value || {}));
  }

  init() {
    const dataJson = levelMap[this.level];
    for (let i = 0; i < dataJson.length; i++) {
      for (let j = 0; j < dataJson[i].length; j++) {
        if (dataJson[i][j] === BgLayoutItemType.main) {
          roleStore.mainPosition = { x: j, y: i };
        } else if (dataJson[i][j] === BgLayoutItemType.end) {
          roleStore.endRect = { x: j, y: i };
        }
      }
    }
    this.bgLayout = dataJson;
  }

  /**本地配置同步 */
  initConfig() {
    const settingsLocal = JSON.parse(localStorage.getItem('settings') || '{}');
    this.settings = { ...this.settings, ...settingsLocal };
  }

  /**加载资源文件 */
  async loadResource() {
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
    await sleep(1000);
    this.loadResources = false;
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
        volume: this.settings.volume,
        loaded: (err, sound) => {
          console.log(loadedIndex, sound);
          // 背景音乐
          if (sound?.url === config.audios.bgAudio) {
            sound.loop = true;
            if (this.settings.switchAudio) {
              sound?.play();
            }
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
    }
    console.log('Punish---', value);
  }

  /**游戏结算 */
  @action
  gameSettlement(status: GameResultStatus) {
    console.log('status', status);
    if (status === GameResultStatus.win) {
      roleStore.getNewView('add');
      message.warning('视野范围增大');
    } else if (status === GameResultStatus.loss) {
      this.failHandler();
    }
    this.isEnd = true;
    // this.showGameModal = false;
    this.status = Status.normal;
  }

  @action
  winGame() {
    // this.status = Status.stop;
    message.success('恭喜通关', 3000, () => {
      this.level++;
      this.init();
    });
  }
}

const globalStore = new GlobalStore();

export default globalStore;
