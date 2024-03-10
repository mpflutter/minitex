"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniTex = void 0;
const drawer_1 = require("./impl/drawer");
const paragraph_1 = require("./adapter/paragraph");
const paragraph_builder_1 = require("./adapter/paragraph_builder");
const logger_1 = require("./logger");
const polyfill_1 = require("./polyfill");
// import { logger } from "./logger";
class MiniTex {
    static install(canvasKit, pixelRatio, embeddingFonts, iconFonts) {
        if (typeof canvasKit.ParagraphBuilder === "undefined") {
            (0, polyfill_1.installPolyfill)(canvasKit);
            paragraph_builder_1.ParagraphBuilder.usingPolyfill = true;
        }
        // logger.profileMode = true;
        logger_1.logger.setLogLevel(logger_1.LogLevel.ERROR);
        drawer_1.Drawer.pixelRatio = pixelRatio;
        const originMakeFromFontCollectionMethod = canvasKit.ParagraphBuilder.MakeFromFontCollection;
        canvasKit.ParagraphBuilder.MakeFromFontCollection = function (style, fontCollection) {
            return paragraph_builder_1.ParagraphBuilder.MakeFromFontCollection(originMakeFromFontCollectionMethod, style, fontCollection, embeddingFonts, iconFonts);
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
