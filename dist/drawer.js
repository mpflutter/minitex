"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = void 0;
const layout_1 = require("./layout");
const paragraph_1 = require("./paragraph");
class Drawer {
    constructor(paragraph) {
        this.paragraph = paragraph;
    }
    initCanvas() {
        if (!Drawer.sharedLayoutCanvas) {
            Drawer.sharedLayoutCanvas = wx.createOffscreenCanvas({
                type: "2d",
                width: 1,
                height: 1,
            });
            Drawer.sharedLayoutContext = Drawer.sharedLayoutCanvas.getContext("2d");
            Drawer.sharedRenderCanvas = wx.createOffscreenCanvas({
                type: "2d",
                width: 1000 * Drawer.pixelRatio,
                height: 1000 * Drawer.pixelRatio,
            });
            Drawer.sharedRenderContext = Drawer.sharedRenderCanvas.getContext("2d");
        }
    }
    layout(width) {
        this.initCanvas();
        const layouter = new layout_1.TextLayout(this.paragraph, Drawer.sharedLayoutContext);
        this.paragraph._lineMetrics = layouter.layout(width);
    }
    draw() {
        this.initCanvas();
        const width = this.paragraph.getMaxWidth() * Drawer.pixelRatio;
        const height = this.paragraph.getHeight() * Drawer.pixelRatio;
        const context = Drawer.sharedRenderContext;
        context.clearRect(0, 0, width, height);
        context.save();
        context.scale(Drawer.pixelRatio, Drawer.pixelRatio);
        let spanLetterStartIndex = 0;
        this.paragraph.spans.forEach((span) => {
            if (span instanceof paragraph_1.TextSpan) {
                let spanLetterEndIndex = spanLetterStartIndex + span.text.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(spanLetterStartIndex, spanLetterEndIndex);
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
                    const lineText = span.text.substring(lineStartIndex, currentLineMetrics.endIndex);
                    // console.log("lineText", currentLineMetrics, lineText);
                    context.fillText(lineText, 0, currentLineMetrics.ascent + currentLineMetrics.yOffset);
                    lineStartIndex = currentLineMetrics.endIndex;
                });
                spanLetterStartIndex = spanLetterEndIndex;
            }
        });
        context.restore();
        return context.getImageData(0, 0, width, height);
    }
}
exports.Drawer = Drawer;
Drawer.pixelRatio = 1.0;
