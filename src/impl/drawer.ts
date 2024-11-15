// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

declare var wx: any;
import { Paragraph } from "../adapter/paragraph";
import {
  LineMetrics,
  ParagraphStyle,
  TextAlign,
  TextDirection,
} from "../adapter/skia";
import {
  DecorationStyle,
  LineThroughDecoration,
  OverlineDecoration,
  UnderlineDecoration,
} from "../adapter/skia";
import { NewlineSpan, TextSpan, spanWithNewline } from "./span";
import {
  colorToHex,
  convertToUpwardToPixelRatio,
  createCanvas,
  isEnglishWord,
  isSquareCharacter,
} from "../util";
import { logger } from "../logger";

export class Drawer {
  static pixelRatio = 1.0;
  static sharedRenderCanvas: HTMLCanvasElement;
  static sharedRenderContext: CanvasRenderingContext2D;

  constructor(readonly paragraph: Paragraph) {}

  private initCanvas() {
    if (!Drawer.sharedRenderCanvas) {
      Drawer.sharedRenderCanvas = createCanvas(
        Math.min(4000, 1000 * Drawer.pixelRatio),
        Math.min(4000, 1000 * Drawer.pixelRatio)
      );
      Drawer.sharedRenderContext = Drawer.sharedRenderCanvas!.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
    }
  }

  draw(): ImageData {
    this.initCanvas();
    const width = convertToUpwardToPixelRatio(
      this.paragraph.getMaxWidth() * Drawer.pixelRatio,
      Drawer.pixelRatio
    );
    const height = convertToUpwardToPixelRatio(
      this.paragraph.getHeight() * Drawer.pixelRatio,
      Drawer.pixelRatio
    );
    if (width <= 0 || height <= 0) {
      const context = Drawer.sharedRenderContext;
      context.clearRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1);
    }
    const context = Drawer.sharedRenderContext;
    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(Drawer.pixelRatio, Drawer.pixelRatio);

    let didExceedMaxLines = false;
    let spanLetterStartIndex = 0;
    let linesDrawingRightBounds: Record<number, number> = {};

