import { useCallback } from 'react';

export function AppMessage() {
  const onCheck = useCallback(() => {
    console.log('>> document.referrer', document.referrer);
    console.log('>> document.location.ancestorOrigins', document.location.ancestorOrigins);
  }, []);

  return (
    <main className='pt-2 pb-12'>
      <iframe
        src='https://localhost:4444/share/embed/7f7e2fef-f7b4-4bc6-b41d-a80e21a85bf1'
        width='540px'
        height='304px'
        loading='lazy'
        allow='fullscreen *;autoplay *;'
      />
      <div className='flex gap-3 mt-4 justify-center'>
        <button
          className='w-40 bg-slate-300 hover:bg-slate-400 hover:disabled:bg-slate-300 disabled:opacity-25'
          onClick={onCheck}>
          CHECK
        </button>
      </div>
    </main>
  );
}
