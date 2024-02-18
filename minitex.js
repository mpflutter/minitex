(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.MiniTex = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paragraph = exports.drawParagraph = void 0;
const drawer_1 = require("../impl/drawer");
const layout_1 = require("../impl/layout");
const span_1 = require("../impl/span");
const logger_1 = require("../logger");
const skia_1 = require("./skia");
const drawParagraph = function (CanvasKit, skCanvas, paragraph, dx, dy) {
    var _a;
    let drawStartTime;
    if (logger_1.logger.profileMode) {
        drawStartTime = new Date().getTime();
    }
    const drawer = new drawer_1.Drawer(paragraph);
    const imageData = (_a = paragraph.imageDataCache) !== null && _a !== void 0 ? _a : drawer.draw();
    paragraph.imageDataCache = imageData;
    const canvasImg = CanvasKit.MakeImage({
        width: imageData.width,
        height: imageData.height,
        alphaType: CanvasKit.AlphaType.Unpremul,
        colorType: CanvasKit.ColorType.RGBA_8888,
        colorSpace: CanvasKit.ColorSpace.SRGB,
    }, imageData.data, 4 * imageData.width);
    const srcRect = CanvasKit.XYWHRect(0, 0, imageData.width, imageData.height);
    const dstRect = CanvasKit.XYWHRect(Math.ceil(dx), Math.ceil(dy), imageData.width / drawer_1.Drawer.pixelRatio, imageData.height / drawer_1.Drawer.pixelRatio);
    const skPaint = new CanvasKit.Paint();
    skCanvas.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
    if (logger_1.logger.profileMode) {
        const drawCostTime = new Date().getTime() - drawStartTime;
        logger_1.logger.profile("drawParagraph cost", drawCostTime);
    }
};
exports.drawParagraph = drawParagraph;
class Paragraph extends skia_1.SkEmbindObject {
    constructor(spans, paragraphStyle) {
        super();
        this.spans = spans;
        this.paragraphStyle = paragraphStyle;
        this._type = "SkParagraph";
        this.isMiniTex = true;
        this._textLayout = new layout_1.TextLayout(this);
    }
    didExceedMaxLines() {
        return this._textLayout.didExceedMaxLines;
    }
    getAlphabeticBaseline() {
        return 0;
    }
    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx, dy) {
        this._textLayout.measureGlyphIfNeeded();
        for (let index = 0; index < this._textLayout.glyphInfos.length; index++) {
            const glyphInfo = this._textLayout.glyphInfos[index];
            const left = glyphInfo.graphemeLayoutBounds[0];
            const top = glyphInfo.graphemeLayoutBounds[1];
            const width = glyphInfo.graphemeLayoutBounds[2] - left;
            const height = glyphInfo.graphemeLayoutBounds[3] - top;
            if (dx >= left && dx <= left + width && dy >= top && dy <= top + height) {
                return { pos: index, affinity: { value: skia_1.Affinity.Downstream } };
            }
        }
        for (let index = 0; index < this._textLayout.lineMetrics.length; index++) {
            const lineMetrics = this._textLayout.lineMetrics[index];
            const isLastLine = index === this._textLayout.lineMetrics.length - 1;
            const left = 0;
            const top = lineMetrics.yOffset;
            const width = lineMetrics.width;
            const height = lineMetrics.height;
            if (dy >= top && dy <= top + height) {
                if (dx <= 0) {
                    return {
                        pos: lineMetrics.startIndex,
                        affinity: { value: skia_1.Affinity.Upstream },
                    };
                }
                else if (dx >= width) {
                    return {
                        pos: lineMetrics.endIndex,
                        affinity: { value: skia_1.Affinity.Upstream },
                    };
                }
            }
            if (dy >= top + height && isLastLine) {
                return {
                    pos: lineMetrics.endIndex,
                    affinity: { value: skia_1.Affinity.Upstream },
                };
            }
        }
        return { pos: 0, affinity: { value: skia_1.Affinity.Upstream } };
    }
    /**
     * Returns the information associated with the closest glyph at the specified
     * paragraph coordinate, or null if the paragraph is empty.
     */
    getClosestGlyphInfoAtCoordinate(dx, dy) {
        return this.getGlyphInfoAt(this.getGlyphPositionAtCoordinate(dx, dy).pos);
    }
    /**
     * Returns the information associated with the glyph at the specified UTF-16
     * offset within the paragraph's visible lines, or null if the index is out
     * of bounds, or points to a codepoint that is logically after the last
     * visible codepoint.
     */
    getGlyphInfoAt(index) {
        var _a;
        this._textLayout.measureGlyphIfNeeded();
        return (_a = this._textLayout.glyphInfos[index]) !== null && _a !== void 0 ? _a : null;
    }
    getHeight() {
        const lineMetrics = this.getLineMetrics();
        let height = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            height += lineMetrics[i].height * lineMetrics[i].heightMultiplier;
            if (i > 0 && i < lineMetrics.length) {
                height += lineMetrics[i].height * 0.15;
            }
        }
        // console.log("getHeight", height);
        return height;
    }
    getIdeographicBaseline() {
        return 0;
    }
    /**
     * Returns the line number of the line that contains the specified UTF-16
     * offset within the paragraph, or -1 if the index is out of bounds, or
     * points to a codepoint that is logically after the last visible codepoint.
     */
    getLineNumberAt(index) {
        var _a, _b;
        return (_b = (_a = this.getLineMetricsOfRange(index, index)[0]) === null || _a === void 0 ? void 0 : _a.lineNumber) !== null && _b !== void 0 ? _b : 0;
    }
    getLineMetrics() {
        return this._textLayout.lineMetrics;
    }
    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber) {
        var _a;
        return (_a = this._textLayout.lineMetrics[lineNumber]) !== null && _a !== void 0 ? _a : null;
    }
    getLineMetricsOfRange(start, end) {
        let lineMetrics = [];
        this._textLayout.lineMetrics.forEach((it) => {
            const range0 = [start, end];
            const range1 = [it.startIndex, it.endIndex];
            const hasIntersection = range0[1] >= range1[0] && range1[1] >= range0[0];
            if (hasIntersection) {
                lineMetrics.push(it);
            }
        });
        return lineMetrics;
    }
    getLongestLine() {
        return 0;
    }
    getMaxIntrinsicWidth() {
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, lineMetrics[i].width);
        }
        // console.log("getMaxIntrinsicWidth", maxWidth);
        return maxWidth;
    }
    getMaxWidth() {
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, lineMetrics[i].width);
        }
        // console.log("getMaxWidth", maxWidth);
        return maxWidth;
    }
    getMinIntrinsicWidth() {
        const lineMetrics = this.getLineMetrics();
        let width = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            width = Math.max(width, lineMetrics[i].width);
        }
        // console.log("getMinIntrinsicWidth", width);
        return width;
    }
    /**
     * Returns the total number of visible lines in the paragraph.
     */
    getNumberOfLines() {
        return this._textLayout.lineMetrics.length;
    }
    getRectsForPlaceholders() {
        return [];
    }
    /**
     * Returns bounding boxes that enclose all text in the range of glpyh indexes [start, end).
     * @param start
     * @param end
     * @param hStyle
     * @param wStyle
     */
    getRectsForRange(start, end, hStyle, wStyle) {
        this._textLayout.measureGlyphIfNeeded();
        let result = [];
        this._textLayout.lineMetrics.forEach((it) => {
            const range0 = [start, end];
            const range1 = [it.startIndex, it.endIndex];
            const hasIntersection = range0[1] > range1[0] && range1[1] > range0[0];
            if (hasIntersection) {
                const intersecRange = [
                    Math.max(range0[0], range1[0]),
                    Math.min(range0[1], range1[1]),
                ];
                let currentLineLeft = -1;
                let currentLineTop = -1;
                let currentLineWidth = 0;
                let currentLineHeight = 0;
                for (let index = intersecRange[0]; index < intersecRange[1]; index++) {
                    const glyphInfo = this._textLayout.glyphInfos[index];
                    if (glyphInfo) {
                        if (currentLineLeft < 0) {
                            currentLineLeft = glyphInfo.graphemeLayoutBounds[0];
                        }
                        if (currentLineTop < 0) {
                            currentLineTop = glyphInfo.graphemeLayoutBounds[1];
                        }
                        currentLineTop = Math.min(currentLineTop, glyphInfo.graphemeLayoutBounds[1]);
                        currentLineWidth =
                            glyphInfo.graphemeLayoutBounds[2] - currentLineLeft;
                        currentLineHeight = Math.max(currentLineHeight, glyphInfo.graphemeLayoutBounds[3] - currentLineTop);
                    }
                }
                result.push({
                    rect: new Float32Array([
                        currentLineLeft,
                        currentLineTop,
                        currentLineLeft + currentLineWidth,
                        currentLineTop + currentLineHeight,
                    ]),
                    dir: { value: skia_1.TextDirection.LTR },
                });
            }
        });
        if (result.length === 0) {
            const lastSpan = this.spans[this.spans.length - 1];
            const lastLine = this._textLayout.lineMetrics[this._textLayout.lineMetrics.length - 1];
            if (end > lastLine.endIndex &&
                lastSpan instanceof span_1.TextSpan &&
                lastSpan.text.endsWith("\n")) {
                return [
                    {
                        rect: new Float32Array([
                            0,
                            lastLine.yOffset,
                            0,
                            lastLine.yOffset + lastLine.height,
                        ]),
                        dir: { value: skia_1.TextDirection.LTR },
                    },
                ];
            }
        }
        return result;
    }
    /**
     * Finds the first and last glyphs that define a word containing the glyph at index offset.
     * @param offset
     */
    getWordBoundary(offset) {
        return { start: offset, end: offset };
    }
    /**
     * Returns an array of ShapedLine objects, describing the paragraph.
     */
    getShapedLines() {
        return [];
    }
    /**
     * Lays out the text in the paragraph so it is wrapped to the given width.
     * @param width
     */
    layout(width) {
        this.imageDataCache = undefined;
        this._textLayout.layout(width);
    }
    /**
     * When called after shaping, returns the glyph IDs which were not matched
     * by any of the provided fonts.
     */
    unresolvedCodepoints() {
        return [];
    }
}
exports.Paragraph = Paragraph;

},{"../impl/drawer":4,"../impl/layout":5,"../impl/span":6,"../logger":8,"./skia":3}],2:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParagraphBuilder = void 0;
const span_1 = require("../impl/span");
const logger_1 = require("../logger");
const paragraph_1 = require("./paragraph");
const skia_1 = require("./skia");
class ParagraphBuilder extends skia_1.SkEmbindObject {
    static MakeFromFontCollection(originMakeFromFontCollectionMethod, style, fontCollection) {
        var _a;
        const fontFamilies = (_a = style.textStyle) === null || _a === void 0 ? void 0 : _a.fontFamilies;
        if (fontFamilies && fontFamilies[0] === "MiniTex") {
            logger_1.logger.info("use minitex paragraph builder.", fontFamilies);
            return new ParagraphBuilder(style);
        }
        else {
            logger_1.logger.info("use skia paragraph builder.", fontFamilies);
            return originMakeFromFontCollectionMethod(style, fontCollection);
        }
    }
    constructor(style) {
        super();
        this.style = style;
        this.isMiniTex = true;
        this.spans = [];
        this.styles = [];
    }
    /**
     * Pushes the information required to leave an open space.
     * @param width
     * @param height
     * @param alignment
     * @param baseline
     * @param offset
     */
    addPlaceholder(width, height, alignment, baseline, offset) { }
    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(str) {
        logger_1.logger.debug("ParagraphBuilder.addText", str);
        let mergedStyle = {};
        this.styles.forEach((it) => {
            Object.assign(mergedStyle, it);
        });
        const span = new span_1.TextSpan(str, mergedStyle);
        this.spans.push(span);
    }
    /**
     * Returns a Paragraph object that can be used to be layout and paint the text to an
     * Canvas.
     */
    build() {
        return new paragraph_1.Paragraph(this.spans, this.style);
    }
    /**
     * @param words is an array of word edges (starting or ending). You can
     * pass 2 elements (0 as a start of the entire text and text.size as the
     * end). This information is only needed for a specific API method getWords.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setWordsUtf8(words) { }
    /**
     * @param words is an array of word edges (starting or ending). You can
     * pass 2 elements (0 as a start of the entire text and text.size as the
     * end). This information is only needed for a specific API method getWords.
     *
     * The indices are expected to be relative to the UTF-16 representation of
     * the text.
     *
     * The `Intl.Segmenter` API can be used as a source for this data.
     */
    setWordsUtf16(words) { }
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setGraphemeBreaksUtf8(graphemes) { }
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-16 representation of
     * the text.
     *
     * The `Intl.Segmenter` API can be used as a source for this data.
     */
    setGraphemeBreaksUtf16(graphemes) { }
    /**
     * @param lineBreaks is an array of unsigned integers that should be
     * treated as pairs (index, break type) that point to the places of possible
     * line breaking if needed. It should include 0 as the first element.
     * Break type == 0 means soft break, break type == 1 is a hard break.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setLineBreaksUtf8(lineBreaks) { }
    /**
     * @param lineBreaks is an array of unsigned integers that should be
     * treated as pairs (index, break type) that point to the places of possible
     * line breaking if needed. It should include 0 as the first element.
     * Break type == 0 means soft break, break type == 1 is a hard break.
     *
     * The indices are expected to be relative to the UTF-16 representation of
     * the text.
     *
     * Chrome's `v8BreakIterator` API can be used as a source for this data.
     */
    setLineBreaksUtf16(lineBreaks) { }
    /**
     * Returns the entire Paragraph text (which is useful in case that text
     * was produced as a set of addText calls).
     */
    getText() {
        let text = "";
        this.spans.forEach((it) => {
            if (it instanceof span_1.TextSpan) {
                text += it.text;
            }
        });
        if (typeof window === "object" && window.TextEncoder) {
            const encoder = new window.TextEncoder();
            const view = encoder.encode(text);
            return String.fromCharCode(...Array.from(view));
        }
        return text;
    }
    /**
     * Remove a style from the stack. Useful to apply different styles to chunks
     * of text such as bolding.
     */
    pop() {
        logger_1.logger.debug("ParagraphBuilder.pop");
        this.styles.pop();
    }
    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(textStyle) {
        logger_1.logger.debug("ParagraphBuilder.pushStyle", textStyle);
        this.styles.push(textStyle);
    }
    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle, fg, bg) {
        logger_1.logger.debug("ParagraphBuilder.pushPaintStyle", textStyle, fg, bg);
        this.styles.push(textStyle);
    }
    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset() {
        logger_1.logger.debug("ParagraphBuilder.reset");
        this.spans = [];
        this.styles = [];
    }
}
exports.ParagraphBuilder = ParagraphBuilder;

},{"../impl/span":6,"../logger":8,"./paragraph":1,"./skia":3}],3:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationStyle = exports.FontSlant = exports.FontWidth = exports.FontWeight = exports.LineThroughDecoration = exports.OverlineDecoration = exports.UnderlineDecoration = exports.NoDecoration = exports.TextAlign = exports.Affinity = exports.RectWidthStyle = exports.RectHeightStyle = exports.TextDirection = exports.TextBaseline = exports.StrokeJoin = exports.StrokeCap = exports.PlaceholderAlignment = exports.SkEmbindObject = void 0;
class SkEmbindObject {
    constructor() {
        this._type = "";
        this._deleted = false;
    }
    delete() {
        this._deleted = true;
    }
    deleteLater() {
        this._deleted = true;
    }
    isAliasOf(other) {
        return other._type === this._type;
    }
    isDeleted() {
        return this._deleted;
    }
}
exports.SkEmbindObject = SkEmbindObject;
var PlaceholderAlignment;
(function (PlaceholderAlignment) {
    PlaceholderAlignment["Baseline"] = "Baseline";
    PlaceholderAlignment["AboveBaseline"] = "AboveBaseline";
    PlaceholderAlignment["BelowBaseline"] = "BelowBaseline";
    PlaceholderAlignment["Top"] = "Top";
    PlaceholderAlignment["Bottom"] = "Bottom";
    PlaceholderAlignment["Middle"] = "Middle";
})(PlaceholderAlignment || (exports.PlaceholderAlignment = PlaceholderAlignment = {}));
var StrokeCap;
(function (StrokeCap) {
    StrokeCap["Butt"] = "Butt";
    StrokeCap["Round"] = "Round";
    StrokeCap["Square"] = "Square";
})(StrokeCap || (exports.StrokeCap = StrokeCap = {}));
var StrokeJoin;
(function (StrokeJoin) {
    StrokeJoin["Bevel"] = "Bevel";
    StrokeJoin["Miter"] = "Miter";
    StrokeJoin["Round"] = "Round";
})(StrokeJoin || (exports.StrokeJoin = StrokeJoin = {}));
var TextBaseline;
(function (TextBaseline) {
    TextBaseline[TextBaseline["Alphabetic"] = 0] = "Alphabetic";
    TextBaseline[TextBaseline["Ideographic"] = 1] = "Ideographic";
})(TextBaseline || (exports.TextBaseline = TextBaseline = {}));
var TextDirection;
(function (TextDirection) {
    TextDirection[TextDirection["RTL"] = 0] = "RTL";
    TextDirection[TextDirection["LTR"] = 1] = "LTR";
})(TextDirection || (exports.TextDirection = TextDirection = {}));
var RectHeightStyle;
(function (RectHeightStyle) {
    RectHeightStyle[RectHeightStyle["Tight"] = 0] = "Tight";
    RectHeightStyle[RectHeightStyle["Max"] = 1] = "Max";
    RectHeightStyle[RectHeightStyle["IncludeLineSpacingMiddle"] = 2] = "IncludeLineSpacingMiddle";
    RectHeightStyle[RectHeightStyle["IncludeLineSpacingTop"] = 3] = "IncludeLineSpacingTop";
    RectHeightStyle[RectHeightStyle["IncludeLineSpacingBottom"] = 4] = "IncludeLineSpacingBottom";
    RectHeightStyle[RectHeightStyle["Strut"] = 5] = "Strut";
})(RectHeightStyle || (exports.RectHeightStyle = RectHeightStyle = {}));
var RectWidthStyle;
(function (RectWidthStyle) {
    RectWidthStyle[RectWidthStyle["Tight"] = 0] = "Tight";
    RectWidthStyle[RectWidthStyle["Max"] = 1] = "Max";
})(RectWidthStyle || (exports.RectWidthStyle = RectWidthStyle = {}));
var Affinity;
(function (Affinity) {
    Affinity[Affinity["Upstream"] = 0] = "Upstream";
    Affinity[Affinity["Downstream"] = 1] = "Downstream";
})(Affinity || (exports.Affinity = Affinity = {}));
var TextAlign;
(function (TextAlign) {
    TextAlign[TextAlign["Left"] = 0] = "Left";
    TextAlign[TextAlign["Right"] = 1] = "Right";
    TextAlign[TextAlign["Center"] = 2] = "Center";
    TextAlign[TextAlign["Justify"] = 3] = "Justify";
    TextAlign[TextAlign["Start"] = 4] = "Start";
    TextAlign[TextAlign["End"] = 5] = "End";
})(TextAlign || (exports.TextAlign = TextAlign = {}));
exports.NoDecoration = 0;
exports.UnderlineDecoration = 1;
exports.OverlineDecoration = 2;
exports.LineThroughDecoration = 4;
var FontWeight;
(function (FontWeight) {
    FontWeight[FontWeight["Invisible"] = 0] = "Invisible";
    FontWeight[FontWeight["Thin"] = 100] = "Thin";
    FontWeight[FontWeight["ExtraLight"] = 200] = "ExtraLight";
    FontWeight[FontWeight["Light"] = 300] = "Light";
    FontWeight[FontWeight["Normal"] = 400] = "Normal";
    FontWeight[FontWeight["Medium"] = 500] = "Medium";
    FontWeight[FontWeight["SemiBold"] = 600] = "SemiBold";
    FontWeight[FontWeight["Bold"] = 700] = "Bold";
    FontWeight[FontWeight["ExtraBold"] = 800] = "ExtraBold";
    FontWeight[FontWeight["Black"] = 900] = "Black";
    FontWeight[FontWeight["ExtraBlack"] = 1000] = "ExtraBlack";
})(FontWeight || (exports.FontWeight = FontWeight = {}));
var FontWidth;
(function (FontWidth) {
    FontWidth[FontWidth["UltraCondensed"] = 0] = "UltraCondensed";
    FontWidth[FontWidth["ExtraCondensed"] = 1] = "ExtraCondensed";
    FontWidth[FontWidth["Condensed"] = 2] = "Condensed";
    FontWidth[FontWidth["SemiCondensed"] = 3] = "SemiCondensed";
    FontWidth[FontWidth["Normal"] = 4] = "Normal";
    FontWidth[FontWidth["SemiExpanded"] = 5] = "SemiExpanded";
    FontWidth[FontWidth["Expanded"] = 6] = "Expanded";
    FontWidth[FontWidth["ExtraExpanded"] = 7] = "ExtraExpanded";
    FontWidth[FontWidth["UltraExpanded"] = 8] = "UltraExpanded";
})(FontWidth || (exports.FontWidth = FontWidth = {}));
var FontSlant;
(function (FontSlant) {
    FontSlant[FontSlant["Upright"] = 0] = "Upright";
    FontSlant[FontSlant["Italic"] = 1] = "Italic";
    FontSlant[FontSlant["Oblique"] = 2] = "Oblique";
})(FontSlant || (exports.FontSlant = FontSlant = {}));
var DecorationStyle;
(function (DecorationStyle) {
    DecorationStyle[DecorationStyle["Solid"] = 0] = "Solid";
    DecorationStyle[DecorationStyle["Double"] = 1] = "Double";
    DecorationStyle[DecorationStyle["Dotted"] = 2] = "Dotted";
    DecorationStyle[DecorationStyle["Dashed"] = 3] = "Dashed";
    DecorationStyle[DecorationStyle["Wavy"] = 4] = "Wavy";
})(DecorationStyle || (exports.DecorationStyle = DecorationStyle = {}));

},{}],4:[function(require,module,exports){
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
                    const drawingLeft = (() => {
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
                            return context.measureText(currentDrawText).width;
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
                    context.fillText(currentDrawText, drawingLeft, textBaseline + currentDrawLine.yOffset);
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

},{"../adapter/skia":3,"../logger":8,"../util":9,"./span":6}],5:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLayout = void 0;
const skia_1 = require("../adapter/skia");
const skia_2 = require("../adapter/skia");
const logger_1 = require("../logger");
const util_1 = require("../util");
const span_1 = require("./span");
class LetterMeasurer {
    static measureLetters(span, context) {
        let result = [0];
        let curPosWidth = 0;
        for (let index = 0; index < span.text.length; index++) {
            const letter = span.text[index];
            const wordWidth = (() => {
                if ((0, util_1.isSquareCharacter)(letter)) {
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
    constructor(paragraph) {
        this.paragraph = paragraph;
        this.glyphInfos = [];
        this.lineMetrics = [];
        this.didExceedMaxLines = false;
        this.previousLayoutWidth = 0;
    }
    initCanvas() {
        if (!TextLayout.sharedLayoutCanvas) {
            TextLayout.sharedLayoutCanvas = (0, util_1.createCanvas)(1, 1);
            TextLayout.sharedLayoutContext =
                TextLayout.sharedLayoutCanvas.getContext("2d");
        }
    }
    measureGlyphIfNeeded() {
        if (Object.keys(this.glyphInfos).length <= 0) {
            this.layout(-1, true);
        }
    }
    layout(layoutWidth, forceCalcGlyphInfos = false) {
        var _a;
        let layoutStartTime;
        if (logger_1.logger.profileMode) {
            layoutStartTime = new Date().getTime();
        }
        if (layoutWidth < 0) {
            layoutWidth = this.previousLayoutWidth;
        }
        else {
            this.previousLayoutWidth = layoutWidth;
        }
        this.initCanvas();
        this.glyphInfos = [];
        let currentLineMetrics = {
            startIndex: 0,
            endIndex: 0,
            endExcludingWhitespaces: 0,
            endIncludingNewline: 0,
            isHardBreak: false,
            ascent: 0,
            descent: 0,
            height: 0,
            heightMultiplier: Math.max(1, ((_a = this.paragraph.paragraphStyle.heightMultiplier) !== null && _a !== void 0 ? _a : 1.5) / 1.5),
            width: 0,
            left: 0,
            yOffset: 0,
            baseline: 0,
            lineNumber: 0,
        };
        let lineMetrics = [];
        const spans = (0, span_1.spanWithNewline)(this.paragraph.spans);
        spans.forEach((span) => {
            var _a, _b, _c;
            if (span instanceof span_1.TextSpan) {
                TextLayout.sharedLayoutContext.font = span.toCanvasFont();
                const matrics = TextLayout.sharedLayoutContext.measureText(span.text);
                if (!matrics.fontBoundingBoxAscent) {
                    const mHeight = TextLayout.sharedLayoutContext.measureText("M").width;
                    currentLineMetrics.ascent = mHeight * 1.15;
                    currentLineMetrics.descent = mHeight * 0.35;
                    span.letterBaseline = mHeight * 1.15;
                    span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
                }
                else {
                    currentLineMetrics.ascent = matrics.fontBoundingBoxAscent;
                    currentLineMetrics.descent = matrics.fontBoundingBoxDescent;
                    span.letterBaseline = matrics.fontBoundingBoxAscent;
                    span.letterHeight =
                        matrics.fontBoundingBoxAscent + matrics.fontBoundingBoxDescent;
                }
                if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
                    currentLineMetrics.heightMultiplier = Math.max(currentLineMetrics.heightMultiplier, span.style.heightMultiplier / 1.5);
                }
                currentLineMetrics.height = Math.max(currentLineMetrics.height, currentLineMetrics.ascent + currentLineMetrics.descent);
                currentLineMetrics.baseline = Math.max(currentLineMetrics.baseline, currentLineMetrics.ascent);
                if (currentLineMetrics.width + matrics.width < layoutWidth &&
                    !forceCalcGlyphInfos) {
                    if (span instanceof span_1.NewlineSpan) {
                        const newLineMatrics = this.createNewLine(currentLineMetrics);
                        lineMetrics.push(currentLineMetrics);
                        currentLineMetrics = newLineMatrics;
                    }
                    else {
                        currentLineMetrics.endIndex += span.text.length;
                        currentLineMetrics.width += matrics.width;
                        if (((_b = (_a = span.style.fontStyle) === null || _a === void 0 ? void 0 : _a.slant) === null || _b === void 0 ? void 0 : _b.value) === skia_2.FontSlant.Italic) {
                            currentLineMetrics.width += 2;
                        }
                    }
                }
                else {
                    let advances = matrics.advances
                        ? [...matrics.advances]
                        : LetterMeasurer.measureLetters(span, TextLayout.sharedLayoutContext);
                    advances.push(matrics.width);
                    if (span instanceof span_1.NewlineSpan) {
                        advances = [0, 0];
                    }
                    let currentWord = "";
                    let currentWordWidth = 0;
                    let currentWordLength = 0;
                    let nextWordWidth = 0;
                    let canBreak = true;
                    let forceBreak = false;
                    for (let index = 0; index < span.text.length; index++) {
                        const letter = span.text[index];
                        currentWord += letter;
                        let currentLetterLeft = currentWordWidth;
                        let nextWord = (_c = currentWord + span.text[index + 1]) !== null && _c !== void 0 ? _c : "";
                        if (advances[index + 1] === undefined) {
                            currentWordWidth += advances[index] - advances[index - 1];
                        }
                        else {
                            currentWordWidth += advances[index + 1] - advances[index];
                        }
                        if (advances[index + 2] === undefined) {
                            nextWordWidth = currentWordWidth;
                        }
                        else {
                            nextWordWidth =
                                currentWordWidth + (advances[index + 2] - advances[index + 1]);
                        }
                        currentWordLength += 1;
                        canBreak = true;
                        forceBreak = false;
                        if ((0, util_1.isEnglishWord)(nextWord)) {
                            canBreak = false;
                        }
                        if ((0, util_1.isPunctuation)(nextWord[nextWord.length - 1]) &&
                            currentLineMetrics.width + nextWordWidth >= layoutWidth) {
                            forceBreak = true;
                        }
                        if (span instanceof span_1.NewlineSpan) {
                            forceBreak = true;
                        }
                        const currentGlyphLeft = currentLineMetrics.width + currentLetterLeft;
                        const currentGlyphTop = currentLineMetrics.yOffset;
                        const currentGlyphWidth = (() => {
                            if (advances[index + 1] === undefined) {
                                return advances[index] - advances[index - 1];
                            }
                            else {
                                return advances[index + 1] - advances[index];
                            }
                        })();
                        const currentGlyphHeight = currentLineMetrics.height;
                        const currentGlyphInfo = {
                            graphemeLayoutBounds: (0, util_1.valueOfRectXYWH)(currentGlyphLeft, currentGlyphTop, currentGlyphWidth, currentGlyphHeight),
                            graphemeClusterTextRange: { start: index, end: index + 1 },
                            dir: { value: skia_1.TextDirection.LTR },
                            isEllipsis: false,
                        };
                        this.glyphInfos.push(currentGlyphInfo);
                        if (!canBreak) {
                            continue;
                        }
                        else if (!forceBreak &&
                            currentLineMetrics.width + currentWordWidth < layoutWidth) {
                            currentLineMetrics.width += currentWordWidth;
                            currentLineMetrics.endIndex += currentWordLength;
                            currentWord = "";
                            currentWordWidth = 0;
                            currentWordLength = 0;
                            canBreak = true;
                        }
                        else if (forceBreak ||
                            currentLineMetrics.width + currentWordWidth >= layoutWidth) {
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
                    if (currentWord.length > 0) {
                        currentLineMetrics.width += currentWordWidth;
                        currentLineMetrics.endIndex += currentWordLength;
                    }
                }
            }
        });
        lineMetrics.push(currentLineMetrics);
        if (this.paragraph.paragraphStyle.maxLines &&
            lineMetrics.length > this.paragraph.paragraphStyle.maxLines) {
            this.didExceedMaxLines = true;
            lineMetrics = lineMetrics.slice(0, this.paragraph.paragraphStyle.maxLines);
        }
        else {
            this.didExceedMaxLines = false;
        }
        logger_1.logger.debug("TextLayout.layout.lineMetrics", lineMetrics);
        if (logger_1.logger.profileMode) {
            const layoutCostTime = new Date().getTime() - layoutStartTime;
            logger_1.logger.profile("Layout cost", layoutCostTime);
        }
        this.lineMetrics = lineMetrics;
    }
    createNewLine(currentLineMetrics) {
        var _a;
        return {
            startIndex: currentLineMetrics.endIndex,
            endIndex: currentLineMetrics.endIndex,
            endExcludingWhitespaces: 0,
            endIncludingNewline: 0,
            isHardBreak: false,
            ascent: currentLineMetrics.ascent,
            descent: currentLineMetrics.descent,
            height: currentLineMetrics.height,
            heightMultiplier: Math.max(1, ((_a = this.paragraph.paragraphStyle.heightMultiplier) !== null && _a !== void 0 ? _a : 1.5) / 1.5),
            width: 0,
            left: 0,
            yOffset: currentLineMetrics.yOffset +
                currentLineMetrics.height * currentLineMetrics.heightMultiplier +
                currentLineMetrics.height * 0.15, // 行间距
            baseline: currentLineMetrics.baseline,
            lineNumber: currentLineMetrics.lineNumber + 1,
        };
    }
}
exports.TextLayout = TextLayout;

},{"../adapter/skia":3,"../logger":8,"../util":9,"./span":6}],6:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.spanWithNewline = exports.NewlineSpan = exports.TextSpan = exports.Span = void 0;
const skia_1 = require("../adapter/skia");
const util_1 = require("../util");
class Span {
    constructor() {
        this.letterBaseline = 0;
        this.letterHeight = 0;
        this.lettersBounding = [];
    }
}
exports.Span = Span;
class TextSpan extends Span {
    constructor(text, style) {
        super();
        this.text = text;
        this.style = style;
    }
    toBackgroundFillStyle() {
        if (this.style.backgroundColor) {
            return (0, util_1.colorToHex)(this.style.backgroundColor);
        }
        else {
            return "#000000";
        }
    }
    toTextFillStyle() {
        if (this.style.color) {
            return (0, util_1.colorToHex)(this.style.color);
        }
        else {
            return "#000000";
        }
    }
    toDecorationStrokeStyle() {
        if (this.style.decorationColor) {
            return (0, util_1.colorToHex)(this.style.decorationColor);
        }
        else {
            return "#000000";
        }
    }
    toCanvasFont() {
        var _a, _b, _c, _d;
        let font = `${this.style.fontSize}px system-ui, Roboto`;
        const fontWeight = (_b = (_a = this.style.fontStyle) === null || _a === void 0 ? void 0 : _a.weight) === null || _b === void 0 ? void 0 : _b.value;
        if (fontWeight && fontWeight !== 400) {
            if (fontWeight >= 900) {
                font = "900 " + font;
            }
            else {
                font = fontWeight.toFixed(0) + " " + font;
            }
        }
        const slant = (_d = (_c = this.style.fontStyle) === null || _c === void 0 ? void 0 : _c.slant) === null || _d === void 0 ? void 0 : _d.value;
        if (slant) {
            switch (slant) {
                case skia_1.FontSlant.Italic:
                    font = "italic " + font;
                    break;
                case skia_1.FontSlant.Oblique:
                    font = "oblique " + font;
                    break;
            }
        }
        return font;
    }
}
exports.TextSpan = TextSpan;
class NewlineSpan extends TextSpan {
    constructor() {
        super("\n", {});
    }
}
exports.NewlineSpan = NewlineSpan;
const spanWithNewline = (spans) => {
    let result = [];
    spans.forEach((span) => {
        if (span instanceof TextSpan) {
            if (span.text.indexOf("\n") >= 0) {
                const components = span.text.split("\n");
                for (let index = 0; index < components.length; index++) {
                    const component = components[index];
                    if (index > 0) {
                        result.push(new NewlineSpan());
                    }
                    result.push(new TextSpan(component, span.style));
                }
                return;
            }
        }
        result.push(span);
    });
    return result;
};
exports.spanWithNewline = spanWithNewline;

},{"../adapter/skia":3,"../util":9}],7:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniTex = void 0;
const drawer_1 = require("./impl/drawer");
const paragraph_1 = require("./adapter/paragraph");
const paragraph_builder_1 = require("./adapter/paragraph_builder");
// import { logger } from "./logger";
class MiniTex {
    static install(canvasKit, pixelRatio) {
        // logger.profileMode = true;
        drawer_1.Drawer.pixelRatio = pixelRatio;
        const originMakeFromFontCollectionMethod = canvasKit.ParagraphBuilder.MakeFromFontCollection;
        canvasKit.ParagraphBuilder.MakeFromFontCollection = function (style, fontCollection) {
            return paragraph_builder_1.ParagraphBuilder.MakeFromFontCollection(originMakeFromFontCollectionMethod, style, fontCollection);
        };
        const originDrawParagraphMethod = canvasKit.Canvas.prototype.drawParagraph;
        canvasKit.Canvas.prototype.drawParagraph = function (paragraph, dx, dy) {
            if (paragraph.isMiniTex === true) {
                (0, paragraph_1.drawParagraph)(canvasKit, this, paragraph, dx, dy);
            }
            else {
                originDrawParagraphMethod.apply(this, [paragraph, dx, dy]);
            }
        };
    }
}
exports.MiniTex = MiniTex;

},{"./adapter/paragraph":1,"./adapter/paragraph_builder":2,"./impl/drawer":4}],8:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor(logLevel = LogLevel.ERROR) {
        this.profileMode = false;
        this.logLevel = logLevel;
    }
    setLogLevel(logLevel = LogLevel.DEBUG) {
        this.logLevel = logLevel;
    }
    log(level, ...args) {
        if (level >= this.logLevel) {
            const message = args.length === 1 ? args[0] : args;
            console.log(`[${LogLevel[level]}]`, ...message);
        }
    }
    debug(...args) {
        this.log(LogLevel.DEBUG, ...args);
    }
    info(...args) {
        this.log(LogLevel.INFO, ...args);
    }
    warn(...args) {
        this.log(LogLevel.WARN, ...args);
    }
    error(...args) {
        this.log(LogLevel.ERROR, ...args);
    }
    profile(...args) {
        if (this.profileMode) {
            console.info("[PROFILE]", ...args);
        }
    }
}
exports.Logger = Logger;
exports.logger = new Logger(LogLevel.ERROR);

},{}],9:[function(require,module,exports){
"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanvas = exports.convertToUpwardToPixelRatio = exports.isPunctuation = exports.isSquareCharacter = exports.isEnglishWord = exports.valueOfRectXYWH = exports.valueOfRGBAInt = exports.colorToHex = void 0;
const colorToHex = (rgbaColor) => {
    const r = Math.round(rgbaColor[0] * 255).toString(16);
    const g = Math.round(rgbaColor[1] * 255).toString(16);
    const b = Math.round(rgbaColor[2] * 255).toString(16);
    const a = Math.round(rgbaColor[3] * 255).toString(16);
    const padHex = (hex) => (hex.length === 1 ? "0" + hex : hex);
    const hexColor = "#" + padHex(r) + padHex(g) + padHex(b) + padHex(a);
    return hexColor;
};
exports.colorToHex = colorToHex;
const valueOfRGBAInt = (r, g, b, a) => {
    return Float32Array.from([r, g, b, a]);
};
exports.valueOfRGBAInt = valueOfRGBAInt;
const valueOfRectXYWH = (x, y, w, h) => {
    return Float32Array.from([x, y, x + w, y + h]);
};
exports.valueOfRectXYWH = valueOfRectXYWH;
function isEnglishWord(str) {
    const englishRegex = /^[A-Za-z]+$/;
    const result = englishRegex.test(str);
    return result;
}
exports.isEnglishWord = isEnglishWord;
function isSquareCharacter(str) {
    const squareCharacterRange = /[\u4e00-\u9fa5]/;
    return squareCharacterRange.test(str);
}
exports.isSquareCharacter = isSquareCharacter;
const mapOfPunctuation = {
    "！": 1,
    "？": 1,
    "｡": 1,
    "，": 1,
    "、": 1,
    "“": 1,
    "”": 1,
    "‘": 1,
    "’": 1,
    "；": 1,
    "：": 1,
    "【": 1,
    "】": 1,
    "『": 1,
    "』": 1,
    "（": 1,
    "）": 1,
    "《": 1,
    "》": 1,
    "〈": 1,
    "〉": 1,
    "〔": 1,
    "〕": 1,
    "［": 1,
    "］": 1,
    "｛": 1,
    "｝": 1,
    "〖": 1,
    "〗": 1,
    "〘": 1,
    "〙": 1,
    "〚": 1,
    "〛": 1,
    "〝": 1,
    "〞": 1,
    "〟": 1,
    "﹏": 1,
    "…": 1,
    "—": 1,
    "～": 1,
    "·": 1,
    "•": 1,
    ",": 1,
    ".": 1,
};
function isPunctuation(char) {
    return mapOfPunctuation[char] === 1;
}
exports.isPunctuation = isPunctuation;
function convertToUpwardToPixelRatio(number, pixelRatio) {
    const upwardInt = Math.ceil(number);
    const remainder = upwardInt % pixelRatio;
    return remainder === 0 ? upwardInt : upwardInt + (pixelRatio - remainder);
}
exports.convertToUpwardToPixelRatio = convertToUpwardToPixelRatio;
function createCanvas(width, height) {
    if (typeof wx === "object") {
        return wx.createOffscreenCanvas({
            type: "2d",
            width: width,
            height: height,
        });
    }
    else if (typeof window === "object") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    else {
        throw "can not create canvas";
    }
}
exports.createCanvas = createCanvas;

},{}]},{},[7])(7)
});