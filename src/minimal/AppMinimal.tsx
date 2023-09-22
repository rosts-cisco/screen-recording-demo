import { useCallback, useEffect, useState } from 'react';

export function AppMinimal() {
  const [isStream, isStreamSet] = useState(false);
  const [bytes, bytesSet] = useState(0);

  const onStartScreen = useCallback(() => {
    REC.start();
    isStreamSet(true);
    bytesSet(0);
  }, []);

  const onStopScreen = useCallback(() => {
    REC.stop();
    isStreamSet(false);
    bytesSet(0);
  }, []);

  useEffect(() => {
    REC.onBytes(bb => bytesSet(b => b + bb));
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
      {bytes > 0 && <div className='flex gap-3 justify-center'>Recording: {bytes} bytes</div>}
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

  private _onBytes: ((bytes: number) => void) | null = null;
  onBytes(cb: (bytes: number) => void) {
    this._onBytes = cb;
  }

  private onData = (blob: BlobEvent) => {
    console.log('MediaRecorder:', blob.data.size, blob.data.type);
    this._onBytes && this._onBytes(blob.data.size);
  };
  private onError = () => console.log('MediaRecorder: ERRROR');

  private onEnded = () => console.log('Track: ended');
  private onMute = () => console.log('Track: mute');
  private onUnmute = () => console.log('Track: unmute');
}

const REC = new Recorder();
