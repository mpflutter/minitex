declare var wx: any;
import { TextLayout } from "./layout";
import { Paragraph, TextSpan } from "./paragraph";

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

    const layouter = new TextLayout(
      this.paragraph,
      Drawer.sharedLayoutContext
    );
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
    this.paragraph.spans.forEach((span) => {
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
        let lineStartIndex = spanLetterStartIndex;
        lineMetrics.forEach((currentLineMetrics) => {
          const lineText = span.text.substring(
            lineStartIndex,
            currentLineMetrics.endIndex
          );
          // console.log("lineText", currentLineMetrics, lineText);
          context.fillText(
            lineText,
            0,
            currentLineMetrics.ascent + currentLineMetrics.yOffset
          );
          lineStartIndex = currentLineMetrics.endIndex;
        });
        spanLetterStartIndex = spanLetterEndIndex;
      }
    });
    context.restore();
    return context.getImageData(0, 0, width, height);
  }
}
