// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { Drawer } from "../impl/drawer";
import { TextLayout } from "../impl/layout";
import { Span, TextSpan } from "../impl/span";
import { logger } from "../logger";
import {
  Affinity,
  SkEmbindObject,
  GlyphInfo,
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

export const drawParagraph = function (
  CanvasKit: any,
  skCanvas: any,
  paragraph: Paragraph,
  dx: number,
  dy: number
) {
  let drawStartTime!: number;
  if (logger.profileMode) {
    drawStartTime = new Date().getTime();
  }
  const drawer = new Drawer(paragraph);
  const imageData = paragraph.imageDataCache ?? drawer.draw();
  paragraph.imageDataCache = imageData;
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
  const skPaint = new CanvasKit.Paint();
  skCanvas.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
  if (logger.profileMode) {
    const drawCostTime = new Date().getTime() - drawStartTime;
    logger.profile("drawParagraph cost", drawCostTime);
  }
};

export class Paragraph extends SkEmbindObject {
  constructor(readonly spans: Span[], readonly paragraphStyle: ParagraphStyle) {
    super();
  }

  public _type = "SkParagraph";
  public isMiniTex = true;
  public imageDataCache?: ImageData;
  private _textLayout = new TextLayout(this);

  didExceedMaxLines(): boolean {
    return this._textLayout.didExceedMaxLines;
  }

  getAlphabeticBaseline(): number {
    return 0;
  }

  /**
   * Returns the index of the glyph that corresponds to the provided coordinate,
   * with the top left corner as the origin, and +y direction as down.
   */
  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    this._textLayout.measureGlyphIfNeeded();
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
    for (let index = 0; index < this._textLayout.lineMetrics.length; index++) {
      const lineMetrics = this._textLayout.lineMetrics[index];
      const isLastLine = index === this._textLayout.lineMetrics.length - 1;
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
    this._textLayout.measureGlyphIfNeeded();
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

  getLineMetrics(): LineMetrics[] {
    return this._textLayout.lineMetrics;
  }

  /**
   * Returns the LineMetrics of the line at the specified line number, or null
   * if the line number is out of bounds, or is larger than or equal to the
   * specified max line number.
   */
  getLineMetricsAt(lineNumber: number): LineMetrics | null {
    return this._textLayout.lineMetrics[lineNumber] ?? null;
  }

  getLineMetricsOfRange(start: number, end: number): LineMetrics[] {
    let lineMetrics: LineMetrics[] = [];
    this._textLayout.lineMetrics.forEach((it) => {
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
    return this._textLayout.lineMetrics.length;
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
    this._textLayout.measureGlyphIfNeeded();
    let result: RectWithDirection[] = [];
    this._textLayout.lineMetrics.forEach((it) => {
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
      const lastLine =
        this._textLayout.lineMetrics[this._textLayout.lineMetrics.length - 1];
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
    this.imageDataCache = undefined;
    this._textLayout.layout(width);
  }

  /**
   * When called after shaping, returns the glyph IDs which were not matched
   * by any of the provided fonts.
   */
  unresolvedCodepoints(): number[] {
    return [];
  }
}
