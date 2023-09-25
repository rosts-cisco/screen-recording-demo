import { useCallback, useRef, useState } from 'react';
import { clsx as tw } from 'clsx';
import { useAudioAnimation, useInit, useDevicePermission } from './hooks';

type StopReason = 'click' | 'ended' | 'permissions';

// NOT working in Safari
// ---------------------

// navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);

// navigator.permissions.query({ name: 'camera' }).then(permission => {
//   permission.addEventListener('change', onPermissionChange);
// });

// MediaStream.addEventListener('inactive', onInactive);

// ---------------------

type Media = {
  stream: MediaStream;
  track: MediaStreamTrack;
  trackListeners: { onEnded: () => void; onMute: () => void; onUnmute: () => void };
};

type MediaWithRecording = Media & {
  recorder: MediaRecorder;
  recorderListeners: { onData: (blob: BlobEvent) => void; onError: (err: Event) => void };
};

export function App() {
  const { isDevices, isPermissions, mimeType, userAgent } = useInit();

  const { cameras, mics, checkDevicePermission } = useDevicePermission(
    isDevices,
    isPermissions,
    2000,
  );

  // SCREEN
  // ---------------------

  const [screen, screenSet] = useState<MediaWithRecording | null>(null);
  const refScreen = useRef<HTMLVideoElement>(null!);

  const onScreenStop = useCallback(
    (media: MediaWithRecording, reason: StopReason) => {
      console.log(`SCREEN STOP - ${reason}`);

      media.recorder.removeEventListener('dataavailable', media.recorderListeners.onData);
      media.recorder.removeEventListener('error', media.recorderListeners.onError);
      media.recorder.stop();

      media.track.removeEventListener('ended', media.trackListeners.onEnded);
      media.track.removeEventListener('mute', media.trackListeners.onMute);
      media.track.removeEventListener('unmute', media.trackListeners.onUnmute);
      media.track.stop();
      media.stream.removeTrack(media.track);

      refScreen.current.srcObject = null;
      screenSet(null);
      checkDevicePermission();
    },
    [checkDevicePermission],
  );

  const onScreenStart = useCallback(() => {
    console.log('SCREEN START');

    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          height: { max: 1080 },
          width: { max: 1920 },
          frameRate: 5 /* 15 */,
        },
        audio: false,
      })
      .then(stream => {
        if (stream.getTracks().length > 1) {
          console.warn('SCREEN: More than 1 track on stream detected.');
        }

        const media: MediaWithRecording = {
          stream,
          track: stream.getTracks()[0],
          trackListeners: {
            onMute: () => console.log('onMute'),
            onUnmute: () => console.log('onUnmute'),
            onEnded: () => {
              console.log('onEnded');
              onScreenStop(media, 'ended');
            },
          },
          recorder: new MediaRecorder(stream, { mimeType }),
          recorderListeners: {
            onData: blob => console.log('MediaRecorder:', blob.data.size, blob.data.type),
            onError: err => console.log('MediaRecorder ERRROR: ', err),
          },
        };

        media.track.addEventListener('ended', media.trackListeners.onEnded);
        media.track.addEventListener('mute', media.trackListeners.onMute);
        media.track.addEventListener('unmute', media.trackListeners.onUnmute);

        media.recorder.addEventListener('dataavailable', media.recorderListeners.onData);
        media.recorder.addEventListener('error', media.recorderListeners.onError);
        media.recorder.start(1000);

        refScreen.current.srcObject = media.stream;
        screenSet(media);
      })
      .catch(err => {
        console.log('SCREEN getDisplayMedia error');
        console.warn(err.name + ': ' + err.message);
      });
  }, [mimeType, onScreenStop]);

  // CAMERA
  // ---------------------

  const [camera, cameraSet] = useState<Media | null>(null);
  const [cameraId, cameraIdSet] = useState('');

  const refCamera = useRef<HTMLVideoElement>(null!);

  const onCameraStop = useCallback(
    (media: Media, reason: StopReason) => {
      console.log(`CAMERA STOP - ${reason}`);

      media.track.removeEventListener('ended', media.trackListeners.onEnded);
      media.track.removeEventListener('mute', media.trackListeners.onMute);
      media.track.removeEventListener('unmute', media.trackListeners.onUnmute);
      media.track.stop();
      media.stream.removeTrack(media.track);

      refCamera.current.srcObject = null;
      cameraSet(null);
      checkDevicePermission();
    },
    [checkDevicePermission],
  );

  const onCameraStart = useCallback(() => {
    if (camera || !Array.isArray(cameras) || cameras.length < 1) return;
    console.log('CAMERA START');

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          deviceId: cameraId || cameras[0].id,
        },
      })
      .then(stream => {
        if (stream.getTracks().length > 1) {
          console.warn('CANMERA: More than 1 track on stream detected.');
        }

        const media: Media = {
          stream,
          track: stream.getTracks()[0],
          trackListeners: {
            onEnded: () => {
              console.log('onEnded');
              onCameraStop(media, 'ended');
            },
            onMute: () => console.log('onMute'),
            onUnmute: () => console.log('onUnmute'),
          },
        };

        media.track.addEventListener('ended', media.trackListeners.onEnded);
        media.track.addEventListener('mute', media.trackListeners.onMute);
        media.track.addEventListener('unmute', media.trackListeners.onUnmute);

        refCamera.current.srcObject = media.stream;
        cameraSet(media);
      })
      .catch(err => {
        console.log('CAMERA getUserMedia error');
        console.warn(err.name + ': ' + err.message);
      });
  }, [camera, cameras, cameraId, onCameraStop]);

  const [isCameraAsk, isCameraAskSet] = useState(false);
  const onCameraAsk = useCallback(() => {
    isCameraAskSet(true);
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then(s => {
        s.getTracks().forEach(t => t.stop());
        console.log('Camera access granted');
      })
      .catch(err => console.log('Camera access error: ' + err))
      .finally(() => {
        checkDevicePermission();
        isCameraAskSet(false);
      });
  }, [checkDevicePermission]);

  // MICROPHONE
  // ---------------------

  const [mic, micSet] = useState<Media | null>(null);
  const [micId, micIdSet] = useState('');

  const onMicStop = useCallback(
    (media: Media, reason: StopReason) => {
      console.log(`MIC STOP - ${reason}`);

      media.stream.removeTrack(media.track);
      media.track.removeEventListener('ended', media.trackListeners.onEnded);
      media.track.removeEventListener('mute', media.trackListeners.onMute);
      media.track.removeEventListener('unmute', media.trackListeners.onUnmute);
      media.track.stop();

      micSet(null);
      checkDevicePermission();
    },
    [checkDevicePermission],
  );

  const onMicStart = useCallback(() => {
    if (mic || !Array.isArray(mics) || mics.length < 1) return;
    console.log('MIC START');

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          deviceId: micId || mics[0].id,
        },
      })
      .then(stream => {
        if (stream.getTracks().length > 1) {
          console.warn('MIC: More than 1 track on stream detected.');
        }

        const media: Media = {
          stream,
          track: stream.getTracks()[0],
          trackListeners: {
            onEnded: () => {
              console.log('onEnded');
              onMicStop(media, 'ended');
            },
            onMute: () => console.log('onMute'),
            onUnmute: () => console.log('onUnmute'),
          },
        };

        media.track.addEventListener('ended', media.trackListeners.onEnded);
        media.track.addEventListener('mute', media.trackListeners.onMute);
        media.track.addEventListener('unmute', media.trackListeners.onUnmute);

        micSet(media);
      })
      .catch(err => {
        console.log('MIC getUserMedia error');
        console.warn(err.name + ': ' + err.message);
      });
  }, [mic, mics, micId, onMicStop]);

  const [isMicAsk, isMicAskSet] = useState(false);
  const onMicAsk = useCallback(() => {
    isMicAskSet(true);
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then(s => {
        console.log('Mic access granted');
        s.getTracks().forEach(t => t.stop());
      })
      .catch(err => console.log('Mic access error: ' + err))
      .finally(() => {
        checkDevicePermission();
        isMicAskSet(false);
      });
  }, [checkDevicePermission]);

  const refAudioVolume = useRef<HTMLDivElement>(null!);
  useAudioAnimation(mic?.stream || null, refAudioVolume);

  return (
    <main className='pt-2 pb-12'>
      <div className='text-xs text-slate-400 text-center'>{userAgent}</div>

      <div className='mx-auto w-[400px] flex flex-col gap-8 mt-8'>
        {/* SCREEN */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button className={btn} disabled={screen != null} onClick={onScreenStart}>
              START SCREEN
            </button>
            <button
              className={btn}
              disabled={screen == null}
              onClick={() => onScreenStop(screen!, 'click')}>
              STOP SCREEN
            </button>
          </div>

          <video className='bg-slate-200 aspect-video' ref={refScreen} autoPlay playsInline muted />
        </div>

        {/* CAMERA */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button
              className={btn}
              disabled={camera != null || !Array.isArray(cameras) || cameras.length < 1}
              onClick={onCameraStart}>
              START CAMERA
            </button>
            <button
              className={btn}
              disabled={camera == null}
              onClick={() => onCameraStop(camera!, 'click')}>
              STOP CAMERA
            </button>
          </div>

          <div className='flex gap-3 mx-auto h-6'>
            {cameras == null ? (
              <div>&nbsp;</div>
            ) : cameras == 'denied' ? (
              <div>Camera access denied</div>
            ) : cameras == 'prompt' ? (
              <button className={btn} disabled={isCameraAsk} onClick={() => onCameraAsk()}>
                Ask Permissions
              </button>
            ) : (
              <select
                className='bg-slate-100'
                disabled={camera != null}
                onChange={v => cameraIdSet(v.currentTarget.value)}>
                {cameras.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <video className='bg-slate-200 aspect-video' ref={refCamera} autoPlay playsInline muted />
        </div>

        {/* MIC */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button
              className={btn}
              disabled={mic != null || !Array.isArray(mics) || mics.length < 1}
              onClick={onMicStart}>
              START MIC
            </button>
            <button className={btn} disabled={mic == null} onClick={() => onMicStop(mic!, 'click')}>
              STOP MIC
            </button>
          </div>

          <div className='flex gap-3 mx-auto h-6'>
            {mics == null ? (
              <div>&nbsp;</div>
            ) : mics == 'denied' ? (
              <div>Microphone access denied</div>
            ) : mics == 'prompt' ? (
              <button className={btn} disabled={isMicAsk} onClick={() => onMicAsk()}>
                Ask Permissions
              </button>
            ) : (
              <select
                className='bg-slate-100'
                disabled={mic != null}
                onChange={v => micIdSet(v.currentTarget.value)}>
                {mics.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className='w-full bg-slate-200 h-4'>
            <div ref={refAudioVolume} className='bg-slate-600 h-4' style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>
    </main>
  );
}

const btn = tw(
  'w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25',
);
