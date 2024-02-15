import { Drawer } from "./drawer";
import { TextLayout } from "./layout";
import {
  Affinity,
  EmbindObject,
  GlyphInfo,
  LetterRect,
  LineMetrics,
  ParagraphStyle,
  PositionWithAffinity,
  RectHeightStyle,
  RectWidthStyle,
  RectWithDirection,
  ShapedLine,
  SkEnum,
  TextDirection,
  URange,
} from "./skia";
import { FontSlant, TextStyle } from "./text_style";

export const drawParagraph = function (
  CanvasKit: any,
  skCanvas: any,
  paragraph: Paragraph,
  dx: number,
  dy: number
) {
  const drawer = new Drawer(paragraph);
  const imageData = drawer.draw();
  // const canvasImg = CanvasKit.MakeLazyImageFromTextureSource(imageData);
  const canvasImg = CanvasKit.MakeImage(
    {
      width: imageData.width,
      height: imageData.height,
      alphaType: CanvasKit.AlphaType.Unpremul,
      colorType: CanvasKit.ColorType.RGBA_8888,
      colorSpace: CanvasKit.ColorSpace.SRGB,
    },
    imageData.data,
    4 * imageData.width
  );
  const srcRect = CanvasKit.XYWHRect(0, 0, imageData.width, imageData.height);
  const dstRect = CanvasKit.XYWHRect(
    Math.ceil(dx),
    Math.ceil(dy),
    imageData.width / Drawer.pixelRatio,
    imageData.height / Drawer.pixelRatio
  );
  // console.log("srcRect", srcRect[0], srcRect[1], srcRect[2], srcRect[3]);
  // console.log("dstRect", dstRect[0], dstRect[1], dstRect[2], dstRect[3]);
  const skPaint = new CanvasKit.Paint();
  skCanvas.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
};

export class Span {
  letterBaseline: number = 0;
  letterHeight: number = 0;
  lettersBounding: LetterRect[] = [];
}

export class TextSpan extends Span {
  constructor(readonly text: string, readonly style: TextStyle) {
    super();
  }

  toBackgroundFillStyle(): string {
    if (this.style.backgroundColor) {
      return this.colorToHex(this.style.backgroundColor as Float32Array);
    } else {
      return "#000000";
    }
  }

  toTextFillStyle(): string {
    if (this.style.color) {
      return this.colorToHex(this.style.color as Float32Array);
    } else {
      return "#000000";
    }
  }

  toDecorationStrokeStyle(): string {
    if (this.style.decorationColor) {
      return this.colorToHex(this.style.decorationColor as Float32Array);
    } else {
      return "#000000";
    }
  }

  toCanvasFont(): string {
    let font = `${this.style.fontSize}px system-ui, Roboto`;
    const fontWeight = this.style.fontStyle?.weight?.value;
    if (fontWeight && fontWeight !== 400) {
      if (fontWeight >= 900) {
        font = "900 " + font;
      } else {
        font = fontWeight.toFixed(0) + " " + font;
      }
    }
    const slant = this.style.fontStyle?.slant?.value;
    if (slant) {
      switch (slant) {
        case FontSlant.Italic:
          font = "italic " + font;
          break;
        case FontSlant.Oblique:
          font = "oblique " + font;
          break;
      }
    }
    return font;
  }

  colorToHex(rgbaColor: Float32Array): string {
    const r = Math.round(rgbaColor[0] * 255).toString(16);
    const g = Math.round(rgbaColor[1] * 255).toString(16);
    const b = Math.round(rgbaColor[2] * 255).toString(16);
    const a = Math.round(rgbaColor[3] * 255).toString(16);
    const padHex = (hex: string) => (hex.length === 1 ? "0" + hex : hex);
    const hexColor = "#" + padHex(r) + padHex(g) + padHex(b) + padHex(a);
    return hexColor;
  }
}

export class NewlineSpan extends TextSpan {
  constructor() {
    super("\n", {});
  }
}

export class Paragraph extends EmbindObject {
  constructor(readonly spans: Span[], readonly paragraphStyle: ParagraphStyle) {
    super();
  }

  isMiniTex = true;

  _textLayout = new TextLayout(this);

  _didExceedMaxLines = false;

