"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLayouter = void 0;
const paragraph_1 = require("./paragraph");
class TextLayouter {
    constructor(paragraph, context) {
        this.paragraph = paragraph;
        this.context = context;
    }
    layout(layoutWidth) {
        let currentLineMetrics = {
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
        let lineMetrics = [];
        this.paragraph.spans.forEach((span) => {
            if (span instanceof paragraph_1.TextSpan) {
                this.context.font = span.toCanvasFont();
                const matrics = this.context.measureText(span.text);
                console.log("matricsmatrics", matrics);
                currentLineMetrics.ascent = matrics.fontBoundingBoxAscent;
                currentLineMetrics.descent = matrics.fontBoundingBoxDescent;
                currentLineMetrics.height = Math.max(currentLineMetrics.height, matrics.fontBoundingBoxAscent + matrics.fontBoundingBoxDescent);
                currentLineMetrics.baseline = matrics.fontBoundingBoxAscent;
                let totalWidth = matrics.width;
                let totalLength = span.text.length;
                let usedWidth = 0;
                let advancesCurrentIndex = 0;
                while (currentLineMetrics.width + totalWidth > layoutWidth) {
                    let endIndex = currentLineMetrics.endIndex;
                    const advances = matrics.advances;
                    if (advances) {
                        for (let index = advancesCurrentIndex; index < advances.length; index++) {
                            const letterBoundsLeft = advances[index + 1] - usedWidth;
                            const letterBoundsRight = advances[index + 1] - usedWidth;
                            const segmentIndex = index - advancesCurrentIndex;
                            if (currentLineMetrics.width + letterBoundsRight > layoutWidth) {
                                usedWidth += letterBoundsLeft;
                                advancesCurrentIndex = index - 1;
                                endIndex += segmentIndex - 1;
                                totalWidth -= letterBoundsLeft;
                                totalLength -= segmentIndex - 1;
                                break;
                            }
                        }
                    }
                    currentLineMetrics.endIndex = endIndex;
                    currentLineMetrics.width = layoutWidth;
                    const newLineMatrics = {
                        startIndex: endIndex,
                        endIndex: endIndex,
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
                }
                currentLineMetrics.endIndex += totalLength;
                currentLineMetrics.width += totalWidth;
            }
        });
        if (currentLineMetrics.endIndex > currentLineMetrics.startIndex) {
            lineMetrics.push(currentLineMetrics);
        }
        return lineMetrics;
    }
}
exports.TextLayouter = TextLayouter;
