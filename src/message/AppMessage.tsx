import { useCallback, useState } from 'react';

export function AppMessage() {
  const [isListening, isListeningSet] = useState(false);
  const [text, textSet] = useState<string[]>([]);

  const onListen = useCallback(() => {
    const handler = (e: MessageEvent) => {
      console.log('PARENT', e.origin, e.data);
      textSet(v => [...v, `PARENT: ${e.origin} - ${JSON.stringify(e.data)}`]);
    };

    const handlerTop = (e: MessageEvent) => {
      console.log('TOP', e.origin, e.data);
      textSet(v => [...v, `TOP: ${e.origin} - ${JSON.stringify(e.data)}`]);
    };

    window.addEventListener('message', handler);
    if (window.top) {
      window.top.addEventListener('message', handlerTop);
    }

    isListeningSet(true);

    return () => {
      window.removeEventListener('message', handler);
      if (window.top) {
        window.top.removeEventListener('message', handlerTop);
      }
    };
  }, []);

  const onSend = useCallback(() => {
    if (window.parent) {
      window.parent.postMessage({ type: 'TEST PARENT', data: 'test parent' }, 'origin parent');
    }
    if (window.top) {
      window.top.postMessage({ type: 'TEST TOP', data: 'test top' }, 'origin top');
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

      <div className='flex gap-3 justify-center'>
        {text.map((txt, i) => (
          <div key={i}>{txt}</div>
        ))}
      </div>
    </main>
  );
}
