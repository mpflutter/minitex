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
const util_1 = require("../util");
const skia_1 = require("./skia");
let drawParagraphSharedPaint;
const drawParagraph = function (CanvasKit, skCanvas, paragraph, dx, dy) {
    let drawStartTime;
    if (logger_1.logger.profileMode) {
        drawStartTime = new Date().getTime();
    }
    let canvasImg = paragraph.skImageCache;
    if (!canvasImg) {
        const drawer = new drawer_1.Drawer(paragraph);
        const imageData = drawer.draw();
        canvasImg = CanvasKit.MakeImage({
            width: imageData.width,
            height: imageData.height,
            alphaType: CanvasKit.AlphaType.Unpremul,
            colorType: CanvasKit.ColorType.RGBA_8888,
            colorSpace: CanvasKit.ColorSpace.SRGB,
        }, imageData.data, 4 * imageData.width);
        paragraph.skImageCache = canvasImg;
        paragraph.skImageWidth = imageData.width;
        paragraph.skImageHeight = imageData.height;
    }
    const srcRect = CanvasKit.XYWHRect(0, 0, paragraph.skImageWidth, paragraph.skImageHeight);
    const dstRect = CanvasKit.XYWHRect(Math.ceil(dx), Math.ceil(dy), paragraph.skImageWidth / drawer_1.Drawer.pixelRatio, paragraph.skImageHeight / drawer_1.Drawer.pixelRatio);
    const skPaint = drawParagraphSharedPaint !== null && drawParagraphSharedPaint !== void 0 ? drawParagraphSharedPaint : new CanvasKit.Paint();
    drawParagraphSharedPaint = skPaint;
    skCanvas.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
    if (logger_1.logger.profileMode) {
        const drawCostTime = new Date().getTime() - drawStartTime;
        logger_1.logger.profile("drawParagraph cost", drawCostTime);
    }
};
exports.drawParagraph = drawParagraph;
class Paragraph extends skia_1.SkEmbindObject {
    constructor(spans, paragraphStyle, iconFontData) {
        super();
        this.spans = spans;
        this.paragraphStyle = paragraphStyle;
        this.iconFontData = iconFontData;
        this._type = "SkParagraph";
        this.isMiniTex = true;
        this._textLayout = new layout_1.TextLayout(this);
        if (this.iconFontData) {
            this.iconFontMap = JSON.parse(this.iconFontData);
        }
    }
    delete() {
        if (this.skImageCache) {
            this.skImageCache.delete();
            this.skImageCache = undefined;
        }
        super.delete();
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
                        affinity: { value: skia_1.Affinity.Downstream },
                    };
                }
                else if (dx >= width) {
                    return {
                        pos: lineMetrics.endIndex,
                        affinity: { value: skia_1.Affinity.Downstream },
                    };
                }
            }
            if (dy >= top + height && isLastLine) {
                return {
                    pos: lineMetrics.endIndex,
                    affinity: { value: skia_1.Affinity.Downstream },
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
        var _a;
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, (_a = lineMetrics[i].justifyWidth) !== null && _a !== void 0 ? _a : lineMetrics[i].width);
        }
        // console.log("getMaxIntrinsicWidth", maxWidth);
        return maxWidth;
    }
    getMaxWidth() {
        var _a;
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, (_a = lineMetrics[i].justifyWidth) !== null && _a !== void 0 ? _a : lineMetrics[i].width);
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
                    rect: (0, util_1.makeFloat32Array)([
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
                lastSpan.originText.endsWith("\n")) {
                return [
                    {
                        rect: (0, util_1.makeFloat32Array)([
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
        if (this.skImageCache) {
            this.skImageCache.delete();
        }
        this.skImageCache = undefined;
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
