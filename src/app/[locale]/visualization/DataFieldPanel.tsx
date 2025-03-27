import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { DataField } from '../../../models/visualization/visualization';
import FieldItem from './FieldItem';

interface DataFieldPanelProps {
  fields: DataField[];
  droppableId: string;
}

const logPrefixDFP = "[DataFieldPanel]";

const DataFieldPanel: React.FC<DataFieldPanelProps> = React.memo(({ fields, droppableId }) => {
  // Log đã có từ trước: console.log(`Rendering DataFieldPanel (memo check) - fields length: ${fields.length}`);
  console.log(`%c${logPrefixDFP} Rendering (memo check). Fields length: ${fields.length}, Droppable ID: ${droppableId}`);
  // console.log(`%c${logPrefixDFP} Fields prop:`, fields); // Uncomment for detail

  const dimensions = fields.filter(f => f.type === 'dimension');
  const measures = fields.filter(f => f.type === 'measure');
   console.log(`%c${logPrefixDFP} Dimensions: ${dimensions.length}, Measures: ${measures.length}`);


  return (
    <div className="h-full w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">Fields</h3>

      <Droppable droppableId={droppableId} isDropDisabled={true}>
        {(provided, snapshot) => {
           // console.log(`%c${logPrefixDFP} Droppable state: isDraggingOver=${snapshot.isDraggingOver}`);
           return (
            <div ref={provided.innerRef} {...provided.droppableProps}>
                {/* Dimensions */}
                <div className="mb-4">
                <h4 className="mb-2 text-xs font-medium text-blue-600">Dimensions</h4>
                {dimensions.map((field, index) => {
                    // console.log(`%c${logPrefixDFP} Rendering Draggable Dimension: ${field.id} at index ${index}`);
                    return (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(providedDraggable, snapshotDraggable) => {
                             // console.log(`%c${logPrefixDFP} Draggable state (${field.id}): isDragging=${snapshotDraggable.isDragging}`);
                            return ( <FieldItem field={field} provided={providedDraggable} /> );
                        }}
                    </Draggable>
                    );
                })}
                {dimensions.length === 0 && <p className='text-xs text-gray-400'>No dimensions found.</p>}
                </div>

                {/* Measures */}
                <div>
                <h4 className="mb-2 text-xs font-medium text-green-600">Measures</h4>
                {measures.map((field, index) => {
                    const draggableIndex = index + dimensions.length;
                     // console.log(`%c${logPrefixDFP} Rendering Draggable Measure: ${field.id} at index ${draggableIndex}`);
                     return (
                        <Draggable key={field.id} draggableId={field.id} index={draggableIndex}>
                            {(providedDraggable, snapshotDraggable) => {
                                // console.log(`%c${logPrefixDFP} Draggable state (${field.id}): isDragging=${snapshotDraggable.isDragging}`);
                                return ( <FieldItem field={field} provided={providedDraggable} /> );
                            }}
                        </Draggable>
                     );
                })}
                {measures.length === 0 && <p className='text-xs text-gray-400'>No measures found.</p>}
                </div>

                {provided.placeholder}
            </div>
           );
        }}
      </Droppable>
    </div>
  );
});

DataFieldPanel.displayName = 'DataFieldPanel';
export default DataFieldPanel;