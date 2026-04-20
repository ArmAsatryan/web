import { Avatar, Skeleton } from '@mui/material';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import { useAppIcon } from './hooks';

interface AppCardIconProps {
  appId: string;
  name?: string;
  size?: number;
}

export default function AppCardIcon({ appId, name, size = 56 }: AppCardIconProps) {
  const { data, isLoading } = useAppIcon(appId);

  if (isLoading) {
    return <Skeleton variant="rounded" width={size} height={size} sx={{ borderRadius: 2 }} />;
  }

  if (data?.iconUrl) {
    return (
      <Avatar
        src={data.iconUrl}
        alt={name}
        variant="rounded"
        sx={{ width: size, height: size, borderRadius: 2 }}
      />
    );
  }

  return (
    <Avatar
      variant="rounded"
      sx={{
        width: size,
        height: size,
        borderRadius: 2,
        bgcolor: 'primary.light',
        color: '#fff',
      }}
    >
      {name?.[0]?.toUpperCase() ?? <AppShortcutIcon />}
    </Avatar>
  );
}