    const spans = spanWithNewline(this.paragraph.spans);
    let linesUndrawed: Record<number, number> = {};
    this.paragraph.getLineMetrics().forEach((it) => {
      linesUndrawed[it.lineNumber] = it.endIndex - it.startIndex;
    });
    spans.forEach((span) => {
      if (didExceedMaxLines) return;
      if (span instanceof TextSpan) {
        if (span instanceof NewlineSpan) {
          spanLetterStartIndex++;
          return;
        }
        let spanUndrawLength = span.charSequence.length;
        let spanLetterEndIndex =
          spanLetterStartIndex + span.charSequence.length;
        const lineMetrics = this.paragraph.getLineMetricsOfRange(
          spanLetterStartIndex,
          spanLetterEndIndex
        );

        context.font = span.toCanvasFont();

        while (spanUndrawLength > 0) {
          let currentDrawText: string[] = [];
          let currentDrawLine: LineMetrics | undefined;
          for (let index = 0; index < lineMetrics.length; index++) {
            const line = lineMetrics[index];
            if (linesUndrawed[line.lineNumber] > 0) {
              const currentDrawLength = Math.min(
                linesUndrawed[line.lineNumber],
                spanUndrawLength
              );
              currentDrawText = span.charSequence.slice(
                span.charSequence.length - spanUndrawLength,
                span.charSequence.length - spanUndrawLength + currentDrawLength
              );
              spanUndrawLength -= currentDrawLength;
              linesUndrawed[line.lineNumber] -= currentDrawLength;
              currentDrawLine = line;
              break;
            }
          }

          if (!currentDrawLine) break;

          if (
            this.paragraph.didExceedMaxLines() &&
            this.paragraph.paragraphStyle.maxLines ===
              currentDrawLine.lineNumber + 1 &&
            linesUndrawed[currentDrawLine.lineNumber] <= 0
          ) {
            const trimLength = isSquareCharacter(
              currentDrawText[currentDrawText.length - 1]
            )
              ? 1
              : 3;
            currentDrawText = currentDrawText.slice(
              0,
              currentDrawText.length - trimLength
            );
            currentDrawText.push(
              ...Array.from(this.paragraph.paragraphStyle.ellipsis ?? "...")
            );
            didExceedMaxLines = true;
          }

          let drawingLeft = (() => {
            if (
              linesDrawingRightBounds[currentDrawLine.lineNumber] === undefined
            ) {
              const textAlign = this.paragraph.paragraphStyle.textAlign?.value;
              const textDirection =
                this.paragraph.paragraphStyle.textDirection?.value;
              if (textAlign === TextAlign.Center) {
                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                  (this.paragraph.getMaxWidth() - currentDrawLine.width) / 2.0;
              } else if (
                textAlign === TextAlign.Right ||
                (textAlign === TextAlign.End &&
                  textDirection !== TextDirection.RTL) ||
                (textAlign === TextAlign.Start &&
                  textDirection === TextDirection.RTL)
              ) {
                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                  this.paragraph.getMaxWidth() - currentDrawLine.width;
              } else {
                linesDrawingRightBounds[currentDrawLine.lineNumber] = 0;
              }
            }
            return linesDrawingRightBounds[currentDrawLine.lineNumber];
          })();

          const drawingRight =
            drawingLeft +
            (() => {
              if (currentDrawText.length === 1 && currentDrawText[0] === "\n") {
                return 0;
              }
              const extraLetterSpacing = span.hasLetterSpacing()
                ? currentDrawText.length * span.style.letterSpacing!
                : 0;
              return (
                context.measureText(currentDrawText.join("")).width +
                extraLetterSpacing
              );
            })();

          linesDrawingRightBounds[currentDrawLine.lineNumber] = drawingRight;

          const textTop =
            currentDrawLine.baseline * currentDrawLine.heightMultiplier -
            span.letterBaseline;
          const textBaseline =
            currentDrawLine.baseline * currentDrawLine.heightMultiplier;
          const textHeight = span.letterHeight;

          this.drawBackground(span, context, {
            currentDrawLine,
            drawingLeft,
            drawingRight,
            textBaseline,
            textTop,
            textHeight,
          });

          context.save();
          if (span.style.shadows && span.style.shadows.length > 0) {
            context.shadowColor = span.style.shadows[0].color
              ? colorToHex(span.style.shadows[0].color as Float32Array)
              : "transparent";
            context.shadowOffsetX = span.style.shadows[0].offset?.[0] ?? 0;
            context.shadowOffsetY = span.style.shadows[0].offset?.[1] ?? 0;
            context.shadowBlur = span.style.shadows[0].blurRadius ?? 0;
          }
          context.fillStyle = span.toTextFillStyle();
          if (this.paragraph.iconFontData) {
            for (let index = 0; index < currentDrawText.length; index++) {
              const currentDrawLetter = currentDrawText[index];
              const letterWidth = span.style.fontSize ?? 14;
              this.fillIcon(
                context,
                currentDrawLetter,
                letterWidth,
                drawingLeft,
                textBaseline + currentDrawLine.yOffset
              );
              drawingLeft += letterWidth;
            }
          } else if (
            span.hasLetterSpacing() ||
            span.hasWordSpacing() ||
            span.hasJustifySpacing(this.paragraph.paragraphStyle)
          ) {
            const letterSpacing = span.hasLetterSpacing()
              ? span.style.letterSpacing!
              : 0;
            const justifySpacing =
              span.hasJustifySpacing(this.paragraph.paragraphStyle) &&
              !currentDrawLine.isLastLine
                ? this.computeJustifySpacing(
                    currentDrawText,
                    currentDrawLine.width,
                    currentDrawLine.justifyWidth!
                  )
                : 0;
            for (let index = 0; index < currentDrawText.length; index++) {
              const currentDrawLetter = currentDrawText[index];
              context.fillText(
                currentDrawLetter,
                drawingLeft,
                textBaseline + currentDrawLine.yOffset
              );
              const letterWidth = context.measureText(currentDrawLetter).width;
              if (
                span.hasWordSpacing() &&
                currentDrawLetter === " " &&
                isEnglishWord(currentDrawText[index - 1])
              ) {
                drawingLeft += span.style.wordSpacing!;
              } else {
                drawingLeft += letterWidth + letterSpacing;
              }
              if (!isEnglishWord(currentDrawText[index])) {
                drawingLeft += justifySpacing;
              }
            }
          } else {
            context.fillText(
              currentDrawText.join(""),
              drawingLeft,
              textBaseline + currentDrawLine.yOffset
            );
          }
          context.restore();

          logger.debug(
            "Drawer.draw.fillText",
            currentDrawText,
            drawingLeft,
            textBaseline + currentDrawLine.yOffset
          );

          this.drawDecoration(span, context, {
            currentDrawLine,
            drawingLeft,
            drawingRight,
            textBaseline,
            textTop,
            textHeight,
          });

          if (didExceedMaxLines) {
            break;
          }
        }

        spanLetterStartIndex = spanLetterEndIndex;
      }
    });

