import React, { useState } from 'react';
import { useObserver, Observer } from 'mobx-react';
import dbStore from '@/store/dbStore';
import dayjs from 'dayjs';
import message from '@/components/message/message';
import { ProgressTableItem } from '@/db/db';

function ProgressManage({ onClose }: { onClose: () => void }) {
  const progressList = useObserver(() => dbStore.progressList);
  const currentProgressId = useObserver(() => dbStore.currentProgressId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [progressData, setProgressData] = useState<ProgressTableItem>();

  return (
    <div className="relative px-4 py-4 flex flex-col text-black h-full font-bold overflow-y-auto">
      <h1 className="text-center font-bold text-4xl mb-8 text-white">
        存档设置
      </h1>
      <div className="grid gap-x-24 gap-y-4 grid-cols-2">
        {progressList.map((item) => (
          <div key={item.id} className="bg-base-300 p-2">
            <div className="flex justify-center">
              {item.name}
              <span
                onClick={() => {
                  setProgressData(item);
                  setShowCreateModal(true);
                }}
              >
                修改
              </span>
            </div>
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
      <div className="flex justify-center items-center mt-8">
        <button
          className="nes-btn flex items-center px-8 text-xl mr-8"
          onClick={async () => {
            if (progressList.length >= 8) {
              message.info('存档最多为8个');
              return;
            }
            await dbStore.addProgress();
            message.success('新建存档成功');
          }}
        >
          新建存档
        </button>
        <button
          className="nes-btn flex items-center px-8 text-xl"
          onClick={() => {
            onClose?.();
          }}
        >
          返回设置
        </button>
      </div>

      {showCreateModal && (
        <div className="absolute w-full h-full bg-black bg-opacity-30 flex justify-center items-center">
          <div className="px-4 py-8 bg-white">
            <input
              type="text"
              className="nes-input w-2/3"
              placeholder="请输入存档名字"
              value={progressData?.name}
              onChange={(e) => {
                setProgressData({
                  ...((progressData || {}) as ProgressTableItem),
                  name: e.target.value,
                });
              }}
            />
            <div className="flex justify-center items-center mt-8">
              <button
                className="nes-btn flex items-center px-8 text-xl mr-8"
                onClick={() => {
                  setShowCreateModal(false);
                  setProgressData({} as ProgressTableItem);
                }}
              >
                取消
              </button>
              <button
                className="nes-btn flex items-center px-8 text-xl"
                onClick={async () => {
                  if (!progressData?.name) {
                    message.info('存档名不能为空');
                    return;
                  }
                  const isHas = progressList
                    .filter((item) => item.id !== progressData.id)
                    .some((item) => item.name === progressData.name);
                  if (isHas) {
                    message.info('存档名已存在');
                    return;
                  }

                  await dbStore.updateProgress(progressData.id!, {
                    name: progressData.name,
                  });
                  message.success('修改成功');
                  setShowCreateModal(false);
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressManage;
