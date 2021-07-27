const NodeCache = require("node-cache");

export default class cacheService {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }
  set(key, value) {
    if (!this.cache.get(key)) this.cache.set(key, value);
    /* console.log(key, ": Cache Operation[SET]"); */
  }

  get(key, storeFunction) {
    const value = this.cache.get(key);
    if (value) {
      /* console.log(`${key}: Cache Operation[GET]`); */
      return Promise.resolve(value);
    }

    return storeFunction().then((result) => {
      /* console.log(`${key}: Cache set[GET_NETWORK]`); */
      this.cache.set(key, result);
      return result;
    });
  }
  wait(key) {
    const value = this.cache.get(key);
    if (value) {
      /* console.log(`${key}: Cache Operation[WAIT]`); */
      return Promise.resolve(value);
    }
    return new Promise((resolve, reject) => {
      function check(count, cache) {
        return () => {
          const value = cache.get(key);
          if (value !== undefined || count > 120) {
            /*  console.log(`${key}: Cache Operation[WAIT]`); */
            return resolve(value);
          }
          /* console.log(key, count); */
          setTimeout(check(count++, cache), 100);
        };
      }
      check(0, this.cache)();
    });
  }

  del(keys) {
    this.cache.del(keys);
  }

  flush() {
    this.cache.flushAll();
  }
}
