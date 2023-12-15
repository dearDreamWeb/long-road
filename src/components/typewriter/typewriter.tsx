import { useEffect, useRef, useState } from 'react';
import './typewriter.less';
import classNames from 'classnames';

interface TypeWriterProps {
  text: string;
  color?: string;
  rectColor?: string;
  time?: number;
}

const TypeWriter = (props: TypeWriterProps) => {
  const { text, time = 100, color, rectColor } = props;
  const [currentText, setCurrentText] = useState('');
  let timer = useRef<NodeJS.Timer | null>(null);
  useEffect(() => {
    timer.current && clearInterval(timer.current);
    const len = text.length;
    let i = 1;
    setCurrentText(text.slice(0, i));
    timer.current = setInterval(() => {
      if (i >= len) {
        clearInterval(timer.current!);
        return;
      }
      i++;
      setCurrentText(text.slice(0, i));
    }, time);
  }, [text]);
  return (
    <div className="type-writer-box" style={{ color: color || 'inherit' }}>
      {currentText}
      <span
        className={classNames([
          'rect',
          { typingEnd: currentText.length === text.length },
        ])}
        style={{ backgroundColor: rectColor || '#fff' }}
      ></span>
    </div>
  );
};

export default TypeWriter;
