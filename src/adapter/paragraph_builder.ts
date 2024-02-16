// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { Span, TextSpan } from "../impl/span";
import { logger } from "../logger";
import { Paint } from "./paint";
import { Paragraph } from "./paragraph";
import {
  SkEmbindObject,
  InputGraphemes,
  InputLineBreaks,
  InputWords,
  ParagraphStyle,
  PlaceholderAlignment,
  TextBaseline,
} from "./skia";
import { TextStyle } from "./skia";

export class ParagraphBuilder extends SkEmbindObject {
  static MakeFromFontCollection(
    originMakeFromFontCollectionMethod: (
      style: ParagraphStyle,
      fontCollection: any
    ) => any,
    style: ParagraphStyle,
    fontCollection: any
  ) {
    const fontFamilies = style.textStyle?.fontFamilies;
    if (fontFamilies && fontFamilies[0] === "MiniTex") {
      logger.info("use minitex paragraph builder.", fontFamilies);
      return new ParagraphBuilder(style);
    } else {
      logger.info("use skia paragraph builder.", fontFamilies);
      return originMakeFromFontCollectionMethod(style, fontCollection);
    }
  }

  constructor(readonly style: ParagraphStyle) {
    super();
  }

  isMiniTex = true;

  private spans: Span[] = [];
  private styles: TextStyle[] = [];

  /**
   * Pushes the information required to leave an open space.
   * @param width
   * @param height
   * @param alignment
   * @param baseline
   * @param offset
   */
  addPlaceholder(
    width?: number,
    height?: number,
    alignment?: PlaceholderAlignment,
    baseline?: TextBaseline,
    offset?: number
  ): void {}

  /**
   * Adds text to the builder. Forms the proper runs to use the upper-most style
   * on the style_stack.
   * @param str
   */
  addText(str: string): void {
    logger.debug("ParagraphBuilder.addText", str);
    let mergedStyle: TextStyle = {};
    this.styles.forEach((it) => {
      Object.assign(mergedStyle, it);
    });
    const span = new TextSpan(str, mergedStyle);
    this.spans.push(span);
  }

  /**
   * Returns a Paragraph object that can be used to be layout and paint the text to an
   * Canvas.
   */
  build(): Paragraph {
    return new Paragraph(this.spans, this.style);
  }

  /**
   * @param words is an array of word edges (starting or ending). You can
   * pass 2 elements (0 as a start of the entire text and text.size as the
   * end). This information is only needed for a specific API method getWords.
   *
   * The indices are expected to be relative to the UTF-8 representation of
   * the text.
   */
  setWordsUtf8(words: InputWords): void {}
  /**
   * @param words is an array of word edges (starting or ending). You can
   * pass 2 elements (0 as a start of the entire text and text.size as the
   * end). This information is only needed for a specific API method getWords.
   *
   * The indices are expected to be relative to the UTF-16 representation of
   * the text.
   *
   * The `Intl.Segmenter` API can be used as a source for this data.
   */
  setWordsUtf16(words: InputWords): void {}

  /**
   * @param graphemes is an array of indexes in the input text that point
   * to the start of each grapheme.
   *
   * The indices are expected to be relative to the UTF-8 representation of
   * the text.
   */
  setGraphemeBreaksUtf8(graphemes: InputGraphemes): void {}
  /**
   * @param graphemes is an array of indexes in the input text that point
   * to the start of each grapheme.
   *
   * The indices are expected to be relative to the UTF-16 representation of
   * the text.
   *
   * The `Intl.Segmenter` API can be used as a source for this data.
   */
  setGraphemeBreaksUtf16(graphemes: InputGraphemes): void {}

  /**
   * @param lineBreaks is an array of unsigned integers that should be
   * treated as pairs (index, break type) that point to the places of possible
   * line breaking if needed. It should include 0 as the first element.
   * Break type == 0 means soft break, break type == 1 is a hard break.
   *
   * The indices are expected to be relative to the UTF-8 representation of
   * the text.
   */
  setLineBreaksUtf8(lineBreaks: InputLineBreaks): void {}
  /**
   * @param lineBreaks is an array of unsigned integers that should be
   * treated as pairs (index, break type) that point to the places of possible
   * line breaking if needed. It should include 0 as the first element.
   * Break type == 0 means soft break, break type == 1 is a hard break.
   *
   * The indices are expected to be relative to the UTF-16 representation of
   * the text.
   *
   * Chrome's `v8BreakIterator` API can be used as a source for this data.
   */
  setLineBreaksUtf16(lineBreaks: InputLineBreaks): void {}

  /**
   * Returns the entire Paragraph text (which is useful in case that text
   * was produced as a set of addText calls).
   */
  getText(): string {
    let text = "";
    this.spans.forEach((it) => {
      if (it instanceof TextSpan) {
        text += it.text;
      }
    });
    return text;
  }

  /**
   * Remove a style from the stack. Useful to apply different styles to chunks
   * of text such as bolding.
   */
  pop(): void {
    logger.debug("ParagraphBuilder.pop");
    this.styles.pop();
  }

  /**
   * Push a style to the stack. The corresponding text added with addText will
   * use the top-most style.
   * @param textStyle
   */
  pushStyle(textStyle: TextStyle): void {
    logger.debug("ParagraphBuilder.pushStyle", textStyle);
    this.styles.push(textStyle);
  }

  /**
   * Pushes a TextStyle using paints instead of colors for foreground and background.
   * @param textStyle
   * @param fg
   * @param bg
   */
  pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
    logger.debug("ParagraphBuilder.pushPaintStyle", textStyle, fg, bg);
    this.styles.push(textStyle);
  }

  /**
   * Resets this builder to its initial state, discarding any text, styles, placeholders that have
   * been added, but keeping the initial ParagraphStyle.
   */
  reset(): void {
    logger.debug("ParagraphBuilder.reset");
    this.spans = [];
    this.styles = [];
  }
}
