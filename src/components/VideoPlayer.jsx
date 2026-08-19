import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Maximize, Loader2
} from 'lucide-react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SKIP_SECONDS = 10;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export default function VideoPlayer({ src, isDarkMode = true }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState(null);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch((err) => setError(err.message));
    } else {
      video.pause();
    }
  }, []);

  const skip = useCallback((delta) => {
    const video = videoRef.current;
    if (!video) return;
    const target = video.currentTime + delta;
    video.currentTime = Math.min(Math.max(target, 0), video.duration || 0);
  }, []);

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolume = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Number(e.target.value);
    video.volume = next;
    video.muted = next === 0;
    setVolume(next);
    setIsMuted(next === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const changeSpeed = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Number(e.target.value);
    video.playbackRate = next;
    setSpeed(next);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  // Keeps the "already downloaded" bar in sync with the buffer
  const handleProgress = () => {
    const video = videoRef.current;
    if (!video || !video.buffered.length) return;
    setBuffered(video.buffered.end(video.buffered.length - 1));
  };

  // Shortcuts are bound to the player, not the document, so they only fire
  // once the user has focused it
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip(-SKIP_SECONDS);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skip(SKIP_SECONDS);
      }
    };

    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, skip]);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  const btnClass = `flex items-center justify-center rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
    isDarkMode
      ? 'text-slate-200 hover:bg-white/10 hover:text-white'
      : 'text-slate-700 hover:bg-black/10 hover:text-black'
  }`;

  const rangeThumb =
    '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full ' +
    '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0';

  // Native range inputs can't style the filled portion, so paint it with a
  // hard-stop gradient that follows the current value
  const volumeLevel = isMuted ? 0 : volume;
  const volumeFill = {
    background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${volumeLevel * 100}%, rgb(100 116 139 / 0.5) ${volumeLevel * 100}%, rgb(100 116 139 / 0.5) 100%)`
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
        Could not play this video: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={`overflow-hidden rounded-lg border bg-black focus:outline-none ${
        isDarkMode ? 'border-slate-700' : 'border-slate-300'
      }`}
    >
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          preload="metadata"
          className="block max-h-[460px] w-full bg-black"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onProgress={handleProgress}
          onWaiting={() => setIsWaiting(true)}
          onPlaying={() => setIsWaiting(false)}
          onCanPlay={() => setIsWaiting(false)}
          onError={() => setError('the file could not be loaded or decoded')}
        />

        {isWaiting && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="h-10 w-10 animate-spin text-white/90" />
          </div>
        )}

        {!isPlaying && !isWaiting && (
          <button
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="ml-1 h-7 w-7 text-slate-900" fill="currentColor" />
            </span>
          </button>
        )}
      </div>

      <div className={isDarkMode ? 'bg-slate-900' : 'bg-slate-200'}>
        <div className="px-3 pt-3">
          <div className="relative h-1.5 w-full rounded-full bg-slate-600/40">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-slate-400/50"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="any"
              value={currentTime}
              onChange={handleSeek}
              aria-label="Seek"
              className={`absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent ${rangeThumb} [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:bg-blue-500 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:bg-blue-500`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 px-2 py-2">
          <button onClick={() => skip(-SKIP_SECONDS)} className={btnClass} title="Back 10 seconds" aria-label="Back 10 seconds">
            <SkipBack className="h-4 w-4" />
          </button>

          <button onClick={togglePlay} className={btnClass} title={isPlaying ? 'Pause' : 'Play'} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>

          <button onClick={() => skip(SKIP_SECONDS)} className={btnClass} title="Forward 10 seconds" aria-label="Forward 10 seconds">
            <SkipForward className="h-4 w-4" />
          </button>

          <span className={`ml-1 font-mono text-xs tabular-nums ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1">
            <button onClick={toggleMute} className={btnClass} title={isMuted ? 'Unmute' : 'Mute'} aria-label={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volumeLevel}
              onChange={handleVolume}
              aria-label="Volume"
              style={volumeFill}
              className={`h-1.5 w-20 cursor-pointer appearance-none rounded-full ${rangeThumb} [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:bg-white`}
            />

            <select
              value={speed}
              onChange={changeSpeed}
              aria-label="Playback speed"
              title="Playback speed"
              className={`ml-1 cursor-pointer rounded-md border-0 px-1.5 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              {SPEEDS.map((s) => (
                <option key={s} value={s}>{s}x</option>
              ))}
            </select>

            <button onClick={toggleFullscreen} className={btnClass} title="Fullscreen" aria-label="Fullscreen">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
