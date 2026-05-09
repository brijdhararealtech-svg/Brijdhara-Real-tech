const AUDIO_SOURCES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://archive.org/download/PeacefulMusic/Peaceful_Music.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://cdn.pixabay.com/audio/2022/03/10/audio_c361955734.mp3"
];

let divineAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let currentSourceIndex = 0;
let isRetrying = false;

export function getDivineAudio() {
  if (typeof window === 'undefined') return null;
  
  if (!divineAudio) {
    divineAudio = new Audio();
    divineAudio.src = AUDIO_SOURCES[currentSourceIndex];
    // Try without anonymous first, if boost fails we'll know
    // divineAudio.crossOrigin = "anonymous"; 
    divineAudio.loop = true;
    divineAudio.volume = 1.0;
    divineAudio.preload = "auto";

    // Handle source failure
    divineAudio.addEventListener('error', (e) => {
      const error = (e.target as HTMLAudioElement).error;
      console.warn(`Audio source ${AUDIO_SOURCES[currentSourceIndex]} failed. Code: ${error?.code}, Message: ${error?.message}`);
    });
  }
  return divineAudio;
}

async function tryNextSource(): Promise<boolean> {
  if (isRetrying) return false;
  isRetrying = true;

  try {
    if (currentSourceIndex < AUDIO_SOURCES.length - 1) {
      currentSourceIndex++;
      console.log(`Rotating to audio source [${currentSourceIndex}]: ${AUDIO_SOURCES[currentSourceIndex]}`);
      
      const audio = getDivineAudio();
      if (audio) {
        audio.src = AUDIO_SOURCES[currentSourceIndex];
        audio.load();
        
        // Wait a bit for metadata
        await new Promise((resolve) => {
          const onLoaded = () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('error', onError);
            resolve(true);
          };
          const onError = () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('error', onError);
            resolve(false);
          };
          audio.addEventListener('loadedmetadata', onLoaded);
          audio.addEventListener('error', onError);
          // Timeout if it takes too long
          setTimeout(resolve, 3000);
        });

        return true;
      }
    } else {
      console.error("All audio sources exhausted.");
      return false;
    }
  } finally {
    isRetrying = false;
  }
  return false;
}

export async function startBoostedAudio() {
  const audio = getDivineAudio();
  if (!audio) return;

  // If already playing skip
  if (!audio.paused && audio.currentTime > 0) return;

  // Handle problematic states before playing
  if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || audio.error) {
     const nextOk = await tryNextSource();
     if (!nextOk) return;
  }

  // Setup/Resume AudioContext for gain boost
  if (!audioContext) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      
      // If we need gain boost, we might need crossOrigin=anonymous
      // But let's try direct first, or only set it if the domain allows it
      if (audio.src.includes('pixabay') || audio.src.includes('archive.org')) {
         audio.crossOrigin = "anonymous";
      }

      const source = audioContext.createMediaElementSource(audio);
      gainNode = audioContext.createGain();
      gainNode.gain.value = 2.0; // 200% boost
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
    } catch (err) {
      console.warn("Web Audio API failed or blocked by CORS, using direct playback:", err);
      audioContext = null;
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  // Playback attempt with recursive retry
  let attempts = 0;
  const maxAttempts = AUDIO_SOURCES.length;

  while (attempts < maxAttempts) {
    try {
      await audio.play();
      console.log("Playback started successfully on source index:", currentSourceIndex);
      return; 
    } catch (err: any) {
      console.error(`Attempt ${attempts + 1} failed for ${AUDIO_SOURCES[currentSourceIndex]}:`, err.message);
      
      // If it's a source error, rotate and try again
      if (err.name === "NotSupportedError" || err.message.includes("supported source") || err.message.length === 0) {
        attempts++;
        const rotated = await tryNextSource();
        if (!rotated) break;
      } else {
        // Likely interaction error or something else, don't retry here
        throw err;
      }
    }
  }
}

export function flushAudioContext() {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
