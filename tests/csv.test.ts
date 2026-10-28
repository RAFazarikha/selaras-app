import { expect, test } from "bun:test";
import { toCsv } from "@/lib/csv";

test("header, escape koma/kutip/newline, null", () => {
  const out = toCsv([{ a: 1, b: 'x,"y"', c: null }, { a: 2, b: "l1\nl2", c: "z" }], ["a", "b", "c"]);
  expect(out).toBe('a,b,c\r\n1,"x,""y""",\r\n2,"l1\nl2",z');
});
