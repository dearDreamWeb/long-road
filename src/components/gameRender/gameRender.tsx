import globalStore from '@/store/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import BlackjackGame from '../blackjackGame/blackjackGame';
import RockGame from '../rockGame/rockGame';
import KnowledgeGame from '../knowledgeGame/knowledgeGame';
import { observer } from 'mobx-react';
import dbStore from '@/store/dbStore';
import { TypeEnum } from '@/db/db';

const GameRender = () => {
  const [startGame, setStartGame] = useState(false);
  const [gameIndex, setGameIndex] = useState<null | number>(null);

  const gameList = useMemo(() => {
    return [
      {
        key: 'rock',
        name: '石头剪刀布',
        componentRender: () => (
          <RockGame
            isOpen={globalStore.showGameModal}
            onChange={(value) => (globalStore.showGameModal = value)}
          />
        ),
      },
      {
        key: 'blackjack',
        name: '21点',
        componentRender: () => (
          <BlackjackGame
            isOpen={globalStore.showGameModal}
            onChange={(value) => (globalStore.showGameModal = value)}
          />
        ),
      },
      {
        key: 'knowledge',
        name: '知识竞赛',
        componentRender: () => (
          <KnowledgeGame
            isOpen={globalStore.showGameModal}
            onChange={(value) => (globalStore.showGameModal = value)}
          />
        ),
      },
    ];
  }, [globalStore.showGameModal]);

  useEffect(() => {
    if (!globalStore.showGameModal) {
      setStartGame(false);
      setGameIndex(null);
    }
  }, [globalStore.showGameModal]);

  useEffect(() => {
    if (!globalStore.showGameModal || startGame) {
      return;
    }
    // const randomIndex = 0;
    const randomIndex = Math.floor(Math.random() * gameList.length);
    console.log('random game', randomIndex, gameList.length);
    setStartGame(true);
    setGameIndex(randomIndex);
    dbStore.addLogger({
      type: TypeEnum.Info,
      content: `决斗游戏名：${gameList[randomIndex].name}`,
      focus: gameList[randomIndex].name,
    });
  }, [gameList, globalStore.showGameModal, startGame, gameIndex]);

  if (!globalStore.showGameModal) {
    return null;
  }
  return (
    <>
      {typeof gameIndex === 'number' && gameList[gameIndex].componentRender()}
    </>
  );
};

export default observer(GameRender);
