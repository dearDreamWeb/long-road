import { ChangeEvent } from 'react';
import Modal from '@/components/modal/modal';
import CloseIcon from '@/components/closeIcon/closeIcon';
import store from '@/store/store';
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
  const switchAudio = useObserver(() => store.settings.switchAudio);
  const volume = useObserver(() => store.settings.volume);

  const changeSwitch = () => {
    if (!switchAudio) {
      store.audioResources.bgAudio.play();
    } else {
      store.audioResources.bgAudio.stop();
    }
    store.setSettings({
      ...store.settings,
      switchAudio: !switchAudio,
    });
  };

  const volumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const volumeValue = Number((Number(e.target.value) / 100).toFixed(2));
    for (let key in store.audioResources) {
      store.audioResources[key as keyof Audios].volume = volumeValue;
    }
    store.setSettings({
      ...store.settings,
      volume: volumeValue,
    });
  };

  return (
    <Modal isOpen={isOpen} height={200}>
      <div className="py-4 flex flex-col h-full bg-cyan-100">
        <h1 className=" text-center font-bold text-4xl mb-8">设置</h1>
        <div className="flex items-center p-4 bg-cyan-200">
          <div className="text-3xl font-bold">音效</div>
          <div className="flex items-center ml-auto font-bold text-inherit">
            {store.settings.switchAudio ? '开' : '关'}
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
        {store.settings.switchAudio && (
          <div className="flex items-center pt-4 pl-8 bg-cyan-200">
            音量：
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              defaultValue={Math.floor(volume * 100)}
              className="w-3/5"
              onChange={volumeChange}
            />
            <span className="ml-4">{Math.floor(volume * 100)}</span>
          </div>
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
