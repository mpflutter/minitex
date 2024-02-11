"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextAlign = exports.Affinity = exports.RectWidthStyle = exports.RectHeightStyle = exports.TextDirection = exports.StrokeJoin = exports.StrokeCap = exports.TextBaseline = exports.PlaceholderAlignment = exports.EmbindObject = void 0;
class EmbindObject {
    constructor() {
        this._type = "";
    }
    delete() { }
    deleteLater() { }
    isAliasOf(other) {
        return false;
    }
    isDeleted() {
        return false;
    }
}
exports.EmbindObject = EmbindObject;
var PlaceholderAlignment;
(function (PlaceholderAlignment) {
    PlaceholderAlignment["Baseline"] = "Baseline";
    PlaceholderAlignment["AboveBaseline"] = "AboveBaseline";
    PlaceholderAlignment["BelowBaseline"] = "BelowBaseline";
    PlaceholderAlignment["Top"] = "Top";
    PlaceholderAlignment["Bottom"] = "Bottom";
    PlaceholderAlignment["Middle"] = "Middle";
})(PlaceholderAlignment || (exports.PlaceholderAlignment = PlaceholderAlignment = {}));
var TextBaseline;
(function (TextBaseline) {
    TextBaseline["Alphabetic"] = "Alphabetic";
    TextBaseline["Ideographic"] = "Ideographic";
})(TextBaseline || (exports.TextBaseline = TextBaseline = {}));
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
var TextDirection;
(function (TextDirection) {
    TextDirection[TextDirection["RTL"] = 0] = "RTL";
    TextDirection[TextDirection["LTR"] = 1] = "LTR";
})(TextDirection || (exports.TextDirection = TextDirection = {}));
var RectHeightStyle;
(function (RectHeightStyle) {
    RectHeightStyle["Tight"] = "Tight";
    RectHeightStyle["Max"] = "Max";
    RectHeightStyle["IncludeLineSpacingMiddle"] = "IncludeLineSpacingMiddle";
    RectHeightStyle["IncludeLineSpacingTop"] = "IncludeLineSpacingTop";
    RectHeightStyle["IncludeLineSpacingBottom"] = "IncludeLineSpacingBottom";
    RectHeightStyle["Strut"] = "Strut";
})(RectHeightStyle || (exports.RectHeightStyle = RectHeightStyle = {}));
var RectWidthStyle;
(function (RectWidthStyle) {
    RectWidthStyle["Tight"] = "Tight";
    RectWidthStyle["Max"] = "Max";
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
