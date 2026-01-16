import { StatusBar } from 'expo-status-bar';
import { RecordingScreen } from './features/recording/presentation/components/RecordingScreen';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <RecordingScreen />
    </>
  );
}
