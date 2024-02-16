"use strict";
// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paint = void 0;
const util_1 = require("../util");
const skia_1 = require("./skia");
class Paint extends skia_1.SkEmbindObject {
    constructor() {
        super(...arguments);
        this._type = "SkPaint";
        this._color = (0, util_1.valueOfRGBAInt)(0, 0, 0, 255);
        this._strokeCap = skia_1.StrokeCap.Butt;
        this._strokeJoin = skia_1.StrokeJoin.Bevel;
        this._strokeMiter = 0;
        this._strokeWidth = 0;
        this._alpha = 1.0;
        this._antiAlias = true;
    }
    /**
     * Returns a copy of this paint.
     */
    copy() {
        const newValue = new Paint();
        Object.assign(newValue, this);
        return newValue;
    }
    /**
     * Retrieves the alpha and RGB unpremultiplied. RGB are extended sRGB values
     * (sRGB gamut, and encoded with the sRGB transfer function).
     */
    getColor() {
        return this._color;
    }
    /**
     * Returns the geometry drawn at the beginning and end of strokes.
     */
    getStrokeCap() {
        return this._strokeCap;
    }
    /**
     * Returns the geometry drawn at the corners of strokes.
     */
    getStrokeJoin() {
        return this._strokeJoin;
    }
    /**
     *  Returns the limit at which a sharp corner is drawn beveled.
     */
    getStrokeMiter() {
        return this._strokeMiter;
    }
    /**
     * Returns the thickness of the pen used to outline the shape.
     */
    getStrokeWidth() {
        return this._strokeWidth;
    }
    /**
     * Replaces alpha, leaving RGBA unchanged. 0 means fully transparent, 1.0 means opaque.
     * @param alpha
     */
    setAlphaf(alpha) {
        this._alpha = alpha;
    }
    /**
     * Requests, but does not require, that edge pixels draw opaque or with
     * partial transparency.
     * @param aa
     */
    setAntiAlias(aa) {
        this._antiAlias = aa;
    }
    /**
     * Sets the blend mode that is, the mode used to combine source color
     * with destination color.
     * @param mode
     */
    setBlendMode(mode) { }
    /**
     * Sets the current blender, increasing its refcnt, and if a blender is already
     * present, decreasing that object's refcnt.
     *
     * * A nullptr blender signifies the default SrcOver behavior.
     *
     * * For convenience, you can call setBlendMode() if the blend effect can be expressed
     * as one of those values.
     * @param blender
     */
    setBlender(blender) { }
    /**
     * Sets alpha and RGB used when stroking and filling. The color is four floating
     * point values, unpremultiplied. The color values are interpreted as being in
     * the provided colorSpace.
     * @param color
     * @param colorSpace - defaults to sRGB
     */
    setColor(color) {
        this._color = color;
    }
    /**
     * Sets alpha and RGB used when stroking and filling. The color is four floating
     * point values, unpremultiplied. The color values are interpreted as being in
     * the provided colorSpace.
     * @param r
     * @param g
     * @param b
     * @param a
     * @param colorSpace - defaults to sRGB
     */
    setColorComponents(r, g, b, a) {
        this.setColor((0, util_1.valueOfRGBAInt)(r, g, b, a));
    }
    /**
     * Sets the current color filter, replacing the existing one if there was one.
     * @param filter
     */
    setColorFilter(filter) { }
    /**
     * Sets the color used when stroking and filling. The color values are interpreted as being in
     * the provided colorSpace.
     * @param color
     * @param colorSpace - defaults to sRGB.
     */
    setColorInt(color, colorSpace) { }
    /**
     * Requests, but does not require, to distribute color error.
     * @param shouldDither
     */
    setDither(shouldDither) { }
    /**
     * Sets the current image filter, replacing the existing one if there was one.
     * @param filter
     */
    setImageFilter(filter) { }
    /**
     * Sets the current mask filter, replacing the existing one if there was one.
     * @param filter
     */
    setMaskFilter(filter) { }
    /**
     * Sets the current path effect, replacing the existing one if there was one.
     * @param effect
     */
    setPathEffect(effect) { }
    /**
     * Sets the current shader, replacing the existing one if there was one.
     * @param shader
     */
    setShader(shader) { }
    /**
     * Sets the geometry drawn at the beginning and end of strokes.
     * @param cap
     */
    setStrokeCap(cap) {
        this._strokeCap = cap;
    }
    /**
     * Sets the geometry drawn at the corners of strokes.
     * @param join
     */
    setStrokeJoin(join) {
        this._strokeJoin = join;
    }
    /**
     * Sets the limit at which a sharp corner is drawn beveled.
     * @param limit
     */
    setStrokeMiter(limit) {
        this._strokeMiter = limit;
    }
    /**
     * Sets the thickness of the pen used to outline the shape.
     * @param width
     */
    setStrokeWidth(width) {
        this._strokeWidth = width;
    }
    /**
     * Sets whether the geometry is filled or stroked.
     * @param style
     */
    setStyle(style) { }
}
exports.Paint = Paint;
