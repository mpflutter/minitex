"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextHeightBehavior = exports.DecorationStyle = exports.FontSlant = exports.FontWidth = exports.FontWeight = exports.LineThroughDecoration = exports.OverlineDecoration = exports.UnderlineDecoration = exports.NoDecoration = exports.TextAlign = exports.Affinity = exports.RectWidthStyle = exports.RectHeightStyle = exports.TextDirection = exports.TextBaseline = exports.StrokeJoin = exports.StrokeCap = exports.PlaceholderAlignment = exports.SkEmbindObject = void 0;
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
var TextHeightBehavior;
(function (TextHeightBehavior) {
    TextHeightBehavior[TextHeightBehavior["All"] = 0] = "All";
    TextHeightBehavior[TextHeightBehavior["DisableFirstAscent"] = 1] = "DisableFirstAscent";
    TextHeightBehavior[TextHeightBehavior["DisableLastDescent"] = 2] = "DisableLastDescent";
    TextHeightBehavior[TextHeightBehavior["DisableAll"] = 3] = "DisableAll";
})(TextHeightBehavior || (exports.TextHeightBehavior = TextHeightBehavior = {}));
