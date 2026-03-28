import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 800); // Allow time for fade out animation
    }, 4200); // Total display time ~5 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1120] transition-all duration-1000 ${fadeOut ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
      {/* Elegant Radial Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative flex flex-col items-center text-center px-4">
        {/* Animated Shield Icon */}
        <div className="mb-8 relative splash-icon-anim">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
          <div className="relative w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Scaled Title Fade-in */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 splash-title-anim">
          <span className="text-white">Secure</span>
          <span className="text-primary">Pay</span>
        </h1>
        
        {/* Sequential Tagline Fade-in */}
        <p className="text-lg md:text-xl text-slate-400 max-w-lg font-medium tracking-wide splash-tagline-anim">
          SecurePay — Intelligent Fraud Detection for Digital Banking
        </p>

        {/* Minimal Progress Line */}
        <div className="mt-16 w-32 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 bg-primary translate-x-[-100%] splash-progress-anim" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .splash-icon-anim {
          animation: iconPop 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          opacity: 0;
        }

        .splash-title-anim {
          animation: titleScaleFade 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
          opacity: 0;
        }

        .splash-tagline-anim {
          animation: taglineFade 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.8s forwards;
          opacity: 0;
        }

        .splash-progress-anim {
          animation: progressRun 4s linear 0.5s forwards;
        }

        @keyframes iconPop {
          0% { transform: scale(0.5) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }

        @keyframes titleScaleFade {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }

        @keyframes taglineFade {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes progressRun {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default SplashScreen;

