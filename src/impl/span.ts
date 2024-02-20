// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { LetterRect, FontSlant, TextStyle } from "../adapter/skia";
import { colorToHex } from "../util";

export class Span {
  letterBaseline: number = 0;
  letterHeight: number = 0;
  lettersBounding: LetterRect[] = [];
}

export class TextSpan extends Span {
  constructor(readonly text: string, readonly style: TextStyle) {
    super();
  }

  hasLetterSpacing() {
    return (
      this.style.letterSpacing !== undefined && this.style.letterSpacing > 1
    );
  }

  toBackgroundFillStyle(): string {
    if (this.style.backgroundColor) {
      return colorToHex(this.style.backgroundColor as Float32Array);
    } else {
      return "#000000";
    }
  }

  toTextFillStyle(): string {
    if (this.style.color) {
      return colorToHex(this.style.color as Float32Array);
    } else {
      return "#000000";
    }
  }

  toDecorationStrokeStyle(): string {
    if (this.style.decorationColor) {
      return colorToHex(this.style.decorationColor as Float32Array);
    } else {
      return "#000000";
    }
  }

  toCanvasFont(): string {
    let font = `${this.style.fontSize}px system-ui, Roboto`;
    const fontWeight = this.style.fontStyle?.weight?.value;
    if (fontWeight && fontWeight !== 400) {
      if (fontWeight >= 900) {
        font = "900 " + font;
      } else {
        font = fontWeight.toFixed(0) + " " + font;
      }
    }
    const slant = this.style.fontStyle?.slant?.value;
    if (slant) {
      switch (slant) {
        case FontSlant.Italic:
          font = "italic " + font;
          break;
        case FontSlant.Oblique:
          font = "oblique " + font;
          break;
      }
    }
    return font;
  }
}

export class NewlineSpan extends TextSpan {
  constructor() {
    super("\n", {});
  }
}

export const spanWithNewline = (spans: Span[]): Span[] => {
  let result: Span[] = [];
  spans.forEach((span) => {
    if (span instanceof TextSpan) {
      if (span.text.indexOf("\n") >= 0) {
        const components = span.text.split("\n");
        for (let index = 0; index < components.length; index++) {
          const component = components[index];
          if (index > 0) {
            result.push(new NewlineSpan());
          }
          result.push(new TextSpan(component, span.style));
        }
        return;
      }
    }
    result.push(span);
  });
  return result;
};
