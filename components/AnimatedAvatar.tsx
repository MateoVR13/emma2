import React, { useState, useEffect } from 'react';

type ActionState = 'idle' | 'wink' | 'kiss' | 'laugh' | 'wave' | 'makeup';

const AnimatedAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const [action, setAction] = useState<ActionState>('idle');

  useEffect(() => {
    // Cycle through actions randomly to make her feel alive
    // Identical logic to home screen to ensure consistent "reactions"
    const actions: ActionState[] = ['idle', 'wink', 'kiss', 'laugh', 'wave', 'makeup', 'idle', 'idle'];
    
    const interval = setInterval(() => {
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setAction(randomAction);
      
      // Reset to idle after action duration
      setTimeout(() => {
        setAction('idle');
      }, 2500);
    }, 4000); // Change state every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-full border-4 border-pink-200 shadow-md relative overflow-hidden flex items-center justify-center transition-all duration-300`}>
      <div className="relative w-full h-full">
        {/* Face Base */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#FFDFC4] rounded-full shadow-inner"></div>
        
        {/* Blush (Always present but varies opacity) */}
        <div className={`absolute top-[55%] left-[20%] w-[15%] h-[10%] bg-pink-300 rounded-full blur-sm transition-opacity duration-500 ${action === 'makeup' ? 'opacity-100 scale-125' : 'opacity-60'}`}></div>
        <div className={`absolute top-[55%] right-[20%] w-[15%] h-[10%] bg-pink-300 rounded-full blur-sm transition-opacity duration-500 ${action === 'makeup' ? 'opacity-100 scale-125' : 'opacity-60'}`}></div>

        {/* EYES */}
        {/* Left Eye */}
        <div className={`absolute top-[45%] left-[30%] w-[12%] h-[12%] bg-black rounded-full transition-all duration-300 
            ${action === 'wink' ? 'scale-y-[0.1]' : ''} 
            ${action === 'laugh' ? 'scale-y-[0.2] -rotate-12' : ''}
            ${action === 'idle' ? 'animate-blink' : ''}
        `}></div>
        
        {/* Right Eye */}
        <div className={`absolute top-[45%] right-[30%] w-[12%] h-[12%] bg-black rounded-full transition-all duration-300
             ${action === 'laugh' ? 'scale-y-[0.2] rotate-12' : ''}
             ${action === 'idle' ? 'animate-blink' : ''}
        `}></div>

        {/* MOUTH */}
        {action === 'idle' || action === 'wink' || action === 'wave' || action === 'makeup' ? (
             <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[25%] h-[10%] border-b-2 border-black rounded-full transition-all duration-300"></div>
        ) : action === 'kiss' ? (
             <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[15%] h-[15%] border-2 border-pink-600 bg-pink-400 rounded-full animate-pulse"></div>
        ) : action === 'laugh' ? (
             <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[30%] h-[20%] bg-red-900 rounded-b-full border-t-2 border-black overflow-hidden">
                <div className="w-full h-[30%] bg-white rounded-b-md"></div>
             </div>
        ) : null}

        {/* ACCESSORIES / HANDS */}
        
        {/* Bow (Reduced size as requested: text-lg instead of text-2xl) */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 text-pink-500 transform -rotate-12 text-lg drop-shadow-sm">
            🎀
        </div>

        {/* Wave Hand */}
        <div className={`absolute bottom-[-10%] right-[-10%] text-4xl transition-transform duration-500 ${action === 'wave' ? 'translate-y-[-40%] rotate-[-20deg] animate-wiggle' : 'translate-y-[100%]'}`}>
            👋
        </div>

        {/* Lipstick / Makeup Brush */}
        <div className={`absolute bottom-[10%] left-[-10%] text-3xl transition-transform duration-500 ${action === 'makeup' ? 'translate-x-[50%] translate-y-[-50%] rotate-[20deg] animate-bounce-slow' : 'translate-x-[-100%]'}`}>
            💄
        </div>

        {/* Kiss Heart */}
        <div className={`absolute top-[60%] left-[60%] text-pink-500 text-xl transition-all duration-500 ${action === 'kiss' ? 'opacity-100 translate-x-2 -translate-y-4 scale-150' : 'opacity-0 scale-0'}`}>
            ❤️
        </div>

      </div>
    </div>
  );
};

export default AnimatedAvatar;