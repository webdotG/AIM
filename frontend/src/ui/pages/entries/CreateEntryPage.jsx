// Универсальный TimelinePage
// src/ui/pages/entries/TimelinePage.jsx
import { usePlatform } from '@/layers/platform';

export default function TimelinePage({ navigate }) {
  const { platform } = usePlatform();
  const { entriesStore } = useStore();

  // Разная логика для разных платформ
  const handleEntryClick = (entryId) => {
    if (platform === 'telegram' && navigate) {
      navigate('entry-detail', { id: entryId });
    } else if (platform === 'web') {
      // В вебе используем react-router
      window.history.pushState({}, '', `/entries/${entryId}`);
    }
  };

  return (
    <div>
      <h1>Timeline</h1>
      {entriesStore.entries.map(entry => (
        <EntryCard 
          key={entry.id} 
          entry={entry}
          onClick={() => handleEntryClick(entry.id)}
        />
      ))}
    </div>
  );
}