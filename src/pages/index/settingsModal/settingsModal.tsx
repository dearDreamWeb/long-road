import { ChangeEvent } from 'react';
import Modal from '@/components/modal/modal';
import CloseIcon from '@/components/closeIcon/closeIcon';
import globalStore from '@/store/store';
import { observer, useObserver } from 'mobx-react';
import config, { Audios, Config } from '@/config';
import classNames from 'classnames';
import styles from './settingsModal.module.less';

interface SettingsModalProps {
  isOpen: boolean;
  onClose(): void;
}

const SettingsModal = (props: SettingsModalProps) => {
  const { isOpen, onClose } = props;
  const switchAudio = useObserver(() => globalStore.settings.switchAudio);
  const volume = useObserver(() => globalStore.settings.volume);
  const bgVolume = useObserver(() => globalStore.settings.bgVolume);
  const clickVolume = useObserver(() => globalStore.settings.clickVolume);

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

  return (
    <Modal isOpen={isOpen} height={200} className={styles.settingsModalBox}>
      <div className="py-4 flex flex-col bg-cyan-100">
        <h1 className=" text-center font-bold text-4xl mb-8">设置</h1>
        <div className="flex items-center p-4 bg-cyan-200">
          <div className="text-3xl font-bold">音效</div>
          <div className="flex items-center ml-auto font-bold text-inherit">
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
            <div className="flex items-center pt-4 pl-8 bg-cyan-200">
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
            <div className="flex items-center pt-4 pl-8 bg-cyan-200">
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
        <div className="flex justify-center items-center mt-auto">
          <button
            className="nes-btn flex items-center px-8 text-xl m-auto mt-4 ml-auto"
            onClick={() => onClose()}
          >
            关闭
            <CloseIcon />
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default observer(SettingsModal);
