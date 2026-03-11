export function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let offsetY = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      context.fillText(line, x, y + offsetY);
      line = words[i] + ' ';
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y + offsetY);
}

interface IFontConfig {
  width?: number;
  height?: number;
  lineHeight?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  shadowColor?: string;
  hasShadow?: boolean;
  textBaseline?: CanvasTextBaseline;
  verticalAligin?: 'top' | 'center' | 'bottom';
}
export function getTextImage(text: string, config: IFontConfig) {
  const fontCanvas = document.createElement('canvas');
  const ratio = 2;
  fontCanvas.width = (config.width || 120) * ratio; // resize
  fontCanvas.height = (config.height || 27) * ratio;
  const fontSize = (config.fontSize || 28) * ratio;
  const lineHeight = (config.lineHeight || 32) * ratio;
  const fontContext = fontCanvas.getContext('2d') as CanvasRenderingContext2D;
  const fontWeight = config.fontWeight || 400;
  fontContext.font = `${fontWeight} ${fontSize}px "PingFang SC", Arial`;
  fontContext.textAlign = 'center';
  fontContext.textBaseline = config.textBaseline || 'middle';
  fontContext.fillStyle = config.color || '#FFF0B3';
  // shadow
  if (config.hasShadow) {
    fontContext.shadowColor = config.shadowColor ?? 'rgba(0, 0, 0, 0.5)';
    fontContext.shadowBlur = 6;
    fontContext.shadowOffsetX = 0;
    fontContext.shadowOffsetY = 0;
  }
  drawWrappedText(
    fontContext,
    text,
    fontCanvas.width / 2,
    config.verticalAligin === 'top' ? 0 : fontCanvas.height / 2,
    fontCanvas.width,
    lineHeight
  );
  return fontCanvas.toDataURL();
}
