import { Paint } from "./adapter/paint";
import { ParagraphBuilder } from "./adapter/paragraph_builder";
import { ParagraphStyle, Rect, SkEmbindObject, SkEnum } from "./adapter/skia";

export type GlyphIDArray = Uint16Array;
export type InputGlyphIDArray = GlyphIDArray | number[];

export interface CanvasKit {
  ParagraphBuilder: ParagraphBuilderFactory;
  FontCollection: FontCollectionFactory;
  FontMgr: FontMgrFactory;
  Typeface: TypefaceFactory;
  TypefaceFontProvider: TypefaceFontProviderFactory;
  Font: any;
  ParagraphStyle: any;
  TextStyle: any;
  FontEdging: SkEnum<FontEdging>;
  FontHinting: SkEnum<FontHinting>;
  // Paragraph Enums
  Affinity: AffinityEnumValues;
  DecorationStyle: DecorationStyleEnumValues;
  FontSlant: FontSlantEnumValues;
  FontWeight: FontWeightEnumValues;
  FontWidth: FontWidthEnumValues;
  PlaceholderAlignment: PlaceholderAlignmentEnumValues;
  RectHeightStyle: RectHeightStyleEnumValues;
  RectWidthStyle: RectWidthStyleEnumValues;
  TextAlign: TextAlignEnumValues;
  TextBaseline: TextBaselineEnumValues;
  TextDirection: TextDirectionEnumValues;
  TextHeightBehavior: TextHeightBehaviorEnumValues;
  // Paragraph Constants
  NoDecoration: number;
  UnderlineDecoration: number;
  OverlineDecoration: number;
  LineThroughDecoration: number;
}

export interface ParagraphBuilderFactory {
  /**
   * Creates a ParagraphBuilder using the fonts available from the given font manager.
   * @param style
   * @param fontManager
   */
  Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder;

  /**
   * Creates a ParagraphBuilder using the fonts available from the given font provider.
   * @param style
   * @param fontSrc
   */
  //   MakeFromFontProvider(
  //     style: ParagraphStyle,
  //     fontSrc: TypefaceFontProvider
  //   ): ParagraphBuilder;

  /**
   * Creates a ParagraphBuilder using the given font collection.
   * @param style
   * @param fontCollection
   */
  MakeFromFontCollection(
    style: ParagraphStyle,
    fontCollection: FontCollection
  ): ParagraphBuilder;

  /**
   * Return a shaped array of lines
   */
  //   ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[];

  /**
   * Whether the paragraph builder requires ICU data to be provided by the
   * client.
   */
  RequiresClientICU(): boolean;
}

export interface FontCollection extends SkEmbindObject {
  /**
   * Enable fallback to dynamically discovered fonts for characters that are not handled
   * by the text style's fonts.
   */
  enableFontFallback(): void;

  /**
   * Set the default provider used to locate fonts.
   */
  setDefaultFontManager(fontManager: TypefaceFontProvider | null): void;
}

export interface FontMgr extends SkEmbindObject {
  /**
   * Return the number of font families loaded in this manager. Useful for debugging.
   */
  countFamilies(): number;

  /**
   * Return the nth family name. Useful for debugging.
   * @param index
   */
  getFamilyName(index: number): string;

  /**
   * Find the closest matching typeface to the specified familyName and style.
   */
  // matchFamilyStyle(name: string, style: FontStyle): Typeface;
}

export interface FontCollectionFactory {
  /**
   * Return an empty FontCollection
   */
  Make(): FontCollection;
}

export interface FontMgrFactory {
  /**
   * Create an FontMgr with the created font data. Returns null if buffers was empty.
   * @param buffers
   */
  FromData(...buffers: ArrayBuffer[]): FontMgr | null;
}

export interface TypefaceFontProviderFactory {
  /**
   * Return an empty TypefaceFontProvider
   */
  Make(): TypefaceFontProvider;
}

export interface TypefaceFontProvider extends FontMgr {
  /**
   * Registers a given typeface with the given family name (ignoring whatever name the
   * typface has for itself).
   * @param bytes - the raw bytes for a typeface.
   * @param family
   */
  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void;
}

export interface TypefaceFactory {
  /**
   * By default, CanvasKit has a default monospace typeface compiled in so that text works out
   * of the box. This returns that typeface if it is available, null otherwise.
   */
  GetDefault(): Typeface | null;

