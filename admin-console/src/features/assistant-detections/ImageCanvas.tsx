import { useEffect, useRef, useState } from 'react';
import type { TransformedDetection } from '../../types';
import { clearCanvas, drawDetections, drawImage } from './canvasUtils';

interface Props {
  detection: TransformedDetection | null;
  showBoundingBoxes?: boolean;
  hoveredBulletId?: number | null;
}

export default function ImageCanvas({
  detection,
  showBoundingBoxes = true,
  hoveredBulletId = null,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!detection) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    imageRef.current = img;

    img.onload = () => {
      setImageLoaded(true);
      setError(null);

      clearCanvas(ctx, canvas);

      const imageDrawInfo = drawImage(ctx, img, canvas);

      if (showBoundingBoxes && detection.detectionData) {
        drawDetections(ctx, detection.detectionData, imageDrawInfo, hoveredBulletId ?? null);
      }
    };

    img.onerror = () => {
      setError('Failed to load image');
      setImageLoaded(false);
    };

    img.src = detection.imagePath;
  }, [detection, showBoundingBoxes, hoveredBulletId]);

  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !detection) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    clearCanvas(ctx, canvas);
    const imageDrawInfo = drawImage(ctx, imageRef.current, canvas);

    if (showBoundingBoxes && detection.detectionData) {
      drawDetections(ctx, detection.detectionData, imageDrawInfo, hoveredBulletId ?? null);
    }
  }, [showBoundingBoxes, imageLoaded, detection, hoveredBulletId]);

  if (!detection) {
    return (
      <div className="image-canvas-placeholder">
        <p>No detection selected</p>
      </div>
    );
  }

  return (
    <div className="image-canvas-container">
      <canvas ref={canvasRef} width={800} height={600} className="image-canvas" />
      {error && (
        <div className="image-error">
          <p>{error}</p>
          <p className="image-path">Path: {detection.imagePath}</p>
        </div>
      )}
      {!imageLoaded && !error && (
        <div className="image-loading">
          <p>Loading image...</p>
        </div>
      )}
    </div>
  );
}
