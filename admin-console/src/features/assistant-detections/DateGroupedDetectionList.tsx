import { useEffect, useMemo, useState } from 'react';
import type { TransformedDetection } from '../../types';
import { groupDetectionsByDate } from './detectionGroups';

interface Props {
  detections: TransformedDetection[];
  selectedDetection: TransformedDetection | null;
  onSelectDetection: (d: TransformedDetection) => void;
  title?: string;
  onDeleteDetection?: (d: TransformedDetection) => void;
  onDeleteGroup?: (payload: { calendarDate: string; detections: TransformedDetection[] }) => void;
}

export default function DateGroupedDetectionList({
  detections,
  selectedDetection,
  onSelectDetection,
  title = 'Detections',
  onDeleteDetection,
  onDeleteGroup,
}: Props) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const groupedDetections = useMemo(() => groupDetectionsByDate(detections), [detections]);

  const toggleDateGroup = (calendarDate: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(calendarDate)) next.delete(calendarDate);
      else next.add(calendarDate);
      return next;
    });
  };

  useEffect(() => {
    if (groupedDetections.length > 0) {
      setExpandedDates(new Set(groupedDetections.map((g) => g.calendarDate)));
    }
  }, [groupedDetections.length, detections]);

  if (!detections || detections.length === 0) {
    return (
      <div className="detection-list">
        <h3>{title}</h3>
        <p className="no-detections">No detections available</p>
      </div>
    );
  }

  return (
    <div className="detection-list">
      <h3>
        {title} ({detections.length})
      </h3>
      <div className="detection-items-scrollview">
        <div className="detection-groups">
          {groupedDetections.map((group) => {
            const isExpanded = expandedDates.has(group.calendarDate);
            const showGroupDelete = typeof onDeleteGroup === 'function';

            return (
              <div key={group.calendarDate} className="date-group">
                <div className="date-group-header-row">
                  <div
                    className="date-group-header date-group-header-main"
                    onClick={() => toggleDateGroup(group.calendarDate)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDateGroup(group.calendarDate);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                    <span className="date-group-title">{group.date}</span>
                    <span className="date-group-count">({group.detections.length})</span>
                  </div>
                  {showGroupDelete && (
                    <button
                      type="button"
                      className="date-group-delete"
                      title="Delete all detections for this day"
                      aria-label="Delete all detections for this day"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup?.({
                          calendarDate: group.calendarDate,
                          detections: group.detections,
                        });
                      }}
                    >
                      X
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="detection-items">
                    {group.detections.map((detection) => {
                      const isSelected = selectedDetection?.id === detection.id;
                      const bulletCount = detection.detectionData.bulletHoles.length;
                      const hasTarget = !!detection.detectionData.target;
                      const isVibrating = detection.detectionData.isVibrating;
                      const showItemDelete = typeof onDeleteDetection === 'function';

                      return (
                        <div
                          key={detection.id}
                          className={`detection-item-compact ${isSelected ? 'selected' : ''}`}
                        >
                          <div className="detection-item-row">
                            <div
                              className="detection-item-row-click"
                              onClick={() => onSelectDetection(detection)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  onSelectDetection(detection);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="detection-item-left">
                                <span className="detection-id-compact">#{detection.id}</span>
                                <span className="detection-time">
                                  {new Date(detection.timestamp).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div className="detection-item-right">
                                <span className="detection-stat" title="Bullets">
                                  🔴 {bulletCount}
                                </span>
                                <span
                                  className={`detection-stat ${hasTarget ? 'has-target' : 'no-target'}`}
                                  title="Target"
                                >
                                  🎯 {hasTarget ? '✓' : '✗'}
                                </span>
                                {isVibrating && (
                                  <span className="vibration-badge-compact" title="Vibration">
                                    ⚠️
                                  </span>
                                )}
                              </div>
                            </div>
                            {showItemDelete && (
                              <button
                                type="button"
                                className="detection-delete-btn"
                                title={`Remove detection #${detection.id}`}
                                aria-label={`Remove detection ${detection.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteDetection?.(detection);
                                }}
                              >
                                X
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
