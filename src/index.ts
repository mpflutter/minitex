import { Drawer } from "./drawer";
import { drawParagraph } from "./paragraph";
import { ParagraphBuilder } from "./paragraph_builder";

export class MiniTex {
  static install(canvasKit: any, pixelRatio: number) {
    Drawer.pixelRatio = pixelRatio;
    canvasKit.ParagraphBuilder = ParagraphBuilder;
    canvasKit.Canvas.prototype.drawParagraph = function (
      paragraph: any,
      dx: number,
      dy: number
    ) {
      drawParagraph(canvasKit, this, paragraph, dx, dy);
    };
  }
}
