// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { appTarget } from "./target";

declare var wx: any;
declare var window: any;

export const makeFloat32Array = (arr: any) => {
  if (appTarget === "wegame") {
    return arr;
  }
  return new Float32Array(arr);
};

export const makeUint16Array = (arr: any) => {
  if (appTarget === "wegame") {
    return arr;
  }
  return new Uint16Array(arr);
};

export const colorToHex = (rgbaColor: Float32Array): string => {
  const r = Math.round(rgbaColor[0] * 255).toString(16);
  const g = Math.round(rgbaColor[1] * 255).toString(16);
  const b = Math.round(rgbaColor[2] * 255).toString(16);
  const a = Math.round(rgbaColor[3] * 255).toString(16);
  const padHex = (hex: string) => (hex.length === 1 ? "0" + hex : hex);
  const hexColor = "#" + padHex(r) + padHex(g) + padHex(b) + padHex(a);
  return hexColor;
};

export const valueOfRGBAInt = (
  r: number,
  g: number,
  b: number,
  a: number
): Float32Array => {
  return Float32Array.from([r, g, b, a]);
};

export const valueOfRectXYWH = (
  x: number,
  y: number,
  w: number,
  h: number
): Float32Array => {
  return Float32Array.from([x, y, x + w, y + h]);
};

export function isEnglishWord(str: string) {
  const englishRegex = /^[A-Za-z,.]+$/;
  const result = englishRegex.test(str);
  return result;
}

export function isSquareCharacter(str: string) {
  const squareCharacterRange = /[\u4e00-\u9fa5]/;
  return squareCharacterRange.test(str);
}

const mapOfPunctuation: Record<string, number> = {
  "！": 1,
  "？": 1,
  "｡": 1,
  "，": 1,
  "、": 1,
  "“": 1,
  "”": 1,
  "‘": 1,
  "’": 1,
  "；": 1,
  "：": 1,
  "【": 1,
  "】": 1,
  "『": 1,
  "』": 1,
  "（": 1,
  "）": 1,
  "《": 1,
  "》": 1,
  "〈": 1,
  "〉": 1,
  "〔": 1,
  "〕": 1,
  "［": 1,
  "］": 1,
  "｛": 1,
  "｝": 1,
  "〖": 1,
  "〗": 1,
  "〘": 1,
  "〙": 1,
  "〚": 1,
  "〛": 1,
  "〝": 1,
  "〞": 1,
  "〟": 1,
  "﹏": 1,
  "…": 1,
  "—": 1,
  "～": 1,
  "·": 1,
  "•": 1,
  ",": 1,
  ".": 1,
};

export function isPunctuation(char: string) {
  return mapOfPunctuation[char] === 1;
}

export function convertToUpwardToPixelRatio(
  number: number,
  pixelRatio: number
) {
  const upwardInt = Math.ceil(number);
  const remainder = upwardInt % pixelRatio;
  return remainder === 0 ? upwardInt : upwardInt + (pixelRatio - remainder);
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  if (
    typeof wx === "object" &&
    typeof wx.createOffscreenCanvas === "function"
  ) {
    return wx.createOffscreenCanvas({
      type: "2d",
      width: width,
      height: height,
    });
  } else if (typeof wx === "object" && typeof wx.createCanvas === "function") {
    return wx.createCanvas({
      type: "2d",
      width: width,
      height: height,
    });
  } else if (typeof window === "object") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  } else {
    throw "can not create canvas";
  }
}
