import { useCallback, useState } from 'react';

export function AppMessage() {
  const [isListening, isListeningSet] = useState(false);
  const [text, textSet] = useState<string[]>([]);

  const onListen = useCallback(() => {
    const handler = (e: MessageEvent) => {
      console.log('PARENT', e.origin, e.data);
      textSet(v => [...v, `PARENT: ${e.origin} - ${JSON.stringify(e.data)}`]);
    };

    window.addEventListener('message', handler);
    isListeningSet(true);

    return () => window.removeEventListener('message', handler);
  }, []);

  const onSend = useCallback(() => {
    if (window.parent) {
      window.parent.postMessage({ type: 'TEST PARENT', data: 'test parent' }, '*');
    }
    if (window.top) {
      window.top.postMessage({ type: 'TEST TOP', data: 'test top' }, '*');
    }
  }, []);

  return (
    <main className='pt-2 pb-12'>
      <div className='flex gap-3 mt-4 justify-center'>
        <button
          className='w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25'
          disabled={isListening}
          onClick={onListen}>
          LISTEN
        </button>
        <button
          className='w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25'
          disabled={!isListening}
          onClick={onSend}>
          SEND
        </button>
      </div>

      <div className='flex flex-col gap-1 text-xs w-full'>
        {text.map((txt, i) => (
          <div className='text-center odd:bg-slate-200' key={i}>
            {txt}
          </div>
        ))}
      </div>
    </main>
  );
}
