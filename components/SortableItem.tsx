import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, className }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative' as 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`${className} ${isDragging ? 'opacity-50' : ''}`}>
      {children}
    </div>
  );
};