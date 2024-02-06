"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLayout = void 0;
const paragraph_1 = require("./paragraph");
class TextLayout {
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
            var _a;
            if (span instanceof paragraph_1.TextSpan) {
                this.context.font = span.toCanvasFont();
                const matrics = this.context.measureText(span.text);
                currentLineMetrics.ascent = matrics.fontBoundingBoxAscent;
                currentLineMetrics.descent = matrics.fontBoundingBoxDescent;
                currentLineMetrics.height = Math.max(currentLineMetrics.height, matrics.fontBoundingBoxAscent + matrics.fontBoundingBoxDescent);
                currentLineMetrics.baseline = matrics.fontBoundingBoxAscent;
                if (currentLineMetrics.width + matrics.width < layoutWidth) {
                    currentLineMetrics.endIndex += span.text.length;
                    currentLineMetrics.width += matrics.width;
                    return; // single line
                }
                let advances = Object.assign({}, matrics.advances);
                let currentWord = "";
                let currentWordWidth = 0;
                let currentWordLength = 0;
                let canBreak = true;
                for (let index = 0; index < span.text.length; index++) {
                    const letter = span.text[index];
                    currentWord += letter;
                    let nextWord = (_a = currentWord + span.text[index + 1]) !== null && _a !== void 0 ? _a : "";
                    if (advances[index + 1] === undefined) {
                        currentWordWidth += advances[index] - advances[index - 1];
                    }
                    else {
                        currentWordWidth += advances[index + 1] - advances[index];
                    }
                    currentWordLength += 1;
                    canBreak = true;
                    if (isEnglishWord(nextWord)) {
                        canBreak = false;
                    }
                    if (!canBreak) {
                        continue;
                    }
                    else if (currentLineMetrics.width + currentWordWidth <
                        layoutWidth) {
                        currentLineMetrics.width += currentWordWidth;
                        currentLineMetrics.endIndex += currentWordLength;
                        currentWord = "";
                        currentWordWidth = 0;
                        currentWordLength = 0;
                        canBreak = true;
                    }
                    else if (currentLineMetrics.width + currentWordWidth >=
                        layoutWidth) {
                        const newLineMatrics = {
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
        });
        if (currentLineMetrics.endIndex > currentLineMetrics.startIndex) {
            lineMetrics.push(currentLineMetrics);
        }
        return lineMetrics;
    }
}
exports.TextLayout = TextLayout;
function isEnglishWord(str) {
    const englishRegex = /^[A-Za-z]+$/;
    const result = englishRegex.test(str);
    return result;
}
