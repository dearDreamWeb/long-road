import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import './message.less';

type RenderReturn = (
  content: string,
  duration?: number,
  onClose?: () => void
) => void;

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
  type: string;
}

function MessageComponent(props: MessageComponentProps) {
  const { type, content } = props;
  return (
    <div>
      <div className={classNames(['alert', `alert-${type}`])}>
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
      </div>
    </div>
  );
}

const render = (type: string) => {
  return (content: string, duration = 3000, onClose?: () => void) => {
    const el = document.createElement('div');
    document.getElementById('message-wrapper')!.append(el);
    el.setAttribute('class', 'messageBox');
    el.style.animationDuration = `${duration}ms`;
    const root = ReactDOM.createRoot(el);
    root.render(<MessageComponent type={type} content={content} />);
    setTimeout(() => {
      el.remove();
      onClose && onClose();
    }, duration);
  };
};

const message: MessageProps = {
  success: render('success'),
  info: render('info'),
  warning: render('warning'),
  error: render('error'),
};

export default message;
