(function attachSafeStorage(host) {
  function cloneFallback(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function read(key, fallback, validator = () => true) {
    try {
      const raw = host.localStorage?.getItem(key);
      if (raw === null || raw === undefined) return cloneFallback(fallback);
      const value = JSON.parse(raw);
      if (!validator(value)) throw new TypeError("Formato persistido invalido.");
      return value;
    } catch {
      try {
        host.localStorage?.removeItem(key);
      } catch {
        // Storage can be unavailable in privacy modes; the fallback remains usable.
      }
      return cloneFallback(fallback);
    }
  }

  function write(key, value) {
    try {
      host.localStorage?.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(key) {
    try {
      host.localStorage?.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  const api = Object.freeze({ read, write, remove });
  host.SafeStorage = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
