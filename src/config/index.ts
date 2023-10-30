import { SoundSourceMap } from '@pixi/sound';

export interface Audios {
  bgAudio: string;
  collectAudio: string;
  buttonClickAudio: string;
}

// 输出类型为：{ a: number; b: number }

export interface Config {
  audios: Audios;
  font: string;
  [key: string]: any;
}

const config: Config = {
  audios: {
    // 背景音乐
    bgAudio:
      'https://blogwxb.oss-cn-hangzhou.aliyuncs.com/longLoad/audios/bg.mp3',
    collectAudio:
      'https://blogwxb.oss-cn-hangzhou.aliyuncs.com/longLoad/audios/click.mp3',
    buttonClickAudio:
      'https://blogwxb.oss-cn-hangzhou.aliyuncs.com/longLoad/audios/collect.mp3',
  },
  font: 'https://blogwxb.oss-cn-hangzhou.aliyuncs.com/longLoad/fonts/IPix.ttf',
};

export default config;
