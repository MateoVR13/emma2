import React from 'react';
import { Sparkles } from 'lucide-react';

interface AbstractTextProps {
  text: string;
  className?: string;
  baseSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: 'left' | 'center' | 'right';
}

const AbstractText: React.FC<AbstractTextProps> = ({ 
  text, 
  className = "", 
  baseSize = 'lg',
  align = 'center'
}) => {
  // Uniform size mapping as requested (mismo tamaño y grosor)
  const sizeMap = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
    '2xl': 'text-7xl md:text-8xl',
  };

  const currentSize = sizeMap[baseSize];
  const alignClass = align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
  const isLogo = text.toLowerCase().includes('emma glow');

  return (
    <div className={`font-serif flex flex-wrap items-baseline gap-1 ${alignClass} ${className} leading-none tracking-widest`}>
      {text.split('').map((char, i) => {
        if (char === ' ') return <span key={i} className="w-4"></span>;

        // COLOR MIX: Alternating "Almond Blossom" (represented by a soft pink/rose) and "Tickled Pink" (vibrant)
        // We use uniform font-weight (font-medium or font-normal depending on font definition) to satisfy "same thickness".
        const isTickled = i % 2 === 0;
        const colorClass = isTickled ? 'text-emma-tickled' : 'text-[#F3DAD8] drop-shadow-[1px_1px_0px_rgba(244,127,190,0.8)]'; // Added drop shadow to make the light almond visible on white backgrounds
            
        // SPECIAL 'O' SPARKLE for "EMMA GLOW"
        if (isLogo && char.toLowerCase() === 'o') {
            return (
                <span 
                    key={i} 
                    className={`
                      relative inline-block transition-transform duration-300 hover:scale-110
                      ${currentSize} 
                      ${colorClass}
                    `}
                >
                    {char}
                    {/* Golden Sparkle positioned perfectly on the 'o' to be harmonious */}
                    <Sparkles 
                        className="absolute -top-1 -right-2 text-emma-gold drop-shadow-md animate-twinkle z-10" 
                        size={baseSize === 'sm' ? 14 : baseSize === 'md' ? 20 : 32} 
                        fill="#FFD700"
                        strokeWidth={1.5}
                    />
                </span>
            );
        }

        return (
          <span 
            key={i} 
            className={`
              inline-block transition-transform duration-300 hover:scale-110 hover:rotate-3
              ${currentSize} 
              ${colorClass}
            `}
            style={{ 
                // Ensuring uniform thickness visually if the font has variance, though Chewy is quite uniform.
                // Tracking (letter-spacing) is handled by the parent flex gap-1
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default AbstractText;