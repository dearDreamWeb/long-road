import { useEffect, PropsWithChildren, useState, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { randomHash } from '@/utils';
import './modal.less';
import classnames from 'classnames';

export interface ModalProps extends PropsWithChildren {
  isOpen: boolean;
  moreStyle?: CSSProperties;
  mainAnimation?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function Modal(props: ModalProps) {
  const { isOpen, className, width, height, moreStyle, mainAnimation } = props;
  const rootSize = parseInt(document.body.style.fontSize);
  const styles = {
    ...(width ? { width: `${width / rootSize}rem` } : {}),
    ...(height ? { height: `${height / rootSize}rem` } : {}),
    ...(moreStyle || {}),
  };

  return isOpen
    ? createPortal(
        <div className={classnames(['modal-wrap', className || ''])}>
          <div
            className={classnames([
              'modal-main',
              { 'main-animation': mainAnimation },
            ])}
            style={styles}
          >
            {props.children}
          </div>
        </div>,
        document.body
      )
    : null;
}
