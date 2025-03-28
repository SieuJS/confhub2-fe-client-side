import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { DataField } from '../../../models/visualization/visualization'; // Adjust path as needed
import FieldItem from './FieldItem'; // Assuming FieldItem correctly handles DraggableProvided

interface DataFieldPanelProps {
  /** The list of available data fields to display and make draggable. */
  fields: DataField[];
  /** A unique identifier for this droppable source list, required by @hello-pangea/dnd. */
  droppableId: string;
}

const logPrefixDFP = "[DataFieldPanel]";

/**
 * A panel component that displays available data fields (Dimensions and Measures)
 * as draggable items. It acts as a source list for drag-and-drop operations.
 * Uses React.memo for performance optimization.
 */
const DataFieldPanel: React.FC<DataFieldPanelProps> = React.memo(({ fields, droppableId }) => {
  // console.log(`%c${logPrefixDFP} Rendering (memo check). Fields count: ${fields.length}, Droppable ID: ${droppableId}`, 'color: #909'); // Use a distinct color

  // Separate fields into dimensions and measures for distinct sections
  const dimensions = fields.filter(f => f.type === 'dimension');
  const measures = fields.filter(f => f.type === 'measure');
  // console.log(`%c${logPrefixDFP} Dimensions: ${dimensions.length}, Measures: ${measures.length}`, 'color: #909');

  return (
    <div className="h-full w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 p-4">
      {/* Panel Title */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500"> {/* Increased bottom margin, added tracking */}
        Fields
      </h3>

      {/* Droppable area encompassing all fields. Drops are disabled; it's just a source. */}
      <Droppable droppableId={droppableId} isDropDisabled={true}>
        {(provided, snapshot) => {
           // console.log(`%c${logPrefixDFP} Droppable state: isDraggingOver=${snapshot.isDraggingOver}, draggingFromThis=${snapshot.draggingFromThisWith}`, 'color: gray'); // Optional: More detailed log
           return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-4" // Add vertical space between sections
            >
                {/* Dimensions Section */}
                <section> {/* Use section for semantics */}
                  <h4 className="mb-2 text-xs font-medium text-blue-700"> {/* Slightly darker blue */}
                    Dimensions ({dimensions.length}) {/* Show count */}
                  </h4>
                  {dimensions.length > 0 ? (
                    dimensions.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(providedDraggable, snapshotDraggable) => {
                              // console.log(`%c${logPrefixDFP} Draggable Dim state (${field.id}): isDragging=${snapshotDraggable.isDragging}`, 'color: gray');
                              // Pass field data and dnd props to the FieldItem component
                              return (
                                <FieldItem
                                  field={field}
                                  provided={providedDraggable}
                                  isDragging={snapshotDraggable.isDragging} // Pass dragging state down if FieldItem needs it
                                />
                              );
                          }}
                      </Draggable>
                    ))
                  ) : (
                    <p className='px-1 text-xs text-gray-400 italic'>No dimensions available.</p> // Added padding and italics
                  )}
                </section>

                {/* Measures Section */}
                <section> {/* Use section for semantics */}
                  <h4 className="mb-2 text-xs font-medium text-green-700"> {/* Slightly darker green */}
                    Measures ({measures.length}) {/* Show count */}
                  </h4>
                  {measures.length > 0 ? (
                    measures.map((field, index) => {
                      // IMPORTANT: The index for dnd must be unique and contiguous across ALL items
                      // within the *same* Droppable. So, measures indices start after dimensions.
                      const draggableIndex = index + dimensions.length;
                      // console.log(`%c${logPrefixDFP} Rendering Draggable Measure: ${field.id} at global index ${draggableIndex}`, 'color: gray');
                      return (
                          <Draggable key={field.id} draggableId={field.id} index={draggableIndex}>
                              {(providedDraggable, snapshotDraggable) => {
                                  // console.log(`%c${logPrefixDFP} Draggable Measure state (${field.id}): isDragging=${snapshotDraggable.isDragging}`, 'color: gray');
                                  return (
                                    <FieldItem
                                      field={field}
                                      provided={providedDraggable}
                                      isDragging={snapshotDraggable.isDragging} // Pass dragging state down
                                    />
                                  );
                              }}
                          </Draggable>
                      );
                    })
                  ) : (
                     <p className='px-1 text-xs text-gray-400 italic'>No measures available.</p> // Added padding and italics
                  )}
                </section>

                {/* Placeholder required by @hello-pangea/dnd to reserve space during drag */}
                {provided.placeholder}
            </div>
           );
        }}
      </Droppable>
    </div>
  );
});

// Setting displayName is helpful for debugging, especially when using React.memo or HOCs
DataFieldPanel.displayName = 'DataFieldPanel';
export default DataFieldPanel;