import React from 'react';

/**
 * Windows-style title-bar controls (minimize / maximize / close) shared by the
 * draggable desktop windows. Only the close button is wired up; minimize and
 * maximize are decorative, matching the original per-window markup.
 */
export default function WindowControls({
  onClose,
  buttonWidth = 45,
  iconSize = 12,
  buttonClassName = 'hover:bg-white/10 text-gray-400',
  closeClassName = 'hover:bg-[#e81123] hover:text-white text-gray-400',
  roundedClose = false,
  className = '',
}) {
  const boxIcon = iconSize - 2;
  const baseButton = 'h-full flex items-center justify-center transition-colors';

  return (
    <div className={`flex h-full${className ? ` ${className}` : ''}`}>
      <button
        style={{ width: buttonWidth }}
        className={`${baseButton} ${buttonClassName}`}
      >
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="currentColor"><path d="M19 13H5v-2h14v2z" /></svg>
      </button>
      <button
        style={{ width: buttonWidth }}
        className={`${baseButton} ${buttonClassName}`}
      >
        <svg viewBox="0 0 24 24" width={boxIcon} height={boxIcon} fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" /></svg>
      </button>
      <button
        onClick={onClose}
        style={{ width: buttonWidth }}
        className={`${baseButton} ${closeClassName}${roundedClose ? ' rounded-tr' : ''}`}
      >
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
      </button>
    </div>
  );
}
