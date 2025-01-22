import { useCallback } from 'react';

export function AppMessage() {
  const onCheck = useCallback(() => {
    console.log('>> document.referrer', document.referrer);
    console.log('>> document.location.ancestorOrigins', document.location.ancestorOrigins);
  }, []);

  return (
    <main className='pt-2 pb-12'>
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
