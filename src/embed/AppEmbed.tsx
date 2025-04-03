export function AppEmbed() {
  return (
    <main className='p-6 gap-12 grow flex flex-row bg-neutral-800 text-neutral-500'>
      <div>
        video
        <iframe
          src='https://integration.vidcast.io/share/embed/7f7e2fef-f7b4-4bc6-b41d-a80e21a85bf1'
          width='540px'
          height='330px'
          loading='lazy'
          allow='fullscreen *;autoplay *;'
        />
      </div>

      <div>
        playlist
        <iframe
          src='https://integration.vidcast.io/playlists/embed/c1d47c89-4274-4817-b84e-33ba9f8c9e81?theme=light'
          width='540px'
          height='330px'
          loading='lazy'
          allow='fullscreen *;autoplay *;'
        />
      </div>

      <div>
        page
        <iframe
          src='https://integration.vidcast.io/pages/embed/f1db5c0c-e1e0-449e-a497-f0e721e3d311'
          width='540px'
          height='540px'
          title='April 05, 2023 at 8:49 PM'
          loading='lazy'
          allow='fullscreen *;autoplay *;'></iframe>
      </div>
    </main>
  );
}
