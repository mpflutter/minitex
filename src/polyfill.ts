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
  PlaceholderAlignmentEnumValues,
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
  canvasKit.PlaceholderAlignment = new PlaceholderAlignmentEnumValues();
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
    throw new Error("MakeFromFontCollection not implemented.");
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
    return new _Typeface();
  }
  MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null {
    return new _Typeface();
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
    return { ascent: 0, descent: 0, leading: 0 };
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
    return new Float32Array([]);
  }
  getGlyphIntercepts(
    glyphs: InputGlyphIDArray,
    positions: number[] | Float32Array,
    top: number,
    bottom: number
  ): Float32Array {
    return new Float32Array([]);
  }
  getScaleX(): number {
    return 1;
  }
  getSize(): number {
    return 0;
  }
  getSkewX(): number {
    return 1;
  }
  isEmbolden(): boolean {
    return false;
  }
  getTypeface(): Typeface | null {
    return new _Typeface();
  }
  setEdging(edging: FontEdging): void {}
  setEmbeddedBitmaps(embeddedBitmaps: boolean): void {}
  setHinting(hinting: FontHinting): void {}
  setLinearMetrics(linearMetrics: boolean): void {}
  setScaleX(sx: number): void {}
  setSize(points: number): void {}
  setSkewX(sx: number): void {}
  setEmbolden(embolden: boolean): void {}
  setSubpixel(subpixel: boolean): void {}
  setTypeface(face: Typeface | null): void {}
}
