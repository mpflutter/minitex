// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

declare var wx: any;
import { type Paragraph } from "../adapter/paragraph";
import {
  GlyphInfo,
  LineMetrics,
  TextAlign,
  TextDirection,
} from "../adapter/skia";
import { FontSlant } from "../adapter/skia";
import { logger } from "../logger";
import {
  createCanvas,
  isEnglishWord,
  isPunctuation,
  isSquareCharacter,
  valueOfRectXYWH,
} from "../util";
import { NewlineSpan, TextSpan, spanWithNewline } from "./span";

interface LetterMeasureResult {
  useCount: number;
  width: number;
}

class LetterMeasurer {
  private static LRUConfig = {
    maxCacheCount: 1000,
    minCacheCount: 200,
  };

  private static measureLRUCache: Record<string, LetterMeasureResult> = {};

  static measureLetters(
    span: TextSpan,
    context: CanvasRenderingContext2D
  ): { advances: number[] } {
    let advances: number[] = [0];
    let curPosWidth = 0;
    for (let index = 0; index < span.charSequence.length; index++) {
      const letter = span.charSequence[index];
      let wordWidth = (() => {
        if (isSquareCharacter(letter)) {
          return this.measureSquareCharacter(context);
        } else {
          return this.measureNormalLetter(letter, context);
        }
      })();
      if (
        span.hasWordSpacing() &&
        letter === " " &&
        isEnglishWord(span.charSequence[index - 1])
      ) {
        wordWidth = span.style.wordSpacing!;
      } else if (span.hasLetterSpacing()) {
        wordWidth += span.style.letterSpacing!;
      }
      curPosWidth += wordWidth;
      advances.push(curPosWidth);
    }
    return { advances };
  }

  private static measureNormalLetter(
    letter: string,
    context: CanvasRenderingContext2D
  ): number {
    const width =
      this.widthFromCache(context, letter) ?? context.measureText(letter).width;
    this.setWidthToCache(context, letter, width);
    return width;
  }

  private static measureSquareCharacter(
    context: CanvasRenderingContext2D
  ): number {
    const width =
      this.widthFromCache(context, "测") ?? context.measureText("测").width;
    this.setWidthToCache(context, "测", width);
    return width;
  }

  private static widthFromCache(
    context: CanvasRenderingContext2D,
    word: string
  ): number | undefined {
    const cacheKey = context.font + "_" + word;
    return this.measureLRUCache[cacheKey]?.width;
  }

  private static setWidthToCache(
    context: CanvasRenderingContext2D,
    word: string,
    width: number
  ) {
    const cacheKey = context.font + "_" + word;
    if (this.measureLRUCache[cacheKey]) {
      this.measureLRUCache[cacheKey].useCount++;
      return;
    }
    this.measureLRUCache[cacheKey] = {
      useCount: 1,
      width: width,
    };
    if (
      Object.keys(this.measureLRUCache).length > this.LRUConfig.maxCacheCount
    ) {
      this.clearCache();
    }
  }

  private static clearCache() {
    const keys = Object.keys(this.measureLRUCache).sort((a, b) => {
      return this.measureLRUCache[a].useCount > this.measureLRUCache[b].useCount
        ? 1
        : -1;
    });
    keys
      .slice(0, this.LRUConfig.maxCacheCount - this.LRUConfig.minCacheCount)
      .forEach((it) => {
        delete this.measureLRUCache[it];
      });
  }
}

export class TextLayout {
  static sharedLayoutCanvas: HTMLCanvasElement;
  static sharedLayoutContext: CanvasRenderingContext2D;

  constructor(readonly paragraph: Paragraph) {}

  glyphInfos: GlyphInfo[] = [];
  lineMetrics: LineMetrics[] = [];
  didExceedMaxLines: boolean = false;

  private previousLayoutWidth: number = 0;

  private initCanvas() {
    if (!TextLayout.sharedLayoutCanvas) {
      TextLayout.sharedLayoutCanvas = createCanvas(1, 1);
      TextLayout.sharedLayoutContext =
        TextLayout.sharedLayoutCanvas!.getContext(
          "2d"
        ) as CanvasRenderingContext2D;
    }
  }

  measureGlyphIfNeeded() {
    if (Object.keys(this.glyphInfos).length <= 0) {
      this.layout(-1, true);
    }
  }

