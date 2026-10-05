import React from 'react';
import { Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface InfoButtonProps {
  infoId: string;
  onOpenInfo: (infoId: string) => void;
  title?: string;
  size?: 'sm' | 'md' | 'xs';
  className?: string;
}

export const InfoButton: React.FC<InfoButtonProps> = ({
  infoId,
  onOpenInfo,
  title = 'Information & Parameter Guide',
  size = 'sm',
  className = ''
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const sizeClasses = 
    size === 'xs' 
      ? 'w-4 h-4 p-0.5 text-[9px]' 
      : size === 'md' 
      ? 'w-6 h-6 p-1 text-xs' 
      : 'w-5 h-5 p-0.5 text-[10px]';

  const iconSizes = 
    size === 'xs' 
      ? 'w-2.5 h-2.5' 
      : size === 'md' 
      ? 'w-4 h-4' 
      : 'w-3 h-3';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenInfo(infoId);
      }}
      title={title}
      className={`inline-flex items-center justify-center rounded-full transition-all shrink-0 select-none ${sizeClasses} ${
        isLight
          ? 'bg-sky-100/90 text-sky-700 hover:bg-sky-200 hover:text-sky-900 border border-sky-300 shadow-xs'
          : 'bg-cyan-950/80 text-cyan-400 hover:bg-cyan-900 hover:text-cyan-200 border border-cyan-500/40 shadow-xs shadow-cyan-500/10'
      } ${className}`}
    >
      <Info className={iconSizes} />
    </button>
  );
};
