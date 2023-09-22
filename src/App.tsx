import { useCallback, useRef, useState } from 'react';
import { clsx as tw } from 'clsx';
import { useAudioAnimation, useInit, useDevicePermission } from './hooks';

type StopReason = 'click' | 'inactive' | 'ended' | 'change' | 'permissions';

// NOT working in Safari
// ---------------------

// navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);

// navigator.permissions.query({ name: 'camera' }).then(permission => {
//   permission.addEventListener('change', onPermissionChange);
// });

// MediaStream.addEventListener('inactive', onInactive);

// ---------------------

export function App() {
  const { isDevices, isPermissions, mimeType, userAgent } = useInit();

  const { cameras, mics, checkDevicePermission } = useDevicePermission(
    isDevices,
    isPermissions,
    2000,
  );

  // SCREEN
  // ---------------------

  const [isScreen, isScreenSet] = useState(false);

  const screen = useRef<HTMLVideoElement>(null!);
  const screenStream = useRef<MediaStream | null>(null);
  const screenRecorder = useRef<MediaRecorder | null>(null);

  const onScreenStop = useCallback((reason: StopReason) => {
    console.log('STOP SCREEN', reason, Boolean(screenStream.current));
    if (screenStream.current && screenRecorder.current) {
      console.log('cleanUp');
      screenRecorder.current.stop();
      screenStream.current.getTracks().forEach(t => t.stop());
    }
    screen.current.srcObject = null;
    screenStream.current = null;
    screenRecorder.current = null;
    isScreenSet(false);
  }, []);

  const onScreenStart = useCallback(() => {
    if (screenStream.current) return;

    console.log('START SCREEN');
    navigator.mediaDevices
      .getDisplayMedia({
        audio: false,
        video: { height: { max: 1080 }, width: { max: 1920 }, frameRate: 5 /* 15 */ },
      })
      .then(s => {
        screen.current.srcObject = s;
        screenStream.current = s;
        isScreenSet(true);

        // ---

        const recorder = new MediaRecorder(s, { mimeType });
        recorder.addEventListener('dataavailable', blob => {
          console.log('MediaRecorder:', blob.data.size, blob.data.type);
        });
        recorder.addEventListener('error', err => {
          console.log('MediaRecorder ERRROR: ', err);
        });
        recorder.start(1000);
        screenRecorder.current = recorder;
        // ---

        // const onEnded = () => {
        //   s.getTracks()[0].removeEventListener('ended', onEnded);
        //   onStopScreen(s, 'ended');
        // };

        // s.getTracks()[0].addEventListener('ended', onEnded);
        // s.getTracks()[0].addEventListener('mute', () => console.log('mute'));
        // s.getTracks()[0].addEventListener('unmute', () => console.log('unmute'));

        console.log('getTracks().length', s.getTracks().length);
        console.log(s.getTracks()[0]);
      })
      .catch(err => {
        console.log('getDisplayMedia ERROR');
        console.log(err.name + ': ' + err.message);
      });
  }, [mimeType]);

  // CAMERA
  // ---------------------

  const camera = useRef<HTMLVideoElement>(null!);
  const [cameraStream, cameraStreamSet] = useState<MediaStream | null>(null);
  const [cameraId, cameraIdSet] = useState('');

  const onCameraStart = useCallback(() => {
    if (cameraStream || !Array.isArray(cameras) || cameras.length < 1) return;
    console.log('START CAMERA');

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          deviceId: cameraId || cameras[0].id,
        },
      })
      .then(s => {
        cameraStreamSet(s);
        camera.current.srcObject = s;

        // const onEnded = () => {
        //   s.getTracks()[0].removeEventListener('ended', onEnded);
        //   onStopCamera(s, 'ended');
        // };
        console.log('camera getTracks().length', s.getTracks().length);
        // s.getTracks()[0].addEventListener('ended', onEnded);
      })
      .catch(err => {
        console.log(err.name + ': ' + err.message);
      });
  }, [cameraStream, cameras, cameraId]);

  const onCameraStop = useCallback((s: MediaStream, reason: StopReason) => {
    console.log('STOP CAMERA', reason);
    s.getTracks().forEach(t => t.stop());
    camera.current.srcObject = null;
    cameraStreamSet(null);
  }, []);

  const [isCameraAsk, isCameraAskSet] = useState(false);
  const onCameraAsk = useCallback(() => {
    isCameraAskSet(true);
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(() => {})
      .catch(err => console.log(err.name + ': ' + err.message))
      .finally(() => isCameraAskSet(false));
  }, []);

  // MICROPHONE
  // ---------------------

  const [micStream, micStreamSet] = useState<MediaStream | null>(null);
  const [micId, micIdSet] = useState('');

  const onMicStart = useCallback(() => {
    if (micStream || !Array.isArray(mics) || mics.length < 1) return;
    console.log('START MIC');

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          deviceId: micId || mics[0].id,
        },
      })
      .then(s => {
        micStreamSet(s);

        // const onInactive = () => {
        //   s.removeEventListener('inactive', onInactive);
        //   onStopMic(s, 'inactive');
        // };
        // s.addEventListener('inactive', onInactive);

        // const onEnded = () => {
        //   s.getTracks()[0].removeEventListener('ended', onEnded);
        //   onStopMic(s, 'ended');
        // };

        console.log('mic getTracks().length', s.getTracks().length);
        // s.getTracks()[0].addEventListener('ended', onEnded);
      })
      .catch(err => {
        console.log(err.name + ': ' + err.message);
      });
  }, [micStream, micId, mics]);

  const onMicStop = useCallback((s: MediaStream, reason: StopReason) => {
    console.log('STOP MIC', reason);
    s.getTracks().forEach(t => t.stop());
    micStreamSet(null);
  }, []);

  const [isMicAsk, isMicAskSet] = useState(false);
  const onMicAsk = useCallback(() => {
    isMicAskSet(true);
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then(() => {
        console.log('Mic access granted');
        checkDevicePermission();
      })
      .catch(err => {
        console.log(err.name + ': ' + err.message);
      })
      .finally(() => isMicAskSet(false));
  }, [checkDevicePermission]);

  const refAudioVolume = useRef<HTMLDivElement>(null!);
  useAudioAnimation(micStream, refAudioVolume);

  return (
    <main className='pt-2 pb-12'>
      <div className='text-xs text-slate-400 text-center'>{userAgent}</div>
      <button className={btn} onClick={checkDevicePermission}>
        CHECK
      </button>

      <div className='mx-auto w-[400px] flex flex-col gap-8 mt-8'>
        {/* SCREEN */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button className={btn} disabled={isScreen} onClick={onScreenStart}>
              START SCREEN
            </button>
            <button className={btn} disabled={!isScreen} onClick={() => onScreenStop('click')}>
              STOP SCREEN
            </button>
          </div>

          <video className='bg-slate-200 aspect-video' ref={screen} autoPlay playsInline muted />
        </div>

        {/* CAMERA */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button
              className={btn}
              disabled={cameraStream != null || !Array.isArray(cameras) || cameras.length < 1}
              onClick={onCameraStart}>
              START CAMERA
            </button>
            <button
              className={btn}
              disabled={cameraStream == null}
              onClick={() => onCameraStop(cameraStream!, 'click')}>
              STOP CAMERA
            </button>
          </div>

          <div className='flex gap-3 mx-auto'>
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
                disabled={cameraStream != null}
                onChange={v => cameraIdSet(v.currentTarget.value)}>
                {cameras.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <video className='bg-slate-200 aspect-video' ref={camera} autoPlay playsInline muted />
        </div>

        {/* MIC */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button
              className={btn}
              disabled={micStream != null || !Array.isArray(mics) || mics.length < 1}
              onClick={onMicStart}>
              START MIC
            </button>
            <button
              className={btn}
              disabled={micStream == null}
              onClick={() => onMicStop(micStream!, 'click')}>
              STOP MIC
            </button>
          </div>

          <div className='flex gap-3 mx-auto'>
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
                disabled={micStream != null}
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
