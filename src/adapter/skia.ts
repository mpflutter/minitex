export class SkEmbindObject {
  _type = "";
  _deleted = false;

  delete(): void {
    this._deleted = true;
  }

  deleteLater(): void {
    this._deleted = true;
  }

  isAliasOf(other: any): boolean {
    return other._type === this._type;
  }

  isDeleted(): boolean {
    return this._deleted;
  }
}

export interface SkEnum<T> {
  value: T;
}

export type InputWords = Uint32Array | number[];
export type InputGraphemes = Uint32Array | number[];
export type InputLineBreaks = Uint32Array | number[];
export type Color = Float32Array;
export type InputColor = Color | number[];
export type Rect = Float32Array;
export type GlyphIDArray = Uint16Array;

export enum PlaceholderAlignment {
  Baseline = "Baseline",
  AboveBaseline = "AboveBaseline",
  BelowBaseline = "BelowBaseline",
  Top = "Top",
  Bottom = "Bottom",
  Middle = "Middle",
}

export enum StrokeCap {
  Butt = "Butt",
  Round = "Round",
  Square = "Square",
}

export enum StrokeJoin {
  Bevel = "Bevel",
  Miter = "Miter",
  Round = "Round",
}

export enum TextBaseline {
  Alphabetic,
  Ideographic,
}

export enum TextDirection {
  RTL,
  LTR,
}

export enum RectHeightStyle {
  Tight,
  Max,
  IncludeLineSpacingMiddle,
  IncludeLineSpacingTop,
  IncludeLineSpacingBottom,
  Strut,
}

export enum RectWidthStyle {
  Tight,
  Max,
}

export enum Affinity {
  Upstream,
  Downstream,
}

export interface GlyphInfo {
  /**
   * The layout bounds of the grapheme cluster the code point belongs to, in
   * the paragraph's coordinates.
   *
   * This width of the rect is horizontal advance of the grapheme cluster,
   * the height of the rect is the line height when the grapheme cluster
   * occupies a full line.
   */
  graphemeLayoutBounds: Rect;
  /**
   * The left-closed-right-open UTF-16 range of the grapheme cluster the code
   * point belongs to.
   */
  graphemeClusterTextRange: URange;
  /** The writing direction of the grapheme cluster. */
  dir: SkEnum<TextDirection>;
  /**
   * Whether the associated glyph points to an ellipsis added by the text
   * layout library.
   *
   * The text layout library truncates the lines that exceed the specified
   * max line number, and may add an ellipsis to replace the last few code
   * points near the logical end of the last visible line. If True, this object
   * marks the logical end of the list of GlyphInfo objects that are
   * retrievable from the text layout library.
   */
  isEllipsis: boolean;
}

export interface URange {
  start: number;
  end: number;
}

export interface LineMetrics {
  /** The index in the text buffer the line begins. */
  startIndex: number;
  /** The index in the text buffer the line ends. */
  endIndex: number;
  endExcludingWhitespaces: number;
  endIncludingNewline: number;
  /** True if the line ends in a hard break (e.g. newline) */
  isHardBreak: boolean;
  /**
   * The final computed ascent for the line. This can be impacted by
   * the strut, height, scaling, as well as outlying runs that are very tall.
   */
  ascent: number;
  /**
   * The final computed descent for the line. This can be impacted by
   * the strut, height, scaling, as well as outlying runs that are very tall.
   */
  descent: number;
  /** round(ascent + descent) */
  height: number;
  /** heightMultiplier */
  heightMultiplier: number;
  /** width of the line */
  width: number;
  /** The left edge of the line. The right edge can be obtained with `left + width` */
  left: number;
  /** The y offset of the line to top. */
  yOffset: number;
  /** The y position of the baseline for this line from the top of the paragraph. */
  baseline: number;
  /** Zero indexed line number. */
  lineNumber: number;
}

export interface RectWithDirection {
  rect: Rect;
  dir: SkEnum<TextDirection>;
}

export interface ShapedLine {
  textRange: Range; // first and last character offsets for the line (derived from runs[])
  top: number; // top y-coordinate for the line
  bottom: number; // bottom y-coordinate for the line
  baseline: number; // baseline y-coordinate for the line
  runs: GlyphRun[]; // array of GlyphRun objects for the line
}

export interface GlyphRun {
  typeface: Typeface; // currently set to null (temporary)
  size: number;
  fakeBold: boolean;
  fakeItalic: boolean;

  glyphs: Uint16Array;
  positions: Float32Array; // alternating x0, y0, x1, y1, ...
  offsets: Uint32Array;
  flags: number; // see GlyphRunFlags
}

export interface Typeface {
  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: GlyphIDArray
  ): GlyphIDArray;
}

export interface PositionWithAffinity {
  pos: number;
  affinity: SkEnum<Affinity>;
}

export interface ParagraphStyle {
  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  replaceTabCharacters?: boolean;
  strutStyle?: StrutStyle;
  textAlign?: SkEnum<TextAlign>;
  textDirection?: SkEnum<TextDirection>;
  // textHeightBehavior?: TextHeightBehavior;
  textStyle?: TextStyle;
  // applyRoundingHack?: boolean;
}

export interface StrutStyle {
  strutEnabled?: boolean;
  fontFamilies?: string[];
  fontStyle?: FontStyle;
  fontSize?: number;
  heightMultiplier?: number;
  halfLeading?: boolean;
  leading?: number;
  forceStrutHeight?: boolean;
}

export enum TextAlign {
  Left = 0,
  Right = 1,
  Center = 2,
  Justify = 3,
  Start = 4,
  End = 5,
}

export interface LetterRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextShadow {
  color?: InputColor;
  offset?: number[];
  blurRadius?: number;
}

export const NoDecoration = 0;
export const UnderlineDecoration = 1;
export const OverlineDecoration = 2;
export const LineThroughDecoration = 4;

export interface TextStyle {
  backgroundColor?: InputColor;
  color?: InputColor;
  decoration?: number;
  decorationColor?: InputColor;
  decorationThickness?: number;
  decorationStyle?: SkEnum<DecorationStyle>;
  fontFamilies?: string[];
  fontFeatures?: TextFontFeatures[];
  fontSize?: number;
  fontStyle?: FontStyle;
  fontVariations?: TextFontVariations[];
  foregroundColor?: InputColor;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  shadows?: TextShadow[];
  textBaseline?: SkEnum<TextBaseline>;
  wordSpacing?: number;
}

export interface FontStyle {
  weight?: SkEnum<FontWeight>;
  width?: SkEnum<FontWidth>;
  slant?: SkEnum<FontSlant>;
}

export enum FontWeight {
  Invisible = 0,
  Thin = 100,
  ExtraLight = 200,
  Light = 300,
  Normal = 400,
  Medium = 500,
  SemiBold = 600,
  Bold = 700,
  ExtraBold = 800,
  Black = 900,
  ExtraBlack = 1000,
}

export enum FontWidth {
  UltraCondensed,
  ExtraCondensed,
  Condensed,
  SemiCondensed,
  Normal,
  SemiExpanded,
  Expanded,
  ExtraExpanded,
  UltraExpanded,
}

export enum FontSlant {
  Upright,
  Italic,
  Oblique,
}

export enum DecorationStyle {
  Solid,
  Double,
  Dotted,
  Dashed,
  Wavy,
}

export interface TextFontFeatures {
  name: string;
  value: number;
}

export interface TextFontVariations {
  axis: string;
  value: number;
}
