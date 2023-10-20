import { useEffect, useRef } from 'react';
import './mosaicImg.less';
import { RATE } from '@/const';
import classNames from 'classnames';

interface MosaicImgProps {
  imgUrl: string;
  width?: number;
  height?: number;
  className?: number;
  compressTimes?: number;
}

/**将图片转为像素风格 */
const MosaicImg = (props: MosaicImgProps) => {
  const { imgUrl, width, height, compressTimes, className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    const compressTimesConfig = compressTimes || 3;
    const ctx = canvasRef.current!.getContext('2d')!;
    const canvasW = (width || 60) * RATE;
    const canvasH = (height || 60) * RATE;
    canvasRef.current!.style.width = canvasW + 'px';
    canvasRef.current!.style.height = canvasH + 'px';

    ctx.save();
    ctx.fillStyle = '#eee';
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();

    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > canvasW || h > canvasH) {
        let radio = Math.max(h / canvasH, w / canvasW);
        radio = Number(radio.toFixed(2));
        img.width = Math.floor(w / radio);
        img.height = Math.floor(h / radio);
      }

      ctx.clearRect(0, 0, canvasW, canvasH);

      canvasRef.current!.width = Math.floor(canvasW / compressTimesConfig);
      canvasRef.current!.height = Math.floor(canvasH / compressTimesConfig);
      ctx.drawImage(
        img,
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    };
    img.src = imgUrl;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={60}
      height={60}
      className={classNames('mosaicCanvas', className)}
    ></canvas>
  );
};

export default MosaicImg;