    context.restore();
    return context.getImageData(0, 0, width, height);
  }

  private fillIcon(
    context: CanvasRenderingContext2D,
    text: string,
    fontSize: number,
    x: number,
    y: number
  ) {
    const svgPath = this.paragraph.iconFontMap?.[text];
    if (!svgPath) {
      console.log("fill icon not found", text.charCodeAt(0).toString(16));
      return;
    }
    const pathCommands = svgPath.match(/[A-Za-z]\d+([\.\d,]+)?/g);
    if (!pathCommands) return;
    context.save();
    context.beginPath();
    let lastControlPoint = null;
    pathCommands.forEach((command) => {
      const type = command.charAt(0);
      const args = command
        .substring(1)
        .split(",")
        .map(parseFloat)
        .map((it, index) => {
          let value = it;
          if (index % 2 === 1) {
            value = 150 - value + 150;
          }
          return value * (fontSize / 300);
        });
      if (type === "M") {
        context.moveTo(args[0], args[1]);
      } else if (type === "L") {
        context.lineTo(args[0], args[1]);
      } else if (type === "C") {
        context.bezierCurveTo(
          args[0],
          args[1],
          args[2],
          args[3],
          args[4],
          args[5]
        );
        lastControlPoint = [args[2], args[3]];
      } else if (type === "Q") {
        context.quadraticCurveTo(args[0], args[1], args[2], args[3]);
        lastControlPoint = [args[0], args[1]];
      } else if (type === "A") {
        // no need A
      } else if (type === "Z") {
        context.closePath();
      }
    });
    context.fill();
    context.restore();
  }

  private computeJustifySpacing(
    text: string[],
    lineWidth: number,
    justifyWidth: number
  ): number {
    let count = 0;
    for (let index = 0; index < text.length; index++) {
      if (!isEnglishWord(text[index])) {
        count++;
      }
    }
    return (justifyWidth - lineWidth) / (count - 1);
  }

  private drawBackground(
    span: TextSpan,
    context: CanvasRenderingContext2D,
    options: {
      currentDrawLine: LineMetrics;
      drawingLeft: number;
      drawingRight: number;
      textBaseline: number;
      textTop: number;
      textHeight: number;
    }
  ) {
    if (span.style.backgroundColor) {
      const {
        currentDrawLine,
        drawingLeft,
        drawingRight,
        textTop,
        textHeight,
      } = options;
      context.fillStyle = span.toBackgroundFillStyle();
      context.fillRect(
        drawingLeft,
        textTop + currentDrawLine.yOffset,
        drawingRight - drawingLeft,
        textHeight
      );
    }
  }

  private drawDecoration(
    span: TextSpan,
    context: CanvasRenderingContext2D,
    options: {
      currentDrawLine: LineMetrics;
      drawingLeft: number;
      drawingRight: number;
      textBaseline: number;
      textTop: number;
      textHeight: number;
    }
  ) {
    const {
      currentDrawLine,
      drawingLeft,
      drawingRight,
      textBaseline,
      textTop,
      textHeight,
    } = options;
    if (span.style.decoration) {
      context.save();
      context.strokeStyle = span.toDecorationStrokeStyle();
      context.lineWidth =
        (span.style.decorationThickness ?? 1) *
        Math.max(1, (span.style.fontSize ?? 12) / 14);
      const decorationStyle = span.style.decorationStyle?.value;

      switch (decorationStyle) {
        case DecorationStyle.Dashed:
          context.lineCap = "butt";
          context.setLineDash([4, 2]);
          break;
        case DecorationStyle.Dotted:
          context.lineCap = "butt";
          context.setLineDash([2, 2]);
          break;
      }

      if (span.style.decoration === UnderlineDecoration) {
        context.beginPath();
        context.moveTo(drawingLeft, currentDrawLine.yOffset + textBaseline + 1);
        context.lineTo(
          drawingRight,
          currentDrawLine.yOffset + textBaseline + 1
        );
        context.stroke();
        if (decorationStyle === DecorationStyle.Double) {
          context.beginPath();
          context.moveTo(
            drawingLeft,
            currentDrawLine.yOffset + textBaseline + 3
          );
          context.lineTo(
            drawingRight,
            currentDrawLine.yOffset + textBaseline + 3
          );
          context.stroke();
        }
      }
      if (span.style.decoration === LineThroughDecoration || span.style.decoration === 3) {
        context.beginPath();
        context.moveTo(
          drawingLeft,
          currentDrawLine.yOffset + textTop + textHeight / 2.0
        );
        context.lineTo(
          drawingRight,
          currentDrawLine.yOffset + textTop + textHeight / 2.0
        );
        if (decorationStyle === DecorationStyle.Double) {
          context.moveTo(
            drawingLeft,
            currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2
          );
          context.lineTo(
            drawingRight,
            currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2
          );
        }
        context.stroke();
      }
      if (span.style.decoration === OverlineDecoration) {
        context.beginPath();
        context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop);
        context.lineTo(drawingRight, currentDrawLine.yOffset + textTop);

        if (decorationStyle === DecorationStyle.Double) {
          context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + 2);
          context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + 2);
        }
        context.stroke();
      }
      context.restore();
    }
  }
}
