import React from 'react';
import { observer, useObserver, Observer } from 'mobx-react';
import roleStore from '@/store/roleStore';
import coinImg from '@/assets/images/coin.png';

function InfoComponent() {
  return (
    <div className="absolute top-0 left-full ml-8 w-128 px-4 py-8 h-full backdrop-blur-sm">
      <div className="flex items-center">
        <span className=" text-2xl font-bold">
          金币：<span>{roleStore.coins}</span>
        </span>
        <img src={coinImg} alt="coin" className="h-8 ml-4" />
      </div>
    </div>
  );
}

export default observer(InfoComponent);
