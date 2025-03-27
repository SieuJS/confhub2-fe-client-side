import React from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'; // Thêm Snapshot
import { DataField } from '../../../models/visualization/visualization';
import { TagIcon, VariableIcon } from '@heroicons/react/24/solid';

interface FieldItemProps {
  field: DataField;
  provided: DraggableProvided;
  // snapshot: DraggableStateSnapshot; // Có thể thêm snapshot nếu cần log trạng thái kéo
}
const logPrefixFI = "[FieldItem]";


// Thêm React.memo nếu chưa có
const FieldItem: React.FC<FieldItemProps> = React.memo(({ field, provided /*, snapshot */ }) => {
  console.log(`%c${logPrefixFI} Rendering (memo check) for field: ${field.name} (${field.id})`);
  // console.log(`%c${logPrefixFI} Draggable state: isDragging=${snapshot.isDragging}`); // Nếu dùng snapshot
  const Icon = field.type === 'dimension' ? TagIcon : VariableIcon;

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="mb-2 flex cursor-grab items-center rounded border border-gray-300 bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
      style={provided.draggableProps.style}
    >
      <Icon className={`mr-2 h-4 w-4 ${field.type === 'dimension' ? 'text-blue-500' : 'text-green-500'}`} />
      <span className="text-sm text-gray-800">{field.name}</span>
    </div>
  );
});

FieldItem.displayName = 'FieldItem';
export default FieldItem;