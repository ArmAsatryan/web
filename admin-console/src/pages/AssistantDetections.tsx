import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AssistantDetectionsTab from '../features/assistant-detections/AssistantDetectionsTab';

export default function AssistantDetections() {
  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CardContent
          sx={{
            p: 3,
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            '&:last-child': { pb: 3 },
          }}
        >
          <AssistantDetectionsTab />
        </CardContent>
      </Card>
    </Box>
  );
}
