import React from 'react';
import { useObserver, Observer } from 'mobx-react';
import dbStore from '@/store/dbStore';
import dayjs from 'dayjs';

function ProgressManage({ onClose }: { onClose: () => void }) {
  const progressList = useObserver(() => dbStore.progressList);
  const currentProgressIndex = useObserver(() => dbStore.currentProgressIndex);

  return (
    <div className="px-4 py-4 flex flex-col text-black h-full font-bold overflow-y-auto">
      <h1 className=" text-center font-bold text-4xl mb-8 text-white">
        存档设置
      </h1>
      <div
        onClick={() => {
          dbStore.addProgress();
        }}
      >
        新建存档
      </div>
      <div className="grid gap-x-24 gap-y-4 grid-cols-2">
        {progressList.map((item) => (
          <div key={item.id} className="bg-base-300 p-2">
            <div className="flex justify-center">{item.name}</div>
            <div>
              时间：{dayjs(item.updateAt).format('YYYY-MM-DD HH:mm:ss')}
            </div>
            <ul>
              <li>关卡：{item.level}</li>
              <li>视野：{item.viewDistance}</li>
              <li>保护罩：{item.purifyCount}</li>
              <li>金币：{item.coins}</li>
              <li>反向：{item.isReverse ? '是' : '否'}</li>
            </ul>
            <div className="flex justify-center mt-4">
              <div className="diy-hover-cursor hover:text-success">
                读取存档
              </div>
              <div
                className="ml-8 diy-hover-cursor hover:text-success"
                onClick={async () => {
                  await dbStore.deleteProgress(item.id!);
                }}
              >
                删除存档
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mt-4">
        <button
          className="nes-btn flex items-center px-8 text-xl m-auto mt-4 ml-auto"
          onClick={() => {
            onClose?.();
          }}
        >
          返回设置
        </button>
      </div>
    </div>
  );
}

export default ProgressManage;
