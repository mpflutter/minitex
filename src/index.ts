import { drawParagraph } from "./paragraph";
import { ParagraphBuilder } from "./paragraph_builder";

export class MiniTex {
  static install(canvasKit: any) {
    canvasKit.ParagraphBuilder = ParagraphBuilder;
    canvasKit.Canvas.prototype.drawParagraph = drawParagraph;
  }
}
