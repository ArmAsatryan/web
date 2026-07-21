import { Box, Button, ButtonGroup, Card, CardContent, Typography } from '@mui/material';
import { useRef } from 'react';

interface VideoReviewPlayerProps {
  src?: string;
  poster?: string;
}

export default function VideoReviewPlayer({ src, poster }: VideoReviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const setPlaybackRate = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const stepFrame = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = Math.max(0, video.currentTime + delta);
  };

  if (!src) {
    return (
      <Card>
        <CardContent>
          <Typography color="warning.main" variant="body2">
            No video available for this session. Approval is blocked until a video is linked.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box
          component="video"
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          sx={{ width: '100%', maxHeight: 480, borderRadius: 1, bgcolor: 'black' }}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <ButtonGroup size="small" variant="outlined">
            <Button onClick={() => setPlaybackRate(0.5)}>0.5×</Button>
            <Button onClick={() => setPlaybackRate(1)}>1×</Button>
          </ButtonGroup>
          <ButtonGroup size="small" variant="outlined">
            <Button onClick={() => stepFrame(-1 / 30)}>−1 frame</Button>
            <Button onClick={() => stepFrame(1 / 30)}>+1 frame</Button>
          </ButtonGroup>
        </Box>
      </CardContent>
    </Card>
  );
}
