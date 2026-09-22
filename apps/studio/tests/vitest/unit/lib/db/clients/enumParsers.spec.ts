import { describe, it, expect } from "vitest"
import { parseQuotedEnumValues } from "@/lib/db/clients/enumParsers"

describe("parseQuotedEnumValues (MySQL / MariaDB)", () => {
  it("parses a simple enum definition", () => {
    expect(parseQuotedEnumValues("enum('a','b','c')")).toEqual(['a', 'b', 'c'])
  })

  it("is case-insensitive and tolerates spaces after commas (DuckDB style)", () => {
    expect(parseQuotedEnumValues("ENUM('a', 'b', 'c')")).toEqual(['a', 'b', 'c'])
  })

  it("keeps commas that appear inside values", () => {
    expect(parseQuotedEnumValues("enum('a,b','c')")).toEqual(['a,b', 'c'])
  })

  it("unescapes doubled single quotes", () => {
    expect(parseQuotedEnumValues("enum('o''clock','noon')")).toEqual(["o'clock", 'noon'])
  })

  it("handles a single value", () => {
    expect(parseQuotedEnumValues("enum('only')")).toEqual(['only'])
  })

  it("returns undefined for non-enum types", () => {
    expect(parseQuotedEnumValues("varchar(20)")).toBeUndefined()
    expect(parseQuotedEnumValues("int")).toBeUndefined()
    expect(parseQuotedEnumValues("set('x','y')")).toBeUndefined()
    expect(parseQuotedEnumValues(undefined)).toBeUndefined()
    expect(parseQuotedEnumValues(null)).toBeUndefined()
  })
})
