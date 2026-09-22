// Helpers for pulling the allowed values out of a column's enum type definition.
// Each database encodes enums differently in the type string its catalog returns,
// so these turn that raw type into the list the UI uses to build a dropdown. They
// return undefined for anything that isn't an enum, so callers can apply them
// unconditionally to every column's data type.

/**
 * Parse a quoted, comma-separated enum definition where single quotes inside a
 * value are escaped by doubling (`''`). Covers MySQL/MariaDB (`enum('a','b')`).
 * Returns undefined for non-enum types (including MySQL's `set(...)`).
 */
export function parseQuotedEnumValues(columnType?: string | null): string[] | undefined {
  if (!columnType) return undefined;
  const match = /^enum\((.*)\)$/i.exec(columnType.trim());
  if (!match) return undefined;

  const body = match[1];
  const values: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < body.length; i++) {
    const char = body[i];
    if (inQuote) {
      if (char === "'") {
        if (body[i + 1] === "'") {
          // doubled single quote -> literal quote
          current += "'";
          i++;
        } else {
          inQuote = false;
        }
      } else {
        current += char;
      }
    } else if (char === "'") {
      inQuote = true;
    } else if (char === ",") {
      values.push(current);
      current = "";
    }
    // ignore whitespace between items when outside quotes
  }
  values.push(current);

  return values;
}
