"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniTex = void 0;
const paragraph_1 = require("./paragraph");
const paragraph_builder_1 = require("./paragraph_builder");
class MiniTex {
    static install(canvasKit) {
        canvasKit.ParagraphBuilder = paragraph_builder_1.ParagraphBuilder;
        canvasKit.Canvas.prototype.drawParagraph = paragraph_1.drawParagraph;
    }
}
exports.MiniTex = MiniTex;
