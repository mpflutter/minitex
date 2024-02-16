import { Drawer } from "./impl/drawer";
import { drawParagraph } from "./adapter/paragraph";
import { ParagraphBuilder } from "./adapter/paragraph_builder";
import { logger } from "./logger";

export class MiniTex {
  static install(canvasKit: any, pixelRatio: number) {
    logger.profileMode = true;
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
        fontCollection
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
