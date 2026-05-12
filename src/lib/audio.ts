const AUDIO_SOURCES = [
  "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",
  "https://cdn.pixabay.com/audio/2021/11/25/audio_123b3d1193.mp3",
  "https://cdn.pixabay.com/audio/2022/03/15/audio_2d7f8d689b.mp3",
  "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
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
        // Reset crossOrigin before changing src
        audio.removeAttribute('crossOrigin');
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
          setTimeout(resolve, 5000);
        });

        return true;
      }
    } else {
      console.error("All audio sources exhausted.");
      return false;
    }
  } catch (err) {
    console.error("Error transitioning to next source:", err);
    return false;
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

  // Setup AudioContext for gain boost if possible
  if (!audioContext) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
        
        // We only set crossOrigin if the server supports it (Pixabay does, SoundHelix doesn't)
        if (audio.src.includes('pixabay') || audio.src.includes('archive.org')) {
           audio.crossOrigin = "anonymous";
        }

        const source = audioContext.createMediaElementSource(audio);
        gainNode = audioContext.createGain();
        gainNode.gain.value = 2.0; // 200% boost
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
      }
    } catch (err) {
      console.warn("Web Audio API boost failed (likely CORS), using standard playback:", err);
      // Clean up failed context state
      if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
      }
      audio.removeAttribute('crossOrigin');
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
      console.log("Professional audio stream active:", AUDIO_SOURCES[currentSourceIndex]);
      return; 
    } catch (err: any) {
      console.error(`Playback attempt ${attempts + 1} failed for ${AUDIO_SOURCES[currentSourceIndex]}:`, err.message);
      
      // If it's a source error, rotate and try again
      if (err.name === "NotSupportedError" || err.message.includes("supported") || err.message.length === 0) {
        attempts++;
        const rotated = await tryNextSource();
        if (!rotated) break;
      } else if (err.name === "NotAllowedError") {
        // User hasn't interacted yet? We'll let the next interaction trigger it
        console.warn("Playback blocked by browser policy. Interaction required.");
        break;
      } else {
        attempts++;
        await tryNextSource();
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
