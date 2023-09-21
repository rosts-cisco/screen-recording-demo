import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clsx as tw } from 'clsx';
import { getSupportedMimeTypes } from './utils/helpers';

const btn = tw(
  'w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25',
);

type Devices = { id: string; name: string }[] | 'denied' | null;
type StopReason = 'click' | 'inactive' | 'ended' | 'change' | 'permissions';

export function App() {
  const [isStream, isStreamSet] = useState(false);

  const screen = useRef<HTMLVideoElement>(null!);
  const screenStream = useRef<MediaStream | null>(null);
  const screenRecorder = useRef<MediaRecorder | null>(null);

  const onStopScreen = useCallback((reason: StopReason) => {
    console.log('STOP SCREEN', reason, Boolean(screenStream.current));
    if (screenStream.current && screenRecorder.current) {
      console.log('cleanUp');
      screenRecorder.current.stop();
      screenStream.current.getTracks().forEach(t => t.stop());
    }
    screen.current.srcObject = null;
    screenStream.current = null;
    screenRecorder.current = null;
    isStreamSet(false);
  }, []);

  const onStartScreen = useCallback(() => {
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
        isStreamSet(true);

        // ---

        console.log('video/webm', MediaRecorder.isTypeSupported('video/webm'));
        console.log('video/mp4', MediaRecorder.isTypeSupported('video/mp4'));

        const mimeType = getSupportedMimeTypes('recording').extendedVideoMimeTypes[0];
        console.log(mimeType, MediaRecorder.isTypeSupported(mimeType));

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

        // const onInactive = () => {
        //   s.removeEventListener('inactive', onInactive);
        //   onStopScreen(s, 'inactive');
        // };
        // s.addEventListener('inactive', onInactive);

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
  }, []);

  // CAMERA
  // ---------------------

  const camera = useRef<HTMLVideoElement>(null!);
  const [cameraStream, cameraStreamSet] = useState<MediaStream | null>(null);
  const [cameraDevices, cameraDevicesSet] = useState<Devices>(null);
  const [cameraDeviceId, cameraDeviceIdSet] = useState('');

  const onStopCamera = useCallback((s: MediaStream | null, reason: StopReason) => {
    console.log('STOP CAMERA', reason, Boolean(s));
    if (s) {
      s.getTracks().forEach(t => t.stop());
    }
    camera.current.srcObject = null;
    cameraStreamSet(null);
  }, []);

  const onStartCamera = useCallback(() => {
    if (cameraStream) return;
    console.log('START CAMERA');

    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          deviceId: cameraDeviceId,
        },
      })
      .then(s => {
        cameraStreamSet(s);
        camera.current.srcObject = s;

        const onInactive = () => {
          s.removeEventListener('inactive', onInactive);
          onStopCamera(s, 'inactive');
        };
        s.addEventListener('inactive', onInactive);

        const onEnded = () => {
          s.getTracks()[0].removeEventListener('ended', onEnded);
          onStopCamera(s, 'ended');
        };
        console.log('getTracks().length', s.getTracks().length);
        s.getTracks()[0].addEventListener('ended', onEnded);
      })
      .catch(err => {
        console.log(err.name + ': ' + err.message);
      });
  }, [cameraStream, cameraDeviceId, onStopCamera]);

  const onChangeCamera = useCallback(
    (deviceId: string) => {
      if (deviceId != cameraDeviceId) {
        cameraDeviceIdSet(deviceId);
        if (cameraStream) {
          onStopCamera(cameraStream, 'change');
        }
      }
    },
    [cameraStream, cameraDeviceId, onStopCamera],
  );

  // MICROPHONE
  // ---------------------

  const [micStream, micStreamSet] = useState<MediaStream | null>(null);
  const [micDevices, micDevicesSet] = useState<Devices>(null);
  const [micDeviceId, micDeviceIdSet] = useState('');

  const onStopMic = useCallback((s: MediaStream | null, reason: StopReason) => {
    console.log('STOP MIC', reason, Boolean(s));
    if (s) {
      s.getTracks().forEach(t => t.stop());
    }
    refVolumeArray.current = null;
    refVolumeAnalyser.current = null;
    refVolume.current.style.width = '0%';
    micStreamSet(null);
  }, []);

  const onStartMic = useCallback(() => {
    if (micStream) return;
    console.log('START MIC');

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          deviceId: micDeviceId,
        },
      })
      .then(s => {
        micStreamSet(s);

        const onInactive = () => {
          s.removeEventListener('inactive', onInactive);
          onStopMic(s, 'inactive');
        };
        s.addEventListener('inactive', onInactive);

        const onEnded = () => {
          s.getTracks()[0].removeEventListener('ended', onEnded);
          onStopMic(s, 'ended');
        };
        console.log('getTracks().length', s.getTracks().length);
        s.getTracks()[0].addEventListener('ended', onEnded);

        const context = new AudioContext();
        const src = context.createMediaStreamSource(s);
        const analyser = context.createAnalyser();
        src.connect(analyser);

        refVolumeArray.current = new Float32Array(analyser.fftSize);
        refVolumeAnalyser.current = analyser;
      })
      .catch(err => {
        console.log(err.name + ': ' + err.message);
      });
  }, [micStream, micDeviceId, onStopMic]);

  const onChangeMic = useCallback(
    (deviceId: string) => {
      if (deviceId != micDeviceId) {
        micDeviceIdSet(deviceId);
        if (micStream) {
          onStopMic(micStream, 'change');
        }
      }
    },
    [micStream, micDeviceId, onStopMic],
  );

  // PERMISSIONS and DEVICES
  // ---------------------

  // const getCameraDevices = useCallback(
  //   (state: PermissionState) => {
  //     console.log('CAMERA permissions', state);

  //     if (state == 'granted') {
  //       if (cameraDevices == null || cameraDevices == 'denied') {
  //         navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
  //           const cameras = devices
  //             .filter(d => d.kind === 'videoinput')
  //             .map(d => ({ id: d.deviceId, name: d.label }));

  //           cameraDevicesSet(cameras);
  //           cameraDeviceIdSet(cameras[0].id);
  //         });
  //       }
  //     } else {
  //       if (cameraStream) onStopCamera(cameraStream, 'permissions');
  //       cameraDevicesSet(state == 'denied' ? 'denied' : null);
  //       cameraDeviceIdSet('');
  //     }
  //   },
  //   [cameraStream, cameraDevices, onStopCamera],
  // );

  // const getMicDevices = useCallback(
  //   (state: PermissionState) => {
  //     console.log('MIC permissions', state);

  //     if (state == 'granted') {
  //       if (micDevices == null || micDevices == 'denied') {
  //         navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
  //           const mics = devices
  //             .filter(d => d.kind === 'audioinput')
  //             .map(d => ({ id: d.deviceId, name: d.label }));

  //           micDevicesSet(mics);
  //           micDeviceIdSet(mics[0].id);
  //         });
  //       }
  //     } else {
  //       if (micStream) onStopMic(micStream, 'permissions');
  //       micDevicesSet(state == 'denied' ? 'denied' : null);
  //       micDeviceIdSet('');
  //     }
  //   },
  //   [micStream, micDevices, onStopMic],
  // );

  const once = useRef(true);
  useEffect(() => {
    if (once.current) {
      once.current = false;

      console.log('useEffect: CHECK');
      // checkPermissions();

      console.log(getSupportedMimeTypes('recording'));

      // navigator.mediaDevices.addEventListener('devicechange', d =>
      //   console.log('devicechange', d.currentTarget),
      // );

      // navigator.permissions.query({ name: 'camera' as any }).then(p => {
      //   getCameraDevices(p.state);
      //   p.addEventListener('change', e =>
      //     getCameraDevices((e.currentTarget as PermissionStatus).state),
      //   );
      // });

      // navigator.permissions.query({ name: 'microphone' as any }).then(p => {
      //   getMicDevices(p.state);
      //   p.addEventListener('change', e =>
      //     getMicDevices((e.currentTarget as PermissionStatus).state),
      //   );
      // });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const check = useCallback(() => {
    console.log('CHECK');
    console.log('-------------');
    navigator.permissions
      .query({ name: 'camera' as any })
      .then(() => {
        console.log('CAMERA: navigator.permissions.query - supported');
      })
      .catch(err => {
        console.warn('CAMERA: navigator.permissions.query - unsuppoerted error');
        console.error(err);
      });

    navigator.permissions
      .query({ name: 'microphone' as any })
      .then(() => {
        console.log('MIC: navigator.permissions.query - supported');
      })
      .catch(err => {
        console.warn('MIC: navigator.permissions.query - unsuppoerted error');
        console.error(err);
      });

    console.log('getDisplayMedia', navigator.mediaDevices.getDisplayMedia);
  }, []);

  const checkPermissions = useCallback(() => {
    console.log('CHECK DEVICES');
    console.log('-------------');

    Promise.allSettled([
      navigator.permissions.query({ name: 'camera' as any }),
      navigator.permissions.query({ name: 'microphone' as any }),
      navigator.mediaDevices.enumerateDevices(),
    ]).then(([camera, mic, devices]) => {
      console.log(
        'CAMERA (navigator.permissions.query) :',
        camera.status == 'fulfilled' ? camera.value.state : 'promise error',
      );
      console.log(
        'MIC (navigator.permissions.query) :',
        mic.status == 'fulfilled' ? mic.value.state : 'promise error',
      );
      console.log('devices', devices.status == 'fulfilled' ? devices.value : 'promise error');
      console.log(
        'navigator.mediaDevices.getSupportedConstraints',
        navigator.mediaDevices.getSupportedConstraints(),
      );

      if (devices.status == 'fulfilled') {
        if (camera.status == 'fulfilled') {
          if (camera.value.state == 'granted') {
            const cameras = devices.value
              .filter(d => d.kind === 'videoinput')
              .map(d => ({ id: d.deviceId, name: d.label }));
            cameraDevicesSet(cameras);
            cameraDeviceIdSet(cameras[0].id);
          } else {
            if (cameraStream) onStopCamera(cameraStream, 'permissions');
            cameraDevicesSet(camera.value.state == 'denied' ? 'denied' : null);
            cameraDeviceIdSet('');
          }
        } else {
          // if navigator.permissions.query is not supported
          const cameras = devices.value
            .filter(d => d.kind === 'videoinput')
            .map(d => ({ id: d.deviceId, name: d.label }));
          cameraDevicesSet(cameras);
          cameraDeviceIdSet(cameras[0].id);
        }

        if (mic.status == 'fulfilled') {
          if (mic.value.state == 'granted') {
            const mics = devices.value
              .filter(d => d.kind === 'audioinput')
              .map(d => ({ id: d.deviceId, name: d.label }));
            micDevicesSet(mics);
            micDeviceIdSet(mics[0].id);
          } else {
            if (micStream) onStopMic(micStream, 'permissions');
            micDevicesSet(mic.value.state == 'denied' ? 'denied' : null);
            micDeviceIdSet('');
          }
        } else {
          // if navigator.permissions.query is not supported
          const mics = devices.value
            .filter(d => d.kind === 'audioinput')
            .map(d => ({ id: d.deviceId, name: d.label }));
          micDevicesSet(mics);
          micDeviceIdSet(mics[0].id);
        }
      }
    });
  }, [cameraStream, onStopCamera, micStream, onStopMic]);

  const userAgent = useMemo(() => navigator.userAgent, []);

  // ---

  const refAnim = useRef<number>(null!);
  const refVolume = useRef<HTMLDivElement>(null!);
  const refVolumeArray = useRef<Float32Array | null>(null);
  const refVolumeAnalyser = useRef<AnalyserNode | null>(null);
  useEffect(() => {
    const animate = () => {
      if (refVolumeAnalyser.current && refVolumeArray.current) {
        refVolumeAnalyser.current.getFloatTimeDomainData(refVolumeArray.current);
        const sumSquares = refVolumeArray.current.reduce((acc, amp) => acc + amp * amp, 0);
        const volume = Math.sqrt(sumSquares / refVolumeArray.current.length);
        refVolume.current.style.width = (volume + 0.01) * 400 + '%';
      }
      refAnim.current = requestAnimationFrame(animate);
    };

    refAnim.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(refAnim.current);
  }, []);

  return (
    <main className='pt-2 pb-12'>
      <div className='text-xs text-slate-400 text-center'>{userAgent}</div>
      <div className='flex gap-3 justify-center mt-2'>
        <button className={btn} onClick={check}>
          CHECK
        </button>
        <button className={btn} onClick={checkPermissions}>
          CHECK DEVICES
        </button>
      </div>

      <div className='mx-auto w-[400px] flex flex-col gap-8 mt-8'>
        {/* SCREEN */}
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
            <button className={btn} disabled={isStream} onClick={onStartScreen}>
              START SCREEN
            </button>
            <button className={btn} disabled={!isStream} onClick={() => onStopScreen('click')}>
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
              disabled={cameraStream != null || cameraDevices == 'denied'}
              onClick={onStartCamera}>
              START CAMERA
            </button>
            <button
              className={btn}
              disabled={cameraStream == null}
              onClick={() => onStopCamera(cameraStream, 'click')}>
              STOP CAMERA
            </button>
          </div>

          <div className='flex gap-3 mx-auto'>
            {cameraDevices == 'denied' ? (
              <div>Access denied</div>
            ) : cameraDevices == null ? (
              <div>Click START to access camera</div>
            ) : (
              <select
                className='bg-slate-100'
                onChange={v => onChangeCamera(v.currentTarget.value)}>
                {cameraDevices.map(({ id, name }) => (
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
              disabled={micStream != null || micDevices == 'denied'}
              onClick={onStartMic}>
              START MIC
            </button>
            <button
              className={btn}
              disabled={micStream == null}
              onClick={() => onStopMic(micStream, 'click')}>
              STOP MIC
            </button>
          </div>

          <div className='flex gap-3 mx-auto'>
            {micDevices == 'denied' ? (
              <div>Access denied</div>
            ) : micDevices == null ? (
              <div>Click START to access mic</div>
            ) : (
              <select className='bg-slate-100' onChange={v => onChangeMic(v.currentTarget.value)}>
                {micDevices.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className='w-full bg-slate-200 h-4'>
            <div ref={refVolume} className='bg-slate-600 h-4' style={{ width: '0%' }}></div>
          </div>
        </div>
      </div>
    </main>
  );
}
