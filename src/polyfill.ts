import { Paint } from "./adapter/paint";
import { ParagraphBuilder } from "./adapter/paragraph_builder";
import {
  DecorationStyle,
  FontStyle,
  InputColor,
  ParagraphStyle,
  SkEmbindObject,
  SkEnum,
  StrutStyle,
  TextAlign,
  TextBaseline,
  TextDirection,
  TextFontFeatures,
  TextFontVariations,
  TextShadow,
  TextStyle,
} from "./adapter/skia";
import {
  TextAlignEnumValues,
  type CanvasKit,
  type Font,
  type FontCollection,
  type FontCollectionFactory,
  type FontEdging,
  type FontHinting,
  type FontMetrics,
  type FontMgr,
  type FontMgrFactory,
  type InputGlyphIDArray,
  type ParagraphBuilderFactory,
  type Typeface,
  type TypefaceFactory,
  type TypefaceFontProvider,
  type TypefaceFontProviderFactory,
  TextDirectionEnumValues,
  TextBaselineEnumValues,
  RectHeightStyleEnumValues,
  RectWidthStyleEnumValues,
  AffinityEnumValues,
  FontWeightEnumValues,
  FontWidthEnumValues,
  FontSlantEnumValues,
  DecorationStyleEnumValues,
  TextHeightBehaviorEnumValues,
} from "./polyfill.types";

export const installPolyfill = (canvasKit: CanvasKit) => {
  canvasKit.ParagraphBuilder = new _ParagraphBuilderFactory();
  canvasKit.FontCollection = new _FontCollectionFactory();
  canvasKit.FontMgr = new _FontMgrFactory();
  canvasKit.Typeface = new _TypefaceFactory();
  canvasKit.TypefaceFontProvider = new _TypefaceFontProviderFactory();
  canvasKit.Font = _Font;
  canvasKit.ParagraphStyle = (properties: any) => {
    return new _ParagraphStyle(properties);
  };
  canvasKit.TextStyle = (properties: any) => {
    return new _TextStyle(properties);
  };
  // Paragraph Enums
  canvasKit.TextAlign = new TextAlignEnumValues();
  canvasKit.TextDirection = new TextDirectionEnumValues();
  canvasKit.TextBaseline = new TextBaselineEnumValues();
  canvasKit.RectHeightStyle = new RectHeightStyleEnumValues();
  canvasKit.RectWidthStyle = new RectWidthStyleEnumValues();
  canvasKit.Affinity = new AffinityEnumValues();
  canvasKit.FontWeight = new FontWeightEnumValues();
  canvasKit.FontWidth = new FontWidthEnumValues();
  canvasKit.FontSlant = new FontSlantEnumValues();
  canvasKit.DecorationStyle = new DecorationStyleEnumValues();
  canvasKit.TextHeightBehavior = new TextHeightBehaviorEnumValues();
  // Paragraph Constants
  canvasKit.NoDecoration = 0;
  canvasKit.UnderlineDecoration = 1;
  canvasKit.OverlineDecoration = 2;
  canvasKit.LineThroughDecoration = 3;
};

class _ParagraphBuilderFactory implements ParagraphBuilderFactory {
  Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
    return this.MakeFromFontCollection(style, {} as any);
  }
  MakeFromFontCollection(
    style: ParagraphStyle,
    fontCollection: FontCollection
  ): ParagraphBuilder {
    throw new Error("Method not implemented.");
  }
  RequiresClientICU(): boolean {
    return false;
  }
}

class _ParagraphStyle extends SkEmbindObject implements ParagraphStyle {
  constructor(properties: any) {
    super();
    Object.assign(this, properties);
  }

  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  replaceTabCharacters?: boolean;
  strutStyle?: StrutStyle;
  textAlign?: SkEnum<TextAlign>;
  textDirection?: SkEnum<TextDirection>;
  // textHeightBehavior?,
  textStyle?: TextStyle;
  // applyRoundingHack?: boolean;
}

