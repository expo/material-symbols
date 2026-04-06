import { describe, expect, test } from "bun:test";
import { parseIconUrl, buildAxisSegment, toFileName } from "./add-icon";
import type { IconParams } from "./add-icon";

describe("parseIconUrl", () => {
  test("parses icon name and all axis values", () => {
    const url =
      "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:check_box:FILL@1;wght@300;GRAD@0;opsz@24&icon.size=26&icon.color=%23ECB576";
    expect(parseIconUrl(url)).toEqual({
      name: "check_box",
      style: "outlined",
      fill: 1,
      wght: 300,
      grad: 0,
      opsz: 24,
    });
  });

  test("parses URL with default axis values", () => {
    const url =
      "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:search:FILL@0;wght@400;GRAD@0;opsz@24";
    expect(parseIconUrl(url)).toEqual({
      name: "search",
      style: "outlined",
      fill: 0,
      wght: 400,
      grad: 0,
      opsz: 24,
    });
  });

  test("parses URL without axis segment", () => {
    const url =
      "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:home";
    expect(parseIconUrl(url)).toEqual({
      name: "home",
      style: "outlined",
      fill: 0,
      wght: 400,
      grad: 0,
      opsz: 24,
    });
  });

  test("parses URL with non-default optical size", () => {
    const url =
      "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:star:FILL@0;wght@400;GRAD@0;opsz@48";
    expect(parseIconUrl(url)).toEqual({
      name: "star",
      style: "outlined",
      fill: 0,
      wght: 400,
      grad: 0,
      opsz: 48,
    });
  });

  test("parses rounded style from URL", () => {
    const url =
      "https://fonts.google.com/icons?selected=Material+Symbols+Rounded:star:FILL@0;wght@400;GRAD@0;opsz@24";
    expect(parseIconUrl(url)).toEqual({
      name: "star",
      style: "rounded",
      fill: 0,
      wght: 400,
      grad: 0,
      opsz: 24,
    });
  });

  test("parses sharp style from URL", () => {
    const url =
      "https://fonts.google.com/icons?selected=Material+Symbols+Sharp:home";
    expect(parseIconUrl(url).style).toBe("sharp");
  });

  test("throws on missing selected param", () => {
    expect(() => parseIconUrl("https://fonts.google.com/icons")).toThrow(
      "missing \"selected\" query parameter",
    );
  });

  test("throws on malformed selected param", () => {
    expect(() =>
      parseIconUrl("https://fonts.google.com/icons?selected=Material+Symbols+Outlined"),
    ).toThrow("Could not parse icon name");
  });
});

describe("buildAxisSegment", () => {
  test("returns 'default' when all axes are default", () => {
    expect(buildAxisSegment({ name: "search", style: "outlined", fill: 0, wght: 400, grad: 0, opsz: 24 }))
      .toBe("default");
  });

  test("returns 'fill1' for filled icons", () => {
    expect(buildAxisSegment({ name: "check_box", style: "outlined", fill: 1, wght: 400, grad: 0, opsz: 24 }))
      .toBe("fill1");
  });

  test("returns weight segment for non-400 weight", () => {
    expect(buildAxisSegment({ name: "star", style: "outlined", fill: 0, wght: 300, grad: 0, opsz: 24 }))
      .toBe("wght300");
    expect(buildAxisSegment({ name: "star", style: "outlined", fill: 0, wght: 700, grad: 0, opsz: 24 }))
      .toBe("wght700");
  });

  test("returns grade segment for non-zero grade", () => {
    expect(buildAxisSegment({ name: "star", style: "outlined", fill: 0, wght: 400, grad: 200, opsz: 24 }))
      .toBe("grad200");
  });

  test("returns gradN prefix for negative grade", () => {
    expect(buildAxisSegment({ name: "star", style: "outlined", fill: 0, wght: 400, grad: -25, opsz: 24 }))
      .toBe("gradN25");
  });

  test("fill takes priority over weight", () => {
    expect(buildAxisSegment({ name: "star", style: "outlined", fill: 1, wght: 700, grad: 0, opsz: 24 }))
      .toBe("fill1");
  });
});

describe("toFileName", () => {
  const defaults: IconParams = { name: "star", style: "outlined", fill: 0, wght: 400, grad: 0, opsz: 24 };

  test("returns plain name for default outlined params", () => {
    expect(toFileName(defaults)).toBe("star");
  });

  test("includes style suffix for non-outlined", () => {
    expect(toFileName({ ...defaults, style: "rounded" })).toBe("star_rounded");
    expect(toFileName({ ...defaults, style: "sharp" })).toBe("star_sharp");
  });

  test("includes fill suffix", () => {
    expect(toFileName({ ...defaults, fill: 1 })).toBe("star_fill");
  });

  test("includes weight suffix", () => {
    expect(toFileName({ ...defaults, wght: 300 })).toBe("star_wght300");
  });

  test("includes grade suffix", () => {
    expect(toFileName({ ...defaults, grad: -25 })).toBe("star_grad-25");
  });

  test("combines multiple suffixes", () => {
    expect(toFileName({ ...defaults, style: "rounded", fill: 1, wght: 700 }))
      .toBe("star_rounded_fill_wght700");
  });
});
