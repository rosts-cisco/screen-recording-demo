import { getSupportedMimeTypes } from './helpers';

class Recorder {
  private stream: MediaStream | null = null;
  private track: MediaStreamTrack | null = null;
  private recorder: MediaRecorder | null = null;

  start() {
    console.log('START REC');
    navigator.mediaDevices
      .getDisplayMedia({
        audio: false,
        video: { height: { max: 1080 }, width: { max: 1920 }, frameRate: 5 /* 15 */ },
      })
      .then(s => {
        this.stream = s;

        // ---

        // console.log('video/webm', MediaRecorder.isTypeSupported('video/webm'));
        // console.log('video/mp4', MediaRecorder.isTypeSupported('video/mp4'));
        // console.log(
        //   'video/webm;codecs=vp9',
        //   MediaRecorder.isTypeSupported('video/webm;codecs=vp9'),
        // );
        // console.log(
        //   'video/mp4;codecs=avc1',
        //   MediaRecorder.isTypeSupported('video/mp4;codecs=avc1'),
        // );
        // const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        //   ? 'video/webm;codecs=vp9'
        //   : 'video/mp4;codecs=avc1';

        const mimeType = getSupportedMimeTypes('recording').extendedVideoMimeTypes[0];

        this.recorder = new MediaRecorder(s, { mimeType });
        this.recorder.addEventListener('dataavailable', this.onData);
        this.recorder.addEventListener('error', this.onError);
        this.recorder.start(1000);

        // ---

        // const onInactive = () => {
        //   s.removeEventListener('inactive', onInactive);
        //   onStopScreen(s, 'inactive');
        // };
        // s.addEventListener('inactive', onInactive);

        // const onEnded = () => {
        //   s.getTracks()[0].removeEventListener('ended', onEnded);
        //   onStopScreen(s, 'ended');
        // };

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

  onData(blob: BlobEvent) {
    console.log('MediaRecorder:', blob.data.size, blob.data.type);
  }

  onError() {
    console.log('MediaRecorder ERRROR');
  }

  onEnded() {
    console.log('ended');
  }

  onMute() {
    console.log('mute');
  }

  onUnmute() {
    console.log('unmute');
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
}

export const REC = new Recorder();
