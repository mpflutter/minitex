"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationStyle = exports.FontSlant = exports.FontWidth = exports.FontWeight = exports.LineThroughDecoration = exports.OverlineDecoration = exports.UnderlineDecoration = exports.NoDecoration = void 0;
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
