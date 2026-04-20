import { useState } from 'react';
import { AssistantDetectionsProvider } from './AssistantDetectionsContext';
import AssistantUserDetail from './AssistantUserDetail';
import AssistantUserList from './AssistantUserList';
import './assistantDetections.css';

export default function AssistantDetectionsTab() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [detailUserId, setDetailUserId] = useState<number | null>(null);

  return (
    <AssistantDetectionsProvider>
      <div className="assistant-detections">
        {view === 'list' ? (
          <AssistantUserList
            onSelectUser={(id) => {
              setDetailUserId(id);
              setView('detail');
            }}
          />
        ) : detailUserId != null ? (
          <AssistantUserDetail userId={detailUserId} onBack={() => setView('list')} />
        ) : null}
      </div>
    </AssistantDetectionsProvider>
  );
}
