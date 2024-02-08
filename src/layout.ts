import { TextSpan, type Paragraph } from "./paragraph";
import { LineMetrics } from "./skia";

interface LetterMeasureResult {
  useCount: number;
  width: number;
}

export class TextLayout {
  constructor(
    readonly paragraph: Paragraph,
    readonly context: CanvasRenderingContext2D
  ) {}

  private static LRUConfig = {
    maxCacheCount: 1000,
    minCacheCount: 200,
  };

  private static measureLRUCache: Record<string, LetterMeasureResult> = {};

  private static measureLetters(
    span: TextSpan,
    context: CanvasRenderingContext2D
  ): number[] {
    let result: number[] = [0];
    let curPosWidth = 0;
    for (let index = 0; index < span.text.length; index++) {
      const letter = span.text[index];
      const wordWidth = (() => {
        if (isSquareCharacter(letter)) {
          console.log("isSquareCharacter", letter);
          return this.measureSquareCharacter(context);
        } else {
          return this.measureNormalLetter(letter, context);
        }
      })();
      curPosWidth += wordWidth;
      result.push(curPosWidth);
    }
    return result;
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

  layout(layoutWidth: number): LineMetrics[] {
    let currentLineMetrics: LineMetrics = {
      startIndex: 0,
      endIndex: 0,
      endExcludingWhitespaces: 0,
      endIncludingNewline: 0,
      isHardBreak: false,
      ascent: 0,
      descent: 0,
      height: 0,
      width: 0,
      left: 0,
      yOffset: 0,
      baseline: 0,
      lineNumber: 0,
    };
    let lineMetrics: LineMetrics[] = [];
    this.paragraph.spans.forEach((span) => {
      if (span instanceof TextSpan) {
        this.context.font = span.toCanvasFont();
        const matrics = this.context.measureText(span.text);
        if (!matrics.fontBoundingBoxAscent) {
          const mHeight = this.context.measureText("M").width;
          currentLineMetrics.ascent = mHeight * 1.15;
          currentLineMetrics.descent = mHeight * 0.35;
        } else {
          currentLineMetrics.ascent = matrics.fontBoundingBoxAscent;
          currentLineMetrics.descent = matrics.fontBoundingBoxDescent;
        }
        currentLineMetrics.height = Math.max(
          currentLineMetrics.height,
          currentLineMetrics.ascent + currentLineMetrics.descent
        );
        currentLineMetrics.baseline = currentLineMetrics.ascent;

        if (currentLineMetrics.width + matrics.width < layoutWidth) {
          currentLineMetrics.endIndex += span.text.length;
          currentLineMetrics.width += matrics.width;
        } else {
          let advances = (matrics as any).advances
            ? (matrics as any).advances
            : TextLayout.measureLetters(span, this.context);
          let currentWord = "";
          let currentWordWidth = 0;
          let currentWordLength = 0;
          let canBreak = true;

          for (let index = 0; index < span.text.length; index++) {
            const letter = span.text[index];
            currentWord += letter;
            let nextWord = currentWord + span.text[index + 1] ?? "";
            if (advances[index + 1] === undefined) {
              currentWordWidth += advances[index] - advances[index - 1];
            } else {
              currentWordWidth += advances[index + 1] - advances[index];
            }
            currentWordLength += 1;
            canBreak = true;

            if (isEnglishWord(nextWord)) {
              canBreak = false;
            }

            if (!canBreak) {
              continue;
            } else if (
              currentLineMetrics.width + currentWordWidth <
              layoutWidth
            ) {
              currentLineMetrics.width += currentWordWidth;
              currentLineMetrics.endIndex += currentWordLength;
              currentWord = "";
              currentWordWidth = 0;
              currentWordLength = 0;
              canBreak = true;
            } else if (
              currentLineMetrics.width + currentWordWidth >=
              layoutWidth
            ) {
              const newLineMatrics: LineMetrics = {
                startIndex: currentLineMetrics.endIndex,
                endIndex: currentLineMetrics.endIndex,
                endExcludingWhitespaces: 0,
                endIncludingNewline: 0,
                isHardBreak: false,
                ascent: currentLineMetrics.ascent,
                descent: currentLineMetrics.descent,
                height: currentLineMetrics.height,
                width: 0,
                left: 0,
                yOffset: currentLineMetrics.yOffset + currentLineMetrics.height,
                baseline: currentLineMetrics.baseline,
                lineNumber: currentLineMetrics.lineNumber + 1,
              };
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
        }
      }
    });
    if (currentLineMetrics.endIndex > currentLineMetrics.startIndex) {
      lineMetrics.push(currentLineMetrics);
    }
    return lineMetrics;
  }
}

function isEnglishWord(str: string) {
  const englishRegex = /^[A-Za-z]+$/;
  const result = englishRegex.test(str);
  return result;
}

function isSquareCharacter(str: string) {
  const squareCharacterRange = /[\u4e00-\u9fa5]/;
  return squareCharacterRange.test(str);
}
