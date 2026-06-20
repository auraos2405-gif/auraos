import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Mic, MoreHorizontal, Sparkles, X } from 'lucide-react';

type BubblePosition = {
  x: number;
  y: number;
};

type VoiceState = 'idle' | 'listening' | 'processing' | 'ready';

const positionKey = 'aura:bubble-position';
const quickTranscripts = [
  'Abrir panorama executivo',
  'Priorizar contas vencidas',
  'Preparar ação direta',
  'Resumir fluxo de caixa',
];

function getInitialPosition(): BubblePosition {
  if (typeof window === 'undefined') return { x: 24, y: 24 };

  const saved = window.localStorage.getItem(positionKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as BubblePosition;
      if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) return parsed;
    } catch {
      window.localStorage.removeItem(positionKey);
    }
  }

  return { x: Math.max(16, window.innerWidth - 112), y: Math.max(16, window.innerHeight - 112) };
}

export function AuraBubble({ onOpenCopilot }: { onOpenCopilot: () => void }) {
  const [position, setPosition] = useState(getInitialPosition);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const drag = useRef<{ pointerId: number; offsetX: number; offsetY: number; moved: boolean } | null>(null);
  const pressTimer = useRef<number | null>(null);
  const clickTimer = useRef<number | null>(null);
  const voiceTimers = useRef<number[]>([]);

  useEffect(() => {
    window.localStorage.setItem(positionKey, JSON.stringify(position));
  }, [position]);

  useEffect(() => () => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    if (clickTimer.current) window.clearTimeout(clickTimer.current);
    voiceTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  function clampPosition(nextX: number, nextY: number) {
    const size = 72;
    const margin = 12;
    return {
      x: Math.min(Math.max(margin, nextX), Math.max(margin, window.innerWidth - size - margin)),
      y: Math.min(Math.max(margin, nextY), Math.max(margin, window.innerHeight - size - margin)),
    };
  }

  function startVoiceUx() {
    voiceTimers.current.forEach((timer) => window.clearTimeout(timer));
    voiceTimers.current = [];
    setQuickMenuOpen(false);
    setVoiceState('listening');
    setTranscript('');

    quickTranscripts.forEach((text, index) => {
      voiceTimers.current.push(window.setTimeout(() => setTranscript(text), 550 + index * 420));
    });
    voiceTimers.current.push(window.setTimeout(() => setVoiceState('processing'), 2400));
    voiceTimers.current.push(window.setTimeout(() => {
      setVoiceState('ready');
      setTranscript('Comando pronto para revisão.');
    }, 3500));
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - position.x,
      offsetY: event.clientY - position.y,
      moved: false,
    };
    pressTimer.current = window.setTimeout(() => {
      setQuickMenuOpen(true);
      drag.current = null;
    }, 520);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    const next = clampPosition(event.clientX - drag.current.offsetX, event.clientY - drag.current.offsetY);
    if (Math.abs(next.x - position.x) > 4 || Math.abs(next.y - position.y) > 4) drag.current.moved = true;
    setPosition(next);
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    const wasDragging = Boolean(drag.current?.moved);
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (wasDragging || quickMenuOpen) return;

    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      startVoiceUx();
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      onOpenCopilot();
    }, 220);
  }

  const voiceLabel = {
    idle: '',
    listening: 'Ouvindo…',
    processing: 'Processando…',
    ready: 'Pronto',
  }[voiceState];

  return (
    <div className="fixed z-50 select-none" style={{ left: position.x, top: position.y }}>
      {(quickMenuOpen || voiceState !== 'idle') && (
        <div className="absolute bottom-20 right-0 w-72 rounded-3xl border border-white/10 bg-[#0b0d19]/95 p-4 shadow-2xl shadow-aura-violet/20 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Aura Bubble™</p>
              <h2 className="mt-1 text-base font-semibold text-white">{voiceState === 'idle' ? 'Menu rápido' : voiceLabel}</h2>
            </div>
            <button className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => { setQuickMenuOpen(false); setVoiceState('idle'); }} type="button">
              <X size={16} />
            </button>
          </div>
          {voiceState !== 'idle' ? (
            <div className="mt-4 rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] p-4">
              <div className="flex items-center gap-2 text-violet-200"><Mic size={16} /> {voiceLabel}</div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{transcript || 'Transcrição em tempo real aparecerá aqui.'}</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-2 text-sm">
              <button className="rounded-2xl bg-white/[0.04] px-4 py-3 text-left text-slate-200 hover:bg-white/[0.08]" onClick={onOpenCopilot} type="button">Abrir Aura Copilot</button>
              <button className="rounded-2xl bg-white/[0.04] px-4 py-3 text-left text-slate-200 hover:bg-white/[0.08]" onClick={startVoiceUx} type="button">Ativar Voice UX</button>
              <button className="rounded-2xl bg-white/[0.04] px-4 py-3 text-left text-slate-200 hover:bg-white/[0.08]" type="button">Ações diretas</button>
            </div>
          )}
        </div>
      )}
      <button
        aria-label="Aura Bubble: clique para abrir Copilot, duplo clique para Voice UX, pressione para menu rápido"
        className="grid size-[72px] touch-none place-items-center rounded-full border border-violet-200/30 bg-gradient-to-br from-aura-violet via-blue-500 to-cyan-300 text-white shadow-2xl shadow-aura-violet/35 outline-none ring-4 ring-white/5 transition hover:scale-105"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        type="button"
      >
        {voiceState === 'idle' ? <Sparkles size={28} /> : <MoreHorizontal size={30} />}
      </button>
    </div>
  );
}
