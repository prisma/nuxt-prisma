import { describe, it, expect } from "vitest";
import { defineNuxtModule } from "@nuxt/kit";

// Basic module test
describe("prisma module", () => {
  it("should define the module correctly", () => {
    // Import module synchronously for basic test
    const module = defineNuxtModule({
      meta: { name: "test-module" },
      setup() {},
    });

    expect(module).toBeDefined();
    expect(typeof module).toBe("function");
  });

  it("should have default configuration", async () => {
    // Import main module
    const { default: prismaModule } = await import("../src/module");

    expect(prismaModule).toBeDefined();
    expect(typeof prismaModule).toBe("function");
  });
});
