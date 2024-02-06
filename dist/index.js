"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniTex = void 0;
const drawer_1 = require("./drawer");
const paragraph_1 = require("./paragraph");
const paragraph_builder_1 = require("./paragraph_builder");
class MiniTex {
    static install(canvasKit, pixelRatio) {
        drawer_1.Drawer.pixelRatio = pixelRatio;
        canvasKit.ParagraphBuilder = paragraph_builder_1.ParagraphBuilder;
        canvasKit.Canvas.prototype.drawParagraph = function (paragraph, dx, dy) {
            (0, paragraph_1.drawParagraph)(canvasKit, this, paragraph, dx, dy);
        };
    }
}
exports.MiniTex = MiniTex;
