import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Modal from '@/components/modal/modal';
import CloseIcon from '@/components/closeIcon/closeIcon';
import globalStore from '@/store/store';
import { Observer, observer, useObserver } from 'mobx-react';
import config, { Audios, Config } from '@/config';
import classNames from 'classnames';
import styles from './settingsModal.module.less';
import { WIDTH, HEIGHT } from '@/const';
import modalStore, { NewModalProps } from '@/store/modalStore';
import AudioSettings from './components/audioSettings/audioSettings';
import ProgressManage from './components/progressManage/progressManage';

type SettingsModalProps = NewModalProps<void>;

const SettingsModal = (props: SettingsModalProps) => {
  const { isOpen, hidden } = props;
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const keyDownClose = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      hidden();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', keyDownClose);
    return () => {
      document.removeEventListener('keydown', keyDownClose);
    };
  }, [isOpen]);

  const moreStyleHandler = (): React.CSSProperties => {
    const mainCanvasDom = document.querySelector('#mainCanvas');
    if (!mainCanvasDom) {
      return {};
    }
    const { x, y, width, height } = mainCanvasDom.getBoundingClientRect();
    return {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  const settingsList = useMemo(() => {
    return [
      { key: '0', label: '音效设置', component: AudioSettings },
      { key: '1', label: '存档设置', component: ProgressManage },
    ];
  }, []);

  const selectInfo = useMemo(() => {
    return settingsList[selectedIndex];
  }, [selectedIndex]);

  return (
    <Observer>
      {() => (
        <Modal
          isOpen={isOpen}
          className={styles.settingsModalBox}
          moreStyle={moreStyleHandler()}
        >
          {selectedIndex > -1 ? (
            <selectInfo.component
              onClose={() => {
                setSelectedIndex(-1);
              }}
            />
          ) : (
            <div className="px-4 py-4 flex flex-col text-black h-full font-bold">
              <h1 className=" text-center font-bold text-4xl mb-8 text-white">
                设置
              </h1>
              {settingsList.map((item, index) => (
                <div
                  key={item.key}
                  className="flex items-center p-4 mb-4 bg-base-300 font-bold hover:bg-base-200"
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                >
                  {item.label}
                </div>
              ))}

              <div className="flex justify-center items-center mt-auto">
                <button
                  className="nes-btn flex items-center px-8 text-xl m-auto mt-4 ml-auto"
                  onClick={() => hidden()}
                >
                  关闭
                  <CloseIcon />
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </Observer>
  );
};

export const openSettingsModal = async (props?: SettingsModalProps) => {
  const data = await modalStore.open(SettingsModal as any, props || {});
  return data;
};

export default observer(SettingsModal);
