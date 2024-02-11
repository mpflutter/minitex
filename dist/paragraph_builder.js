"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParagraphBuilder = void 0;
const paragraph_1 = require("./paragraph");
const skia_1 = require("./skia");
class ParagraphBuilder extends skia_1.EmbindObject {
    static MakeFromFontCollection(originMakeFromFontCollectionMethod, style, fontCollection) {
        var _a;
        const fontFamilies = (_a = style.textStyle) === null || _a === void 0 ? void 0 : _a.fontFamilies;
        if (fontFamilies && fontFamilies[0] === "MiniTex") {
            // console.log("use minitex");
            return new ParagraphBuilder(style);
        }
        else {
            // console.log("use old", fontFamilies);
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
    addPlaceholder(width, height, alignment, baseline, offset) {
        // console.log("addPlaceholder", width, height, alignment, baseline, offset);
    }
    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(str) {
        // console.log("addText", str);
        let mergedStyle = {};
        this.styles.forEach((it) => {
            Object.assign(mergedStyle, it);
        });
        const span = new paragraph_1.TextSpan(str, mergedStyle);
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
            if (it instanceof paragraph_1.TextSpan) {
                text += it.text;
            }
        });
        return text;
    }
    /**
     * Remove a style from the stack. Useful to apply different styles to chunks
     * of text such as bolding.
     */
    pop() {
        // console.log("pop");
        this.styles.pop();
    }
    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(textStyle) {
        // console.log("pushStyle", textStyle);
        this.styles.push(textStyle);
    }
    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle, fg, bg) {
        // console.log("pushPaintStyle", textStyle, fg, bg);
        this.styles.push(textStyle);
    }
    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset() {
        this.spans = [];
        this.styles = [];
    }
}
exports.ParagraphBuilder = ParagraphBuilder;
