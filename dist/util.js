"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanvas = exports.convertToUpwardToPixelRatio = exports.isPunctuation = exports.isSquareCharacter = exports.isEnglishWord = exports.valueOfRectXYWH = exports.valueOfRGBAInt = exports.colorToHex = exports.makeUint16Array = exports.makeFloat32Array = void 0;
const target_1 = require("./target");
const makeFloat32Array = (arr) => {
    if (target_1.appTarget === "wegame") {
        return arr;
    }
    return new Float32Array(arr);
};
exports.makeFloat32Array = makeFloat32Array;
const makeUint16Array = (arr) => {
    if (target_1.appTarget === "wegame") {
        return arr;
    }
    return new Uint16Array(arr);
};
exports.makeUint16Array = makeUint16Array;
const colorToHex = (rgbaColor) => {
    const r = Math.round(rgbaColor[0] * 255).toString(16);
    const g = Math.round(rgbaColor[1] * 255).toString(16);
    const b = Math.round(rgbaColor[2] * 255).toString(16);
    const a = Math.round(rgbaColor[3] * 255).toString(16);
    const padHex = (hex) => (hex.length === 1 ? "0" + hex : hex);
    const hexColor = "#" + padHex(r) + padHex(g) + padHex(b) + padHex(a);
    return hexColor;
};
exports.colorToHex = colorToHex;
const valueOfRGBAInt = (r, g, b, a) => {
    return Float32Array.from([r, g, b, a]);
};
exports.valueOfRGBAInt = valueOfRGBAInt;
const valueOfRectXYWH = (x, y, w, h) => {
    return Float32Array.from([x, y, x + w, y + h]);
};
exports.valueOfRectXYWH = valueOfRectXYWH;
function isEnglishWord(str) {
    const englishRegex = /^[A-Za-z,.]+$/;
    const result = englishRegex.test(str);
    return result;
}
exports.isEnglishWord = isEnglishWord;
function isSquareCharacter(str) {
    const squareCharacterRange = /[\u4e00-\u9fa5]/;
    return squareCharacterRange.test(str);
}
exports.isSquareCharacter = isSquareCharacter;
const mapOfPunctuation = {
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
function isPunctuation(char) {
    return mapOfPunctuation[char] === 1;
}
exports.isPunctuation = isPunctuation;
function convertToUpwardToPixelRatio(number, pixelRatio) {
    const upwardInt = Math.ceil(number);
    const remainder = upwardInt % pixelRatio;
    return remainder === 0 ? upwardInt : upwardInt + (pixelRatio - remainder);
}
exports.convertToUpwardToPixelRatio = convertToUpwardToPixelRatio;
function createCanvas(width, height) {
    if (typeof wx === "object" &&
        typeof wx.createOffscreenCanvas === "function") {
        return wx.createOffscreenCanvas({
            type: "2d",
            width: width,
            height: height,
        });
    }
    else if (typeof wx === "object" && typeof wx.createCanvas === "function") {
        return wx.createCanvas({
            type: "2d",
            width: width,
            height: height,
        });
    }
    else if (typeof window === "object") {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    else {
        throw "can not create canvas";
    }
}
exports.createCanvas = createCanvas;
