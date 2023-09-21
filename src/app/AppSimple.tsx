import { useCallback, useState } from 'react';
import { REC } from './utils/recorder';

export function AppSimple() {
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
      <div className='mx-auto w-[400px] flex flex-col gap-8 mt-8'>
        <div className='flex flex-col gap-3'>
          <div className='flex gap-3 mx-auto'>
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
        </div>
      </div>
    </main>
  );
}
