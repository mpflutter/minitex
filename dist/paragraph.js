"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paragraph = exports.TextSpan = exports.Span = exports.drawParagraph = void 0;
const drawer_1 = require("./drawer");
const skia_1 = require("./skia");
const drawParagraph = function (CanvasKit, skCanvas, paragraph, dx, dy) {
    const drawer = new drawer_1.Drawer(paragraph);
    const imageData = drawer.draw();
    // const canvasImg = CanvasKit.MakeLazyImageFromTextureSource(imageData);
    const canvasImg = CanvasKit.MakeImage({
        width: imageData.width,
        height: imageData.height,
        alphaType: CanvasKit.AlphaType.Unpremul,
        colorType: CanvasKit.ColorType.RGBA_8888,
        colorSpace: CanvasKit.ColorSpace.SRGB,
    }, imageData.data, 4 * imageData.width);
    const srcRect = CanvasKit.XYWHRect(0, 0, imageData.width, imageData.height);
    const dstRect = CanvasKit.XYWHRect(dx, dy, imageData.width / drawer_1.Drawer.pixelRatio, imageData.height / drawer_1.Drawer.pixelRatio);
    const skPaint = new CanvasKit.Paint();
    skCanvas.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
};
exports.drawParagraph = drawParagraph;
class Span {
}
exports.Span = Span;
class TextSpan extends Span {
    constructor(text, style) {
        super();
        this.text = text;
        this.style = style;
    }
    toCanvasFillStyle() {
        const rgbaColor = this.style.color;
        const r = Math.round(rgbaColor[0] * 255).toString(16);
        const g = Math.round(rgbaColor[1] * 255).toString(16);
        const b = Math.round(rgbaColor[2] * 255).toString(16);
        const a = Math.round(rgbaColor[3] * 255).toString(16);
        const padHex = (hex) => (hex.length === 1 ? "0" + hex : hex);
        const hexColor = "#" + padHex(r) + padHex(g) + padHex(b) + padHex(a);
        return hexColor;
    }
    toCanvasFont() {
        let font = `${this.style.fontSize}px `;
        if (this.style.fontFamilies) {
            this.style.fontFamilies.forEach((it, idx) => {
                if (idx > 0) {
                    font += ",";
                }
                font += `"${it}"`;
            });
        }
        return font;
    }
}
exports.TextSpan = TextSpan;
class Paragraph extends skia_1.EmbindObject {
    constructor(spans) {
        super();
        this.spans = spans;
        this._lineMetrics = [];
    }
    didExceedMaxLines() {
        return false;
    }
    getAlphabeticBaseline() {
        return 0;
    }
    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx, dy) {
        return { pos: 0, affinity: {} };
        throw "getGlyphPositionAtCoordinate todo";
    }
    /**
     * Returns the information associated with the closest glyph at the specified
     * paragraph coordinate, or null if the paragraph is empty.
     */
    getClosestGlyphInfoAtCoordinate(dx, dy) {
        return null;
    }
    /**
     * Returns the information associated with the glyph at the specified UTF-16
     * offset within the paragraph's visible lines, or null if the index is out
     * of bounds, or points to a codepoint that is logically after the last
     * visible codepoint.
     */
    getGlyphInfoAt(index) {
        return null;
    }
    getHeight() {
        const lineMetrics = this.getLineMetrics();
        console.log(lineMetrics);
        let height = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            height += lineMetrics[i].height;
        }
        console.log("getHeight", height);
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
        return 0;
    }
    getLineMetrics() {
        return this._lineMetrics;
    }
    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber) {
        var _a;
        return (_a = this._lineMetrics[lineNumber]) !== null && _a !== void 0 ? _a : null;
    }
    getLineMetricsOfRange(start, end) {
        let lineMetrics = [];
        this._lineMetrics.forEach((it) => {
            if (start <= it.startIndex && end >= it.endIndex) {
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
        console.log("getMaxIntrinsicWidth", maxWidth);
        return maxWidth;
    }
    getMaxWidth() {
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, lineMetrics[i].width);
        }
        console.log("getMaxWidth", maxWidth);
        return maxWidth;
    }
    getMinIntrinsicWidth() {
        const lineMetrics = this.getLineMetrics();
        let width = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            width = Math.max(width, lineMetrics[i].width);
        }
        console.log("getMinIntrinsicWidth", width);
        return width;
    }
    /**
     * Returns the total number of visible lines in the paragraph.
     */
    getNumberOfLines() {
        return this._lineMetrics.length;
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
        return [];
    }
    /**
     * Finds the first and last glyphs that define a word containing the glyph at index offset.
     * @param offset
     */
    getWordBoundary(offset) {
        throw "getWordBoundary todo";
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
        new drawer_1.Drawer(this).layout(width);
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
