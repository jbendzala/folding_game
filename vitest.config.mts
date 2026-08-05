import { defineConfig } from 'vitest/config';

// Only the pure-TypeScript game engine (src/core, src/data) is unit tested
// this way; it has no React Native imports, so a plain node environment is
// enough and keeps this fast and independent of the Expo/Metro toolchain.
export default defineConfig({
  test: {
    include: ['src/core/**/*.test.ts', 'src/data/**/*.test.ts'],
  },
});
