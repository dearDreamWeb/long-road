import React, { useState } from 'react';
import { useObserver, Observer } from 'mobx-react';
import dbStore from '@/store/dbStore';
import dayjs from 'dayjs';
import message from '@/components/message/message';
import { ProgressTableItem } from '@/db/db';
import classNames from 'classnames';
import modalStore from '@/store/modalStore';
import globalStore from '@/store/store';
import { DEDAULTVALUES } from '@/store/roleStore';

function ProgressManage({ onClose }: { onClose: () => void }) {
  const progressList = useObserver(() => dbStore.progressList);
  const currentProgressId = useObserver(() => dbStore.currentProgressId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [createGameModal, setCreateGameModal] = useState(false);
  const [progressData, setProgressData] = useState<ProgressTableItem>();

  return (
    <div className="relative px-4 py-4 flex flex-col text-black h-full font-bold">
      <h1 className="text-center font-bold text-4xl mb-8 text-white">
        存档设置
      </h1>
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-x-24 gap-y-4 grid-cols-2">
          {progressList.map((item) => (
            <div
              key={item.id}
              className={classNames([
                'bg-base-300 p-2',
                item.id === currentProgressId ? 'bg-orange-100' : '',
              ])}
            >
              <div className="flex justify-center">{item.name}</div>
              <div>
                时间：{dayjs(item.updateAt).format('YYYY-MM-DD HH:mm:ss')}
              </div>
              <ul>
                <li>周目：{item.weeks || 1}</li>
                <li>关卡：{item.level}</li>
                <li>视野：{item.viewDistance}</li>
                <li>保护罩：{item.purifyCount}</li>
                <li>金币：{item.coins}</li>
                <li>反向：{item.isReverse ? '是' : '否'}</li>
              </ul>
              <div className="flex justify-center mt-4">
                <div
                  className="diy-hover-cursor hover:text-success"
                  data-click="true"
                  onClick={() => {
                    setProgressData(item);
                    setShowCreateModal(true);
                  }}
                >
                  重命名
                </div>
                {currentProgressId !== item.id && (
                  <>
                    <div
                      className="mx-8 diy-hover-cursor hover:text-success"
                      data-click="true"
                      onClick={async () => {
                        await dbStore.loadingProgress(item.id);
                        modalStore.clear();
                        message.success('读取存档成功');
                        await globalStore.init();
                      }}
                    >
                      读取存档
                    </div>
                    <div
                      className="diy-hover-cursor hover:text-success"
                      data-click="true"
                      onClick={async () => {
                        setProgressData(item);
                        setConfirmDeleteModal(true);
                        //   await dbStore.deleteProgress(item.id!);
                      }}
                    >
                      删除存档
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center mt-8">
        <button
          className="nes-btn flex items-center px-8 text-xl mr-8"
          data-click="true"
          onClick={async () => {
            if (progressList.length >= 8) {
              message.info('存档最多为8个');
              return;
            }
            setCreateGameModal(true);
          }}
        >
          新建游戏
        </button>
        <button
          className="nes-btn flex items-center px-8 text-xl mr-8"
          data-click="true"
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
          data-click="true"
          onClick={() => {
            onClose?.();
          }}
        >
          返回设置
        </button>
      </div>

      {showCreateModal && (
        <div className="absolute w-full h-full top-0 left-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="px-4 py-8 bg-white">
            <input
              type="text"
              className="nes-input w-full"
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
                data-click="true"
                onClick={() => {
                  setShowCreateModal(false);
                  setProgressData({} as ProgressTableItem);
                }}
              >
                取消
              </button>
              <button
                className="nes-btn flex items-center px-8 text-xl"
                data-click="true"
                onClick={async () => {
                  if (!progressData?.name) {
                    message.info('存档名不能为空');
                    return;
                  }

                  if (progressData?.name.length > 16) {
                    message.info('存档名不能超过16个字');
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

      {confirmDeleteModal && (
        <div className="absolute w-full h-full top-0 left-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="px-4 py-8 bg-white">
            <div>存档删除数据将无法恢复，确定删除该存档？</div>
            <div className="flex justify-center items-center mt-8">
              <button
                className="nes-btn flex items-center px-8 text-xl mr-8"
                data-click="true"
                onClick={() => {
                  setConfirmDeleteModal(false);
                  setProgressData({} as ProgressTableItem);
                }}
              >
                取消
              </button>
              <button
                className="nes-btn flex items-center px-8 text-xl"
                data-click="true"
                onClick={async () => {
                  await dbStore.deleteProgress(progressData!.id!);
                  message.success('删除成功');
                  setConfirmDeleteModal(false);
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {createGameModal && (
        <div className="absolute w-full h-full top-0 left-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="px-4 py-8 bg-white">
            <div>新建游戏将重新开始，是否新建游戏？</div>
            <div className="flex justify-center items-center mt-8">
              <button
                className="nes-btn flex items-center px-8 text-xl mr-8"
                data-click="true"
                onClick={() => {
                  setCreateGameModal(false);
                }}
              >
                取消
              </button>
              <button
                className="nes-btn flex items-center px-8 text-xl"
                data-click="true"
                onClick={async () => {
                  const newId = await dbStore.addProgress(void 0, {
                    ...DEDAULTVALUES,
                    level: 1,
                    loggerList: [],
                  });
                  localStorage.setItem('currentProgressId', String(newId));
                  setCreateGameModal(false);
                  modalStore.clear();
                  globalStore.loadResource();
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