  /**
   * Create a typeface using Freetype from the specified bytes and return it. CanvasKit supports
   * .ttf, .woff and .woff2 fonts. It returns null if the bytes cannot be decoded.
   * @param fontData
   */
  MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null;
  // Legacy
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null;
}

/**
 * See SkTypeface.h for more on this class. The objects are opaque.
 */
export interface Typeface extends SkEmbindObject {
  /**
   * Retrieves the glyph ids for each code point in the provided string. Note that glyph IDs
   * are typeface-dependent; different faces may have different ids for the same code point.
   * @param str
   * @param numCodePoints - the number of code points in the string. Defaults to str.length.
   * @param output - if provided, the results will be copied into this array.
   */
  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: GlyphIDArray
  ): GlyphIDArray;
}

/**
 * See SkFont.h for more on this class.
 */
export interface Font extends SkEmbindObject {
  /**
   * Returns the FontMetrics for this font.
   */
  getMetrics(): FontMetrics;

  /**
   * Retrieves the bounds for each glyph in glyphs.
   * If paint is not null, its stroking, PathEffect, and MaskFilter fields are respected.
   * These are returned as flattened rectangles.  For each glyph, there will be 4 floats for
   * left, top, right, bottom (relative to 0, 0) for that glyph.
   * @param glyphs
   * @param paint
   * @param output - if provided, the results will be copied into this array.
   */
  getGlyphBounds(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array
  ): Float32Array;

  /**
   * Retrieves the glyph ids for each code point in the provided string. This call is passed to
   * the typeface of this font. Note that glyph IDs are typeface-dependent; different faces
   * may have different ids for the same code point.
   * @param str
   * @param numCodePoints - the number of code points in the string. Defaults to str.length.
   * @param output - if provided, the results will be copied into this array.
   */
  getGlyphIDs(
    str: string,
    numCodePoints?: number,
    output?: GlyphIDArray
  ): GlyphIDArray;

  /**
   * Retrieves the advanceX measurements for each glyph.
   * If paint is not null, its stroking, PathEffect, and MaskFilter fields are respected.
   * One width per glyph is returned in the returned array.
   * @param glyphs
   * @param paint
   * @param output - if provided, the results will be copied into this array.
   */
  getGlyphWidths(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array
  ): Float32Array;

  /**
   * Computes any intersections of a thick "line" and a run of positionsed glyphs.
   * The thick line is represented as a top and bottom coordinate (positive for
   * below the baseline, negative for above). If there are no intersections
   * (e.g. if this is intended as an underline, and there are no "collisions")
   * then the returned array will be empty. If there are intersections, the array
   * will contain pairs of X coordinates [start, end] for each segment that
   * intersected with a glyph.
   *
   * @param glyphs        the glyphs to intersect with
   * @param positions     x,y coordinates (2 per glyph) for each glyph
   * @param top           top of the thick "line" to use for intersection testing
   * @param bottom        bottom of the thick "line" to use for intersection testing
   * @return              array of [start, end] x-coordinate pairs. Maybe be empty.
   */
  getGlyphIntercepts(
    glyphs: InputGlyphIDArray,
    positions: Float32Array | number[],
    top: number,
    bottom: number
  ): Float32Array;

  /**
   * Returns text scale on x-axis. Default value is 1.
   */
  getScaleX(): number;

  /**
   * Returns text size in points.
   */
  getSize(): number;

  /**
   * Returns text skew on x-axis. Default value is zero.
   */
  getSkewX(): number;

  /**
   * Returns embolden effect for this font. Default value is false.
   */
  isEmbolden(): boolean;

  /**
   * Returns the Typeface set for this font.
   */
  getTypeface(): Typeface | null;

  /**
   * Requests, but does not require, that edge pixels draw opaque or with partial transparency.
   * @param edging
   */
  setEdging(edging: FontEdging): void;

  /**
   * Requests, but does not require, to use bitmaps in fonts instead of outlines.
   * @param embeddedBitmaps
   */
  setEmbeddedBitmaps(embeddedBitmaps: boolean): void;

  /**
   * Sets level of glyph outline adjustment.
   * @param hinting
   */
  setHinting(hinting: FontHinting): void;

