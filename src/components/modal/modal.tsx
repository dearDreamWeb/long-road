import { useEffect, PropsWithChildren, useState } from 'react';
import { createPortal } from 'react-dom';
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

  return isOpen
    ? createPortal(
        <div className={classnames(['modal-wrap', className || ''])}>
          <div className="modal-main" style={styles}>
            {props.children}
          </div>
        </div>,
        document.body
      )
    : null;
}
