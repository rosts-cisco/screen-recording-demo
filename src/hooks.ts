import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSupportedMimeTypes } from './utils';
import { useCallback } from 'react';

type Devices = { id: string; name: string }[] | 'denied' | 'prompt';

export function useInit() {
  const once = useRef(true);

  const [isDevices, isDevicesSet] = useState(false);
  const [isPermissions, isPermissionsSet] = useState(false);

  const userAgent = useMemo(() => navigator.userAgent, []);
  const mimeType = useMemo(() => getSupportedMimeTypes('recording').extendedVideoMimeTypes[0], []);

  useEffect(() => {
    if (once.current) {
      once.current = false;

      console.log(mimeType, MediaRecorder.isTypeSupported(mimeType));
      console.log('video/webm', MediaRecorder.isTypeSupported('video/webm'));
      console.log('video/mp4', MediaRecorder.isTypeSupported('video/mp4'));

      console.log(
        'navigator.mediaDevices.getDisplayMedia',
        Boolean(navigator.mediaDevices.getDisplayMedia),
      );
      console.log(
        'navigator.mediaDevices.getSupportedConstraints',
        navigator.mediaDevices.getSupportedConstraints(),
      );

      Promise.allSettled([
        navigator.mediaDevices.enumerateDevices(),
        navigator.permissions.query({ name: 'camera' as unknown as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as unknown as PermissionName }),
      ]).then(([devices, camera, mic]) => {
        if (camera.status == 'fulfilled' && mic.status == 'fulfilled') {
          isPermissionsSet(true);
          console.log('navigator.permissions.query', true);
        }

        if (camera.status == 'rejected') {
          console.warn('navigator.permissions.query - UNSUPPORTED');
          console.error(camera.reason);
          isPermissionsSet(false);
        } else if (mic.status == 'rejected') {
          console.warn('navigator.permissions.query - UNSUPPORTED');
          console.error(mic.reason);
          isPermissionsSet(false);
        }

        if (devices.status == 'fulfilled') {
          isDevicesSet(true);
          console.log('navigator.mediaDevices.enumerateDevices', true);
        }

        if (devices.status == 'rejected') {
          console.warn('navigator.mediaDevices.enumerateDevices - UNSUPPORTED');
          console.error(devices.reason);
          isDevicesSet(false);
        }
      });
    }
  }, [mimeType]);

  return { isPermissions, isDevices, userAgent, mimeType };
}

// Check devices - safari camplatible
// ----------------------------------

export function useDevicePermission(isDevices: boolean, isPermissions: boolean, delay: number) {
  const refTimer = useRef<number>(null!);

  const [cameras, camerasSet] = useState<Devices | null>(null);
  const [mics, micsSet] = useState<Devices | null>(null);

  const checkDevicePermission = useCallback(() => {
    if (isPermissions && isDevices) {
      Promise.all([
        navigator.permissions.query({ name: 'camera' as unknown as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as unknown as PermissionName }),
        navigator.mediaDevices.enumerateDevices(),
      ]).then(([camera, mic, devices]) => {
        const cameras =
          camera.state == 'granted'
            ? devices
                .filter(d => d.kind === 'videoinput')
                .map(d => ({ id: d.deviceId, name: d.label }))
            : camera.state;

        const mics =
          mic.state == 'granted'
            ? devices
                .filter(d => d.kind === 'audioinput')
                .map(d => ({ id: d.deviceId, name: d.label }))
            : mic.state;

        // console.log(cameras, mics);

        // update devices only if they change
        camerasSet(camerasPrev => {
          const c1 = Array.isArray(cameras)
            ? cameras
                .map(c => c.id)
                .sort((a, b) => a.localeCompare(b))
                .join()
            : cameras;
          const c2 = Array.isArray(camerasPrev)
            ? camerasPrev
                .map(c => c.id)
                .sort((a, b) => a.localeCompare(b))
                .join()
            : camerasPrev;
          return c1 != c2 ? cameras : camerasPrev;
        });

        micsSet(micsPrev => {
          const c1 = Array.isArray(mics)
            ? mics
                .map(c => c.id)
                .sort((a, b) => a.localeCompare(b))
                .join()
            : mics;
          const c2 = Array.isArray(micsPrev)
            ? micsPrev
                .map(c => c.id)
                .sort((a, b) => a.localeCompare(b))
                .join()
            : micsPrev;
          return c1 != c2 ? mics : micsPrev;
        });
      });
    } else if (isDevices) {
      console.log('PERMISSIONS DISABLED');
    }

    window.clearTimeout(refTimer.current);
    refTimer.current = window.setTimeout(checkDevicePermission, delay);
  }, [delay, isDevices, isPermissions]);

  useEffect(() => {
    checkDevicePermission();
    return () => window.clearTimeout(refTimer.current);
  }, [checkDevicePermission]);

  return { cameras, mics, checkDevicePermission };
}

// Vizualize Audio stream
// ----------------------

export function useAudioAnimation(
  stream: MediaStream | null,
  refDiv: React.MutableRefObject<HTMLDivElement>,
) {
  const refAnim = useRef<number>(null!);
  const refVolumeArray = useRef<Float32Array | null>(null);
  const refVolumeAnalyser = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (stream) {
      const context = new AudioContext();
      const src = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      src.connect(analyser);

      refVolumeArray.current = new Float32Array(analyser.fftSize);
      refVolumeAnalyser.current = analyser;
    } else {
      refVolumeArray.current = null;
      refVolumeAnalyser.current = null;
      refDiv.current.style.width = '0%';
    }
  }, [stream, refDiv]);

  useEffect(() => {
    const animate = () => {
      if (refVolumeAnalyser.current && refVolumeArray.current) {
        refVolumeAnalyser.current.getFloatTimeDomainData(refVolumeArray.current);
        const sumSquares = refVolumeArray.current.reduce((acc, amp) => acc + amp * amp, 0);
        const volume = Math.sqrt(sumSquares / refVolumeArray.current.length);

        refDiv.current.style.width = (volume + 0.01) * 400 + '%';
      }
      cancelAnimationFrame(refAnim.current);
      refAnim.current = requestAnimationFrame(animate);
    };

    refAnim.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(refAnim.current);
  }, [refDiv]);
}
