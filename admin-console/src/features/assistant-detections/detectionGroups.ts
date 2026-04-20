import type { TransformedDetection } from '../../types';

export interface DateDetectionGroup {
  date: string;
  calendarDate: string;
  timestamp: number;
  detections: TransformedDetection[];
}

export function groupDetectionsByDate(detections: TransformedDetection[]): DateDetectionGroup[] {
  if (!detections || detections.length === 0) return [];

  const groups: Record<string, DateDetectionGroup> = {};
  detections.forEach((detection) => {
    const d = new Date(detection.timestamp);
    const calendarDate = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-');

    const dateLabel = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const ts = new Date(detection.timestamp).getTime();
    if (!groups[calendarDate]) {
      groups[calendarDate] = {
        date: dateLabel,
        calendarDate,
        timestamp: ts,
        detections: [],
      };
    }
    groups[calendarDate].detections.push(detection);
    if (ts > groups[calendarDate].timestamp) {
      groups[calendarDate].timestamp = ts;
    }
  });

  return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
}
