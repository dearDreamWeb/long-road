import { useEffect, PropsWithChildren, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { randomHash } from '@/utils';
import './modal.less';
import classnames from 'classnames';

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function Modal(props: ModalProps) {
  const { isOpen, className, width, height } = props;
  const styles = {
    ...(width ? { width: `${width}px` } : {}),
    ...(height ? { height: `${height}px` } : {}),
  };
  const [domId, setDomId] = useState('');
  useEffect(() => {
    if (!isOpen) {
      const existDom = document.getElementById(`${domId}`);
      if (existDom) {
        existDom.remove();
      }
      return;
    }
    const id = `modal-${randomHash()}`;
    setDomId(id);
    const dom = document.createElement('div');
    dom.id = id;
    document.body.appendChild(dom);
    ReactDOM.createRoot(document.getElementById(id) as HTMLElement).render(
      <div className={classnames(['modal-wrap', className || ''])}>
        <div className="modal-main" style={styles}>
          {props.children}
        </div>
      </div>
    );
  }, [isOpen]);

  return null;
}
