declare var wx: any;
import { TextLayout, isSquareCharacter } from "./layout";
import { Paragraph, TextSpan } from "./paragraph";
import { LineMetrics, TextAlign, TextDirection } from "./skia";
import {
  DecorationStyle,
  LineThroughDecoration,
  OverlineDecoration,
  UnderlineDecoration,
} from "./text_style";

export class Drawer {
  static pixelRatio = 1.0;
  static sharedRenderCanvas: HTMLCanvasElement;
  static sharedRenderContext: CanvasRenderingContext2D;

  constructor(readonly paragraph: Paragraph) {}

  private initCanvas() {
    if (!Drawer.sharedRenderCanvas) {
      Drawer.sharedRenderCanvas = wx.createOffscreenCanvas({
        type: "2d",
        width: 1000 * Drawer.pixelRatio,
        height: 1000 * Drawer.pixelRatio,
      });
      Drawer.sharedRenderContext = Drawer.sharedRenderCanvas!.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
    }
  }

  draw(): ImageData {
    // console.log("paragraph", this.paragraph);
    this.initCanvas();
    const width = this.paragraph.getMaxWidth() * Drawer.pixelRatio;
    const height = this.paragraph.getHeight() * Drawer.pixelRatio;
    if (width <= 0 || height <= 0) {
      throw "invalid text draw.";
    }
    const context = Drawer.sharedRenderContext;
    context.clearRect(0, 0, width, height);
    context.save();
    context.scale(Drawer.pixelRatio, Drawer.pixelRatio);
    let spanLetterStartIndex = 0;
    let linesDrawingRightBounds: Record<number, number> = {};
    const spans = this.paragraph.spansWithNewline();
    spans.forEach((span) => {
      if (span instanceof TextSpan) {
        let spanLetterEndIndex = spanLetterStartIndex + span.text.length;
        const lineMetrics = this.paragraph.getLineMetricsOfRange(
          spanLetterStartIndex,
          spanLetterEndIndex
        );
        context.font = span.toCanvasFont();
        let currentDrawStartPosition = 0;
        let currentDrawEndPosition = 0;
        while (
          spanLetterStartIndex + currentDrawStartPosition <
          spanLetterEndIndex
        ) {
          let currentLineMetrics: LineMetrics | undefined;
          for (let index = 0; index < lineMetrics.length; index++) {
            const line = lineMetrics[index];
            if (
              spanLetterStartIndex + currentDrawStartPosition >=
                line.startIndex &&
              spanLetterStartIndex + currentDrawStartPosition < line.endIndex
            ) {
              currentLineMetrics = line;
              currentDrawEndPosition += Math.min(
                span.text.length,
                line.endIndex - spanLetterStartIndex
              );
              break;
            }
          }
          if (
            currentLineMetrics &&
            currentDrawEndPosition > currentDrawStartPosition
          ) {
            let drawingText = span.text.substring(
              currentDrawStartPosition,
              currentDrawEndPosition
            );

            if (
              this.paragraph.didExceedMaxLines() &&
              this.paragraph.paragraphStyle.maxLines ===
                currentLineMetrics.lineNumber + 1 &&
              spanLetterStartIndex + currentDrawEndPosition ===
                currentLineMetrics.endIndex
            ) {
              const trimLength = isSquareCharacter(
                drawingText[drawingText.length - 1]
              )
                ? 1
                : 3;
              drawingText =
                drawingText.substring(0, drawingText.length - trimLength) +
                  this.paragraph.paragraphStyle.ellipsis ?? "...";
            }

            const drawingLeft = (() => {
              if (
                linesDrawingRightBounds[currentLineMetrics.lineNumber] ===
                undefined
              ) {
                const textAlign =
                  this.paragraph.paragraphStyle.textAlign?.value;
                const textDirection =
                  this.paragraph.paragraphStyle.textDirection?.value;
                if (textAlign === TextAlign.Center) {
                  linesDrawingRightBounds[currentLineMetrics.lineNumber] =
                    (this.paragraph.getMaxWidth() - currentLineMetrics.width) /
                    2.0;
                } else if (
                  textAlign === TextAlign.Right ||
                  (textAlign === TextAlign.End &&
                    textDirection !== TextDirection.RTL) ||
                  (textAlign === TextAlign.Start &&
                    textDirection === TextDirection.RTL)
                ) {
                  linesDrawingRightBounds[currentLineMetrics.lineNumber] =
                    this.paragraph.getMaxWidth() - currentLineMetrics.width;
                } else {
                  linesDrawingRightBounds[currentLineMetrics.lineNumber] = 0;
                }
              }
              return linesDrawingRightBounds[currentLineMetrics.lineNumber];
            })();
            const drawingRight =
              drawingLeft + context.measureText(drawingText).width;
            linesDrawingRightBounds[currentLineMetrics.lineNumber] =
              drawingRight;

            const textTop =
              currentLineMetrics.baseline *
                currentLineMetrics.heightMultiplier -
              span.letterBaseline;
            const textBaseline =
              currentLineMetrics.baseline * currentLineMetrics.heightMultiplier;
            const textHeight = span.letterHeight;

            // draw background
            if (span.style.backgroundColor) {
              context.fillStyle = span.toBackgroundFillStyle();
              context.fillRect(
                drawingLeft,
                textTop + currentLineMetrics.yOffset,
                drawingRight - drawingLeft,
                textHeight
              );
            }

            // draw text
            // console.log("draw text", drawingText);
            context.fillStyle = span.toTextFillStyle();
            context.fillText(
              drawingText,
              drawingLeft,
              textBaseline + currentLineMetrics.yOffset
            );

            // draw decoration
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
                  context.setLineDash([10, 4]);
                  break;
                case DecorationStyle.Dotted:
                  context.lineCap = "butt";
                  context.setLineDash([4, 4]);
                  break;
              }

              if (span.style.decoration & UnderlineDecoration) {
                context.beginPath();
                context.moveTo(
                  drawingLeft,
                  currentLineMetrics.yOffset + textBaseline + 2
                );
                context.lineTo(
                  drawingRight,
                  currentLineMetrics.yOffset + textBaseline + 2
                );
                if (decorationStyle === DecorationStyle.Double) {
                  context.moveTo(
                    drawingLeft,
                    currentLineMetrics.yOffset + textBaseline + 4
                  );
                  context.lineTo(
                    drawingRight,
                    currentLineMetrics.yOffset + textBaseline + 4
                  );
                }
                context.stroke();
              }
              if (span.style.decoration & LineThroughDecoration) {
                context.beginPath();
                context.moveTo(
                  drawingLeft,
                  currentLineMetrics.yOffset + textTop + textHeight / 2.0
                );
                context.lineTo(
                  drawingRight,
                  currentLineMetrics.yOffset + textTop + textHeight / 2.0
                );
                if (decorationStyle === DecorationStyle.Double) {
                  context.moveTo(
                    drawingLeft,
                    currentLineMetrics.yOffset + textTop + textHeight / 2.0 + 2
                  );
                  context.lineTo(
                    drawingRight,
                    currentLineMetrics.yOffset + textTop + textHeight / 2.0 + 2
                  );
                }
                context.stroke();
              }
              if (span.style.decoration & OverlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentLineMetrics.yOffset);
                context.lineTo(drawingRight, currentLineMetrics.yOffset);

                if (decorationStyle === DecorationStyle.Double) {
                  context.moveTo(
                    drawingLeft,
                    currentLineMetrics.yOffset + textTop + 2
                  );
                  context.lineTo(
                    drawingRight,
                    currentLineMetrics.yOffset + textTop + 2
                  );
                }
                context.stroke();
              }
              context.restore();
            }

            currentDrawStartPosition = currentDrawEndPosition;
            currentDrawEndPosition = currentDrawStartPosition;
          } else {
            break;
          }
        }
        spanLetterStartIndex = spanLetterEndIndex;
      }
    });
    context.restore();
    return context.getImageData(0, 0, width, height);
  }
}
