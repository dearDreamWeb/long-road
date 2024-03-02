import { useState, useEffect, useMemo } from 'react';
import Modal from '../modal/modal';
import Typewriter from '../typewriter/typewriter';
import styles from './rockGame.module.less';
import globalStore from '@/store/store';
import { GameResultStatus } from '@/typings';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import CloseIcon from '@/components/closeIcon/closeIcon';
import rock1 from '@/assets/images/rock-game-1.png';
import rock2 from '@/assets/images/rock-game-2.png';
import rock3 from '@/assets/images/rock-game-3.png';
import message from '../message/message';
import { shuffleArray } from '@/utils';

interface RockListItem {
  key: string;
  img: string;
  index?: number;
  result?: number;
}

interface GameOpponentListItem extends RockListItem {
  result: ResultType;
}

const rockList: RockListItem[] = [
  {
    key: '0',
    img: rock1,
  },
  {
    key: '1',
    img: rock2,
  },
  {
    key: '2',
    img: rock3,
  },
];

type ResultType = 0 | 1 | 2;

/**
 * 石头剪刀布结果
 * 0 输
 * 1 赢
 * 2 平
 * @param key
 * @param key1
 * @returns
 */
const ruleHandler = (key: string, key1: string): ResultType => {
  let result: ResultType = 2;
  switch (key) {
    case '0':
      if (key1 === '0') {
        result = 2;
      } else if (key1 === '1') {
        result = 1;
      } else {
        result = 0;
      }
      break;
    case '1':
      if (key1 === '1') {
        result = 2;
      } else if (key1 === '2') {
        result = 1;
      } else {
        result = 0;
      }
      break;
    case '2':
      if (key1 === '2') {
        result = 2;
      } else if (key1 === '0') {
        result = 1;
      } else {
        result = 0;
      }
      break;
  }
  return result;
};

interface RockGameProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}

const resultMap = {
  win: {
    text: '你赢了，算你走运。',
    imgClass: 'text-success',
    imgUrl: 'https://resource.blogwxb.cn/longLoad/game-win.gif',
  },
  loss: {
    text: '你输喽，辣鸡！',
    imgClass: 'text-error',
    imgUrl: 'https://resource.blogwxb.cn/longLoad/game-loss.gif',
  },
  tie: {
    text: '什么，居然平手了？',
    imgClass: 'text-warning',
    imgUrl: 'https://resource.blogwxb.cn/longLoad/game-level.gif',
  },
};

