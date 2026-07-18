import { useState, useEffect, useRef } from 'react';

/**
 * Shared drag behaviour for the draggable desktop windows.
 *
 * Returns the current window offset, a setter (for custom positioning such as
 * centering on mount), the dragging flag and the title-bar mouse-down handler.
 */
export default function useDraggable(initial = { x: 0, y: 0 }) {
  const [pos, setPos] = useState(initial);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return { pos, setPos, isDragging, handleMouseDown };
}
