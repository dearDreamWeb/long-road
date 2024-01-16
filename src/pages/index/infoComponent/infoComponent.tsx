import React, { useRef, useEffect, useMemo } from 'react';
import { observer, useObserver, Observer } from 'mobx-react';
import roleStore from '@/store/roleStore';
import coinImg from '@/assets/images/coin.png';
import dbStore from '@/store/dbStore';
import dayjs from 'dayjs';
import { LoggerTableItem, TypeEnum } from '@/db/db';
import classNames from 'classnames';

function DisplayContent({ info }: { info: LoggerTableItem }) {
  const { focus, content, type } = info;

  let classNameStr = useMemo(() => {
    let str = '';
    switch (type) {
      case TypeEnum.LoseDuel:
        str = 'text-error';
        break;
      case TypeEnum.TieDuel:
        str = 'text-warning';
        break;
      default:
        str = '';
        break;
    }
    return str;
  }, [type]);

  if (focus && content.includes(focus)) {
    const startIndex = content.indexOf(focus);
    const endIndex = startIndex + focus.length;

    return (
      <div className="flex items-center">
        {content.slice(0, startIndex)}
        <span
          className={classNames([
            'inline-block mx-2 text-success',
            classNameStr,
          ])}
        >
          {focus}
        </span>
        {content.slice(endIndex + 1)}
      </div>
    );
  } else {
    return <div className={classNameStr}>{content}</div>;
  }
}

function InfoComponent() {
  const loggerList = useObserver(() => dbStore.loggerList);
  const parentRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    parentRef.current!.scrollTop = parentRef.current!.scrollHeight;
  }

  useEffect(() => {
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });
    const config = { childList: true, subtree: true };
    observer.observe(parentRef.current!, config);
  }, []);

  const infoList = useMemo(() => {
    const obj: Record<number, LoggerTableItem[]> = {};
    loggerList.forEach((item) => {
      if (obj[item.level]) {
        obj[item.level].push(item);
      } else {
        obj[item.level] = [item];
      }
    });
    return Object.values(obj);
  }, [loggerList]);

  return (
    <Observer>
      {() => (
        <div className="absolute top-0 left-full ml-8 w-128 px-4 py-8 h-full backdrop-blur-sm flex flex-col">
          <div className="flex items-center">
            <span className="text-2xl font-bold">
              金币：<span>{roleStore.coins}</span>
            </span>
            <img src={coinImg} alt="coin" className="h-8 ml-4" />
          </div>
          <div
            className="bg-base-content text-white px-4 py-2 mt-8 text-base h-96 overflow-y-auto flex-1 font-bold"
            ref={parentRef}
          >
            {infoList.map((list) => (
              <div key={list[0].level}>
                {list.map((item, index) => (
                  <div className="my-2" key={item.id}>
                    {index === 0 && (
                      <h1 className="py-8 flex justify-center text-2xl font-bold text-white">
                        关卡：{item.level}
                      </h1>
                    )}
                    <title className="inline-block text-xs text-primary">
                      {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </title>
                    <DisplayContent info={item} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </Observer>
  );
}

export default observer(InfoComponent);
