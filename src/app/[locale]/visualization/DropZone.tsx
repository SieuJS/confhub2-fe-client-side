// src/app/visualization/DropZone.tsx
import React from 'react';
import { DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { DataField } from '../../../models/visualization/visualization';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface DropZoneProps {
  id: string; // e.g., 'xAxis', 'yAxis', 'color'
  label: string;
  acceptedType: 'dimension' | 'measure' | 'any'; // Control what can be dropped
  field: DataField | null; // The currently dropped field
  onRemoveField: (zoneId: string) => void;
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
}

const DropZone: React.FC<DropZoneProps> = ({
  id,
  label,
  acceptedType,
  field,
  onRemoveField,
  provided,
  snapshot
}) => {
  const isDraggingOver = snapshot.isDraggingOver;
  const bgColor = isDraggingOver ? 'bg-blue-100' : 'bg-gray-100';
  const borderColor = isDraggingOver ? 'border-blue-400' : 'border-gray-300';

  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`flex min-h-[40px] items-center rounded border-2 border-dashed ${borderColor} ${bgColor} p-2 transition-colors`}
        style={{ minHeight: '50px' }} // Ensure enough drop space
      >
        {field ? (
          <div className="flex w-full items-center justify-between rounded border border-gray-300 bg-white p-1.5 px-2 shadow-sm">
             <span className={`mr-1 text-sm font-medium ${field.type === 'dimension' ? 'text-blue-600' : 'text-green-600'}`}>
                {field.name} ({field.type === 'dimension' ? 'Dim' : 'Measure'})
             </span>
            <button
              onClick={() => onRemoveField(id)}
              className="ml-auto text-gray-400 hover:text-red-500"
              aria-label={`Remove ${field.name} from ${label}`}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="w-full text-center text-xs text-gray-400">
            Drop {acceptedType !== 'any' ? acceptedType : 'field'} here
          </span>
        )}
        {provided.placeholder} {/* Placeholder for react-beautiful-dnd */}
      </div>
    </div>
  );
};

export default DropZone;