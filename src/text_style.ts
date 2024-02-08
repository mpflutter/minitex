import { InputColor, SkEnum } from "./skia";

export interface TextStyle {
  backgroundColor?: InputColor;
  color?: InputColor;
  decoration?: number;
  decorationColor?: InputColor;
  decorationThickness?: number;
  // decorationStyle?: DecorationStyle;
  fontFamilies?: string[];
  // fontFeatures?: TextFontFeatures[];
  fontSize?: number;
  fontStyle?: FontStyle;
  // fontVariations?: TextFontVariations[];
  foregroundColor?: InputColor;
  heightMultiplier?: number;
  halfLeading?: boolean;
  letterSpacing?: number;
  locale?: string;
  // shadows?: TextShadow[];
  // textBaseline?: TextBaseline;
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
  Upright = 0,
  Italic = 1,
  Oblique = 2,
}
