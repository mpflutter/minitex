declare var wx: any;
import { TextLayout } from "./layout";
import { Paragraph, TextSpan } from "./paragraph";
import { LineMetrics, TextAlign, TextDirection } from "./skia";

export class Drawer {
  static pixelRatio = 1.0;
  static sharedLayoutCanvas: HTMLCanvasElement;
  static sharedLayoutContext: CanvasRenderingContext2D;
  static sharedRenderCanvas: HTMLCanvasElement;
  static sharedRenderContext: CanvasRenderingContext2D;

  constructor(readonly paragraph: Paragraph) {}

  private initCanvas() {
    if (!Drawer.sharedLayoutCanvas) {
      Drawer.sharedLayoutCanvas = wx.createOffscreenCanvas({
        type: "2d",
        width: 1,
        height: 1,
      });
      Drawer.sharedLayoutContext = Drawer.sharedLayoutCanvas!.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
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

  layout(width: number): void {
    this.initCanvas();

    const layouter = new TextLayout(this.paragraph, Drawer.sharedLayoutContext);
    this.paragraph._lineMetrics = layouter.layout(width);
  }

  draw(): ImageData {
    this.initCanvas();
    const width = this.paragraph.getMaxWidth() * Drawer.pixelRatio;
    const height = this.paragraph.getHeight() * Drawer.pixelRatio;
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
        // console.log(
        //   "lineMetrics",
        //   spanLetterStartIndex,
        //   spanLetterEndIndex,
        //   lineMetrics
        // );
        context.font = span.toCanvasFont();
        context.fillStyle = span.toCanvasFillStyle();
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
              spanLetterStartIndex >= line.startIndex &&
              spanLetterStartIndex < line.endIndex
            ) {
              currentLineMetrics = line;
              currentDrawEndPosition += Math.min(
                span.text.length,
                line.endIndex - spanLetterStartIndex
              );
              break;
            }
          }
          if (currentDrawEndPosition > currentDrawStartPosition) {
            const drawingText = span.text.substring(
              currentDrawStartPosition,
              currentDrawEndPosition
            );
            const drawingLeft = (() => {
              if (
                linesDrawingRightBounds[currentLineMetrics!.lineNumber] ===
                undefined
              ) {
                const textAlign =
                  this.paragraph.paragraphStyle.textAlign?.value;
                const textDirection =
                  this.paragraph.paragraphStyle.textDirection?.value;
                console.log("textAligntextAlign", textAlign);
                if (textAlign === TextAlign.Center) {
                  linesDrawingRightBounds[currentLineMetrics!.lineNumber] =
                    (this.paragraph.getMaxWidth() - currentLineMetrics!.width) /
                    2.0;
                } else if (
                  textAlign === TextAlign.Right ||
                  (textAlign === TextAlign.End &&
                    textDirection !== TextDirection.RTL) ||
                  (textAlign === TextAlign.Start &&
                    textDirection === TextDirection.RTL)
                ) {
                  linesDrawingRightBounds[currentLineMetrics!.lineNumber] =
                    this.paragraph.getMaxWidth() - currentLineMetrics!.width;
                } else {
                  linesDrawingRightBounds[currentLineMetrics!.lineNumber] = 0;
                }
              }
              return linesDrawingRightBounds[currentLineMetrics!.lineNumber];
            })();
            const drawingRight =
              drawingLeft + context.measureText(drawingText).width;
            linesDrawingRightBounds[currentLineMetrics!.lineNumber] =
              drawingRight;
            context.fillText(
              drawingText,
              drawingLeft,
              currentLineMetrics!.ascent + currentLineMetrics!.yOffset
            );
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
