import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Button,
    FlatList,
    StyleSheet,
    Switch,
    TextInput,
    useColorScheme,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const KEY = 'walkingTrackerNotes';
const MAX = 200;

type Note = {
  id: string;
  text: string;
  createdAt: string;
  syncStatus: 'pending' | 'synced';
};

export default function WalkNotesScreen() {
  const isDark = useColorScheme() === 'dark';
  const inputColor = isDark ? '#ffffff' : '#000000';
  const placeholderColor = isDark ? '#aaaaaa' : '#666666';

  const [text, setText] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [status, setStatus] = useState<string>('');
  const [willSucceed, setWillSucceed] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved !== null) {
          const restored: Note[] = JSON.parse(saved);
          setNotes(restored);
          setStatus(`${restored.length} saved notes loaded.`);
        }
      } catch (e) {
        setStatus('Saved notes could not be loaded.');
      }
    })();
  }, []);

  const saveNote = async () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      setStatus('Please enter a note before saving.');
      return;
    }
    if (trimmed.length > MAX) {
      setStatus('Your note must be 200 characters or fewer.');
      return;
    }
    const newNote: Note = {
      id: Date.now().toString(),
      text: trimmed,
      createdAt: new Date().toLocaleString(),
      syncStatus: 'pending',
    };
    const updated = [newNote, ...notes];
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      setNotes(updated);
      setText('');
      setStatus('Note saved on this device.');
    } catch (e) {
      setStatus('Unable to save the note. Please try again.');
    }
  };

  const syncNow = async () => {
    if (syncing) return;
    const pending = notes.filter((n) => n.syncStatus === 'pending');
    if (pending.length === 0) {
      setStatus('All notes are already synced.');
      return;
    }
    setSyncing(true);
    setStatus('Syncing pending notes...');
    await new Promise<void>((r) => setTimeout(r, 1000));

    if (!willSucceed) {
      setStatus(
        'Sync unsuccessful. Your notes are still saved on this device. Please try again.'
      );
      setSyncing(false);
      return;
    }

    const updated: Note[] = notes.map((n) =>
      n.syncStatus === 'pending' ? { ...n, syncStatus: 'synced' } : n
    );
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(updated));
      setNotes(updated);
      setStatus(
        `${pending.length} note${pending.length === 1 ? '' : 's'} synced successfully.`
      );
    } catch (e) {
      setStatus('Unable to save the note. Please try again.');
    }
    setSyncing(false);
  };

  const pendingCount = notes.filter((n) => n.syncStatus === 'pending').length;
  const syncedCount = notes.length - pendingCount;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.heading}>
        Walk Notes
      </ThemedText>

      <TextInput
        style={[styles.input, { color: inputColor }]}
        placeholder="Enter a note about your walk"
        placeholderTextColor={placeholderColor}
        value={text}
        onChangeText={setText}
        multiline
      />
      <ThemedText>
        {text.length}/{MAX} characters
      </ThemedText>

      <Button title="Save Note" onPress={saveNote} />

      <ThemedView style={styles.row}>
        <ThemedText>Next Sync Will Succeed</ThemedText>
        <Switch value={willSucceed} onValueChange={setWillSucceed} />
      </ThemedView>

      <Button title="Sync Now" onPress={syncNow} disabled={syncing} />

      <ThemedText style={styles.status}>{status}</ThemedText>

      <ThemedText>Total Notes: {notes.length}</ThemedText>
      <ThemedText>Pending Notes: {pendingCount}</ThemedText>
      <ThemedText>Synced Notes: {syncedCount}</ThemedText>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <ThemedText>No walk notes have been saved.</ThemedText>
        }
        renderItem={({ item }) => (
          <ThemedView style={styles.note}>
            <ThemedText>{item.text}</ThemedText>
            <ThemedText>Created: {item.createdAt}</ThemedText>
            <ThemedText>
              Status: {item.syncStatus === 'pending' ? 'Pending Sync' : 'Synced'}
            </ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  heading: { marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    minHeight: 70,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  status: { marginVertical: 8, fontWeight: '600' },
  note: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 8,
    marginVertical: 4,
  },
});