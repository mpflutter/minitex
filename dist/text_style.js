"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontSlant = exports.FontWidth = exports.FontWeight = void 0;
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
