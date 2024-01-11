import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import './message.less';

type Position = 'top';

type RenderReturn = (
  content: string | RenderProps,
  duration?: number,
  onClose?: () => void
) => Promise<void>;

// type RenderReturn2 = (params: RenderProps) => void;

// type RenderReturn = RenderReturn1 | RenderReturn2;

interface MessageProps {
  info: RenderReturn;
  success: RenderReturn;
  warning: RenderReturn;
  error: RenderReturn;
}
interface MessageComponentProps {
  type: string;
  content: string;
}

interface RenderProps {
  content: string;
  duration?: number;
  onClose?(): void;
  position?: Position;
  single?: boolean;
}

function MessageComponent(props: MessageComponentProps) {
  const { type, content } = props;
  const typeIconClassName = useMemo(() => {
    switch (type) {
      case 'info':
        return 'nes-bcrikko';
      case 'success':
        return 'nes-bulbasaur';
      case 'warning':
        return 'nes-squirtle';
      case 'error':
        return 'nes-charmander';
      default:
        return 'nes-bcrikko';
    }
  }, [type]);
  return (
    <div>
      <section className="flex">
        <i className={classNames(typeIconClassName, 'mr-4')}></i>
        <div className="nes-balloon from-left is-dark">
          <span className="tracking-3">{content}</span>
        </div>
      </section>
      {/* <div className={classNames(['alert', `alert-${type}`])}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>{content}</span>
      </div> */}
    </div>
  );
}

const handlerParams = <T extends RenderProps>(
  params: string | T,
  duration: number,
  onClose?: () => void
) => {
  if (typeof params === 'string') {
    return { content: params, duration, onClose } as T;
  }
  return {
    ...(params as RenderProps),
    duration: params.duration || duration,
  } as T;
};

const render = (type: string) => {
  function messageRender(
    options: string | RenderProps,
    duration?: number,
    onClose?: () => void
  ): Promise<void>;

  function messageRender(
    options: string | RenderProps,
    duration = 3000,
    onCloseFunction?: () => void
  ) {
    const {
      content,
      onClose,
      duration: handlerDuration,
      position,
      single,
    } = handlerParams<RenderProps>(options, duration, onCloseFunction);

    duration = handlerDuration || duration;

    return new Promise((resolve) => {
      const messageWrapperDom = document.getElementById('message-wrapper')!;
      if (!messageWrapperDom) {
        return;
      }
      if (position === 'top') {
        messageWrapperDom.style.top = `20%`;
      } else {
        messageWrapperDom.style.top = `50%`;
      }

      if (single) {
        const messageDomList = document.querySelectorAll('.messageBox');
        messageDomList.forEach((dom) => dom.remove());
      }

      const el = document.createElement('div');
      messageWrapperDom.append(el);
      el.setAttribute('class', 'messageBox');
      el.style.animationDuration = `${duration}ms`;
      const root = ReactDOM.createRoot(el);
      root.render(<MessageComponent type={type} content={content} />);
      setTimeout(() => {
        el.remove();
        resolve(null);
        onClose && onClose();
      }, duration);
    });
  }
  return messageRender;
};

const message: MessageProps = {
  success: render('success'),
  info: render('info'),
  warning: render('warning'),
  error: render('error'),
};

export default message;
