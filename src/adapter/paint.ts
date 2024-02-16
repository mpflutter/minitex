// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { valueOfRGBAInt } from "../util";
import { Color, SkEmbindObject, StrokeCap, StrokeJoin } from "./skia";

export class Paint extends SkEmbindObject {
  public _type = "SkPaint";

  /**
   * Returns a copy of this paint.
   */
  copy(): Paint {
    const newValue = new Paint();
    Object.assign(newValue, this);
    return newValue;
  }

  private _color: Color = valueOfRGBAInt(0, 0, 0, 255);

  /**
   * Retrieves the alpha and RGB unpremultiplied. RGB are extended sRGB values
   * (sRGB gamut, and encoded with the sRGB transfer function).
   */
  getColor(): Color {
    return this._color;
  }

  private _strokeCap = StrokeCap.Butt;

  /**
   * Returns the geometry drawn at the beginning and end of strokes.
   */
  getStrokeCap(): StrokeCap {
    return this._strokeCap;
  }

  private _strokeJoin = StrokeJoin.Bevel;

  /**
   * Returns the geometry drawn at the corners of strokes.
   */
  getStrokeJoin(): StrokeJoin {
    return this._strokeJoin;
  }

  private _strokeMiter = 0;

  /**
   *  Returns the limit at which a sharp corner is drawn beveled.
   */
  getStrokeMiter(): number {
    return this._strokeMiter;
  }

  private _strokeWidth = 0;

  /**
   * Returns the thickness of the pen used to outline the shape.
   */
  getStrokeWidth(): number {
    return this._strokeWidth;
  }

  private _alpha = 1.0;

  /**
   * Replaces alpha, leaving RGBA unchanged. 0 means fully transparent, 1.0 means opaque.
   * @param alpha
   */
  setAlphaf(alpha: number): void {
    this._alpha = alpha;
  }

  private _antiAlias = true;

  /**
   * Requests, but does not require, that edge pixels draw opaque or with
   * partial transparency.
   * @param aa
   */
  setAntiAlias(aa: boolean): void {
    this._antiAlias = aa;
  }

  /**
   * Sets the blend mode that is, the mode used to combine source color
   * with destination color.
   * @param mode
   */
  setBlendMode(mode: any): void {}

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
  setBlender(blender: any): void {}

  /**
   * Sets alpha and RGB used when stroking and filling. The color is four floating
   * point values, unpremultiplied. The color values are interpreted as being in
   * the provided colorSpace.
   * @param color
   * @param colorSpace - defaults to sRGB
   */
  setColor(color: Color): void {
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
  setColorComponents(r: number, g: number, b: number, a: number): void {
    this.setColor(valueOfRGBAInt(r, g, b, a));
  }

  /**
   * Sets the current color filter, replacing the existing one if there was one.
   * @param filter
   */
  setColorFilter(filter: any): void {}

  /**
   * Sets the color used when stroking and filling. The color values are interpreted as being in
   * the provided colorSpace.
   * @param color
   * @param colorSpace - defaults to sRGB.
   */
  setColorInt(color: any, colorSpace?: any): void {}

  /**
   * Requests, but does not require, to distribute color error.
   * @param shouldDither
   */
  setDither(shouldDither: boolean): void {}

  /**
   * Sets the current image filter, replacing the existing one if there was one.
   * @param filter
   */
  setImageFilter(filter: any): void {}

  /**
   * Sets the current mask filter, replacing the existing one if there was one.
   * @param filter
   */
  setMaskFilter(filter: any): void {}

  /**
   * Sets the current path effect, replacing the existing one if there was one.
   * @param effect
   */
  setPathEffect(effect: any): void {}

  /**
   * Sets the current shader, replacing the existing one if there was one.
   * @param shader
   */
  setShader(shader: any): void {}

  /**
   * Sets the geometry drawn at the beginning and end of strokes.
   * @param cap
   */
  setStrokeCap(cap: StrokeCap): void {
    this._strokeCap = cap;
  }

  /**
   * Sets the geometry drawn at the corners of strokes.
   * @param join
   */
  setStrokeJoin(join: StrokeJoin): void {
    this._strokeJoin = join;
  }

  /**
   * Sets the limit at which a sharp corner is drawn beveled.
   * @param limit
   */
  setStrokeMiter(limit: number): void {
    this._strokeMiter = limit;
  }

  /**
   * Sets the thickness of the pen used to outline the shape.
   * @param width
   */
  setStrokeWidth(width: number): void {
    this._strokeWidth = width;
  }

  /**
   * Sets whether the geometry is filled or stroked.
   * @param style
   */
  setStyle(style: any): void {}
}
