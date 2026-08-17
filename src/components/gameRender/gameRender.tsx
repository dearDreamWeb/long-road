import globalStore from '@/store/store';
import { useEffect, useMemo, useState } from 'react';
import BlackjackGame from '../blackjackGame/blackjackGame';
import RockGame from '../rockGame/rockGame';
import KnowledgeGame from '../knowledgeGame/knowledgeGame';
import SlotMachineGame from '../slotMachineGame/slotMachineGame';
import { observer } from 'mobx-react';
import dbStore from '@/store/dbStore';
import { TypeEnum } from '@/db/db';
import seedrandom from 'seedrandom';
import roleStore from '@/store/roleStore';

const DUEL_GAME_COUNT = 3;
const SLOT_MACHINE_INDEX = 3;

const GameRender = () => {
  const [startGame, setStartGame] = useState(false);
  const [gameIndex, setGameIndex] = useState<null | number>(null);
  const random = seedrandom();

  const gameList = useMemo(() => {
    return [
      {
        key: 'rock',
        name: '石头剪刀布',
        componentRender: () => (
          <RockGame
            key="rock"
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
            key="blackjack"
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
            key="knowledge"
            isOpen={globalStore.showGameModal}
            onChange={(value) => (globalStore.showGameModal = value)}
          />
        ),
      },
      {
        key: 'slotMachine',
        name: '幸运抽奖',
        componentRender: () => (
          <SlotMachineGame
            key="slotMachine"
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
      globalStore.isEnd = false;
    }
  }, [globalStore.showGameModal]);

  useEffect(() => {
    if (!globalStore.showGameModal || startGame) {
      return;
    }
    const rate = random();
    const isSlotMachine = rate > 0.92 && roleStore.coins >= 20;
    const randomIndex = isSlotMachine
      ? SLOT_MACHINE_INDEX
      : Math.floor(random() * DUEL_GAME_COUNT);

    setStartGame(true);
    setGameIndex(randomIndex);
    dbStore.addLogger({
      type: TypeEnum.Info,
      content: isSlotMachine
        ? '路遇幸运抽奖机，可花费金币抽奖（无惩罚）'
        : `决斗游戏名：${gameList[randomIndex].name}`,
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
