import type { TransformedDetection } from '../../types';
import { formatTimestamp } from './canvasUtils';

interface Props {
  detection: TransformedDetection | null;
  onBulletHover?: (id: number | null) => void;
}

export default function MetadataPanel({ detection, onBulletHover }: Props) {
  if (!detection) {
    return (
      <div className="metadata-panel">
        <h3>No Detection Selected</h3>
        <p>Select a detection from the list to view details</p>
      </div>
    );
  }

  const { timestamp, detectionData } = detection;
  const { bulletHoles, target, frameId, isVibrating, vibrationMagnitude } = detectionData;

  return (
    <div className="metadata-panel">
      <h3>Detection Details</h3>

      <div className="metadata-section">
        <h4>General Information</h4>
        <div className="metadata-row">
          <span className="label">Timestamp:</span>
          <span className="value">{formatTimestamp(timestamp)}</span>
        </div>
        <div className="metadata-row">
          <span className="label">Frame ID:</span>
          <span className="value">#{frameId}</span>
        </div>
      </div>

      <div className="metadata-section">
        <h4>Device Motion</h4>
        <div className="metadata-row">
          <span className="label">Status:</span>
          <span className={`value vibration-status ${isVibrating ? 'vibrating' : 'stable'}`}>
            <span className="status-indicator" />
            {isVibrating ? 'VIBRATING' : 'STABLE'}
          </span>
        </div>
        <div className="metadata-row">
          <span className="label">Magnitude:</span>
          <span className="value">{vibrationMagnitude.toFixed(4)}</span>
        </div>
      </div>

      <div className="metadata-section">
        <h4>Target Detection</h4>
        {target ? (
          <>
            <div className="metadata-row">
              <span className="label">Status:</span>
              <span className="value detected">✓ Detected</span>
            </div>
            <div className="metadata-row">
              <span className="label">Confidence:</span>
              <span className="value">
                {((target.confidence ?? 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="metadata-row">
              <span className="label">ID:</span>
              <span className="value">#{target.id}</span>
            </div>
          </>
        ) : (
          <div className="metadata-row">
            <span className="label">Status:</span>
            <span className="value not-detected">✗ Not Detected</span>
          </div>
        )}
      </div>

      <div className="metadata-section">
        <h4>Bullet Holes ({bulletHoles.length})</h4>
        {bulletHoles.length === 0 ? (
          <p className="no-data">No bullet holes detected</p>
        ) : (
          <div className="bullet-holes-list">
            {bulletHoles.map((hole) => (
              <div
                key={hole.id}
                className="bullet-hole-card"
                onMouseEnter={() => onBulletHover?.(hole.id)}
                onMouseLeave={() => onBulletHover?.(null)}
                role="presentation"
              >
                <div className="bullet-hole-header">
                  <span className="bullet-id">#{hole.id}</span>
                  <span className="bullet-confidence">
                    {((hole.confidence ?? 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bullet-hole-details">
                  {hole.distanceInches !== undefined && (
                    <div className="detail-row">
                      <span className="detail-label">Distance:</span>
                      <span className="detail-value">{hole.distanceInches.toFixed(1)}&quot;</span>
                    </div>
                  )}
                  {hole.clockDirection != null && (
                    <div className="detail-row">
                      <span className="detail-label">Direction:</span>
                      <span className="detail-value">{String(hole.clockDirection)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
