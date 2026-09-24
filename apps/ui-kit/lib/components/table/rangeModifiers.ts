import { Tabulator } from "tabulator-tables";
import { isMacLike } from "../../utils/platform";

export interface RangeModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
}

export function rangeModifiers(
  event: MouseEvent,
  isMac: boolean
): RangeModifiers {
  return {
    shiftKey: event.shiftKey,
    ctrlKey: isMac ? event.metaKey : event.ctrlKey,
  };
}

export function attachRangeModifiers(
  tabulator: Tabulator,
  isMac = isMacLike
) {
  const selectRange = (tabulator as any).modules?.selectRange;
  if (!selectRange) return;

  const newSelection = selectRange.newSelection.bind(selectRange);

  selectRange.newSelection = (event: MouseEvent, element: unknown) =>
    newSelection(rangeModifiers(event, isMac), element);
}
