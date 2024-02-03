import {
  useRef,
  useState,
  useEffect,
  EventHandler,
  useMemo,
  useCallback,
} from 'react';
import styles from './index.module.less';
import {
  createLine,
  translatePosition,
  clickPosition,
  animatedSpriteUpdate,
} from '@/utils';
import * as PIXI from 'pixi.js';
import globalStore from '@/store/store';
import roleStore from '@/store/roleStore';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { BgLayoutItemType, Status, TextureCacheObj } from '@/typings';
import message from '@/components/message/message';
import { WIDTH, HEIGHT, GRIDROWS, GRIDWIDTH, GRIDHEIGHT, RATE } from '@/const';
import heroImg from '@/assets/images/hero.png';
import viewImg from '@/assets/images/view.png';
import roadImg from '@/assets/images/road.png';
import purifyImg from '@/assets/images/purify.png';
import confusionImg from '@/assets/images/confusion.png';
import coinImg from '@/assets/images/coin.png';
import settingsIcon from '@/assets/images/settings-icon.png';
import StatusComponent from './statusComponent/statusComponent';
import InfoComponent from './infoComponent/infoComponent';
import { mosaicFilter, translateMosaicImg } from '@/utils/filters';
import MosaicImg from '@/components/mosaicImg/mosaicImg';
import { openSettingsModal } from './settingsModal/settingsModal';
import GameRender from '@/components/gameRender/gameRender';
import { GlowFilter } from '@pixi/filter-glow';
import BgComponent from '@/components/bgComponent/bgComponent';
import dbStore from '@/store/dbStore';
import { TypeEnum } from '@/db/db';
import modalStore from '@/store/modalStore';

interface RectGraphics extends PIXI.Graphics {
  rectType: BgLayoutItemType;
  paramX: number;
  paramY: number;
}

const colorMap = {
  [BgLayoutItemType.empty]: 0x000000,
  [BgLayoutItemType.backTo]: 0x64bcf2,
  [BgLayoutItemType.duel]: 0xe2f050,
  [BgLayoutItemType.end]: 0x67c23a,
  [BgLayoutItemType.main]: 0xe4393c,
  [BgLayoutItemType.obstacle]: 0xcccccc,
  [BgLayoutItemType.protect]: 0x6bd09e,
  [BgLayoutItemType.route]: 0xe6a23c,
};

