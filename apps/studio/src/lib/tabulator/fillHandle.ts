import {
  CellComponent,
  ColumnComponent,
  RangeComponent,
  RowComponent,
  Tabulator,
} from "tabulator-tables";
import { isCellEditable, setCellValue } from "@/lib/menu/tableMenu";

export const FILL_HANDLE_CLASS = "tabulator-range-fill-handle";
export const FILL_TARGET_CLASS = "tabulator-range-fill-target";
export const FILL_HANDLE_HOST_CLASS = "tabulator-range-has-fill-handle";

export interface FillRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

/**
 * The rows that get filled when the handle is dragged onto `row`. Filling only
 * runs vertically, so the source columns are carried through untouched.
 * Returns null while the pointer is still inside the source.
 */
export function computeFillTarget(source: FillRect, row: number): FillRect | null {
  if (row > source.bottom) {
    return { top: source.bottom + 1, bottom: row, left: source.left, right: source.right };
  }

  if (row < source.top) {
    return { top: row, bottom: source.top - 1, left: source.left, right: source.right };
  }

  return null;
}

/** The source row a filled cell on `row` takes its value from, repeating the source block. */
export function fillSourceRow(source: FillRect, row: number) {
  return source.top + positiveModulo(row - source.top, source.bottom - source.top + 1);
}

export function unionRect(a: FillRect, b: FillRect): FillRect {
  return {
    top: Math.min(a.top, b.top),
    bottom: Math.max(a.bottom, b.bottom),
    left: Math.min(a.left, b.left),
    right: Math.max(a.right, b.right),
  };
}

function rectEquals(a: FillRect | null, b: FillRect | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.top === b.top && a.bottom === b.bottom && a.left === b.left && a.right === b.right
  );
}

interface DragState {
  range: RangeComponent;
  source: FillRect;
  rows: RowComponent[];
  columns: ColumnComponent[];
  rowPositions: Map<RowComponent, number>;
  target: FillRect | null;
  highlighted: HTMLElement[];
}

export function attachFillHandle(tabulator: Tabulator) {
  const handle = document.createElement("div");
  handle.className = FILL_HANDLE_CLASS;

  let drag: DragState | null = null;

  function visibleColumns(): ColumnComponent[] {
    return tabulator.getColumns(false).filter((column) => column.isVisible());
  }

  function cellAt(
    rows: RowComponent[],
    columns: ColumnComponent[],
    row: number,
    col: number
  ): CellComponent | undefined {
    const column = columns[col];
    if (!rows[row] || !column) return undefined;
    return rows[row].getCells().find((cell) => cell.getColumn() === column);
  }

  function eachCellInRect(
    state: DragState,
    rect: FillRect,
    fn: (cell: CellComponent, row: number, col: number) => void
  ) {
    for (let row = rect.top; row <= rect.bottom; row++) {
      for (let col = rect.left; col <= rect.right; col++) {
        const cell = cellAt(state.rows, state.columns, row, col);
        if (cell) fn(cell, row, col);
      }
    }
  }

  function soleRange(): RangeComponent | null {
    const ranges = tabulator.getRanges();
    return ranges.length === 1 ? ranges[0] : null;
  }

  function boundsOf(range: RangeComponent): FillRect {
    return {
      top: range.getTopEdge(),
      bottom: range.getBottomEdge(),
      left: range.getLeftEdge(),
      right: range.getRightEdge(),
    };
  }

  function bottomRightCell(range: RangeComponent): CellComponent | undefined {
    const rows = range.getRows();
    const columns = range.getColumns();
    const row = rows[rows.length - 1];
    const column = columns[columns.length - 1];
    if (!row || !column) return undefined;
    return row.getCells().find((cell) => cell.getColumn() === column);
  }

  function detach() {
    handle.parentElement?.classList.remove(FILL_HANDLE_HOST_CLASS);
    handle.remove();
  }

  // The handle is only offered where dragging it could actually write
  // something, which keeps it off read-only grids such as query results.
  function sync() {
    if (drag) return;

    const range = soleRange();
    if (!range) {
      detach();
      return;
    }

    const anchor = bottomRightCell(range);
    if (!anchor || !isCellEditable(anchor)) {
      detach();
      return;
    }

    const element = range.getElement() as HTMLElement;
    if (handle.parentElement !== element) {
      detach();
      element.classList.add(FILL_HANDLE_HOST_CLASS);
      element.appendChild(handle);
    }
  }

  function clearHighlight(state: DragState) {
    state.highlighted.forEach((el) => el.classList.remove(FILL_TARGET_CLASS));
    state.highlighted = [];
  }

  function highlight(state: DragState) {
    clearHighlight(state);
    if (!state.target) return;
    eachCellInRect(state, state.target, (cell) => {
      const element = cell.getElement();
      element.classList.add(FILL_TARGET_CLASS);
      state.highlighted.push(element);
    });
  }

  // Dragging drives the real range, so its border grows and shrinks with the
  // pointer instead of the selection jumping into place on release.
  function stretchRange(state: DragState) {
    const rect = state.target
      ? unionRect(state.source, state.target)
      : state.source;
    const start = cellAt(state.rows, state.columns, rect.top, rect.left);
    const end = cellAt(state.rows, state.columns, rect.bottom, rect.right);
    if (start && end) state.range.setBounds(start, end);
  }

  function applyFill(state: DragState, target: FillRect) {
    tabulator.blockRedraw();
    try {
      eachCellInRect(state, target, (cell, row, col) => {
        const sourceCell = cellAt(
          state.rows,
          state.columns,
          fillSourceRow(state.source, row),
          col
        );
        if (sourceCell) setCellValue(cell, sourceCell.getValue());
      });
    } finally {
      tabulator.restoreRedraw();
    }
  }

  function onMouseUp() {
    document.removeEventListener("mouseup", onMouseUp);

    const state = drag;
    drag = null;
    if (!state) return;

    clearHighlight(state);
    if (state.target) {
      applyFill(state, state.target);
      stretchRange(state);
    }
    sync();
  }

  function onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return;

    const range = soleRange();
    if (!range) return;

    // Keep tabulator from treating this as the start of a new range selection.
    event.preventDefault();
    event.stopPropagation();

    const rows = tabulator.getRows("active");
    const columns = visibleColumns();

    drag = {
      range,
      source: boundsOf(range),
      rows,
      columns,
      rowPositions: new Map(rows.map((row, index) => [row, index])),
      target: null,
      highlighted: [],
    };

    document.addEventListener("mouseup", onMouseUp);
  }

  function onCellMouseMove(_event: MouseEvent, cell: CellComponent) {
    if (!drag) return;

    const row = drag.rowPositions.get(cell.getRow());
    if (row === undefined) return;

    const target = computeFillTarget(drag.source, row);
    if (rectEquals(target, drag.target)) return;

    drag.target = target;
    highlight(drag);
    stretchRange(drag);
  }

  handle.addEventListener("mousedown", onMouseDown);

  tabulator.on("cellMouseMove", onCellMouseMove);
  tabulator.on("rangeAdded", sync);
  tabulator.on("rangeChanged", sync);
  tabulator.on("rangeRemoved", sync);
  tabulator.on("dataProcessed", sync);
  tabulator.on("tableBuilt", sync);
  tabulator.on("tableDestroyed", () => {
    document.removeEventListener("mouseup", onMouseUp);
    detach();
  });
}
