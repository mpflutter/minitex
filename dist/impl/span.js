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
        this.charSequence = Array.from(text);
        this.originText = text;
    }
    hasLetterSpacing() {
        return (this.style.letterSpacing !== undefined && this.style.letterSpacing > 1);
    }
    hasWordSpacing() {
        return this.style.wordSpacing !== undefined && this.style.wordSpacing > 1;
    }
    hasJustifySpacing(paragraphStyle) {
        var _a;
        return ((_a = paragraphStyle.textAlign) === null || _a === void 0 ? void 0 : _a.value) === skia_1.TextAlign.Justify;
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
            if (span.originText.indexOf("\n") >= 0) {
                const components = span.originText.split("\n");
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
