"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPolyfill = void 0;
const skia_1 = require("./adapter/skia");
const polyfill_types_1 = require("./polyfill.types");
const installPolyfill = (canvasKit) => {
    canvasKit.ParagraphBuilder = new _ParagraphBuilderFactory();
    canvasKit.FontCollection = new _FontCollectionFactory();
    canvasKit.FontMgr = new _FontMgrFactory();
    canvasKit.Typeface = new _TypefaceFactory();
    canvasKit.TypefaceFontProvider = new _TypefaceFontProviderFactory();
    canvasKit.Font = _Font;
    canvasKit.ParagraphStyle = (properties) => {
        return new _ParagraphStyle(properties);
    };
    canvasKit.TextStyle = (properties) => {
        return new _TextStyle(properties);
    };
    // Paragraph Enums
    canvasKit.TextAlign = new polyfill_types_1.TextAlignEnumValues();
    canvasKit.TextDirection = new polyfill_types_1.TextDirectionEnumValues();
    canvasKit.TextBaseline = new polyfill_types_1.TextBaselineEnumValues();
    canvasKit.RectHeightStyle = new polyfill_types_1.RectHeightStyleEnumValues();
    canvasKit.RectWidthStyle = new polyfill_types_1.RectWidthStyleEnumValues();
    canvasKit.Affinity = new polyfill_types_1.AffinityEnumValues();
    canvasKit.FontWeight = new polyfill_types_1.FontWeightEnumValues();
    canvasKit.FontWidth = new polyfill_types_1.FontWidthEnumValues();
    canvasKit.FontSlant = new polyfill_types_1.FontSlantEnumValues();
    canvasKit.DecorationStyle = new polyfill_types_1.DecorationStyleEnumValues();
    canvasKit.TextHeightBehavior = new polyfill_types_1.TextHeightBehaviorEnumValues();
    // Paragraph Constants
    canvasKit.NoDecoration = 0;
    canvasKit.UnderlineDecoration = 1;
    canvasKit.OverlineDecoration = 2;
    canvasKit.LineThroughDecoration = 3;
};
exports.installPolyfill = installPolyfill;
class _ParagraphBuilderFactory {
    Make(style, fontManager) {
        return this.MakeFromFontCollection(style, {});
    }
    MakeFromFontCollection(style, fontCollection) {
        throw new Error("Method not implemented.");
    }
    RequiresClientICU() {
        return false;
    }
}
class _ParagraphStyle extends skia_1.SkEmbindObject {
    constructor(properties) {
        super();
        Object.assign(this, properties);
    }
}
class _TextStyle extends skia_1.SkEmbindObject {
    constructor(properties) {
        super();
        Object.assign(this, properties);
    }
}
class _FontCollection extends skia_1.SkEmbindObject {
    setDefaultFontManager(fontManager) { }
    enableFontFallback() { }
}
class _FontCollectionFactory {
    Make() {
        return new _FontCollection();
    }
}
class _FontMgr extends skia_1.SkEmbindObject {
    countFamilies() {
        return 0;
    }
    getFamilyName(index) {
        return "";
    }
}
class _FontMgrFactory {
    FromData(...buffers) {
        return new _FontMgr();
    }
}
class _TypefaceFactory {
    GetDefault() {
        throw new Error("_TypefaceFactory GetDefault Method not implemented.");
    }
    MakeTypefaceFromData(fontData) {
        throw new Error("_TypefaceFactory MakeTypefaceFromData Method not implemented.");
    }
    MakeFreeTypeFaceFromData(fontData) {
        return new _Typeface();
    }
}
class _TypefaceFontProvider extends skia_1.SkEmbindObject {
    registerFont(bytes, family) { }
    countFamilies() {
        return 0;
    }
    getFamilyName(index) {
        return "";
    }
}
class _TypefaceFontProviderFactory {
    Make() {
        return new _TypefaceFontProvider();
    }
}
class _Typeface extends skia_1.SkEmbindObject {
    getGlyphIDs(str, numCodePoints, output) {
        return new Uint16Array([]);
    }
}
class _Font extends skia_1.SkEmbindObject {
    constructor(face, size, scaleX, skewX) {
        super();
    }
    getMetrics() {
        throw new Error("getMetrics Method not implemented.");
    }
    getGlyphBounds(glyphs, paint, output) {
        return new Float32Array([0, 0, 0, 0]);
    }
    getGlyphIDs(str, numCodePoints, output) {
        return new Uint16Array([]);
    }
    getGlyphWidths(glyphs, paint, output) {
        throw new Error("getGlyphWidths Method not implemented.");
    }
    getGlyphIntercepts(glyphs, positions, top, bottom) {
        throw new Error("getGlyphIntercepts Method not implemented.");
    }
    getScaleX() {
        throw new Error("getScaleX Method not implemented.");
    }
    getSize() {
        throw new Error("getSize Method not implemented.");
    }
    getSkewX() {
        throw new Error("getSkewX Method not implemented.");
    }
    isEmbolden() {
        throw new Error("isEmbolden Method not implemented.");
    }
    getTypeface() {
        throw new Error("getTypeface Method not implemented.");
    }
    setEdging(edging) {
        throw new Error("setEdging Method not implemented.");
    }
    setEmbeddedBitmaps(embeddedBitmaps) {
        throw new Error("setEmbeddedBitmaps Method not implemented.");
    }
    setHinting(hinting) {
        throw new Error("setHinting Method not implemented.");
    }
    setLinearMetrics(linearMetrics) {
        throw new Error("setLinearMetrics Method not implemented.");
    }
    setScaleX(sx) {
        throw new Error("setScaleX Method not implemented.");
    }
    setSize(points) {
        throw new Error("setSize Method not implemented.");
    }
    setSkewX(sx) {
        throw new Error("setSkewX Method not implemented.");
    }
    setEmbolden(embolden) {
        throw new Error("setEmbolden Method not implemented.");
    }
    setSubpixel(subpixel) {
        throw new Error("setSubpixel Method not implemented.");
    }
    setTypeface(face) {
        throw new Error("setTypeface Method not implemented.");
    }
}
