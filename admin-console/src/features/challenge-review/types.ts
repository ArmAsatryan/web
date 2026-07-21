export type ReviewStatus =
  | 'AWAITING_VIDEO'
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CORRECTED_APPROVED'
  | 'DECLINED'
  | 'EXPIRED';

export type DeclineReason =
  | 'CHEATING'
  | 'INVALID_TARGET'
  | 'INVALID_SETUP'
  | 'DUPLICATE'
  | 'NO_VIDEO'
  | 'OTHER';

export interface ReviewSessionSummary {
  sessionId: string;
  serverId: number;
  userId: number;
  userName: string;
  userEmail: string;
  challengeName: string;
  createdAt: string;
  totalScore: number;
  reviewStatus: ReviewStatus;
  hasVideo: boolean;
  videoThumbnailUrl?: string;
  waitingSeconds: number;
}

export interface ReviewShot {
  shotNumber: number;
  distanceInches: number;
  detectedZoneScore: number;
  correctedZoneScore: number | null;
  zoneName: string;
  timeFromStart: number;
  timeFromPreviousShot: number;
}

export interface ScoringZone {
  points: number;
  name: string;
  maxDistanceInches: number;
}

export interface ReviewSessionDetail {
  sessionId: string;
  serverId: number;
  user: { id: number; name: string; email: string; username: string };
  challenge: { id: number; name: string; scoringZones: ScoringZone[] };
  createdAt: string;
  totalScore: number;
  detectedTotalScore: number;
  timeElapsed: number;
  timePenalty: number;
  timeBonus: number;
  ringCounts: Record<string, number>;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  shots: ReviewShot[];
  reviewStatus: ReviewStatus;
  reviewedByUserId?: number;
  reviewedAt?: string;
  declineReason?: DeclineReason;
  reviewComment?: string;
}

export interface ApproveRequest {
  shotCorrections: { shotNumber: number; points: number }[];
  comment?: string;
}

export interface DeclineRequest {
  reason: DeclineReason;
  comment: string;
}
