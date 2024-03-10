// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { Drawer } from "./impl/drawer";
import { drawParagraph } from "./adapter/paragraph";
import { ParagraphBuilder } from "./adapter/paragraph_builder";
import { LogLevel, logger } from "./logger";
import { installPolyfill } from "./polyfill";
// import { logger } from "./logger";

export class MiniTex {
  static install(
    canvasKit: any,
    pixelRatio: number,
    embeddingFonts: string[],
    iconFonts?: Record<string, string>
  ) {
    if (typeof canvasKit.ParagraphBuilder === "undefined") {
      installPolyfill(canvasKit);
      ParagraphBuilder.usingPolyfill = true;
    }
    // logger.profileMode = true;
    logger.setLogLevel(LogLevel.DEBUG);
    Drawer.pixelRatio = pixelRatio;
    const originMakeFromFontCollectionMethod =
      canvasKit.ParagraphBuilder.MakeFromFontCollection;
    canvasKit.ParagraphBuilder.MakeFromFontCollection = function (
      style: any,
      fontCollection: any
    ) {
      return ParagraphBuilder.MakeFromFontCollection(
        originMakeFromFontCollectionMethod,
        style,
        fontCollection,
        embeddingFonts,
        iconFonts
      );
    };
    const originDrawParagraphMethod = canvasKit.Canvas.prototype.drawParagraph;
    canvasKit.Canvas.prototype.drawParagraph = function (
      paragraph: any,
      dx: number,
      dy: number
    ) {
      if (paragraph.isMiniTex === true) {
        drawParagraph(canvasKit, this, paragraph, dx, dy);
      } else {
        originDrawParagraphMethod.apply(this, [paragraph, dx, dy]);
      }
    };
  }
}
