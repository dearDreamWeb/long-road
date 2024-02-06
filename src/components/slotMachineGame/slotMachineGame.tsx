import React, { useState, useEffect, useMemo, useRef } from 'react';
import knowledgeQuestions from '@/assets/data/knowledgeQuestions.json';
import Modal from '../modal/modal';
import Typewriter from '../typewriter/typewriter';
import classNames from 'classnames';
import CloseIcon from '../closeIcon/closeIcon';
import globalStore from '@/store/store';
import { GameResultStatus, Status } from '@/typings';
import styles from './slotMachineGame.module.less';
import viewImg from '@/assets/images/view.png';
import purifyImg from '@/assets/images/purify.png';
import coinImg from '@/assets/images/coin.png';
import { SlotMachine } from 'lucky-canvas';
import seedrandom from 'seedrandom';
import roleStore from '@/store/roleStore';
import message from '../message/message';
import dbStore from '@/store/dbStore';
import { TypeEnum } from '@/db/db';
import { rangeCoins } from '@/utils';

interface SlotMachineGameProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const SlotMachineGame = (props: SlotMachineGameProps) => {
  const { isOpen, onChange } = props;
  const luckyCanvasRef = useRef<HTMLDivElement>(null);
  const [myLucky, setMyLucky] = useState<SlotMachine>();
  const [stating, setStating] = useState(false);
  const random = seedrandom();
  const [speedCoins, setSpeedCoins] = useState(20);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const myLucky = new SlotMachine('#my-lucky' as any, {
      width: '500px',
      height: '300px',
      blocks: [
        { padding: '20px', background: '#869cfa' },
        { padding: '40px', background: '#e9e8fe' },
      ],
      slots: [{ speed: 8 }, { speed: 12 }, { speed: 20 }],
      prizes: [
        {
          //   background: '#fff',
          //   borderRadius: '10px',
          imgs: [
            {
              width: '100%',
              src: viewImg,
            },
          ],
        },
        {
          //   background: '#fff',
          //   borderRadius: '10px',
          imgs: [
            {
              width: '100%',
              src: purifyImg,
            },
          ],
        },
        {
          //   background: '#fff',
          //   borderRadius: '10px',
          imgs: [
            {
              width: '100%',
              height: '100%',
              src: coinImg,
            },
          ],
        },
      ],
      defaultConfig: {
        rowSpacing: 10,
        colSpacing: 50,
      },
      end: (resultList) => {
        const str = resultList?.imgs?.[0]?.src;
        if (str?.includes('view')) {
          message.success('恭喜中奖了，视野范围增加一格');
          roleStore.viewDistance++;
          dbStore.addLogger({
            type: TypeEnum.Info,
            content: `恭喜中奖了，视野范围增加一格`,
            focus: '视野范围增加一格',
          });
        } else if (str?.includes('purify')) {
          message.success('恭喜中奖了，获得保护罩');
          roleStore.purifyCount++;
          dbStore.addLogger({
            type: TypeEnum.Info,
            content: `恭喜中奖了，获得保护罩`,
            focus: '保护罩',
          });
        } else if (str?.includes('coin')) {
          const coins = rangeCoins();
          message.success(`恭喜中奖了，增加 ${coins} 金币`);
          roleStore.coins += coins;
          dbStore.addLogger({
            type: TypeEnum.Info,
            content: `恭喜中奖了，增加 ${coins} 金币`,
            focus: `${coins} 金币`,
          });
        } else {
          message.info('很遗憾，未中奖，再接再厉');
        }
        setIsRunning(false);
      },
    });
    setMyLucky(myLucky);
  }, []);

  const playHandler = () => {
    if (isRunning) {
      return;
    }
    if (!stating) {
      if (roleStore.coins < speedCoins) {
        message.error('金币不足');
        return;
      }
      myLucky?.play();
      roleStore.coins -= speedCoins;
      setSpeedCoins(Math.min(speedCoins + 10, 50));
    } else {
      setIsRunning(true);
      const len = 3;
      let resultList: number[] = [];
      const num = random();
      if (num > 0.85 && num < 0.95) {
        resultList = [1, 1, 1];
      } else if (num >= 0.95 && num < 0.98) {
        resultList = [2, 2, 2];
      } else if (num >= 0.98 && num < 1) {
        resultList = [0, 0, 0];
      } else {
        resultList = new Array(3).fill(0).map(() => Math.floor(random() * len));
      }
      myLucky?.stop(resultList);
    }
    setStating(!stating);
  };

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modalBox}
      width={700}
      mainAnimation
    >
      <div
        className={classNames(
          styles.slotMachineGameBox,
          'flex flex-col relative'
        )}
      >
        <h1 className="title-1 text-shadow">决斗吧，骚年--《老虎机抽奖》</h1>
        <p className="nes-text">规则：</p>
        <Typewriter text="按下开始按钮即可进行抽奖"></Typewriter>
        <div className="nes-diy-border inline-flex flex-col items-center !mt-8 bg-slate-50 p-4">
          <div className="nes-diy-border pb-4">
            <h1 className=" text-2xl font-bold mb-4 flex items-center justify-center relative">
              <span>老虎机</span>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="text-base">当前所剩金币：</span>
                {roleStore.coins}
              </div>
            </h1>
            <div ref={luckyCanvasRef} id="my-lucky"></div>
          </div>
          <div className="mt-8">
            <button
              className={classNames(
                'nes-btn w-auto',
                isRunning ? 'is-disabled' : !stating ? 'is-primary' : 'is-error'
              )}
              onClick={playHandler}
            >
              {!stating ? `花费${speedCoins}金币抽奖` : '停止'}
            </button>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className={classNames([
              'nes-btn flex items-center',
              isRunning ? 'is-disabled' : '',
            ])}
            onClick={() => {
              if (isRunning) {
                return;
              }
              onChange(false);
              globalStore.status = Status.normal;
            }}
          >
            关闭
            <CloseIcon />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SlotMachineGame;
