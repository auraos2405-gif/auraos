import type { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuraBubble } from '../components/aura-bubble';
import { AuraBrand } from '../components/aura-brand';

export function AuthLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();

  return (
    <main className="aura-grid relative grid min-h-screen place-items-center overflow-hidden px-5 py-10">
      <div className="absolute left-1/2 top-[-20rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-aura-violet/15 blur-[120px]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1020]/90 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">
        <AuraBrand />
        {children}
      </section>
      <AuraBubble onOpenCopilot={() => navigate('/aura/copilot')} />
    </main>
  );
}
