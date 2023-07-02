import { useEffect, useRef, useState } from 'react';
import './typewriter.less';

interface TypeWriterProps {
  text: string;
  time?: number;
}

const TypeWriter = (props: TypeWriterProps) => {
  const { text, time = 100 } = props;
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
    <div className="typeWriterBox">
      {currentText}
      <span className="rect"></span>
    </div>
  );
};

export default TypeWriter;
