import { InputColor } from "./skia";

export class TextStyle {
  backgroundColor?: InputColor;
  color?: InputColor;
  decoration?: number;
  decorationColor?: InputColor;
  decorationThickness?: number;
  // decorationStyle?: DecorationStyle;
  fontFamilies?: string[];
  // fontFeatures?: TextFontFeatures[];
  fontSize?: number;
  // fontStyle?: FontStyle;
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
