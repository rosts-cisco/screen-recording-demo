export function App() {
  return (
    <main className='p-12 gap-12 grow bg-neutral-800'>
      <div className='text-neutral-300'>integration</div>
      <iframe
        src='https://integration.vidcast.io/share/embed/7f7e2fef-f7b4-4bc6-b41d-a80e21a85bf1'
        width='540px'
        height='304px'
        loading='lazy'
        allow='fullscreen *;autoplay *;'
      />

      <div className='text-neutral-300 mt-12'>videa-web-rosts</div>

      <iframe
        src='https://videa-web-rosts.uscentral1-0.vint.vidcast.io/share/embed/7f7e2fef-f7b4-4bc6-b41d-a80e21a85bf1'
        width='540px'
        height='304px'
        loading='lazy'
        allow='fullscreen *;autoplay *;'
      />

      <div className='text-neutral-300 mt-12'>https://localhost:4444</div>

      <iframe
        src='https://localhost:4444/share/embed/7f7e2fef-f7b4-4bc6-b41d-a80e21a85bf1'
        width='540px'
        height='304px'
        title='April 05, 2023 at 8:49 PM'
        loading='lazy'
        allow='fullscreen *;autoplay *;'></iframe>
    </main>
  );
}
