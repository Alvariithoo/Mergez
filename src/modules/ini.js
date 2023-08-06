// Imports
const Logger = require('../modules/Logger');

// Constants
const eol = process.platform === "win32" ? "\r\n" : "\n";
const separator = " = ";

// Encoding function
function encode(obj, opt) {
    const children = [];
    let out = "";

    if (typeof opt === "string") {
        opt = {
            section: opt,
            whitespace: false
        };
    } else {
        opt = opt || {};
        opt.whitespace = opt.whitespace === true;
    }

    Object.keys(obj).forEach((k) => {
        const val = obj[k];
        if (val && Array.isArray(val)) {
            val.forEach((item) => {
                out += `${safe(k + "[]")}${separator}${safe(item)}${eol}`;
            });
        } else if (val && typeof val === "object") {
            children.push(k);
        } else {
            out += `${safe(k)}${separator}${safe(val)}${eol}`;
        }
    });

    if (opt.section && out.length) {
        out = `[${safe(opt.section)}]${eol}${out}`;
    }

    children.forEach((k) => {
        const nk = dotSplit(k).join('\\.');
        const section = (opt.section ? opt.section + "." : "") + nk;
        const child = encode(obj[k], {
            section: section,
            whitespace: opt.whitespace
        });
        if (out.length && child.length) {
            out += eol;
        }
        out += child;
    });

    return out;
}

// Decoding function
function decode(str) {
    const out = {};
    let p = out;
    let section = null;

    const lines = str.split(/[\r\n]+/g);
    const re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i;

    lines.forEach((line) => {
        const testLine = line.trim();

        if (!line || line.match(/^\s*[;#]/)) {
            return;
        }

        const match = line.match(re);

        if (!match) {
            return;
        }

        if (match[1] !== undefined) {
            section = unsafe(match[1]);
            p = out[section] = out[section] || {};
            return;
        }

        const key = unsafe(match[2]);
        const value = match[3] ? unsafe((match[4] || "")) : true;

        if (key.length > 2 && key.slice(-2) === "[]") {
            const arrayKey = key.substring(0, key.length - 2);
            p[arrayKey] = p[arrayKey] || [];
            p[arrayKey].push(value);
        } else if (startsWith(value, "massToSize(") && endsWith(value, ")")) {
            const strValue = value.slice(11, value.length - 1).trim();
            p[key] = Math.sqrt(parseFloat(strValue) * 100) + 0.5;
        } else if (isNaN(value)) {
            p[key] = value;
        } else if (isInt(value)) {
            p[key] = parseInt(value);
        } else {
            p[key] = parseFloat(value);
        }
    });

    return out;
}

// Utility functions
function dotSplit(str) {
    return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
        .replace(/\\\./g, '\u0001')
        .split(/\./).map((part) => {
            return part.replace(/\1/g, '\\.')
                .replace(/\2LITERAL\\1LITERAL\2/g, '\u0001');
        });
}

function startsWith(value, pattern) {
    return value.length >= pattern.length && value.indexOf(pattern) === 0;
}

function endsWith(value, pattern) {
    return value.length >= pattern.length && value.lastIndexOf(pattern) === value.length - pattern.length;
}

function isQuoted(val) {
    return (val.charAt(0) === "\"" && val.slice(-1) === "\"") || (val.charAt(0) === "'" && val.slice(-1) === "'");
}

function safe(val) {
    if (typeof val !== "string" || val.match(/[=\r\n]/) || val.match(/^\[/) || (val.length > 1 && isQuoted(val)) || val !== val.trim()) {
        return JSON.stringify(val);
    }
    return val.replace(/;/g, '\\;').replace(/#/g, "\\#");
}

function unsafe(val) {
    val = (val || "").trim();
    if (isQuoted(val)) {
        if (val.charAt(0) === "'") {
            val = val.substr(1, val.length - 2);
        }
        try {
            val = JSON.parse(val);
        } catch (err) {
            Logger.error(err.stack);
        }
    } else {
        let esc = false;
        let unesc = "";
        for (let i = 0, l = val.length; i < l; i++) {
            const c = val.charAt(i);
            if (esc) {
                if ("\\;#".indexOf(c) !== -1)
                    unesc += c;
                else
                    unesc += "\\" + c;
                esc = false;
            } else if (";#".indexOf(c) !== -1) {
                break;
            } else if (c === "\\") {
                esc = true;
            } else {
                unesc += c;
            }
        }
        if (esc) {
            unesc += "\\";
        }
        return unesc;
    }
    return val;
}

function isInt(n) {
    return parseInt(n) == n;
}

function getLagMessage(updateTimeAvg) {
    if (updateTimeAvg < 20) return "perfectly smooth";
    if (updateTimeAvg < 35) return "good";
    if (updateTimeAvg < 40) return "tiny lag";
    if (updateTimeAvg < 50) return "lag";
    return "extremely high lag";
}

// Export functions
exports.parse = exports.decode = decode;
exports.stringify = exports.encode = encode;
exports.safe = safe;
exports.unsafe = unsafe;
exports.getLagMessage = getLagMessage;