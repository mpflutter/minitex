import { Drawer } from "./drawer";
import { drawParagraph } from "./paragraph";
import { ParagraphBuilder } from "./paragraph_builder";

export class MiniTex {
  static install(canvasKit: any, pixelRatio: number) {
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
        originDrawParagraphMethod.apply(this, [paragraph, dx, dy])
      }
    };
  }
}
