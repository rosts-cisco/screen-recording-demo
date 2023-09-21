import { useCallback, useState } from 'react';

export function App() {
  const [isStream, isStreamSet] = useState(false);

  const onStartScreen = useCallback(() => {
    REC.start();
    isStreamSet(true);
  }, []);

  const onStopScreen = useCallback(() => {
    REC.stop();
    isStreamSet(false);
  }, []);

  return (
    <main className='pt-2 pb-12'>
      <div className='flex gap-3 justify-center'>
        <button
          className='w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25'
          disabled={isStream}
          onClick={onStartScreen}>
          START SCREEN
        </button>
        <button
          className='w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25'
          disabled={!isStream}
          onClick={onStopScreen}>
          STOP SCREEN
        </button>
      </div>
    </main>
  );
}

class Recorder {
  private stream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  private recorder: MediaRecorder | null = null;

  start() {
    console.log('START REC');
    navigator.mediaDevices
      .getDisplayMedia({
        audio: false,
        video: { height: { max: 1080 }, width: { max: 1920 }, frameRate: 5 },
      })
      .then(s => {
        this.stream = s;

        this.recorder = new MediaRecorder(s);
        this.recorder.addEventListener('dataavailable', this.onData);
        this.recorder.addEventListener('error', this.onError);
        this.recorder.start(1000);

        this.track = s.getTracks()[0];
        this.track.addEventListener('ended', this.onEnded);
        this.track.addEventListener('mute', this.onMute);
        this.track.addEventListener('unmute', this.onUnmute);

        console.log('getTracks().length', s.getTracks().length);
        console.log(this.track);
      })
      .catch(err => {
        console.log('getDisplayMedia ERROR');
        console.log(err.name + ': ' + err.message);
      });
  }

  stop() {
    if (this.stream && this.recorder && this.track) {
      console.log('STOP REC');
      this.recorder.stop();
      this.recorder.removeEventListener('dataavailable', this.onData);
      this.recorder.removeEventListener('error', this.onError);

      this.track.stop();
      this.track.removeEventListener('ended', this.onEnded);
      this.track.removeEventListener('mute', this.onMute);
      this.track.removeEventListener('unmute', this.onUnmute);

      this.stream.removeTrack(this.track);

      this.stream = null;
      this.track = null;
      this.recorder = null;
    }
  }

  onData = (blob: BlobEvent) => console.log('MediaRecorder:', blob.data.size, blob.data.type);
  onError = () => console.log('MediaRecorder: ERRROR');

  onEnded = () => console.log('Track: ended');
  onMute = () => console.log('Track: mute');
  onUnmute = () => console.log('Track: unmute');
}

const REC = new Recorder();
