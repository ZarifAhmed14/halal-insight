import assert from "node:assert/strict";
import { analyzeProductLocally } from "../src/features/assistant/report-logic";

const lowRisk = analyzeProductLocally({
  product_name: "Oat Biscuit",
  ingredients: ["Oats", "Sugar", "Sunflower Oil"],
  market: "Malaysia",
  domain: "food",
});
const blocked = analyzeProductLocally({
  product_name: "Ham Snack",
  ingredients: ["Wheat Flour", "Ham"],
  market: "Malaysia",
  domain: "food",
});

assert.equal(lowRisk.overall_status, "Low Risk");
assert.equal(blocked.overall_status, "Not Ready");
console.log("Local analyzer check passed");
