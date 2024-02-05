import {
  EmbindObject,
  GlyphInfo,
  LineMetrics,
  PositionWithAffinity,
  RectHeightStyle,
  RectWidthStyle,
  RectWithDirection,
  ShapedLine,
  URange,
} from "./skia";

export const drawParagraph = (paragraph: Paragraph) => {}

export class Paragraph extends EmbindObject {
  didExceedMaxLines(): boolean {
    return false;
  }

  getAlphabeticBaseline(): number {
    return 0;
  }

  /**
   * Returns the index of the glyph that corresponds to the provided coordinate,
   * with the top left corner as the origin, and +y direction as down.
   */
  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    throw "todo";
  }

  /**
   * Returns the information associated with the closest glyph at the specified
   * paragraph coordinate, or null if the paragraph is empty.
   */
  getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null {
    return null;
  }

  /**
   * Returns the information associated with the glyph at the specified UTF-16
   * offset within the paragraph's visible lines, or null if the index is out
   * of bounds, or points to a codepoint that is logically after the last
   * visible codepoint.
   */
  getGlyphInfoAt(index: number): GlyphInfo | null {
    return null;
  }

  getHeight(): number {
    return 0;
  }

  getIdeographicBaseline(): number {
    return 0;
  }

  /**
   * Returns the line number of the line that contains the specified UTF-16
   * offset within the paragraph, or -1 if the index is out of bounds, or
   * points to a codepoint that is logically after the last visible codepoint.
   */
  getLineNumberAt(index: number): number {
    return 0;
  }

  getLineMetrics(): LineMetrics[] {
    return [];
  }

  /**
   * Returns the LineMetrics of the line at the specified line number, or null
   * if the line number is out of bounds, or is larger than or equal to the
   * specified max line number.
   */
  getLineMetricsAt(lineNumber: number): LineMetrics | null {
    return null;
  }

  getLongestLine(): number {
    return 0;
  }

  getMaxIntrinsicWidth(): number {
    return 0;
  }

  getMaxWidth(): number {
    return 0;
  }

  getMinIntrinsicWidth(): number {
    return 0;
  }

  /**
   * Returns the total number of visible lines in the paragraph.
   */
  getNumberOfLines(): number {
    return 0;
  }

  getRectsForPlaceholders(): RectWithDirection[] {
    return [];
  }

  /**
   * Returns bounding boxes that enclose all text in the range of glpyh indexes [start, end).
   * @param start
   * @param end
   * @param hStyle
   * @param wStyle
   */
  getRectsForRange(
    start: number,
    end: number,
    hStyle: RectHeightStyle,
    wStyle: RectWidthStyle
  ): RectWithDirection[] {
    return [];
  }

  /**
   * Finds the first and last glyphs that define a word containing the glyph at index offset.
   * @param offset
   */
  getWordBoundary(offset: number): URange {
    throw "todo";
  }

  /**
   * Returns an array of ShapedLine objects, describing the paragraph.
   */
  getShapedLines(): ShapedLine[] {
    return [];
  }

  /**
   * Lays out the text in the paragraph so it is wrapped to the given width.
   * @param width
   */
  layout(width: number): void {
    console.log("layout", width);
  }

  /**
   * When called after shaping, returns the glyph IDs which were not matched
   * by any of the provided fonts.
   */
  unresolvedCodepoints(): number[] {
    return [];
  }
}