  /**
   * Requests, but does not require, linearly scalable font and glyph metrics.
   *
   * For outline fonts 'true' means font and glyph metrics should ignore hinting and rounding.
   * Note that some bitmap formats may not be able to scale linearly and will ignore this flag.
   * @param linearMetrics
   */
  setLinearMetrics(linearMetrics: boolean): void;

  /**
   * Sets the text scale on the x-axis.
   * @param sx
   */
  setScaleX(sx: number): void;

  /**
   * Sets the text size in points on this font.
   * @param points
   */
  setSize(points: number): void;

  /**
   * Sets the text-skew on the x axis for this font.
   * @param sx
   */
  setSkewX(sx: number): void;

  /**
   * Set embolden effect for this font.
   * @param embolden
   */
  setEmbolden(embolden: boolean): void;

  /**
   * Requests, but does not require, that glyphs respect sub-pixel positioning.
   * @param subpixel
   */
  setSubpixel(subpixel: boolean): void;

  /**
   * Sets the typeface to use with this font. null means to clear the typeface and use the
   * default one.
   * @param face
   */
  setTypeface(face: Typeface | null): void;
}

export enum FontEdging {
  Alias,
  AntiAlias,
  SubpixelAntiAlias,
}

export enum FontHinting {
  None,
  Slight,
  Normal,
  Full,
}

export interface FontMetrics {
  ascent: number; // suggested space above the baseline. < 0
  descent: number; // suggested space below the baseline. > 0
  leading: number; // suggested spacing between descent of previous line and ascent of next line.
  bounds?: Rect; // smallest rect containing all glyphs (relative to 0,0)
}

export class TextAlignEnumValues {
  Left = { value: 0 };
  Right = { value: 1 };
  Center = { value: 2 };
  Justify = { value: 3 };
  Start = { value: 4 };
  End = { value: 5 };
}

export class TextDirectionEnumValues {
  RTL = { value: 0 };
  LTR = { value: 1 };
}

export class TextBaselineEnumValues {
  Alphabetic = { value: 0 };
  Ideographic = { value: 1 };
}

export class RectHeightStyleEnumValues {
  Tight = { value: 0 };
  Max = { value: 1 };
  IncludeLineSpacingMiddle = { value: 2 };
  IncludeLineSpacingTop = { value: 3 };
  IncludeLineSpacingBottom = { value: 4 };
  Strut = { value: 5 };
}

export class RectWidthStyleEnumValues {
  Tight = { value: 0 };
  Max = { value: 1 };
}

export class AffinityEnumValues {
  Upstream = { value: 0 };
  Downstream = { value: 1 };
}

export class FontWeightEnumValues {
  Invisible = { value: 0 };
  Thin = { value: 100 };
  ExtraLight = { value: 200 };
  Light = { value: 300 };
  Normal = { value: 400 };
  Medium = { value: 500 };
  SemiBold = { value: 600 };
  Bold = { value: 700 };
  ExtraBold = { value: 800 };
  Black = { value: 900 };
  ExtraBlack = { value: 1000 };
}

export class FontWidthEnumValues {
  UltraCondensed = { value: 0 };
  ExtraCondensed = { value: 1 };
  Condensed = { value: 2 };
  SemiCondensed = { value: 3 };
  Normal = { value: 4 };
  SemiExpanded = { value: 5 };
  Expanded = { value: 6 };
  ExtraExpanded = { value: 7 };
  UltraExpanded = { value: 8 };
}

export class FontSlantEnumValues {
  Upright = { value: 0 };
  Italic = { value: 1 };
  Oblique = { value: 2 };
}

export class DecorationStyleEnumValues {
  Solid = { value: 0 };
  Double = { value: 1 };
  Dotted = { value: 2 };
  Dashed = { value: 3 };
  Wavy = { value: 4 };
}

export class TextHeightBehaviorEnumValues {
  All = { value: 0 };
  DisableFirstAscent = { value: 1 };
  DisableLastDescent = { value: 2 };
  DisableAll = { value: 3 };
}

export class PlaceholderAlignmentEnumValues {
  Baseline = { value: 0 };
  AboveBaseline = { value: 1 };
  BelowBaseline = { value: 2 };
  Top = { value: 3 };
  Bottom = { value: 4 };
  Middle = { value: 5 };
}
