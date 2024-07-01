import { useState } from "react";
const getItems = (count, offset = 0, column = 1) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-column-${column}`,
    content: `item-${k + offset} / column-${column}`,
  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};
const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle,
});
const getListStyle = (isDraggingOver, validTracking) => {
  return {
    background: validTracking ? "red" : "lightgrey",
    padding: grid,
    width: 250,
  };
};

export const useAppStore = () => {
  const [listState, setListState] = useState([
    getItems(10),
    getItems(10, 10, 2),
    getItems(10, 20, 3),
    getItems(10, 30, 4),
  ]);
  const [validValue, setValidValue] = useState(false);
  const [validTracking, setValidTracking] = useState(false);

  const state = { listState, validValue, validTracking };
  const actions = {
    setValidValue,
    setValidTracking,
    showAlert: (text) => {
      alert(text);
    },
    // 1번째컬럼 아이템이 3번째컬럼 아이템으로 불가 (2,4번째 컬럼을 거쳐서 가는것은 가능)
    checkMovementValid: (event, type) => {
      if (!event) return;
      const { source, destination } = event;
      const sInd = +source.droppableId;
      const dInd = +destination.droppableId;

      switch (type) {
        case "move": {
          if (sInd === 0 && dInd === 2) {
            setValidTracking(true);
            return true;
          }
          setValidTracking(false);
          return false;
        }
        case "end": {
          if (sInd === 0 && dInd === 2) {
            setValidValue(true);
            actions.showAlert("첫번째 컬럼에서 세번째컬럼으로 아이템이동이 불가합니다.");
            return true;
          }
          setValidValue(false);
          return false;
        }
      }
    },
    onDragEnd: (event) => {
      if (!event.destination) return;
      const { source, destination } = event;
      const [_, pickedId] = event.draggableId.split("-");
      const formattedId = Number(pickedId);

      const sInd = +source.droppableId;
      const dInd = +destination.droppableId;

      if (sInd === dInd) {
        const items = reorder(listState[sInd], source.index, destination.index);
        const nextItemuUiqueId = Number(items[destination.index + 1]?.id?.split("-")[1]) ?? undefined;
        // 위아래 이동
        if (nextItemuUiqueId && formattedId % 2 === 0) {
          if (nextItemuUiqueId % 2 === 0) {
            setValidValue(true);
            actions.showAlert("짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.");
            return;
          }
        }

        const newState = [...listState];
        newState[sInd] = items;
        setListState(newState);
        // 좌우이동
      } else {
        const items = move(listState[sInd], listState[dInd], source, destination);
        const nextItemuUiqueId = items[dInd][destination.index + 1]?.id?.split("-")[1] ?? undefined;

        if (actions.checkMovementValid(event, "end")) return;

        // 짝수이동 불가
        if (Number(nextItemuUiqueId) && formattedId % 2 === 0) {
          if (Number(nextItemuUiqueId) % 2 === 0) {
            setValidValue(true);
            actions.showAlert("짝수 아이템은 다른 짝수 아이템 앞으로 이동할 수 없습니다.");
            return;
          }
        }

        const newState = [...listState];
        newState[sInd] = items[sInd];
        newState[dInd] = items[dInd];

        setListState(newState.filter((group) => group.length));
      }
      setValidValue(false);
    },
    checkUpdateDragEvenNum: (event) => {
      const { source, destination } = event;
      const [_, pickedId] = event.draggableId?.split("-");
      const formattedId = Number(pickedId);
      const sInd = +source.droppableId;
      const dInd = +destination.droppableId;

      // 위 아래 이동시
      if (sInd === dInd) {
        const items = reorder(listState[sInd], source.index, destination.index);
        const nextItemuUiqueId = Number(items[destination.index + 1]?.id?.split("-")[1]) ?? undefined;
        // 짝수이동 불가
        if (Number(nextItemuUiqueId) && formattedId % 2 === 0) {
          if (Number(nextItemuUiqueId) % 2 === 0) {
            setValidTracking(true);
            return true;
          }
        }
      }

      if (sInd !== dInd) {
        const items = move(listState[sInd], listState[dInd], source, destination);
        const nextItemuUiqueId = items[dInd][destination.index + 1]?.id?.split("-")[1] ?? undefined;

        // 짝수이동 불가
        if (Number(nextItemuUiqueId) && formattedId % 2 === 0) {
          if (Number(nextItemuUiqueId) % 2 === 0) {
            setValidTracking(true);
            return true;
          }
        }
      }
      return false;
    },
    updateDrag: (event) => {
      if (!event.destination) return;

      if (actions.checkUpdateDragEvenNum(event)) return;

      setValidTracking(false);

      actions.checkMovementValid(event, "move");
    },
  };

  return { ...state, actions, getItems, reorder, move, getItemStyle, getListStyle };
};
