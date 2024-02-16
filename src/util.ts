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
  const englishRegex = /^[A-Za-z]+$/;
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