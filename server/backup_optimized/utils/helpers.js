/**
 * Helper Utilities
 */

/**
 * Convert Map/Set to Array efficiently
 */
const toArray = (collection) => Array.from(collection);

/**
 * Deep clone object (for game state)
 */
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Set) return new Set(toArray(obj));
    if (obj instanceof Map) return new Map(toArray(obj));
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
};

/**
 * Generate unique ID
 */
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Measure execution time
 */
const measureTime = async (fn, name = 'operation') => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration, name };
};

/**
 * Debounce function
 */
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Throttle function
 */
const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

/**
 * Safe JSON parse
 */
const safeJsonParse = (str, defaultValue = null) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        return defaultValue;
    }
};

/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
    return Object.keys(obj).length === 0;
};

/**
 * Retry async function
 */
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
};

/**
 * Create rate limiter map for users
 */
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = new Map();
    }

    isAllowed(key) {
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        
        // Remove old requests outside the window
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(key, validRequests);
        
        return true;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }
}

module.exports = {
    toArray,
    deepClone,
    generateId,
    measureTime,
    debounce,
    throttle,
    safeJsonParse,
    isEmpty,
    retry,
    RateLimiter,
};