  layout(layoutWidth: number, forceCalcGlyphInfos: boolean = false): void {
    let layoutStartTime!: number;
    if (logger.profileMode) {
      layoutStartTime = new Date().getTime();
    }
    if (layoutWidth < 0) {
      layoutWidth = this.previousLayoutWidth;
    }
    this.previousLayoutWidth = layoutWidth;
    this.initCanvas();
    this.glyphInfos = [];
    let currentLineMetrics: LineMetrics = {
      startIndex: 0,
      endIndex: 0,
      endExcludingWhitespaces: 0,
      endIncludingNewline: 0,
      isHardBreak: false,
      ascent: 0,
      descent: 0,
      height: 0,
      heightMultiplier: Math.max(
        1,
        (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
      ),
      width: 0,
      justifyWidth:
        this.paragraph.paragraphStyle.textAlign?.value === TextAlign.Justify
          ? layoutWidth
          : undefined,
      left: 0,
      yOffset: 0,
      baseline: 0,
      lineNumber: 0,
      isLastLine: false,
    };
    let lineMetrics: LineMetrics[] = [];
    const spans = spanWithNewline(this.paragraph.spans);
    spans.forEach((span) => {
      if (span instanceof TextSpan) {
        TextLayout.sharedLayoutContext.font = span.toCanvasFont();
        const matrics = TextLayout.sharedLayoutContext.measureText(span.originText);

        let iconFontWidth = 0;
        if (this.paragraph.iconFontData) {
          const fontSize = span.style.fontSize ?? 14;
          iconFontWidth = fontSize;
          currentLineMetrics.ascent = fontSize;
          currentLineMetrics.descent = 0;
          span.letterBaseline = fontSize;
          span.letterHeight = fontSize;
        } else {
          const mHeight = TextLayout.sharedLayoutContext.measureText("M").width;
          currentLineMetrics.ascent = mHeight * 1.15;
          currentLineMetrics.descent = mHeight * 0.35;
          span.letterBaseline = mHeight * 1.15;
          span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
        } 

        if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
          currentLineMetrics.heightMultiplier = Math.max(
            currentLineMetrics.heightMultiplier,
            span.style.heightMultiplier / 1.5
          );
        }

        currentLineMetrics.height = Math.max(
          currentLineMetrics.height,
          currentLineMetrics.ascent + currentLineMetrics.descent
        );

        currentLineMetrics.baseline = Math.max(
          currentLineMetrics.baseline,
          currentLineMetrics.ascent
        );

        if (this.paragraph.iconFontData) {
          const textWidth = span.charSequence.length * iconFontWidth;
          currentLineMetrics.endIndex += span.charSequence.length;
          currentLineMetrics.width += textWidth;
        } else if (
          currentLineMetrics.width + matrics.width < layoutWidth &&
          !span.hasLetterSpacing() &&
          !span.hasWordSpacing() &&
          !forceCalcGlyphInfos
        ) {
          // fast measure
          if (span instanceof NewlineSpan) {
            const newLineMatrics: LineMetrics =
              this.createNewLine(currentLineMetrics);
            lineMetrics.push(currentLineMetrics);
            currentLineMetrics = newLineMatrics;
          } else {
            currentLineMetrics.endIndex += span.charSequence.length;
            currentLineMetrics.width += matrics.width;
            if (span.style.fontStyle?.slant?.value === FontSlant.Italic) {
              currentLineMetrics.width += 2;
            }
          }
        } else {
          let letterMeasureResult = LetterMeasurer.measureLetters(
            span,
            TextLayout.sharedLayoutContext
          );
          let advances: number[] = letterMeasureResult.advances;

          if (span instanceof NewlineSpan) {
            advances = [0, 0];
          }

          if (
            Math.abs(advances[advances.length - 1] - layoutWidth) < 10 &&
            layoutWidth === this.previousLayoutWidth
          ) {
            layoutWidth = advances[advances.length - 1];
          }

          let currentWord = "";
          let currentWordWidth = 0;
          let currentWordLength = 0;
          let nextWordWidth = 0;
          let canBreak = true;
          let forceBreak = false;

          for (let index = 0; index < span.charSequence.length; index++) {
            const letter = span.charSequence[index];
            currentWord += letter;
            let currentLetterLeft = currentWordWidth;
            let spanEnded = span.charSequence[index + 1] === undefined;
            let nextWord = currentWord + span.charSequence[index + 1] ?? "";
            if (advances[index + 1] === undefined) {
              currentWordWidth += advances[index] - advances[index - 1];
            } else {
              currentWordWidth += advances[index + 1] - advances[index];
            }
            if (advances[index + 2] === undefined) {
              nextWordWidth = currentWordWidth;
            } else {
              nextWordWidth =
                currentWordWidth + (advances[index + 2] - advances[index + 1]);
            }
            currentWordLength += 1;
            canBreak = true;
            forceBreak = false;

            if (spanEnded) {
              canBreak = true;
            } else if (isEnglishWord(nextWord)) {
              canBreak = false;
            }
            if (
              isPunctuation(nextWord[nextWord.length - 1]) &&
              currentLineMetrics.width + nextWordWidth >= layoutWidth
            ) {
              forceBreak = true;
            }
            if (span instanceof NewlineSpan) {
              forceBreak = true;
            }

            const currentGlyphLeft =
              currentLineMetrics.width + currentLetterLeft;
            const currentGlyphTop = currentLineMetrics.yOffset;
            const currentGlyphWidth = (() => {
              if (advances[index + 1] === undefined) {
                return advances[index] - advances[index - 1];
              } else {
                return advances[index + 1] - advances[index];
              }
            })();
            const currentGlyphHeight = currentLineMetrics.height;
            const currentGlyphInfo: GlyphInfo = {
              graphemeLayoutBounds: valueOfRectXYWH(
                currentGlyphLeft,
                currentGlyphTop,
                currentGlyphWidth,
                currentGlyphHeight
              ),
              graphemeClusterTextRange: { start: index, end: index + 1 },
              dir: { value: TextDirection.LTR },
              isEllipsis: false,
            };
            this.glyphInfos.push(currentGlyphInfo);

            if (!canBreak) {
              continue;
            } else if (
              !forceBreak &&
              currentLineMetrics.width + currentWordWidth <= layoutWidth
            ) {
              currentLineMetrics.width += currentWordWidth;
              currentLineMetrics.endIndex += currentWordLength;
              currentWord = "";
              currentWordWidth = 0;
              currentWordLength = 0;
              canBreak = true;
            } else if (
              forceBreak ||
              currentLineMetrics.width + currentWordWidth > layoutWidth
            ) {
              const newLineMatrics: LineMetrics =
                this.createNewLine(currentLineMetrics);
              lineMetrics.push(currentLineMetrics);
              currentLineMetrics = newLineMatrics;
              currentLineMetrics.width += currentWordWidth;
              currentLineMetrics.endIndex += currentWordLength;
              currentWord = "";
              currentWordWidth = 0;
              currentWordLength = 0;
              canBreak = true;
            }
          }

          if (currentWord.length > 0) {
            currentLineMetrics.width += currentWordWidth;
            currentLineMetrics.endIndex += currentWordLength;
          }
        }
      }
    });
    lineMetrics.push(currentLineMetrics);
    if (
      this.paragraph.paragraphStyle.maxLines &&
      lineMetrics.length > this.paragraph.paragraphStyle.maxLines
    ) {
      this.didExceedMaxLines = true;
      lineMetrics = lineMetrics.slice(
        0,
        this.paragraph.paragraphStyle.maxLines
      );
    } else {
      this.didExceedMaxLines = false;
    }
    logger.debug("TextLayout.layout.lineMetrics", lineMetrics);
    if (logger.profileMode) {
      const layoutCostTime = new Date().getTime() - layoutStartTime;
      logger.profile("Layout cost", layoutCostTime);
    }
    lineMetrics[lineMetrics.length - 1].isLastLine = true;
    this.lineMetrics = lineMetrics;
  }

  private createNewLine(currentLineMetrics: LineMetrics): LineMetrics {
    return {
      startIndex: currentLineMetrics.endIndex,
      endIndex: currentLineMetrics.endIndex,
      endExcludingWhitespaces: 0,
      endIncludingNewline: 0,
      isHardBreak: false,
      ascent: currentLineMetrics.ascent,
      descent: currentLineMetrics.descent,
      height: currentLineMetrics.height,
      heightMultiplier: Math.max(
        1,
        (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
      ),
      width: 0,
      justifyWidth: currentLineMetrics.justifyWidth,
      left: 0,
      yOffset:
        currentLineMetrics.yOffset +
        currentLineMetrics.height * currentLineMetrics.heightMultiplier +
        currentLineMetrics.height * 0.15, // 行间距
      baseline: currentLineMetrics.baseline,
      lineNumber: currentLineMetrics.lineNumber + 1,
      isLastLine: false,
    };
  }
}
