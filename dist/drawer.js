"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = void 0;
const paragraph_1 = require("./paragraph");
const skia_1 = require("./skia");
const text_style_1 = require("./text_style");
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
            var _a, _b, _c;
            if (span instanceof paragraph_1.TextSpan) {
                let spanLetterEndIndex = spanLetterStartIndex + span.text.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(spanLetterStartIndex, spanLetterEndIndex);
                context.font = span.toCanvasFont();
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
                    if (currentLineMetrics &&
                        currentDrawEndPosition > currentDrawStartPosition) {
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
                        // draw background
                        if (span.style.backgroundColor) {
                            context.fillStyle = span.toBackgroundFillStyle();
                            context.fillRect(drawingLeft, currentLineMetrics.yOffset, drawingRight - drawingLeft, currentLineMetrics.height);
                        }
                        // draw text
                        context.fillStyle = span.toTextFillStyle();
                        context.fillText(drawingText, drawingLeft, currentLineMetrics.ascent + currentLineMetrics.yOffset);
                        // draw decoration
                        if (span.style.decoration) {
                            context.save();
                            context.strokeStyle = span.toDecorationStrokeStyle();
                            context.lineWidth =
                                ((_a = span.style.decorationThickness) !== null && _a !== void 0 ? _a : 1) *
                                    Math.max(1, ((_b = span.style.fontSize) !== null && _b !== void 0 ? _b : 12) / 14);
                            const decorationStyle = (_c = span.style.decorationStyle) === null || _c === void 0 ? void 0 : _c.value;
                            switch (decorationStyle) {
                                case text_style_1.DecorationStyle.Dashed:
                                    context.lineCap = "butt";
                                    context.setLineDash([10, 4]);
                                    break;
                                case text_style_1.DecorationStyle.Dotted:
                                    context.lineCap = "butt";
                                    context.setLineDash([4, 4]);
                                    break;
                            }
                            if (span.style.decoration & text_style_1.UnderlineDecoration) {
                                context.beginPath();
                                context.moveTo(drawingLeft, currentLineMetrics.yOffset + currentLineMetrics.ascent + 2);
                                context.lineTo(drawingRight, currentLineMetrics.yOffset + currentLineMetrics.ascent + 2);
                                if (decorationStyle === text_style_1.DecorationStyle.Double) {
                                    context.moveTo(drawingLeft, currentLineMetrics.yOffset + currentLineMetrics.ascent + 4);
                                    context.lineTo(drawingRight, currentLineMetrics.yOffset + currentLineMetrics.ascent + 4);
                                }
                                context.stroke();
                            }
                            if (span.style.decoration & text_style_1.LineThroughDecoration) {
                                context.beginPath();
                                context.moveTo(drawingLeft, currentLineMetrics.yOffset + currentLineMetrics.height / 2.0);
                                context.lineTo(drawingRight, currentLineMetrics.yOffset + currentLineMetrics.height / 2.0);
                                if (decorationStyle === text_style_1.DecorationStyle.Double) {
                                    context.moveTo(drawingLeft, currentLineMetrics.yOffset +
                                        currentLineMetrics.height / 2.0 +
                                        2);
                                    context.lineTo(drawingRight, currentLineMetrics.yOffset +
                                        currentLineMetrics.height / 2.0 +
                                        2);
                                }
                                context.stroke();
                            }
                            if (span.style.decoration & text_style_1.OverlineDecoration) {
                                context.beginPath();
                                context.moveTo(drawingLeft, currentLineMetrics.yOffset);
                                context.lineTo(drawingRight, currentLineMetrics.yOffset);
                                if (decorationStyle === text_style_1.DecorationStyle.Double) {
                                    context.moveTo(drawingLeft, currentLineMetrics.yOffset + 2);
                                    context.lineTo(drawingRight, currentLineMetrics.yOffset + 2);
                                }
                                context.stroke();
                            }
                            context.restore();
                        }
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
