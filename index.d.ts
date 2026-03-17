declare module 'brittle-snapshot' {
  /**
   * Compare `source` against a stored snapshot using character-level diffing.
   *
   * @param t - A brittle test instance.
   * @param source - The string to snapshot.
   * @param desc - Optional label for the snapshot key. Defaults to an auto-incrementing counter.
   */
  export function matchSnapshot(t: BrittleTest, source: string, desc?: string): void

  /**
   * Compare `source` against a stored snapshot using CSS-aware diffing.
   *
   * @param t - A brittle test instance.
   * @param source - The string to snapshot.
   * @param desc - Optional label for the snapshot key. Defaults to an auto-incrementing counter.
   */
  export function matchSnapshotCSS(t: BrittleTest, source: string, desc?: string): void

  /**
   * Compare `source` against a stored snapshot using JSON-aware diffing.
   *
   * @param t - A brittle test instance.
   * @param source - The string to snapshot.
   * @param desc - Optional label for the snapshot key. Defaults to an auto-incrementing counter.
   */
  export function matchSnapshotJSON(t: BrittleTest, source: string, desc?: string): void

  interface BrittleTest {
    name: string
    pass(message?: string): void
    fail(message?: string): void
  }
}
