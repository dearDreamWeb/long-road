import { SoundSourceMap } from '@pixi/sound';

export interface Audios {
  bgAudio: string;
  collectAudio: string;
  buttonClickAudio: string;
  duelAudio: string;
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
    bgAudio: 'https://resource.blogwxb.cn/longLoad/audios/bg.mp3',
    collectAudio: 'https://resource.blogwxb.cn/longLoad/audios/collect.mp3',
    buttonClickAudio: 'https://resource.blogwxb.cn/longLoad/audios/click.mp3',
    duelAudio: 'https://resource.blogwxb.cn/longLoad/audios/duel.mp3',
  },
  font: 'https://resource.blogwxb.cn/longLoad/fonts/IPix.ttf',
};

export default config;
