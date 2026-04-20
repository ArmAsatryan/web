/**
 * Canvas utility functions for drawing bounding boxes and images
 */

import type { TransformedDetection } from '../../types';

export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export interface ImageDrawInfo {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

export function drawImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
): ImageDrawInfo {
  const canvasAspect = canvas.width / canvas.height;
  const imageAspect = image.width / image.height;

  let drawWidth: number;
  let drawHeight: number;
  let offsetX: number;
  let offsetY: number;

  if (imageAspect > canvasAspect) {
    drawWidth = canvas.width;
    drawHeight = canvas.width / imageAspect;
    offsetX = 0;
    offsetY = (canvas.height - drawHeight) / 2;
  } else {
    drawHeight = canvas.height;
    drawWidth = canvas.height * imageAspect;
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return {
    width: drawWidth,
    height: drawHeight,
    offsetX,
    offsetY,
    scaleX: drawWidth / image.width,
    scaleY: drawHeight / image.height,
  };
}

export function getScaledCoordinates(
  box: { x: number; y: number; width: number; height: number },
  _imageSize: unknown,
  imageDrawInfo: ImageDrawInfo
) {
  const { scaleX, scaleY, offsetX, offsetY } = imageDrawInfo;

  return {
    x: box.x * scaleX + offsetX,
    y: box.y * scaleY + offsetY,
    width: box.width * scaleX,
    height: box.height * scaleY,
  };
}

function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number },
  color: string,
  _label: string | null,
  lineWidth = 3
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  detectionData: TransformedDetection['detectionData'],
  imageDrawInfo: ImageDrawInfo,
  hoveredBulletId: number | null = null
) {
  const { bulletHoles, target } = detectionData;

  if (target?.boundingBox) {
    const scaledTarget = getScaledCoordinates(target.boundingBox, null, imageDrawInfo);
    drawBoundingBox(ctx, scaledTarget, '#00ff00', null, 3);
  }

  bulletHoles.forEach((hole) => {
    if (!hole.boundingBox) return;
    const scaledHole = getScaledCoordinates(hole.boundingBox, null, imageDrawInfo);

    const isHovered = hoveredBulletId === hole.id;
    const color = isHovered ? '#ffff00' : '#ff0000';
    const lineWidth = isHovered ? 4 : 2;

    drawBoundingBox(ctx, scaledHole, color, null, lineWidth);

    const centerX = scaledHole.x + scaledHole.width / 2;
    const centerY = scaledHole.y + scaledHole.height / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    const radius = isHovered ? 5 : 3;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    if (isHovered) {
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(scaledHole.x, scaledHole.y, scaledHole.width, scaledHole.height);
      ctx.shadowBlur = 0;
    }
  });
}

export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
