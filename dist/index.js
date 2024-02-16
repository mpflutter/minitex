"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniTex = void 0;
const drawer_1 = require("./impl/drawer");
const paragraph_1 = require("./adapter/paragraph");
const paragraph_builder_1 = require("./adapter/paragraph_builder");
const logger_1 = require("./logger");
class MiniTex {
    static install(canvasKit, pixelRatio) {
        logger_1.logger.profileMode = true;
        drawer_1.Drawer.pixelRatio = pixelRatio;
        const originMakeFromFontCollectionMethod = canvasKit.ParagraphBuilder.MakeFromFontCollection;
        canvasKit.ParagraphBuilder.MakeFromFontCollection = function (style, fontCollection) {
            return paragraph_builder_1.ParagraphBuilder.MakeFromFontCollection(originMakeFromFontCollectionMethod, style, fontCollection);
        };
        const originDrawParagraphMethod = canvasKit.Canvas.prototype.drawParagraph;
        canvasKit.Canvas.prototype.drawParagraph = function (paragraph, dx, dy) {
            if (paragraph.isMiniTex === true) {
                (0, paragraph_1.drawParagraph)(canvasKit, this, paragraph, dx, dy);
            }
            else {
                originDrawParagraphMethod.apply(this, [paragraph, dx, dy]);
            }
        };
    }
}
exports.MiniTex = MiniTex;