const Index = () => {
  const [app, setApp] = useState<PIXI.Application>();
  // 背景条纹容器
  const bgContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 方格容器
  const rectContainer = useRef<PIXI.Container>(new PIXI.Container());
  // 路径容器
  const routeContainer = useRef<PIXI.Container>(new PIXI.Container());
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    (async () => {
      let _app = new PIXI.Application({
        width: WIDTH,
        height: HEIGHT,
        antialias: true,
        transparent: false,
        resolution: 1,
        backgroundColor: 0x333333,
        view: document.getElementById('mainCanvas') as HTMLCanvasElement,
      });
      loaderShopResources();
      globalStore.gameApp = _app;
      await globalStore.init(_app);
      setApp(_app);
      loaderResources();
      rectContainer.current.filters = [new PIXI.filters.NoiseFilter(0.3)];
      // _app!.renderer.plugins.interaction.removeAllListeners();
      // // 点击事件生成障碍物，再次点击障碍物将障碍物消掉，也可以生成开始点和结束点
      // _app!.renderer.plugins.interaction.on(
      //   'pointerdown',
      //   (event: PIXI.InteractionEvent) => {
      //     let position = event.data.getLocalPosition(bgContainer.current!);
      //     const { x, y, relativeX, relativeY } = clickPosition({
      //       width: WIDTH,
      //       height: HEIGHT,
      //       itemRows: GRIDROWS,
      //       y: position.y,
      //       x: position.x,
      //     });
      //     globalStore.bgLayout[relativeY][relativeX] = BgLayoutItemType.obstacle;
      //     createRect({
      //       position: { x, y },
      //       type: BgLayoutItemType.obstacle,
      //     });
      //   }
      // );
    })();
  }, []);

  useEffect(() => {
    if (!app || globalStore.status === Status.stop) {
      return;
    }
    initLine();
    drawLayout();
  }, [app, globalStore.status, globalStore.bgLayout, roleStore.viewDistance]);

  // 人物移动动画
  useEffect(() => {
    if (
      globalStore.status === Status.stop ||
      !roleStore.heroTextures.down ||
      !roleStore.heroTextures.down.length
    ) {
      return;
    }
    if (roleStore.animatedSprite.textures) {
      roleStore.animatedSprite.textures =
        roleStore.heroTextures[roleStore.direction || 'down'];
    }
    const sprite = animatedSpriteUpdate({
      app: app!,
      sprite: roleStore.animatedSprite,
      list: roleStore.heroTextures[roleStore.direction || 'down'],
      mainPosition: roleStore.mainPosition,
    });
    if (roleStore.animatedSprite.textures) {
      app?.stage.removeChild(roleStore.animatedSprite);
    }

    // 噪点滤镜
    const pixelateFilter = new PIXI.filters.NoiseFilter(0.1);
    sprite.filters = [pixelateFilter];
    if (roleStore.purifyCount) {
      // 保护罩滤镜
      const glowFilter = new GlowFilter({ distance: 5, innerStrength: 1 });
      sprite.filters.push(glowFilter);
    }
    roleStore.animatedSprite = sprite;
    app?.stage.addChild(roleStore.animatedSprite);
    // app?.stage.addChild(graphics);
  }, [
    globalStore.status,
    globalStore.bgLayout,
    roleStore.heroTextures,
    roleStore.direction,
    roleStore.viewDistance,
  ]);

  /**
   * 初始化网格
   */
  const initLine = () => {
    app?.stage.removeChild(bgContainer.current);
    bgContainer.current = new PIXI.Container();
    const container = new PIXI.Container();

    for (let i = 0; i < GRIDROWS + 1; i++) {
      const lineX = createLine({
        moveToX: 0,
        moveToY: i * GRIDHEIGHT,
        lineToX: WIDTH,
        lineToY: i * GRIDHEIGHT,
      });
      const lineY = createLine({
        moveToX: i * GRIDWIDTH,
        moveToY: 0,
        lineToX: i * GRIDWIDTH,
        lineToY: HEIGHT,
      });
      container.addChild(lineX);
      container.addChild(lineY);
    }
    bgContainer.current = container;
    app!.stage.addChild(container);
  };

  /**
   * 创建格子
   * @param param0
   */
  const createRect = ({
    position,
    type = BgLayoutItemType.obstacle,
  }: {
    position: { x: number; y: number };
    type?: BgLayoutItemType;
  }) => {
    const { x, y } = position;
    let rectangle = new PIXI.Graphics() as RectGraphics;
    rectangle.lineStyle(1, 0x000000, 1);
    // 这部分颜色显示空
    const disabledShowColorList = [
      BgLayoutItemType.backTo,
      BgLayoutItemType.duel,
      // BgLayoutItemType.end,
      BgLayoutItemType.protect,
    ];
    if (!roleStore.isRoad) {
      disabledShowColorList.push(BgLayoutItemType.route);
    }
    if (import.meta.env.MODE === 'development') {
      rectangle.beginFill(colorMap[type]);
    } else {
      if (disabledShowColorList.includes(type)) {
        rectangle.beginFill(colorMap[BgLayoutItemType.empty]);
      } else if (type === BgLayoutItemType.end) {
        // 角色在终点周围一格的范围内显示
        const xPow = Math.pow(x / GRIDWIDTH - roleStore.mainPosition.x, 2);
        const yPow = Math.pow(y / GRIDHEIGHT - roleStore.mainPosition.y, 2);
        if (Math.sqrt(xPow + yPow) < 2) {
          rectangle.beginFill(colorMap[type]);
        } else {
          rectangle.beginFill(colorMap[BgLayoutItemType.empty]);
        }
      } else {
        rectangle.beginFill(colorMap[type]);
      }
    }
    rectangle.drawRect(
      x - (x % GRIDWIDTH),
      y - (y % GRIDHEIGHT),
      GRIDWIDTH,
      GRIDHEIGHT
    );
    rectangle.endFill();
    rectangle.paramX = x;
    rectangle.paramY = y;
    rectangle.rectType = type;
    rectContainer.current?.addChild(rectangle);
    app?.stage.addChild(rectContainer.current!);
  };

  useEffect(() => {
    if (!globalStore.showGameModal) {
      document.addEventListener('keydown', characterMove);
    } else {
      document.removeEventListener('keydown', characterMove);
    }
    return () => {
      document.removeEventListener('keydown', characterMove);
    };
  }, [globalStore.showGameModal]);

  /**
   * 绘制画布
   */
  const drawLayout = () => {
    const { x: mainX, y: mainY } = roleStore.mainPosition;
    let arr: any[] = [];
    rectContainer.current.removeChildren();
    // console.log(333, app!.stage.children);
    globalStore.bgLayout.forEach((items, y) => {
      items.forEach((item: BgLayoutItemType, x) => {
        arr.push({ type: item, x, y });
      });
    });
    arr.forEach((item) => {
      const { x, y, type } = item;
      if (
        Math.abs(mainX - x) < roleStore.viewDistance &&
        Math.abs(mainY - y) < roleStore.viewDistance
      ) {
        createRect({
          position: translatePosition({
            width: WIDTH,
            height: HEIGHT,
            itemRows: GRIDROWS,
            rows: y,
            columns: x,
          }),
          type,
        });
      } else {
        createRect({
          position: translatePosition({
            width: WIDTH,
            height: HEIGHT,
            itemRows: GRIDROWS,
            rows: y,
            columns: x,
          }),
          type: BgLayoutItemType.empty,
        });
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setFlash(0);
    }, 1000);
  }, [flash]);

  const randomDuel = () => {
    let perNum = 0.002 * globalStore.level;
    return (
      Math.random() > Math.max(0, 0.98 - roleStore.duelIntervalSteps * perNum)
    );
  };

  /**
   * 移动主角
   * @param e
   * @returns
   */
  const characterMove = async (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (!modalStore.currentModal) {
        openSettings();
      }
      return;
    }

    if (globalStore.status === Status.stop) {
      return;
    }

    let nextStep = { ...roleStore.mainPosition };
    const step = roleStore.isReverse ? -1 : 1;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      return;
    }
    switch (e.key) {
      case 'ArrowUp':
        roleStore.direction = roleStore.isReverse ? 'down' : 'up';
        nextStep.y -= step;
        break;
      case 'ArrowDown':
        roleStore.direction = roleStore.isReverse ? 'up' : 'down';
        nextStep.y += step;
        break;
      case 'ArrowLeft':
        roleStore.direction = roleStore.isReverse ? 'right' : 'left';
        nextStep.x -= step;
        break;
      case 'ArrowRight':
        roleStore.direction = roleStore.isReverse ? 'left' : 'right';
        nextStep.x += step;
        break;
      // case 's':
      //   globalStore.bgLayout.forEach((rows, rowIndex) => {
      //     rows.forEach((item, columnIndex) => {
      //       if (item === BgLayoutItemType.obstacle) {
      //         arr.push([columnIndex, rowIndex]);
      //       }
      //     });
      //   });
      //   console.log(arr);
      //   break;
    }
    if (!globalStore.isCanWalk(nextStep.x, nextStep.y)) {
      return;
    }
    roleStore.duelIntervalSteps++;
    const rectType = globalStore.bgLayout[nextStep.y][nextStep.x];
    globalStore.bgLayout[roleStore.mainPosition.y][roleStore.mainPosition.x] =
      BgLayoutItemType.route;
    globalStore.bgLayout[nextStep.y][nextStep.x] = BgLayoutItemType.main;
    globalStore.bgLayout = JSON.parse(JSON.stringify(globalStore.bgLayout));

    roleStore.mainPosition = { ...nextStep };
    globalStore.bgLayout[roleStore.mainPosition.y][roleStore.mainPosition.x] =
      BgLayoutItemType.main;
    globalStore.bgLayout[roleStore.endRect.y][roleStore.endRect.x] =
      BgLayoutItemType.end;

    if (rectType === BgLayoutItemType.backTo) {
      globalStore.status = Status.stop;
      await message.warning('糟糕，踩到了传送门，回到了原点！');
      dbStore.addLogger({
        type: TypeEnum.FindBackTo,
        content: '糟糕，踩到了传送门，回到了原点！',
        focus: '传送门',
      });
      roleStore.duelIntervalSteps = 0;
      globalStore.bgLayout[roleStore.mainPosition.y][roleStore.mainPosition.x] =
        BgLayoutItemType.empty;
      globalStore.backToLevelOrigin();
      globalStore.status = Status.normal;
    } else if (rectType === BgLayoutItemType.protect) {
      globalStore.status = Status.stop;
      roleStore.duelIntervalSteps = 0;
      await message.success('找到了保护罩，嘻嘻嘻!');
      dbStore.addLogger({
        type: TypeEnum.FindProtect,
        content: '找到了保护罩，嘻嘻嘻!',
        focus: '保护罩',
      });
      globalStore.getProtectTool();
      globalStore.status = Status.normal;
    } else if (rectType === BgLayoutItemType.end) {
      roleStore.duelIntervalSteps = 0;
      globalStore.winGame();
    } else {
      // 随机遇怪
      const isDuel = randomDuel();
      if (rectType === BgLayoutItemType.duel || isDuel) {
        roleStore.duelIntervalSteps = 0;
        globalStore.status = Status.stop;
        if (globalStore.settings.switchAudio) {
          globalStore.audioResources.duelAudio.play();
        }
        dbStore.addLogger({
          type: TypeEnum.FindDuel,
          content: '遇怪，进行决斗',
        });
        setFlash(Math.random());
        setTimeout(() => {
          globalStore.showGameModal = true;
        }, 500);
      }
    }
    // createRect({
    //   position: translatePosition({
    //     width: WIDTH,
    //     height: HEIGHT,
    //     itemRows: GRIDROWS,
    //     rows: nextStep.y,
    //     columns: nextStep.x,
    //   }),
    //   type: BgLayoutItemType.main,
    // });
    // createRect({
    //   position: translatePosition({
    //     width: WIDTH,
    //     height: HEIGHT,
    //     itemRows: GRIDROWS,
    //     rows: roleStore.mainPosition.y,
    //     columns: roleStore.mainPosition.x,
    //   }),
    //   type: BgLayoutItemType.route,
    // });
  };

  /**加载商品图片资源 */
  const loaderShopResources = async () => {
    const loaders = new PIXI.Loader();
    const viewImgMosaic = await translateMosaicImg({
      imgUrl: viewImg,
      compressTimes: 2,
    });
    const purifyImgMosaic = await translateMosaicImg({
      imgUrl: purifyImg,
      compressTimes: 2,
    });
    const confusionImgMosaic = await translateMosaicImg({
      imgUrl: confusionImg,
      compressTimes: 2,
    });
    loaders.add('viewImg', viewImg);
    loaders.add('purifyImg', purifyImg);
    loaders.add('confusionImg', confusionImg);
    loaders.add('coinImg', coinImg);
    loaders.add('roadImg', roadImg);
    loaders.load();
    loaders.onComplete.add(() => {
      const viewTexture = new PIXI.Texture(
        loaders.resources.viewImg.texture!.baseTexture
      );
      const purifyTexture = new PIXI.Texture(
        loaders.resources.purifyImg.texture!.baseTexture
      );
      const confusionTexture = new PIXI.Texture(
        loaders.resources.confusionImg.texture!.baseTexture
      );
      const coinTexture = new PIXI.Texture(
        loaders.resources.coinImg.texture!.baseTexture
      );
      const roadTexture = new PIXI.Texture(
        loaders.resources.roadImg.texture!.baseTexture
      );
      globalStore.toolsTextures = [
        viewTexture,
        purifyTexture,
        confusionTexture,
        coinTexture,
        roadTexture,
      ];
    });
  };

  /**
   * 加载图片资源
   */
  const loaderResources = () => {
    const loaders = new PIXI.Loader();
    loaders.add('heroImg', heroImg);
    loaders.load();
    let list: PIXI.Texture<PIXI.Resource>[][] = [];
    loaders.onComplete.add(() => {
      // 148x190
      const itemW = 148 / 4;
      const itemH = 190 / 4;
      for (let i = 0; i < 4; i++) {
        let arr: PIXI.Texture<PIXI.Resource>[] = [];
        for (let j = 0; j < 4; j++) {
          const spriteTexture = new PIXI.Texture(
            loaders.resources.heroImg.texture!.baseTexture,
            new PIXI.Rectangle(itemW * j, itemH * i, itemW, itemH)
          );
          arr.push(spriteTexture);
        }
        list.push(arr);
      }
      roleStore.heroTextures = {
        left: list[1],
        right: list[2],
        up: list[3],
        down: list[0],
      };
    });
  };

  const openSettings = async () => {
    globalStore.status = Status.stop;
    await openSettingsModal();
    globalStore.status = Status.normal;
  };

  return (
    <div className="relative">
      <div className={classNames(styles.indexMain)}>
        <div className={styles.main}>
          <StatusComponent />
          <div className={classNames([styles.canvasMain, 'nes-diy-border'])}>
            <div className="flex justify-between items-center font-bold py-4">
              <div className="text-xl">关卡：{globalStore.level}</div>
              <div className="text-6xl flex-1">漫长之路</div>
              {/* <button
                className={classNames('nes-btn is-primary', styles.testBtn)}
                onClick={() => {
                  message.info('收到12313收拾收拾');
                  message.success('收到12313收拾收拾');
                  message.warning('收到12313收拾收拾');
                  message.error('收到12313收拾收拾');
                  console.log(JSON.parse(JSON.stringify(globalStore.bgLayout)));
                }}
              >
                Button
              </button> */}

              <button
                className="nes-btn nes-btn-sm right-4 flex items-center"
                onClick={openSettings}
              >
                <img src={settingsIcon} width={40} height={40} alt="" />
                {/* <MosaicImg
                  imgUrl={settingsIcon}
                  width={40}
                  height={40}
                  compressTimes={2}
                /> */}
                <span className="text-2xl font-bold">设置</span>
              </button>
            </div>
            <canvas id="mainCanvas"></canvas>
            <div
              className={`${styles.flashBox} ${flash ? styles.flash : ''}`}
            ></div>
          </div>
          <InfoComponent />
        </div>

        <GameRender />
      </div>
      <BgComponent />
    </div>
  );
};

export default observer(Index);
