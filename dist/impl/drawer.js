"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Drawer = void 0;
const skia_1 = require("../adapter/skia");
const skia_2 = require("../adapter/skia");
const span_1 = require("./span");
const util_1 = require("../util");
const logger_1 = require("../logger");
class Drawer {
    constructor(paragraph) {
        this.paragraph = paragraph;
    }
    initCanvas() {
        if (!Drawer.sharedRenderCanvas) {
            Drawer.sharedRenderCanvas = (0, util_1.createCanvas)(Math.min(4000, 1000 * Drawer.pixelRatio), Math.min(4000, 1000 * Drawer.pixelRatio));
            Drawer.sharedRenderContext = Drawer.sharedRenderCanvas.getContext("2d");
        }
    }
    draw() {
        this.initCanvas();
        const width = (0, util_1.convertToUpwardToPixelRatio)(this.paragraph.getMaxWidth() * Drawer.pixelRatio, Drawer.pixelRatio);
        const height = (0, util_1.convertToUpwardToPixelRatio)(this.paragraph.getHeight() * Drawer.pixelRatio, Drawer.pixelRatio);
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
        let linesDrawingRightBounds = {};
        const spans = (0, span_1.spanWithNewline)(this.paragraph.spans);
        let linesUndrawed = {};
        this.paragraph.getLineMetrics().forEach((it) => {
            linesUndrawed[it.lineNumber] = it.endIndex - it.startIndex;
        });
        spans.forEach((span) => {
            var _a, _b, _c, _d, _e, _f;
            if (didExceedMaxLines)
                return;
            if (span instanceof span_1.TextSpan) {
                if (span instanceof span_1.NewlineSpan) {
                    spanLetterStartIndex++;
                    return;
                }
                let spanUndrawLength = span.text.length;
                let spanLetterEndIndex = spanLetterStartIndex + span.text.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(spanLetterStartIndex, spanLetterEndIndex);
                context.font = span.toCanvasFont();
                while (spanUndrawLength > 0) {
                    let currentDrawText = "";
                    let currentDrawLine;
                    for (let index = 0; index < lineMetrics.length; index++) {
                        const line = lineMetrics[index];
                        if (linesUndrawed[line.lineNumber] > 0) {
                            const currentDrawLength = Math.min(linesUndrawed[line.lineNumber], spanUndrawLength);
                            currentDrawText = span.text.substring(span.text.length - spanUndrawLength, span.text.length - spanUndrawLength + currentDrawLength);
                            spanUndrawLength -= currentDrawLength;
                            linesUndrawed[line.lineNumber] -= currentDrawLength;
                            currentDrawLine = line;
                            break;
                        }
                    }
                    if (!currentDrawLine)
                        break;
                    if (this.paragraph.didExceedMaxLines() &&
                        this.paragraph.paragraphStyle.maxLines ===
                            currentDrawLine.lineNumber + 1 &&
                        linesUndrawed[currentDrawLine.lineNumber] <= 0) {
                        const trimLength = (0, util_1.isSquareCharacter)(currentDrawText[currentDrawText.length - 1])
                            ? 1
                            : 3;
                        currentDrawText =
                            (_a = currentDrawText.substring(0, currentDrawText.length - trimLength) + this.paragraph.paragraphStyle.ellipsis) !== null && _a !== void 0 ? _a : "...";
                        didExceedMaxLines = true;
                    }
                    let drawingLeft = (() => {
                        var _a, _b;
                        if (linesDrawingRightBounds[currentDrawLine.lineNumber] === undefined) {
                            const textAlign = (_a = this.paragraph.paragraphStyle.textAlign) === null || _a === void 0 ? void 0 : _a.value;
                            const textDirection = (_b = this.paragraph.paragraphStyle.textDirection) === null || _b === void 0 ? void 0 : _b.value;
                            if (textAlign === skia_1.TextAlign.Center) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    (this.paragraph.getMaxWidth() - currentDrawLine.width) / 2.0;
                            }
                            else if (textAlign === skia_1.TextAlign.Right ||
                                (textAlign === skia_1.TextAlign.End &&
                                    textDirection !== skia_1.TextDirection.RTL) ||
                                (textAlign === skia_1.TextAlign.Start &&
                                    textDirection === skia_1.TextDirection.RTL)) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    this.paragraph.getMaxWidth() - currentDrawLine.width;
                            }
                            else {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] = 0;
                            }
                        }
                        return linesDrawingRightBounds[currentDrawLine.lineNumber];
                    })();
                    const drawingRight = drawingLeft +
                        (() => {
                            if (currentDrawText === "\n") {
                                return 0;
                            }
                            const extraLetterSpacing = span.hasLetterSpacing()
                                ? currentDrawText.length * span.style.letterSpacing
                                : 0;
                            return (context.measureText(currentDrawText).width + extraLetterSpacing);
                        })();
                    linesDrawingRightBounds[currentDrawLine.lineNumber] = drawingRight;
                    const textTop = currentDrawLine.baseline * currentDrawLine.heightMultiplier -
                        span.letterBaseline;
                    const textBaseline = currentDrawLine.baseline * currentDrawLine.heightMultiplier;
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
                            ? (0, util_1.colorToHex)(span.style.shadows[0].color)
                            : "transparent";
                        context.shadowOffsetX = (_c = (_b = span.style.shadows[0].offset) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : 0;
                        context.shadowOffsetY = (_e = (_d = span.style.shadows[0].offset) === null || _d === void 0 ? void 0 : _d[1]) !== null && _e !== void 0 ? _e : 0;
                        context.shadowBlur = (_f = span.style.shadows[0].blurRadius) !== null && _f !== void 0 ? _f : 0;
                    }
                    context.fillStyle = span.toTextFillStyle();
                    if (span.hasLetterSpacing() || span.hasWordSpacing()) {
                        const letterSpacing = span.style.letterSpacing;
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            context.fillText(currentDrawLetter, drawingLeft, textBaseline + currentDrawLine.yOffset);
                            const letterWidth = context.measureText(currentDrawLetter).width;
                            if (span.hasWordSpacing() &&
                                currentDrawLetter === " " &&
                                (0, util_1.isEnglishWord)(currentDrawText[index - 1])) {
                                drawingLeft += span.style.wordSpacing;
                            }
                            else {
                                drawingLeft += letterWidth + letterSpacing;
                            }
                        }
                    }
                    else {
                        context.fillText(currentDrawText, drawingLeft, textBaseline + currentDrawLine.yOffset);
                    }
                    context.restore();
                    logger_1.logger.debug("Drawer.draw.fillText", currentDrawText, drawingLeft, textBaseline + currentDrawLine.yOffset);
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
    drawBackground(span, context, options) {
        if (span.style.backgroundColor) {
            const { currentDrawLine, drawingLeft, drawingRight, textTop, textHeight, } = options;
            context.fillStyle = span.toBackgroundFillStyle();
            context.fillRect(drawingLeft, textTop + currentDrawLine.yOffset, drawingRight - drawingLeft, textHeight);
        }
    }
    drawDecoration(span, context, options) {
        var _a, _b, _c;
        const { currentDrawLine, drawingLeft, drawingRight, textBaseline, textTop, textHeight, } = options;
        if (span.style.decoration) {
            context.save();
            context.strokeStyle = span.toDecorationStrokeStyle();
            context.lineWidth =
                ((_a = span.style.decorationThickness) !== null && _a !== void 0 ? _a : 1) *
                    Math.max(1, ((_b = span.style.fontSize) !== null && _b !== void 0 ? _b : 12) / 14);
            const decorationStyle = (_c = span.style.decorationStyle) === null || _c === void 0 ? void 0 : _c.value;
            switch (decorationStyle) {
                case skia_2.DecorationStyle.Dashed:
                    context.lineCap = "butt";
                    context.setLineDash([4, 2]);
                    break;
                case skia_2.DecorationStyle.Dotted:
                    context.lineCap = "butt";
                    context.setLineDash([2, 2]);
                    break;
            }
            if (span.style.decoration & skia_2.UnderlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textBaseline + 1);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textBaseline + 1);
                context.stroke();
                if (decorationStyle === skia_2.DecorationStyle.Double) {
                    context.beginPath();
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textBaseline + 3);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textBaseline + 3);
                    context.stroke();
                }
            }
            if (span.style.decoration & skia_2.LineThroughDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + textHeight / 2.0);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + textHeight / 2.0);
                if (decorationStyle === skia_2.DecorationStyle.Double) {
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2);
                }
                context.stroke();
            }
            if (span.style.decoration & skia_2.OverlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textTop);
                if (decorationStyle === skia_2.DecorationStyle.Double) {
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + 2);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + 2);
                }
                context.stroke();
            }
            context.restore();
        }
    }
}
exports.Drawer = Drawer;
Drawer.pixelRatio = 1.0;
