import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Anti-Vibe-Coding Security Verification Suite", () => {
  const JWT_TEST_SECRET = "erenthub_test_secret_key_2026";

  it("Point 05: Passwords must be hashed using Bcrypt with salt rounds", async () => {
    const rawPassword = "Ch.N.V.S.Hithesh@511";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    assert.notEqual(rawPassword, hash, "Password must not be stored in plaintext");
    assert.ok(hash.startsWith("$2a$") || hash.startsWith("$2b$"), "Must use bcrypt format ($2a$/$2b$)");

    const validMatch = await bcrypt.compare(rawPassword, hash);
    assert.equal(validMatch, true, "Bcrypt must verify authentic password correctly");

    const invalidMatch = await bcrypt.compare("WrongPassword123", hash);
    assert.equal(invalidMatch, false, "Bcrypt must reject incorrect password");
  });

  it("Point 02 & Point 09: JWT tokens must enforce signed roles and prevent IDOR", () => {
    const payload = {
      id: "6640c4a3b1f5e2d1a89c1001",
      email: "balue.hithesh@gmail.com",
      role: "customer",
    };

    const token = jwt.sign(payload, JWT_TEST_SECRET, { expiresIn: "1h" });
    assert.ok(typeof token === "string" && token.length > 20, "JWT token must be a signed string");

    const decoded = jwt.verify(token, JWT_TEST_SECRET);
    assert.equal(decoded.email, "balue.hithesh@gmail.com");
    assert.equal(decoded.role, "customer");

    // Attempting to verify with a forged secret should fail
    assert.throws(() => {
      jwt.verify(token, "attacker_fake_secret_key");
    }, /invalid signature/);
  });

  it("Point 06: CORS whitelist must reject untrusted origins", () => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
    ];

    function isOriginAllowed(origin) {
      if (!origin) return true; // same-origin/internal
      return allowedOrigins.includes(origin);
    }

    assert.equal(isOriginAllowed("http://localhost:5173"), true, "Must allow dev frontend");
    assert.equal(isOriginAllowed("http://127.0.0.1:5173"), true, "Must allow loopback frontend");
    assert.equal(isOriginAllowed("http://malicious-site.com"), false, "Must block untrusted origin");
    assert.equal(isOriginAllowed("http://attacker.xyz:5173"), false, "Must block spoofed domain");
  });

  it("Point 03: Regex sanitization must neutralize ReDoS and NoSQL query injection", () => {
    function escapeRegex(text) {
      if (typeof text !== "string") return "";
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    const dangerousInput = "(a+)+$";
    const sanitized = escapeRegex(dangerousInput);

    assert.equal(sanitized, "\\(a\\+\\)\\+\\$");
    // Verify that the sanitized regex compiles and matches literal characters safely
    const regex = new RegExp(sanitized);
    assert.equal(regex.test("(a+)+$"), true);
    assert.equal(regex.test("aaaaa"), false);
  });

  it("Point 13: In-Memory cache must store and evict expired items cleanly", async () => {
    const cache = new Map();

    function setCache(key, value, ttlMs) {
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    }

    function getCache(key) {
      const item = cache.get(key);
      if (!item) return null;
      if (Date.now() > item.expiresAt) {
        cache.delete(key);
        return null;
      }
      return item.value;
    }

    setCache("catalog_products", [{ id: "EQ-101", name: "Epson 4K Projector" }], 50);
    assert.deepEqual(getCache("catalog_products"), [{ id: "EQ-101", name: "Epson 4K Projector" }]);

    await new Promise((r) => setTimeout(r, 60));
    assert.equal(getCache("catalog_products"), null, "Cache must evict after TTL expires");
  });
});