  didExceedMaxLines(): boolean {
    return this._didExceedMaxLines;
  }

  getAlphabeticBaseline(): number {
    return 0;
  }

  /**
   * Returns the index of the glyph that corresponds to the provided coordinate,
   * with the top left corner as the origin, and +y direction as down.
   */
  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    if (Object.keys(this._textLayout.glyphInfos).length <= 0) {
      this._textLayout.layout(-1, true);
    }
    for (let index = 0; index < this._textLayout.glyphInfos.length; index++) {
      const glyphInfo = this._textLayout.glyphInfos[index];
      const left = glyphInfo.graphemeLayoutBounds[0];
      const top = glyphInfo.graphemeLayoutBounds[1];
      const width = glyphInfo.graphemeLayoutBounds[2] - left;
      const height = glyphInfo.graphemeLayoutBounds[3] - top;
      if (dx >= left && dx <= left + width && dy >= top && dy <= top + height) {
        return { pos: index, affinity: { value: Affinity.Downstream } };
      }
    }
    for (let index = 0; index < this._lineMetrics.length; index++) {
      const lineMetrics = this._lineMetrics[index];
      const isLastLine = index === this._lineMetrics.length - 1;
      const left = 0;
      const top = lineMetrics.yOffset;
      const width = lineMetrics.width;
      const height = lineMetrics.height;
      if (dy >= top && dy <= top + height) {
        if (dx <= 0) {
          return {
            pos: lineMetrics.startIndex,
            affinity: { value: Affinity.Upstream },
          };
        } else if (dx >= width) {
          return {
            pos: lineMetrics.endIndex,
            affinity: { value: Affinity.Upstream },
          };
        }
      }
      if (dy >= top + height && isLastLine) {
        return {
          pos: lineMetrics.endIndex,
          affinity: { value: Affinity.Upstream },
        };
      }
    }
    return { pos: 0, affinity: { value: Affinity.Upstream } };
  }

  /**
   * Returns the information associated with the closest glyph at the specified
   * paragraph coordinate, or null if the paragraph is empty.
   */
  getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null {
    return this.getGlyphInfoAt(this.getGlyphPositionAtCoordinate(dx, dy).pos);
  }

  /**
   * Returns the information associated with the glyph at the specified UTF-16
   * offset within the paragraph's visible lines, or null if the index is out
   * of bounds, or points to a codepoint that is logically after the last
   * visible codepoint.
   */
  getGlyphInfoAt(index: number): GlyphInfo | null {
    if (Object.keys(this._textLayout.glyphInfos).length <= 0) {
      this._textLayout.layout(-1, true);
    }
    return this._textLayout.glyphInfos[index] ?? null;
  }

  getHeight(): number {
    const lineMetrics = this.getLineMetrics();
    let height = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      height += lineMetrics[i].height * lineMetrics[i].heightMultiplier;
      if (i > 0 && i < lineMetrics.length) {
        height += lineMetrics[i].height * 0.15;
      }
    }
    // console.log("getHeight", height);
    return height;
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
    return this.getLineMetricsOfRange(index, index)[0]?.lineNumber ?? 0;
  }

  _lineMetrics: LineMetrics[] = [];

  getLineMetrics(): LineMetrics[] {
    return this._lineMetrics;
  }

  /**
   * Returns the LineMetrics of the line at the specified line number, or null
   * if the line number is out of bounds, or is larger than or equal to the
   * specified max line number.
   */
  getLineMetricsAt(lineNumber: number): LineMetrics | null {
    return this._lineMetrics[lineNumber] ?? null;
  }

  getLineMetricsOfRange(start: number, end: number): LineMetrics[] {
    let lineMetrics: LineMetrics[] = [];
    this._lineMetrics.forEach((it) => {
      const range0 = [start, end];
      const range1 = [it.startIndex, it.endIndex];
      const hasIntersection = range0[1] >= range1[0] && range1[1] >= range0[0];
      if (hasIntersection) {
        lineMetrics.push(it);
      }
    });
    return lineMetrics;
  }

  getLongestLine(): number {
    return 0;
  }

  getMaxIntrinsicWidth(): number {
    const lineMetrics = this.getLineMetrics();
    let maxWidth = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      maxWidth = Math.max(maxWidth, lineMetrics[i].width);
    }
    // console.log("getMaxIntrinsicWidth", maxWidth);
    return maxWidth;
  }

  getMaxWidth(): number {
    const lineMetrics = this.getLineMetrics();
    let maxWidth = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      maxWidth = Math.max(maxWidth, lineMetrics[i].width);
    }
    // console.log("getMaxWidth", maxWidth);
    return maxWidth;
  }

  getMinIntrinsicWidth(): number {
    const lineMetrics = this.getLineMetrics();
    let width = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      width = Math.max(width, lineMetrics[i].width);
    }
    // console.log("getMinIntrinsicWidth", width);
    return width;
  }

  /**
   * Returns the total number of visible lines in the paragraph.
   */
  getNumberOfLines(): number {
    return this._lineMetrics.length;
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
    hStyle: SkEnum<RectHeightStyle>,
    wStyle: SkEnum<RectWidthStyle>
  ): RectWithDirection[] {
    if (Object.keys(this._textLayout.glyphInfos).length <= 0) {
      this._textLayout.layout(-1, true);
    }
    let result: RectWithDirection[] = [];
    this._lineMetrics.forEach((it) => {
      const range0 = [start, end];
      const range1 = [it.startIndex, it.endIndex];
      const hasIntersection = range0[1] > range1[0] && range1[1] > range0[0];
      if (hasIntersection) {
        const intersecRange = [
          Math.max(range0[0], range1[0]),
          Math.min(range0[1], range1[1]),
        ];
        let currentLineLeft = -1;
        let currentLineTop = -1;
        let currentLineWidth = 0;
        let currentLineHeight = 0;
        for (let index = intersecRange[0]; index < intersecRange[1]; index++) {
          const glyphInfo = this._textLayout.glyphInfos[index];
          if (glyphInfo) {
            if (currentLineLeft < 0) {
              currentLineLeft = glyphInfo.graphemeLayoutBounds[0];
            }
            if (currentLineTop < 0) {
              currentLineTop = glyphInfo.graphemeLayoutBounds[1];
            }
            currentLineTop = Math.min(
              currentLineTop,
              glyphInfo.graphemeLayoutBounds[1]
            );
            currentLineWidth =
              glyphInfo.graphemeLayoutBounds[2] - currentLineLeft;
            currentLineHeight = Math.max(
              currentLineHeight,
              glyphInfo.graphemeLayoutBounds[3] - currentLineTop
            );
          }
        }
        result.push({
          rect: new Float32Array([
            currentLineLeft,
            currentLineTop,
            currentLineLeft + currentLineWidth,
            currentLineTop + currentLineHeight,
          ]),
          dir: { value: TextDirection.LTR },
        });
      }
    });
    if (result.length === 0) {
      const lastSpan = this.spans[this.spans.length - 1];
      const lastLine = this._lineMetrics[this._lineMetrics.length - 1];
      if (
        end > lastLine.endIndex &&
        lastSpan instanceof TextSpan &&
        lastSpan.text.endsWith("\n")
      ) {
        return [
          {
            rect: new Float32Array([
              0,
              lastLine.yOffset,
              0,
              lastLine.yOffset + lastLine.height,
            ]),
            dir: { value: TextDirection.LTR },
          },
        ];
      }
    }
    return result;
  }

  /**
   * Finds the first and last glyphs that define a word containing the glyph at index offset.
   * @param offset
   */
  getWordBoundary(offset: number): URange {
    return { start: offset, end: offset };
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
    this._textLayout.layout(width);
  }

  /**
   * When called after shaping, returns the glyph IDs which were not matched
   * by any of the provided fonts.
   */
  unresolvedCodepoints(): number[] {
    return [];
  }

  spansWithNewline(): Span[] {
    let result: Span[] = [];
    this.spans.forEach((span) => {
      if (span instanceof TextSpan) {
        if (span.text.indexOf("\n") >= 0) {
          const components = span.text.split("\n");
          for (let index = 0; index < components.length; index++) {
            const component = components[index];
            if (index > 0) {
              result.push(new NewlineSpan());
            }
            result.push(new TextSpan(component, span.style));
          }
          return;
        }
      }
      result.push(span);
    });
    return result;
  }
}
