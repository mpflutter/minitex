"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPolyfill = void 0;
const skia_1 = require("./adapter/skia");
const polyfill_types_1 = require("./polyfill.types");
const util_1 = require("./util");
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
    canvasKit.PlaceholderAlignment = new polyfill_types_1.PlaceholderAlignmentEnumValues();
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
        throw new Error("MakeFromFontCollection not implemented.");
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
        return new _Typeface();
    }
    MakeTypefaceFromData(fontData) {
        return new _Typeface();
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
        return (0, util_1.makeUint16Array)([]);
    }
}
class _Font extends skia_1.SkEmbindObject {
    constructor(face, size, scaleX, skewX) {
        super();
    }
    getMetrics() {
        return { ascent: 0, descent: 0, leading: 0 };
    }
    getGlyphBounds(glyphs, paint, output) {
        return (0, util_1.makeFloat32Array)([0, 0, 0, 0]);
    }
    getGlyphIDs(str, numCodePoints, output) {
        return (0, util_1.makeUint16Array)([]);
    }
    getGlyphWidths(glyphs, paint, output) {
        return (0, util_1.makeFloat32Array)([]);
    }
    getGlyphIntercepts(glyphs, positions, top, bottom) {
        return (0, util_1.makeFloat32Array)([]);
    }
    getScaleX() {
        return 1;
    }
    getSize() {
        return 0;
    }
    getSkewX() {
        return 1;
    }
    isEmbolden() {
        return false;
    }
    getTypeface() {
        return new _Typeface();
    }
    setEdging(edging) { }
    setEmbeddedBitmaps(embeddedBitmaps) { }
    setHinting(hinting) { }
    setLinearMetrics(linearMetrics) { }
    setScaleX(sx) { }
    setSize(points) { }
    setSkewX(sx) { }
    setEmbolden(embolden) { }
    setSubpixel(subpixel) { }
    setTypeface(face) { }
}
