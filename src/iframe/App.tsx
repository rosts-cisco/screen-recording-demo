export function App() {
  return (
    <main className='p-12 gap-12 grow flex flex-row bg-neutral-800 text-neutral-300'>
      <div>
        video
        <iframe
          src='https://localhost:4444/share/embed/7f7e2fef-f7b4-4bc6-b41d-a80e21a85bf1'
          width='540px'
          height='304px'
          loading='lazy'
          allow='fullscreen *;autoplay *;'
        />
      </div>

      <div>
        playlist
        <iframe
          src='https://localhost:4444/playlists/embed/c1d47c89-4274-4817-b84e-33ba9f8c9e81'
          width='540px'
          height='304px'
          loading='lazy'
          allow='fullscreen *;autoplay *;'
        />
      </div>

      <div>
        page
        <iframe
          src='https://localhost:4444/pages/embed/f1db5c0c-e1e0-449e-a497-f0e721e3d311'
          width='540px'
          height='304px'
          title='April 05, 2023 at 8:49 PM'
          loading='lazy'
          allow='fullscreen *;autoplay *;'></iframe>
      </div>
    </main>
  );
}
