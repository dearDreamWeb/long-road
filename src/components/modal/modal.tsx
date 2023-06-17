import { useEffect, PropsWithChildren, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { randomHash } from '@/utils';
import './modal.less';

interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
}

export default function Modal(props: ModalProps) {
  const { isOpen } = props;
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
      <div className="modal-wrap">
        <div className="modal-main">{props.children}</div>
      </div>
    );
  }, [isOpen]);

  return null;
}
