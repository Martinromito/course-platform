// src/components/workshop/WorkshopPlayer.tsx
// Reproductor de video premium con controles personalizados — sin redirección a YouTube

'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from 'lucide-react';

interface WorkshopPlayerProps {
  youtubeId: string;
  title: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let apiLoaded = false;
function loadYoutubeApi() {
  if (apiLoaded) return;
  apiLoaded = true;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const first = document.getElementsByTagName('script')[0];
  first.parentNode?.insertBefore(tag, first);
}

function formatTime(s: number): string {
  if (isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function WorkshopPlayer({ youtubeId, title }: WorkshopPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Cargar API YouTube ────────────────────────────────────────────────────
  useEffect(() => {
    loadYoutubeApi();
    const poll = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(poll);
        initPlayer();
      }
    }, 100);
    return () => clearInterval(poll);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  const initPlayer = () => {
    if (!iframeRef.current) return;
    playerRef.current = new window.YT.Player(iframeRef.current, {
      events: {
        onReady: (e: any) => {
          setReady(true);
          setDuration(e.target.getDuration());
        },
        onStateChange: (e: any) => {
          const s = e.data;
          setPlaying(s === 1);
          if (s === 1) setDuration(e.target.getDuration());
        },
      },
    });
  };

  // ── Actualizar progreso ───────────────────────────────────────────────────
  useEffect(() => {
    let iv: NodeJS.Timeout;
    if (playing && playerRef.current) {
      iv = setInterval(() => {
        if (typeof playerRef.current?.getCurrentTime === 'function') {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 250);
    }
    return () => clearInterval(iv);
  }, [playing]);

  // ── Auto-ocultar controles ────────────────────────────────────────────────
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    if (!playing) {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }
  }, [playing]);

  // ── Click fuera del player → ocultar controles ───────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setShowControls(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Fullscreen ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── Controles ─────────────────────────────────────────────────────────────
  const togglePlay = () => {
    if (!playerRef.current || !ready) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const toggleMute = () => {
    if (!playerRef.current || !ready) return;
    if (muted) { playerRef.current.unMute(); setMuted(false); }
    else { playerRef.current.mute(); setMuted(true); }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!playerRef.current || !ready) return;
    const t = Number(e.target.value);
    playerRef.current.seekTo(t, true);
    setCurrentTime(t);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseLeave = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    // Solo ocultar si está reproduciendo; si está pausado, los controles siempre deben verse
    if (playing) setShowControls(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#E8E2D9] select-none"
      style={{ aspectRatio: '16/9' }}
    >
      {/* ── iframe YouTube (NO interactuable) ── */}
      <iframe
        ref={iframeRef}
        id={`yt-player-${youtubeId}`}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
        title={title}
        className="absolute inset-0 w-full h-full border-none pointer-events-none"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />

      {/* ── Capa de loading ── */}
      {!ready && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#8B7355]" />
        </div>
      )}

      {/* ── Overlay click (play/pause al hacer clic en el video) ── */}
      {ready && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 cursor-pointer"
          style={{ zIndex: 10 }}
        />
      )}

      {/* ── Botón Play central (cuando está pausado) ── */}
      {ready && !playing && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          style={{ zIndex: 20 }}
        >
          <div className="w-16 h-16 rounded-full bg-[#8B7355] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-200">
            <Play className="w-6 h-6 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* ── Panel de controles (sobre todo lo demás) ── */}
      {ready && (
        <div
          className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 px-4 pt-8 pb-3 transition-opacity duration-300"
          style={{
            zIndex: 30,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
            opacity: showControls ? 1 : 0,
            pointerEvents: showControls ? 'auto' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra de progreso */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/80 font-mono tabular-nums min-w-[32px] text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 h-5 flex items-center cursor-pointer group/track">
              {/* Fondo de la barra */}
              <div className="absolute inset-y-0 my-auto h-1 w-full rounded-full bg-white/25" />
              {/* Progreso coloreado */}
              <div
                className="absolute inset-y-0 my-auto h-1 rounded-full bg-[#8B7355] pointer-events-none"
                style={{ width: `${progress}%` }}
              />
              {/* Input oculto pero funcional */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
              {/* Thumb visible */}
              <div
                className="absolute w-3 h-3 rounded-full bg-white shadow-md pointer-events-none opacity-0 group-hover/track:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            <span className="text-[11px] text-white/80 font-mono tabular-nums min-w-[32px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg text-white hover:bg-white/15 transition-colors"
                title={playing ? 'Pausar' : 'Reproducir'}
              >
                {playing
                  ? <Pause className="w-4 h-4 fill-current" />
                  : <Play className="w-4 h-4 fill-current" />
                }
              </button>
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg text-white hover:bg-white/15 transition-colors"
                title={muted ? 'Activar sonido' : 'Silenciar'}
              >
                {muted
                  ? <VolumeX className="w-4 h-4" />
                  : <Volume2 className="w-4 h-4" />
                }
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-white hover:bg-white/15 transition-colors"
              title="Pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
