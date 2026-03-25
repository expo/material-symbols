import { describe, expect, test } from "bun:test";
import { svgToVectorDrawable } from "./svg-to-vector-drawable";

describe("svgToVectorDrawable", () => {
  test("converts a simple single-path SVG", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 21V9l8-6 8 6v12h-6v-7h-4v7z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toContain('android:viewportWidth="24"');
    expect(xml).toContain('android:viewportHeight="24"');
    expect(xml).toContain('android:width="24dp"');
    expect(xml).toContain('android:height="24dp"');
    expect(xml).toContain('android:pathData="M4 21V9l8-6 8 6v12h-6v-7h-4v7z"');
    expect(xml).toContain('android:fillColor="#FF000000"');
  });

  test("converts fill colors to Android #AARRGGBB format", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#e0284f" d="M0 0z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toContain('android:fillColor="#FFE0284F"');
  });

  test("expands shorthand hex colors", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f00" d="M0 0z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toContain('android:fillColor="#FFFF0000"');
  });

  test("treats currentColor as black", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M0 0z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toContain('android:fillColor="#FF000000"');
  });

  test("treats missing fill as black", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toContain('android:fillColor="#FF000000"');
  });

  test("handles multiple paths", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0z"/><path d="M1 1z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toMatch(/android:pathData="M0 0z"/);
    expect(xml).toMatch(/android:pathData="M1 1z"/);
  });

  test("throws on missing viewBox", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0z"/></svg>';
    expect(() => svgToVectorDrawable(svg)).toThrow("viewBox");
  });

  test("throws on SVG with no paths", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>';
    expect(() => svgToVectorDrawable(svg)).toThrow("no <path>");
  });

  test("includes android namespace", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0z"/></svg>';
    const xml = svgToVectorDrawable(svg);
    expect(xml).toContain('xmlns:android="http://schemas.android.com/apk/res/android"');
  });
});
