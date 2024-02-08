"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLayout = void 0;
const paragraph_1 = require("./paragraph");
class LetterMeasurer {
    static measureLetters(span, context) {
        let result = [0];
        let curPosWidth = 0;
        for (let index = 0; index < span.text.length; index++) {
            const letter = span.text[index];
            const wordWidth = (() => {
                if (isSquareCharacter(letter)) {
                    return this.measureSquareCharacter(context);
                }
                else {
                    return this.measureNormalLetter(letter, context);
                }
            })();
            curPosWidth += wordWidth;
            result.push(curPosWidth);
        }
        return result;
    }
    static measureNormalLetter(letter, context) {
        var _a;
        const width = (_a = this.widthFromCache(context, letter)) !== null && _a !== void 0 ? _a : context.measureText(letter).width;
        this.setWidthToCache(context, letter, width);
        return width;
    }
    static measureSquareCharacter(context) {
        var _a;
        const width = (_a = this.widthFromCache(context, "测")) !== null && _a !== void 0 ? _a : context.measureText("测").width;
        this.setWidthToCache(context, "测", width);
        return width;
    }
    static widthFromCache(context, word) {
        var _a;
        const cacheKey = context.font + "_" + word;
        return (_a = this.measureLRUCache[cacheKey]) === null || _a === void 0 ? void 0 : _a.width;
    }
    static setWidthToCache(context, word, width) {
        const cacheKey = context.font + "_" + word;
        if (this.measureLRUCache[cacheKey]) {
            this.measureLRUCache[cacheKey].useCount++;
            return;
        }
        this.measureLRUCache[cacheKey] = {
            useCount: 1,
            width: width,
        };
        if (Object.keys(this.measureLRUCache).length > this.LRUConfig.maxCacheCount) {
            this.clearCache();
        }
    }
    static clearCache() {
        const keys = Object.keys(this.measureLRUCache).sort((a, b) => {
            return this.measureLRUCache[a].useCount > this.measureLRUCache[b].useCount
                ? 1
                : -1;
        });
        keys
            .slice(0, this.LRUConfig.maxCacheCount - this.LRUConfig.minCacheCount)
            .forEach((it) => {
            delete this.measureLRUCache[it];
        });
    }
}
LetterMeasurer.LRUConfig = {
    maxCacheCount: 1000,
    minCacheCount: 200,
};
LetterMeasurer.measureLRUCache = {};
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
        const spans = this.paragraph.spansWithNewline();
        spans.forEach((span) => {
            var _a;
            if (span instanceof paragraph_1.TextSpan) {
                this.context.font = span.toCanvasFont();
                const matrics = this.context.measureText(span.text);
                if (!matrics.fontBoundingBoxAscent) {
                    const mHeight = this.context.measureText("M").width;
                    currentLineMetrics.ascent = mHeight * 1.15;
                    currentLineMetrics.descent = mHeight * 0.35;
                }
                else {
                    currentLineMetrics.ascent = matrics.fontBoundingBoxAscent;
                    currentLineMetrics.descent = matrics.fontBoundingBoxDescent;
                }
                currentLineMetrics.height = Math.max(currentLineMetrics.height, currentLineMetrics.ascent + currentLineMetrics.descent);
                currentLineMetrics.baseline = currentLineMetrics.ascent;
                if (currentLineMetrics.width + matrics.width < layoutWidth) {
                    currentLineMetrics.endIndex += span.text.length;
                    currentLineMetrics.width += matrics.width;
                }
                else {
                    let advances = matrics.advances
                        ? matrics.advances
                        : LetterMeasurer.measureLetters(span, this.context);
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
                            const newLineMatrics = this.createNewLine(currentLineMetrics);
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
            }
            else if (span instanceof paragraph_1.NewlineSpan) {
                const newLineMatrics = this.createNewLine(currentLineMetrics);
                lineMetrics.push(currentLineMetrics);
                currentLineMetrics = newLineMatrics;
                const matrics = this.context.measureText("M");
                if (!matrics.fontBoundingBoxAscent) {
                    const mHeight = this.context.measureText("M").width;
                    currentLineMetrics.ascent = mHeight * 1.15;
                    currentLineMetrics.descent = mHeight * 0.35;
                }
                else {
                    currentLineMetrics.ascent = matrics.fontBoundingBoxAscent;
                    currentLineMetrics.descent = matrics.fontBoundingBoxDescent;
                }
                currentLineMetrics.height = Math.max(currentLineMetrics.height, currentLineMetrics.ascent + currentLineMetrics.descent);
            }
        });
        lineMetrics.push(currentLineMetrics);
        return lineMetrics;
    }
    createNewLine(currentLineMetrics) {
        return {
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
    }
}
exports.TextLayout = TextLayout;
function isEnglishWord(str) {
    const englishRegex = /^[A-Za-z]+$/;
    const result = englishRegex.test(str);
    return result;
}
function isSquareCharacter(str) {
    const squareCharacterRange = /[\u4e00-\u9fa5]/;
    return squareCharacterRange.test(str);
}
