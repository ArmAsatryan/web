import { useState } from 'react';
import type { TransformedDetection } from '../../types';
import ImageCanvas from './ImageCanvas';
import MetadataPanel from './MetadataPanel';

interface Props {
  detection: TransformedDetection | null;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  subtitle?: string | null;
}

export default function DetectionViewer({
  detection,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  subtitle,
}: Props) {
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [hoveredBulletId, setHoveredBulletId] = useState<number | null>(null);

  if (!detection) {
    return (
      <div className="detection-viewer">
        <div className="viewer-placeholder">
          <h2>No Detection Selected</h2>
          <p>Select a detection from the list to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detection-viewer">
      <div className="viewer-header">
        <div>
          <h2>Detection #{detection.id}</h2>
          {subtitle && <p className="viewer-subtitle">{subtitle}</p>}
        </div>
        <div className="viewer-controls">
          <button
            type="button"
            className="control-button control-button-outlined"
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            title="Toggle bounding boxes"
          >
            {showBoundingBoxes ? 'Hide boxes' : 'Show boxes'}
          </button>
          <div className="navigation-controls">
            <button type="button" className="nav-button" onClick={onPrevious} disabled={!hasPrevious} title="Previous detection">
              ← Previous
            </button>
            <button type="button" className="nav-button" onClick={onNext} disabled={!hasNext} title="Next detection">
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="viewer-content">
        <div className="viewer-main">
          <ImageCanvas
            detection={detection}
            showBoundingBoxes={showBoundingBoxes}
            hoveredBulletId={hoveredBulletId}
          />
        </div>
        <aside className="viewer-sidebar" aria-label="Detection details">
          <div className="viewer-metadata-scroll">
            <MetadataPanel detection={detection} onBulletHover={setHoveredBulletId} />
          </div>
        </aside>
      </div>
    </div>
  );
}
