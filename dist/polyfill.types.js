"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderAlignmentEnumValues = exports.TextHeightBehaviorEnumValues = exports.DecorationStyleEnumValues = exports.FontSlantEnumValues = exports.FontWidthEnumValues = exports.FontWeightEnumValues = exports.AffinityEnumValues = exports.RectWidthStyleEnumValues = exports.RectHeightStyleEnumValues = exports.TextBaselineEnumValues = exports.TextDirectionEnumValues = exports.TextAlignEnumValues = exports.FontHinting = exports.FontEdging = void 0;
var FontEdging;
(function (FontEdging) {
    FontEdging[FontEdging["Alias"] = 0] = "Alias";
    FontEdging[FontEdging["AntiAlias"] = 1] = "AntiAlias";
    FontEdging[FontEdging["SubpixelAntiAlias"] = 2] = "SubpixelAntiAlias";
})(FontEdging || (exports.FontEdging = FontEdging = {}));
var FontHinting;
(function (FontHinting) {
    FontHinting[FontHinting["None"] = 0] = "None";
    FontHinting[FontHinting["Slight"] = 1] = "Slight";
    FontHinting[FontHinting["Normal"] = 2] = "Normal";
    FontHinting[FontHinting["Full"] = 3] = "Full";
})(FontHinting || (exports.FontHinting = FontHinting = {}));
class TextAlignEnumValues {
    constructor() {
        this.Left = { value: 0 };
        this.Right = { value: 1 };
        this.Center = { value: 2 };
        this.Justify = { value: 3 };
        this.Start = { value: 4 };
        this.End = { value: 5 };
    }
}
exports.TextAlignEnumValues = TextAlignEnumValues;
class TextDirectionEnumValues {
    constructor() {
        this.RTL = { value: 0 };
        this.LTR = { value: 1 };
    }
}
exports.TextDirectionEnumValues = TextDirectionEnumValues;
class TextBaselineEnumValues {
    constructor() {
        this.Alphabetic = { value: 0 };
        this.Ideographic = { value: 1 };
    }
}
exports.TextBaselineEnumValues = TextBaselineEnumValues;
class RectHeightStyleEnumValues {
    constructor() {
        this.Tight = { value: 0 };
        this.Max = { value: 1 };
        this.IncludeLineSpacingMiddle = { value: 2 };
        this.IncludeLineSpacingTop = { value: 3 };
        this.IncludeLineSpacingBottom = { value: 4 };
        this.Strut = { value: 5 };
    }
}
exports.RectHeightStyleEnumValues = RectHeightStyleEnumValues;
class RectWidthStyleEnumValues {
    constructor() {
        this.Tight = { value: 0 };
        this.Max = { value: 1 };
    }
}
exports.RectWidthStyleEnumValues = RectWidthStyleEnumValues;
class AffinityEnumValues {
    constructor() {
        this.Upstream = { value: 0 };
        this.Downstream = { value: 1 };
    }
}
exports.AffinityEnumValues = AffinityEnumValues;
class FontWeightEnumValues {
    constructor() {
        this.Invisible = { value: 0 };
        this.Thin = { value: 100 };
        this.ExtraLight = { value: 200 };
        this.Light = { value: 300 };
        this.Normal = { value: 400 };
        this.Medium = { value: 500 };
        this.SemiBold = { value: 600 };
        this.Bold = { value: 700 };
        this.ExtraBold = { value: 800 };
        this.Black = { value: 900 };
        this.ExtraBlack = { value: 1000 };
    }
}
exports.FontWeightEnumValues = FontWeightEnumValues;
class FontWidthEnumValues {
    constructor() {
        this.UltraCondensed = { value: 0 };
        this.ExtraCondensed = { value: 1 };
        this.Condensed = { value: 2 };
        this.SemiCondensed = { value: 3 };
        this.Normal = { value: 4 };
        this.SemiExpanded = { value: 5 };
        this.Expanded = { value: 6 };
        this.ExtraExpanded = { value: 7 };
        this.UltraExpanded = { value: 8 };
    }
}
exports.FontWidthEnumValues = FontWidthEnumValues;
class FontSlantEnumValues {
    constructor() {
        this.Upright = { value: 0 };
        this.Italic = { value: 1 };
        this.Oblique = { value: 2 };
    }
}
exports.FontSlantEnumValues = FontSlantEnumValues;
class DecorationStyleEnumValues {
    constructor() {
        this.Solid = { value: 0 };
        this.Double = { value: 1 };
        this.Dotted = { value: 2 };
        this.Dashed = { value: 3 };
        this.Wavy = { value: 4 };
    }
}
exports.DecorationStyleEnumValues = DecorationStyleEnumValues;
class TextHeightBehaviorEnumValues {
    constructor() {
        this.All = { value: 0 };
        this.DisableFirstAscent = { value: 1 };
        this.DisableLastDescent = { value: 2 };
        this.DisableAll = { value: 3 };
    }
}
exports.TextHeightBehaviorEnumValues = TextHeightBehaviorEnumValues;
class PlaceholderAlignmentEnumValues {
    constructor() {
        this.Baseline = { value: 0 };
        this.AboveBaseline = { value: 1 };
        this.BelowBaseline = { value: 2 };
        this.Top = { value: 3 };
        this.Bottom = { value: 4 };
        this.Middle = { value: 5 };
    }
}
exports.PlaceholderAlignmentEnumValues = PlaceholderAlignmentEnumValues;
