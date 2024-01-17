import { ChangeEvent, useEffect, useMemo } from 'react';
import Modal from '@/components/modal/modal';
import CloseIcon from '@/components/closeIcon/closeIcon';
import globalStore from '@/store/store';
import { Observer, observer, useObserver } from 'mobx-react';
import config, { Audios, Config } from '@/config';
import classNames from 'classnames';
import styles from './settingsModal.module.less';
import { WIDTH, HEIGHT } from '@/const';
import modalStore, { NewModalProps } from '@/store/modalStore';

type SettingsModalProps = NewModalProps<void>;

const SettingsModal = (props: SettingsModalProps) => {
  const { isOpen, hidden } = props;
  const switchAudio = useObserver(() => globalStore.settings.switchAudio);
  const volume = useObserver(() => globalStore.settings.volume);
  const bgVolume = useObserver(() => globalStore.settings.bgVolume);
  const clickVolume = useObserver(() => globalStore.settings.clickVolume);

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

  const changeSwitch = () => {
    if (!switchAudio) {
      globalStore.audioResources.bgAudio.play();
    } else {
      globalStore.audioResources.bgAudio.stop();
    }
    globalStore.setSettings({
      ...globalStore.settings,
      switchAudio: !switchAudio,
    });
  };

  const volumeChange = (
    e: ChangeEvent<HTMLInputElement>,
    type?: 'bg' | 'click'
  ) => {
    const volumeValue = Number((Number(e.target.value) / 100).toFixed(2));
    for (let key in globalStore.audioResources) {
      if (type === 'bg' && key === 'bgAudio') {
        globalStore.audioResources[key as keyof Audios].volume = volumeValue;
      }
      if (type === 'click' && key !== 'bgAudio') {
        console.log(key);
        globalStore.audioResources[key as keyof Audios].volume = volumeValue;
      }
    }
    globalStore.setSettings({
      ...globalStore.settings,
      [type === 'bg' ? 'bgVolume' : 'clickVolume']: volumeValue,
    });
  };

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

  return (
    <Observer>
      {() => (
        <Modal
          isOpen={isOpen}
          className={styles.settingsModalBox}
          moreStyle={moreStyleHandler()}
        >
          <div className="px-4 py-4 flex flex-col text-black h-full">
            <h1 className=" text-center font-bold text-4xl mb-8 text-white">
              设置
            </h1>
            <div className="flex items-center p-4">
              <div className="text-3xl font-bold">音效</div>
              <div className="flex items-center ml-auto font-bold text-inherit ">
                {globalStore.settings.switchAudio ? '开' : '关'}
                <input
                  type="checkbox"
                  className={classNames(
                    'toggle toggle-success ml-2',
                    styles.toggleSwitch
                  )}
                  defaultChecked={switchAudio}
                  onClick={changeSwitch}
                />
              </div>
            </div>
            {globalStore.settings.switchAudio && (
              <>
                <div className="flex items-center pt-4 pl-8 bg-base-300 font-bold">
                  背景音量：
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue={Math.floor(bgVolume * 100)}
                    className="range range-xs w-3/5"
                    onChange={(e) => volumeChange(e, 'bg')}
                  />
                  <span className="ml-4">{Math.floor(bgVolume * 100)}</span>
                </div>
                <div className="flex items-center py-4 pl-8 bg-base-300 font-bold">
                  音效音量：
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    defaultValue={Math.floor(clickVolume * 100)}
                    className="range range-xs w-3/5"
                    onChange={(e) => volumeChange(e, 'click')}
                  />
                  <span className="ml-4">{Math.floor(clickVolume * 100)}</span>
                </div>
              </>
            )}
            <div className="flex items-center p-4 bg-base-300">存档管理</div>
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
