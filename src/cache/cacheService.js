const NodeCache = require("node-cache");

export default class cacheService {
  constructor(ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
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
          /* console.log(key, count); */
          if (value !== undefined || count > 120) {
            /*  console.log(`${key}: Cache Operation[WAIT]`); */
            return resolve(value);
          }
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