const RockGame = (props: RockGameProps) => {
  const { isOpen, onChange } = props;
  const [selectedList, setSelectedList] = useState<RockListItem[]>([]);
  const [gameOpponentList, setGameOpponentList] = useState<
    GameOpponentListItem[]
  >([]);
  const [result, setResult] = useState(0);
  const [computerList, setComputerList] = useState<RockListItem[]>([]);
  const [roleSelectedList, setRoleSelectedList] = useState<RockListItem[]>([]);
  const [step, setStep] = useState(0);
  const [step1Index, setStep1Index] = useState(0);

  const selectedRock = (data: RockListItem, index: number) => {
    const findIndex = selectedList.findIndex(
      (item) => item.key + item.index === data.key + index
    );
    if (findIndex > -1) {
      setSelectedList((list) => {
        list.splice(findIndex, 1);
        return JSON.parse(JSON.stringify(list));
      });
      return;
    }

    try {
      let obj: Record<string, number | undefined> = {};
      [...selectedList, data].forEach((item) => {
        if (typeof obj[item.key] === 'number') {
          (obj[item.key] as number)++;
          if (obj[item.key] === 2) {
            throw new Error('error');
          }
        } else {
          obj[item.key] = 0;
        }
      });
    } catch (e) {
      message.info('不能选三张一样的类型');
      return;
    }

    if (globalStore.isEnd || selectedList.length > 2) {
      return;
    }
    setSelectedList([...selectedList, { ...data, index }]);
  };

  useEffect(() => {
    if (isOpen) {
      globalStore.isEnd = false;
      return;
    }
    init();
  }, [isOpen]);

  const init = () => {
    setSelectedList([]);
    setGameOpponentList([]);
    setComputerList([]);
    setRoleSelectedList([]);
    setResult(0);
  };

  const resultOptions = useMemo(() => {
    return result < 0
      ? resultMap.loss
      : result > 0
      ? resultMap.win
      : resultMap.tie;
  }, [result]);

  const overSelected = () => {
    const list = shuffleArray(JSON.parse(JSON.stringify(rockList)));
    setComputerList(list);
    setStep(1);
    setStep1Index(0);
  };

  const selectedStepHandler = (data: RockListItem) => {
    if (step1Index < roleSelectedList.length) {
      return;
    }
    setRoleSelectedList((list) => {
      list.push({
        ...data,
        result: ruleHandler(data.key, computerList[step1Index].key),
      });
      if (list.length === 3) {
        let grade = 0;
        list.forEach((item) => {
          if (item.result === 0) {
            grade--;
          } else if (item.result === 1) {
            grade++;
          }
        });
        setResult(grade);
        globalStore.gameSettlement(
          grade > 0
            ? GameResultStatus.win
            : grade < 0
            ? GameResultStatus.loss
            : GameResultStatus.tie
        );
      }
      return JSON.parse(JSON.stringify(list));
    });
    setSelectedList((list) => {
      const findIndex = list.findIndex((item) => item.index === data.index);
      if (findIndex > -1) {
        list.splice(findIndex, 1);
      }
      return JSON.parse(JSON.stringify(list));
    });
    setStep1Index(step1Index + 1);
  };

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modalBox}
      width={700}
      mainAnimation
    >
      <div className={styles.gameBox}>
        <h1 className="title-1">决斗吧，骚年--《石头剪刀布》</h1>
        <p>规则：</p>
        <Typewriter text="选择三张牌，再选择每一轮的石头剪刀布，三局两胜! 隔壁老王的牌始终是石头剪刀布的随机排序。"></Typewriter>
        {step === 0 ? (
          <>
            <div className={styles.gameMain}>
              <div className={styles.gameOpponentBox}>
                <title className="text-green-500">
                  请选择自己三张牌，不能三张类型是一样的。
                  <span className="loading loading-dots loading-md"></span>
                </title>
              </div>
              <div className={styles.imgListBox}>
                {new Array(3)
                  .fill(rockList)
                  .flat()
                  .map((item, index) => (
                    <div
                      key={item.key + index}
                      className={classnames([styles.imgListItem])}
                      style={{
                        backgroundImage: `url(${item.img})`,
                      }}
                      onClick={() => selectedRock(item, index)}
                    >
                      <div
                        className={classnames([
                          selectedList.find(
                            (selectedItem) =>
                              selectedItem.key + selectedItem.index ===
                              item.key + index
                          )
                            ? styles.imgListSelected
                            : 'hidden',
                        ])}
                      >
                        已选择
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-center">
                <button
                  className={classnames([
                    'nes-btn is-success',
                    selectedList.length < 3 ? 'is-disabled' : '',
                  ])}
                  onClick={overSelected}
                  style={{
                    pointerEvents: selectedList.length < 3 ? 'none' : 'all',
                  }}
                >
                  结束选牌
                </button>
              </div>
            </div>
          </>
        ) : step === 1 ? (
          <div className={styles.resultMain}>
            <div
              className={`${styles.roleName} text-info flex justify-center items-center`}
            >
              隔壁老王<i className="nes-mario scale-50"></i>
            </div>
            <div>
              <div className="flex items-center justify-around">
                {computerList.map((item, index) => (
                  <div
                    key={item.key}
                    className="border border-white border-dashed w-20 h-20 bg-no-repeat"
                    style={{
                      backgroundImage: `url(${
                        index < step1Index ? item.img : ''
                      })`,
                      backgroundSize: '100% 100%',
                    }}
                  ></div>
                ))}
              </div>
              <div className="flex items-center justify-around my-8">
                {[1, 2, 3].map((item, index) => (
                  <>
                    {index === step1Index ? (
                      <div
                        key={item}
                        className={classnames([
                          'font-bold text-xl',
                          index === step1Index ? '' : 'opacity-0',
                        ])}
                      >
                        第{item}局
                      </div>
                    ) : index < step1Index ? (
                      <div
                        key={item}
                        className={classnames(['font-bold text-xl'])}
                      >
                        {roleSelectedList[index].result === 0
                          ? '输'
                          : roleSelectedList[index].result === 1
                          ? '赢'
                          : '平'}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </>
                ))}
              </div>
              <div className="flex items-center justify-around">
                {[0, 1, 2].map((item, index) => (
                  <div
                    key={item}
                    className="border border-white border-dashed w-20 h-20 bg-no-repeat"
                    style={{
                      backgroundImage: `url(${
                        roleSelectedList[index]?.img || ''
                      })`,
                      backgroundSize: '100% 100%',
                    }}
                  ></div>
                ))}
              </div>
              <div
                className={classnames([
                  'flex items-center justify-center mt-8',
                  roleSelectedList.length >= 3 ? 'hidden' : '',
                ])}
              >
                <div className="text-xxl mr-12">选择你的牌：</div>
                {selectedList.map(
                  (item) =>
                    !!item && (
                      <div
                        key={item.key}
                        className={classnames([
                          'w-20 h-20 bg-no-repeat mr-4',
                          styles.selectedListItem,
                        ])}
                        style={{
                          backgroundImage: `url(${item?.img})`,
                          backgroundSize: '100% 100%',
                        }}
                        onClick={() => selectedStepHandler(item)}
                      ></div>
                    )
                )}
              </div>
            </div>
            <div className={styles.resultBox}>
              {gameOpponentList.map((item, index) => (
                <div key={index} className={styles.resultItemBox}>
                  <div
                    className={styles.resultItemImg}
                    style={{
                      backgroundImage: `url('${item.img}')`,
                    }}
                  ></div>
                  <div
                    className={`${styles[`result${item.result}`]} ${
                      item.result === 0
                        ? 'text-error'
                        : item.result === 1
                        ? 'text-success'
                        : 'text-warning'
                    }`}
                  >
                    {item.result === 0 ? '输' : item.result === 1 ? '赢' : '平'}
                  </div>
                </div>
              ))}
            </div>
            <div className={`${styles.heroName} text-secondary`}>你</div>
            <div className="flex flex-col justify-center items-center">
              <div
                className={classnames([
                  'text-xl',
                  roleSelectedList.length < 3 ? 'hidden' : '',
                ])}
              >
                游戏结果:
                <span
                  className={classnames(
                    'inline-block ml-4',
                    resultOptions.imgClass
                  )}
                >
                  {resultOptions.text}
                </span>
              </div>
              {roleSelectedList.length < 3 ? (
                <button
                  className="nes-btn is-error mt-4"
                  onClick={() => {
                    setResult(-1);
                    globalStore.gameSettlement(GameResultStatus.loss);
                    onChange(false);
                  }}
                >
                  投降
                </button>
              ) : (
                <button
                  className="nes-btn text-xl mt-4 flex"
                  onClick={() => onChange(false)}
                >
                  关闭
                  <CloseIcon />
                </button>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </Modal>
  );
};
export default observer(RockGame);
