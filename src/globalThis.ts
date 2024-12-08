declare let self: unknown | undefined;
declare let window: unknown | undefined;
// eslint-disable-next-line no-var, import/no-mutable-exports
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  if (typeof global !== 'undefined') return global;
  throw new Error('Unable to locate global object');
})();

export default globalThis;
