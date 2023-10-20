import { SoundSourceMap } from '@pixi/sound';

export interface Audios {
  bgAudio: string;
  collectAudio: string;
}

// 输出类型为：{ a: number; b: number }

export interface Config {
  audios: Audios;
  [key: string]: any;
}

const config: Config = {
  audios: {
    // 背景音乐
    bgAudio:
      'https://blogwxb.oss-cn-hangzhou.aliyuncs.com/longLoad/audios/%E8%BF%B7%E5%AE%AB%E4%B9%8B%E6%A2%A6_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.mp3',
    collectAudio:
      'https://blogwxb.oss-cn-hangzhou.aliyuncs.com/longLoad/audios/%E6%94%B6%E9%9B%86%28collect%29_%E7%88%B1%E7%BB%99%E7%BD%91_aigei_com.mp3',
  },
};

export default config;
