import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAppStore } from "./store/app_store";

function App() {
  const store = useAppStore();

  return (
    <div>
      <div style={{ display: "flex" }}>
        <DragDropContext onDragEnd={store.actions.onDragEnd} onDragUpdate={store.actions.updateDrag}>
          {store.listState.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={store.getListStyle(snapshot.isDraggingOver, store.validTracking)}
                  {...provided.droppableProps}
                >
                  {el.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={store.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                            }}
                          >
                            {item.content}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
}
export default App;
