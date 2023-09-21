const checkAudioElement = document.createElement('audio');
const checkVideoElement = document.createElement('video');

export function getSupportedMimeTypes(checkType: 'recording' | 'playback') {
  type MEDIA = 'audio' | 'video';

  // by priorities!!!
  const CONTAINERS = [
    'webm', // Chrome + FF recording/playback
    'mp4', // Safari + Chrome support playback
    'mpeg',
    'acc',
    'ogg',
    'wav',
    'mp3',
    'matroska',
    'quicktime',
    'mpeg3',
    'mpeg2',
    'm4v',
    'm4p',
    'm4a',
    'flac',
    'amr',
    'aiff',
    '3gp',
    '3gp2',
    '3gpp',
    '3gpp2',
    'wave',
  ];

  const CONTAINER_PREFIXES = ['', 'x-', 'x-pn-'];

  // by priorities!!!
  const CODECS = [
    'vp9', // Chrome support playback/recording (Video) + FF support playback
    'vp9.0', // Chrome support playback/recording (Video) + FF support playback
    'vp8', // FF support recording/playback (Video) + Chrome support playback
    'vp8.0', // FF support recording/playback (Video) + Chrome support playback
    'avc1', // Safari + Chrome support playback/recording (Video)
    'avc',
    'av1',
    'hevc',
    'h265',
    'h.265',
    'h264',
    'h.264',
    'h263',
    'h.263',
    'h261',
    'h.261',
    // Audio only
    'opus',
    'vorbis',
    'pcm',
    'aac',
    'flac',
    'mp3',
    'ogg',
    'theora',
    'daala',
  ];

  const createCheckFn = (media: MEDIA) => {
    return (variation: string) => {
      if (checkType === 'recording') {
        if (!window.MediaRecorder) {
          return false;
        }
        if (!window.MediaRecorder.isTypeSupported) {
          const mimeType = variation.split(';')[0];
          // Seems some Safari
          return mimeType.startsWith('audio/mp4') || mimeType.startsWith('video/mp4');
        }
        return window.MediaRecorder.isTypeSupported(variation);
      }
      if (checkType === 'playback') {
        const mediaElement = media === 'audio' ? checkAudioElement : checkVideoElement;
        return mediaElement?.canPlayType(variation) === 'probably';
      }
      return false;
    };
  };

  const supportedMimeTypes = (['audio', 'video'] as MEDIA[]).reduce(
    (accMimeTypes, media) => {
      const checkFn = createCheckFn(media);

      accMimeTypes[media] = CONTAINERS.reduce((accMedia, container) => {
        CONTAINER_PREFIXES.forEach(container_prefix => {
          const type = `${media}/${container_prefix}${container}`;

          let variations = [`${type}`];

          CODECS.forEach(codec => {
            variations = variations.concat([
              `${type};codecs=${codec}`,
              //`${type};codecs:${codec}`,
              //`${type};codecs=${codec.toUpperCase()}`,
              //`${type};codecs:${codec.toUpperCase()}`,
            ]);
          });

          variations.forEach(variation => {
            if (checkFn(variation)) {
              const subExists = accMedia.find(
                m => m.indexOf(';') !== -1 && variation.indexOf(m) === 0,
              );
              !subExists && accMedia.push(variation);
            }
          });
        });
        return accMedia;
      }, [] as string[]);

      return accMimeTypes;
    },
    {
      audio: [] as string[],
      video: [] as string[],
    },
  );

  return {
    // e.g. audio/webm
    shortPreferredAudioMimeType: supportedMimeTypes.audio.length
      ? supportedMimeTypes.audio[0]
      : null,
    // e.g. video/webm
    shortPreferredVideoMimeType: supportedMimeTypes.video.length
      ? supportedMimeTypes.video[0]
      : null,

    //e.g. ["audio/webm;codecs=vp9", "audio/webm;codecs=vp8", ...]
    shortAudioMimeTypes: supportedMimeTypes.audio.length
      ? supportedMimeTypes.audio.filter(t => t.indexOf(';') === -1)
      : [],
    //e.g. ["video/webm;codecs=vp9", "video/webm;codecs=vp8", ...]
    shortVideoMimeTypes: supportedMimeTypes.video.length
      ? supportedMimeTypes.video.filter(t => t.indexOf(';') === -1)
      : [],
    //e.g. ["audio/webm;codecs=vp9", "audio/webm;codecs=vp8", ...]
    extendedAudioMimeTypes: supportedMimeTypes.audio.length
      ? supportedMimeTypes.audio.filter(t => t.indexOf(';') !== -1)
      : [],
    //e.g. ["video/webm;codecs=vp9", "video/webm;codecs=vp8", ...]
    extendedVideoMimeTypes: supportedMimeTypes.video.length
      ? supportedMimeTypes.video.filter(t => t.indexOf(';') !== -1)
      : [],
  };
}
