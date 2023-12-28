import React, { useState, useEffect, useMemo, useRef } from 'react';
import knowledgeQuestions from '@/assets/data/knowledgeQuestions.json';
import Modal from '../modal/modal';
import styles from './knowledgeGame.module.less';
import Typewriter from '../typewriter/typewriter';
import classNames from 'classnames';
import CloseIcon from '../closeIcon/closeIcon';
import globalStore from '@/store/store';
import { GameResultStatus } from '@/typings';

interface KnowledgeGameProps {
  isOpen: boolean;
  onChange(value: boolean): void;
}
interface ResultListItem {
  result: number | null;
  right: boolean;
}

/**每个问题的时间 */
const QUESTTIME = 15;

const KnowledgeGame = (props: KnowledgeGameProps) => {
  const { isOpen, onChange } = props;
  //   const [questionsList, setQuestionsList] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resultList, setResultList] = useState<ResultListItem[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const timer = useRef<NodeJS.Timer | null>(null);
  const [seconds, setSeconds] = useState(QUESTTIME);

  const getRandomIndex = (selectedList: number[], size: number): number => {
    const random = Math.floor(Math.random() * size);
    if (selectedList.includes(random)) {
      return getRandomIndex(selectedList, size);
    }
    return random;
  };

  const questionsList = useMemo(() => {
    let indexList: number[] = [];
    for (let i = 0; i < 5; i++) {
      indexList.push(getRandomIndex(indexList, knowledgeQuestions.length));
    }
    return indexList.map((indexValue) => knowledgeQuestions[indexValue]);
  }, []);

  const currentQuestionInfo = useMemo(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    let _seconds = QUESTTIME;
    setSeconds(_seconds);
    timer.current = setInterval(() => {
      if (_seconds <= 0) {
        timer.current && clearInterval(timer.current);
        timer.current = null;
        selectedResult(null);
        return;
      }
      _seconds -= 10 / 1000;
      setSeconds(_seconds);
    }, 10);
    return questionsList[currentIndex];
  }, [questionsList, currentIndex]);

  const selectedResult = (result: number | null) => {
    setResultList([
      ...resultList,
      { result, right: result === currentQuestionInfo.result },
    ]);
    console.log(
      '-----',
      [...resultList, { result, right: result === currentQuestionInfo.result }],
      questionsList
    );
    if (currentIndex === questionsList.length - 1) {
      setGameOver(true);
      return;
    }
    setCurrentIndex(currentIndex + 1);
  };

  const isWin = useMemo(() => {
    if (!gameOver) {
      return false;
    }
    const result =
      resultList.filter((item) => item.right).length >=
      questionsList.length / 2;
    globalStore.gameSettlement(
      result ? GameResultStatus.win : GameResultStatus.loss
    );
    return result;
  }, [gameOver, resultList, questionsList]);

  return (
    <Modal
      isOpen={isOpen}
      className={styles.modalBox}
      width={700}
      height={700}
      mainAnimation
    >
      <div
        className={classNames(
          styles.knowledgeGameBox,
          'flex flex-col relative'
        )}
      >
        <h1 className="title-1 text-shadow">决斗吧，骚年--《知识竞赛》</h1>
        <p className="nes-text">规则：</p>
        <Typewriter text="游戏的目标是在五道题答对三道及以上为胜利，否则失败。"></Typewriter>
        {!gameOver ? (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <ul className="steps grow">
                {questionsList.map((item, questionIndex) => (
                  <li
                    key={item.title}
                    className={classNames([
                      'step',
                      resultList.length - 1 >= questionIndex
                        ? resultList[questionIndex].right
                          ? 'step-accent'
                          : 'step-error'
                        : 'step-warning',
                    ])}
                    data-content={
                      resultList.length - 1 >= questionIndex
                        ? resultList[questionIndex].right
                          ? '✓'
                          : '✕'
                        : '?'
                    }
                  ></li>
                ))}
              </ul>
              <p className="w-32 text-right">
                进度：<span>{currentIndex + 1}</span>/
                <span>{questionsList.length}</span>
              </p>
            </div>
            <h1 className="mt-4 text-2xl">{currentQuestionInfo.title}</h1>
            <div className="flex items-center">
              <progress
                className={classNames([
                  'progress progress-success h-1',
                  seconds <= 10 ? 'progress-warning' : '',
                  seconds <= 5 ? 'progress-error' : '',
                ])}
                value={QUESTTIME - seconds}
                max={QUESTTIME}
              ></progress>
              <span className="block ml-3 w-16 text-lg">
                {Math.ceil(seconds)}s
              </span>
            </div>
            <ul className="mt-4">
              {currentQuestionInfo.options.map((item, index) => (
                <li
                  key={item}
                  className="text-lg pl-2 py-2 hover:bg-primary diy-hover-cursor"
                  onClick={() => selectedResult(index)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="m-auto">
            <div className="text-2xl">
              总共「{questionsList.length}」道,答对
              <span className="text-success">
                {resultList.filter((item) => item.right).length}
              </span>
              道
            </div>
            <h1
              className={classNames([
                'my-16 flex justify-center flex-auto items-center text-6xl',
                isWin ? 'text-success' : 'text-error',
              ])}
            >
              {isWin ? '你赢了' : '你输了'}
            </h1>
            <button
              className="nes-btn is-primary block m-auto"
              onClick={() => setShowDetails(true)}
            >
              查看详情
            </button>
            <button
              className="nes-btn px-8 text-xl m-auto mt-4  flex items-center"
              onClick={() => onChange(false)}
            >
              关闭
              <CloseIcon />
            </button>
          </div>
        )}
        {showDetails && (
          <div className="absolute left-0 top-0 w-full h-full bg-neutral p-4 h-full overflow-y-auto">
            <div className="text-lg flex items-center justify-between">
              <div>
                总共「{questionsList.length}」道,答对
                <span className="text-success">
                  {resultList.filter((item) => item.right).length}
                </span>
                道
              </div>
              <button className="nes-btn" onClick={() => setShowDetails(false)}>
                返回
              </button>
            </div>
            {questionsList.map((item, index) => (
              <div key={item.title} className="mt-4">
                <h1 className="text-2xl">
                  {item.title}
                  {resultList[index].result === null ? (
                    <span className="text-error">（回答超时）</span>
                  ) : null}
                </h1>
                <ul className="mt-2 text-lg">
                  {item.options.map((optionItem, subIndex) => (
                    <li
                      key={optionItem}
                      className={classNames([
                        resultList[index].result === subIndex ? 'bg-error' : '',
                        item.result === subIndex ? 'bg-success' : '',
                      ])}
                    >
                      {optionItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default KnowledgeGame;