class _TextStyle extends SkEmbindObject implements TextStyle {
  constructor(properties: any) {
    super();
    Object.assign(this, properties);
  }

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

class _FontCollection extends SkEmbindObject implements FontCollection {
  setDefaultFontManager(fontManager: TypefaceFontProvider | null): void {}
  enableFontFallback(): void {}
}

class _FontCollectionFactory implements FontCollectionFactory {
  Make(): FontCollection {
    return new _FontCollection();
  }
}

class _FontMgr extends SkEmbindObject implements FontMgr {
  countFamilies(): number {
    return 0;
  }
  getFamilyName(index: number): string {
    return "";
  }
}

class _FontMgrFactory implements FontMgrFactory {
  FromData(...buffers: ArrayBuffer[]): FontMgr | null {
    return new _FontMgr();
  }
}

class _TypefaceFactory implements TypefaceFactory {
  GetDefault(): Typeface | null {
    throw new Error("_TypefaceFactory GetDefault Method not implemented.");
  }
  MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null {
    throw new Error(
      "_TypefaceFactory MakeTypefaceFromData Method not implemented."
    );
  }
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null {
    return new _Typeface();
  }
}

class _TypefaceFontProvider
  extends SkEmbindObject
  implements TypefaceFontProvider
{
  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {}
  countFamilies(): number {
    return 0;
  }
  getFamilyName(index: number): string {
    return "";
  }
}

class _TypefaceFontProviderFactory implements TypefaceFontProviderFactory {
  Make(): TypefaceFontProvider {
    return new _TypefaceFontProvider();
  }
}

class _Typeface extends SkEmbindObject implements Typeface {
  getGlyphIDs(
    str: string,
    numCodePoints?: number | undefined,
    output?: Uint16Array | undefined
  ): Uint16Array {
    return new Uint16Array([]);
  }
}

class _Font extends SkEmbindObject implements Font {
  constructor(
    face: Typeface | null,
    size: number,
    scaleX: number,
    skewX: number
  ) {
    super();
  }

  getMetrics(): FontMetrics {
    throw new Error("getMetrics Method not implemented.");
  }
  getGlyphBounds(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null | undefined,
    output?: Float32Array | undefined
  ): Float32Array {
    return new Float32Array([0, 0, 0, 0]);
  }
  getGlyphIDs(
    str: string,
    numCodePoints?: number | undefined,
    output?: Uint16Array | undefined
  ): Uint16Array {
    return new Uint16Array([]);
  }
  getGlyphWidths(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null | undefined,
    output?: Float32Array | undefined
  ): Float32Array {
    throw new Error("getGlyphWidths Method not implemented.");
  }
  getGlyphIntercepts(
    glyphs: InputGlyphIDArray,
    positions: number[] | Float32Array,
    top: number,
    bottom: number
  ): Float32Array {
    throw new Error("getGlyphIntercepts Method not implemented.");
  }
  getScaleX(): number {
    throw new Error("getScaleX Method not implemented.");
  }
  getSize(): number {
    throw new Error("getSize Method not implemented.");
  }
  getSkewX(): number {
    throw new Error("getSkewX Method not implemented.");
  }
  isEmbolden(): boolean {
    throw new Error("isEmbolden Method not implemented.");
  }
  getTypeface(): Typeface | null {
    throw new Error("getTypeface Method not implemented.");
  }
  setEdging(edging: FontEdging): void {
    throw new Error("setEdging Method not implemented.");
  }
  setEmbeddedBitmaps(embeddedBitmaps: boolean): void {
    throw new Error("setEmbeddedBitmaps Method not implemented.");
  }
  setHinting(hinting: FontHinting): void {
    throw new Error("setHinting Method not implemented.");
  }
  setLinearMetrics(linearMetrics: boolean): void {
    throw new Error("setLinearMetrics Method not implemented.");
  }
  setScaleX(sx: number): void {
    throw new Error("setScaleX Method not implemented.");
  }
  setSize(points: number): void {
    throw new Error("setSize Method not implemented.");
  }
  setSkewX(sx: number): void {
    throw new Error("setSkewX Method not implemented.");
  }
  setEmbolden(embolden: boolean): void {
    throw new Error("setEmbolden Method not implemented.");
  }
  setSubpixel(subpixel: boolean): void {
    throw new Error("setSubpixel Method not implemented.");
  }
  setTypeface(face: Typeface | null): void {
    throw new Error("setTypeface Method not implemented.");
  }
}
