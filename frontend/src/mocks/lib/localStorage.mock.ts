export const localStorageMock = (function () {
  let localStorage: Record<string, string> = {};

  return {
    getItem: function (key: string) {
      return localStorage[key] || null;
    },
    setItem: function (key: string, value: string) {
      localStorage[key] = value;
    },
    removeItem: function (key: string) {
      delete localStorage[key];
    },
    clear: function () {
      localStorage = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});
