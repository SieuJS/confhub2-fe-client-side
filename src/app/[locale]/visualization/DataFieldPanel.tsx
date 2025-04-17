// src/app/[locale]/visualization/DataFieldPanel.tsx
import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { DataField } from '../../../models/visualization/visualization';
import FieldItem from './FieldItem';
import { ChevronDoubleLeftIcon } from '@heroicons/react/20/solid';

interface DataFieldPanelProps {
    fields: DataField[];
    droppableId: string;
    isCollapsed: boolean;
    onToggle: () => void;
}
const DataFieldPanel: React.FC<DataFieldPanelProps> = React.memo(({
    fields,
    droppableId,
    isCollapsed,
    onToggle
}) => {
    const dimensions = fields.filter(f => f.type === 'dimension');
    const measures = fields.filter(f => f.type === 'measure');

    return (
        // Always render the div, control visibility purely with CSS
        <div
            className={`
                relative flex-shrink-0 border-r border-gray-200 bg-gray-50
                transition-all duration-300 ease-in-out
                transition-all duration-400 ease-out
                ${isCollapsed
                    ? 'w-0 p-0 overflow-hidden border-none opacity-0 pointer-events-none'
                    : 'w-64 p-4 overflow-y-auto opacity-100'
                }
            `}
            aria-hidden={isCollapsed}
        >
            {/* --- Content is ALWAYS rendered, but hidden by parent CSS when collapsed --- */}
            {/* Panel Title and Collapse Button */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"> {/* Added whitespace-nowrap */}
                    Fields
                </h3>
                <button
                    onClick={onToggle}
                    className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    title="Collapse Fields Panel"
                    aria-label="Collapse Fields Panel"
                >
                    <ChevronDoubleLeftIcon className="h-5 w-5" />
                </button>
            </div>

            {/* Droppable area */}
            <Droppable droppableId={droppableId} isDropDisabled={true}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-4"
                    >
                        {/* Dimensions Section */}
                        <section>
                            <h4 className="mb-2 text-xs font-medium text-blue-700 whitespace-nowrap"> {/* Added whitespace-nowrap */}
                                Dimensions ({dimensions.length})
                            </h4>
                            {dimensions.length > 0 ? (
                                dimensions.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                        {(providedDraggable, snapshotDraggable) => (
                                            <FieldItem
                                                field={field}
                                                provided={providedDraggable}
                                                isDragging={snapshotDraggable.isDragging}
                                            />
                                        )}
                                    </Draggable>
                                ))
                            ) : (
                                <p className='px-1 text-xs text-gray-400 italic'>No dimensions available.</p>
                            )}
                        </section>

                        {/* Measures Section */}
                        <section>
                            <h4 className="mb-2 text-xs font-medium text-green-700 whitespace-nowrap"> {/* Added whitespace-nowrap */}
                                Measures ({measures.length})
                            </h4>
                            {measures.length > 0 ? (
                                measures.map((field, index) => {
                                    const draggableIndex = index + dimensions.length;
                                    return (
                                        <Draggable key={field.id} draggableId={field.id} index={draggableIndex}>
                                            {(providedDraggable, snapshotDraggable) => (
                                                <FieldItem
                                                    field={field}
                                                    provided={providedDraggable}
                                                    isDragging={snapshotDraggable.isDragging}
                                                />
                                            )}
                                        </Draggable>
                                    );
                                })
                            ) : (
                                <p className='px-1 text-xs text-gray-400 italic'>No measures available.</p>
                            )}
                        </section>

                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
});

DataFieldPanel.displayName = 'DataFieldPanel';
export default DataFieldPanel;