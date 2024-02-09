"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = void 0;
const paragraph_1 = require("./paragraph");
const skia_1 = require("./skia");
class Drawer {
    constructor(paragraph) {
        this.paragraph = paragraph;
    }
    initCanvas() {
        if (!Drawer.sharedRenderCanvas) {
            Drawer.sharedRenderCanvas = wx.createOffscreenCanvas({
                type: "2d",
                width: 1000 * Drawer.pixelRatio,
                height: 1000 * Drawer.pixelRatio,
            });
            Drawer.sharedRenderContext = Drawer.sharedRenderCanvas.getContext("2d");
        }
    }
    draw() {
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
        let linesDrawingRightBounds = {};
        const spans = this.paragraph.spansWithNewline();
        spans.forEach((span) => {
            if (span instanceof paragraph_1.TextSpan) {
                let spanLetterEndIndex = spanLetterStartIndex + span.text.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(spanLetterStartIndex, spanLetterEndIndex);
                context.font = span.toCanvasFont();
                context.fillStyle = span.toCanvasFillStyle();
                let currentDrawStartPosition = 0;
                let currentDrawEndPosition = 0;
                while (spanLetterStartIndex + currentDrawStartPosition <
                    spanLetterEndIndex) {
                    let currentLineMetrics;
                    for (let index = 0; index < lineMetrics.length; index++) {
                        const line = lineMetrics[index];
                        if (spanLetterStartIndex + currentDrawStartPosition >=
                            line.startIndex &&
                            spanLetterStartIndex + currentDrawStartPosition < line.endIndex) {
                            currentLineMetrics = line;
                            currentDrawEndPosition += Math.min(span.text.length, line.endIndex - spanLetterStartIndex);
                            break;
                        }
                    }
                    if (currentDrawEndPosition > currentDrawStartPosition) {
                        const drawingText = span.text.substring(currentDrawStartPosition, currentDrawEndPosition);
                        const drawingLeft = (() => {
                            var _a, _b;
                            if (linesDrawingRightBounds[currentLineMetrics.lineNumber] ===
                                undefined) {
                                const textAlign = (_a = this.paragraph.paragraphStyle.textAlign) === null || _a === void 0 ? void 0 : _a.value;
                                const textDirection = (_b = this.paragraph.paragraphStyle.textDirection) === null || _b === void 0 ? void 0 : _b.value;
                                if (textAlign === skia_1.TextAlign.Center) {
                                    linesDrawingRightBounds[currentLineMetrics.lineNumber] =
                                        (this.paragraph.getMaxWidth() - currentLineMetrics.width) /
                                            2.0;
                                }
                                else if (textAlign === skia_1.TextAlign.Right ||
                                    (textAlign === skia_1.TextAlign.End &&
                                        textDirection !== skia_1.TextDirection.RTL) ||
                                    (textAlign === skia_1.TextAlign.Start &&
                                        textDirection === skia_1.TextDirection.RTL)) {
                                    linesDrawingRightBounds[currentLineMetrics.lineNumber] =
                                        this.paragraph.getMaxWidth() - currentLineMetrics.width;
                                }
                                else {
                                    linesDrawingRightBounds[currentLineMetrics.lineNumber] = 0;
                                }
                            }
                            return linesDrawingRightBounds[currentLineMetrics.lineNumber];
                        })();
                        const drawingRight = drawingLeft + context.measureText(drawingText).width;
                        linesDrawingRightBounds[currentLineMetrics.lineNumber] =
                            drawingRight;
                        context.fillText(drawingText, drawingLeft, currentLineMetrics.ascent + currentLineMetrics.yOffset);
                        currentDrawStartPosition = currentDrawEndPosition;
                        currentDrawEndPosition = currentDrawStartPosition;
                    }
                    else {
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
exports.Drawer = Drawer;
Drawer.pixelRatio = 1.0;
