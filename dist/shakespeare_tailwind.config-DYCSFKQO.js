var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x2) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x2)(function(x2) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x2 + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// esm:https://esm.sh/*tailwindcss@3.4.17/plugin?target=esnext&lp=node_modules%252Ftailwindcss
var plugin_target_esnext_lp_node_modules_252Ftailwindcss_exports = {};
__export(plugin_target_esnext_lp_node_modules_252Ftailwindcss_exports, {
  default: () => A
});

// esm:https://esm.sh/*tailwindcss@3.4.17/esnext/plugin.mjs?lp=node_modules%252Ftailwindcss
var g = Object.create;
var _ = Object.defineProperty;
var m = Object.getOwnPropertyDescriptor;
var O = Object.getOwnPropertyNames;
var y = Object.getPrototypeOf;
var M = Object.prototype.hasOwnProperty;
var i = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var b = (e, t, u2, r2) => {
  if (t && typeof t == "object" || typeof t == "function") for (let n of O(t)) !M.call(e, n) && n !== u2 && _(e, n, { get: () => t[n], enumerable: !(r2 = m(t, n)) || r2.enumerable });
  return e;
};
var h = (e, t, u2) => (u2 = e != null ? g(y(e)) : {}, b(t || !e || !e.__esModule ? _(u2, "default", { value: e, enumerable: true }) : u2, e));
var d = i((l) => {
  "use strict";
  Object.defineProperty(l, "__esModule", { value: true });
  Object.defineProperty(l, "default", { enumerable: true, get: function() {
    return j;
  } });
  function a(e, t) {
    return { handler: e, config: t };
  }
  a.withOptions = function(e, t = () => ({})) {
    let u2 = function(r2) {
      return { __options: r2, handler: e(r2), config: t(r2) };
    };
    return u2.__isOptionsFunction = true, u2.__pluginFunction = e, u2.__configFunction = t, u2;
  };
  var j = a;
});
var s = i((o2) => {
  "use strict";
  Object.defineProperty(o2, "__esModule", { value: true });
  Object.defineProperty(o2, "default", { enumerable: true, get: function() {
    return x2;
  } });
  var q = v2(d());
  function v2(e) {
    return e && e.__esModule ? e : { default: e };
  }
  var x2 = q.default;
});
var P = i((z, p2) => {
  var c2 = s();
  p2.exports = (c2.__esModule ? c2 : { default: c2 }).default;
});
var f = h(P());
var A = f.default ?? f;

// esm:https://esm.sh/*tailwindcss-animate@1.0.7/esnext/tailwindcss-animate.mjs?lp=node_modules%252Ftailwindcss-animate
var require2 = (n) => {
  const e = (m3) => typeof m3.default < "u" ? m3.default : m3, c2 = (m3) => Object.assign({ __esModule: true }, m3);
  switch (n) {
    case "tailwindcss/plugin":
      return e(plugin_target_esnext_lp_node_modules_252Ftailwindcss_exports);
    default:
      console.error('module "' + n + '" not found');
      return null;
  }
};
var u = Object.create;
var o = Object.defineProperty;
var w = Object.getOwnPropertyDescriptor;
var x = Object.getOwnPropertyNames;
var c = Object.getPrototypeOf;
var y2 = Object.prototype.hasOwnProperty;
var d2 = ((a) => typeof require2 < "u" ? require2 : typeof Proxy < "u" ? new Proxy(a, { get: (n, e) => (typeof require2 < "u" ? require2 : n)[e] }) : a)(function(a) {
  if (typeof require2 < "u") return require2.apply(this, arguments);
  throw Error('Dynamic require of "' + a + '" is not supported');
});
var f2 = (a, n) => () => (n || a((n = { exports: {} }).exports, n), n.exports);
var v = (a, n, e, t) => {
  if (n && typeof n == "object" || typeof n == "function") for (let i2 of x(n)) !y2.call(a, i2) && i2 !== e && o(a, i2, { get: () => n[i2], enumerable: !(t = w(n, i2)) || t.enumerable });
  return a;
};
var p = (a, n, e) => (e = a != null ? u(c(a)) : {}, v(n || !a || !a.__esModule ? o(e, "default", { value: a, enumerable: true }) : e, a));
var m2 = f2((T, s2) => {
  var D = d2("tailwindcss/plugin");
  function l(a) {
    return Object.fromEntries(Object.entries(a).filter(([n]) => n !== "DEFAULT"));
  }
  s2.exports = D(({ addUtilities: a, matchUtilities: n, theme: e }) => {
    a({ "@keyframes enter": e("keyframes.enter"), "@keyframes exit": e("keyframes.exit"), ".animate-in": { animationName: "enter", animationDuration: e("animationDuration.DEFAULT"), "--tw-enter-opacity": "initial", "--tw-enter-scale": "initial", "--tw-enter-rotate": "initial", "--tw-enter-translate-x": "initial", "--tw-enter-translate-y": "initial" }, ".animate-out": { animationName: "exit", animationDuration: e("animationDuration.DEFAULT"), "--tw-exit-opacity": "initial", "--tw-exit-scale": "initial", "--tw-exit-rotate": "initial", "--tw-exit-translate-x": "initial", "--tw-exit-translate-y": "initial" } }), n({ "fade-in": (t) => ({ "--tw-enter-opacity": t }), "fade-out": (t) => ({ "--tw-exit-opacity": t }) }, { values: e("animationOpacity") }), n({ "zoom-in": (t) => ({ "--tw-enter-scale": t }), "zoom-out": (t) => ({ "--tw-exit-scale": t }) }, { values: e("animationScale") }), n({ "spin-in": (t) => ({ "--tw-enter-rotate": t }), "spin-out": (t) => ({ "--tw-exit-rotate": t }) }, { values: e("animationRotate") }), n({ "slide-in-from-top": (t) => ({ "--tw-enter-translate-y": `-${t}` }), "slide-in-from-bottom": (t) => ({ "--tw-enter-translate-y": t }), "slide-in-from-left": (t) => ({ "--tw-enter-translate-x": `-${t}` }), "slide-in-from-right": (t) => ({ "--tw-enter-translate-x": t }), "slide-out-to-top": (t) => ({ "--tw-exit-translate-y": `-${t}` }), "slide-out-to-bottom": (t) => ({ "--tw-exit-translate-y": t }), "slide-out-to-left": (t) => ({ "--tw-exit-translate-x": `-${t}` }), "slide-out-to-right": (t) => ({ "--tw-exit-translate-x": t }) }, { values: e("animationTranslate") }), n({ duration: (t) => ({ animationDuration: t }) }, { values: l(e("animationDuration")) }), n({ delay: (t) => ({ animationDelay: t }) }, { values: e("animationDelay") }), n({ ease: (t) => ({ animationTimingFunction: t }) }, { values: l(e("animationTimingFunction")) }), a({ ".running": { animationPlayState: "running" }, ".paused": { animationPlayState: "paused" } }), n({ "fill-mode": (t) => ({ animationFillMode: t }) }, { values: e("animationFillMode") }), n({ direction: (t) => ({ animationDirection: t }) }, { values: e("animationDirection") }), n({ repeat: (t) => ({ animationIterationCount: t }) }, { values: e("animationRepeat") });
  }, { theme: { extend: { animationDelay: ({ theme: a }) => ({ ...a("transitionDelay") }), animationDuration: ({ theme: a }) => ({ 0: "0ms", ...a("transitionDuration") }), animationTimingFunction: ({ theme: a }) => ({ ...a("transitionTimingFunction") }), animationFillMode: { none: "none", forwards: "forwards", backwards: "backwards", both: "both" }, animationDirection: { normal: "normal", reverse: "reverse", alternate: "alternate", "alternate-reverse": "alternate-reverse" }, animationOpacity: ({ theme: a }) => ({ DEFAULT: 0, ...a("opacity") }), animationTranslate: ({ theme: a }) => ({ DEFAULT: "100%", ...a("translate") }), animationScale: ({ theme: a }) => ({ DEFAULT: 0, ...a("scale") }), animationRotate: ({ theme: a }) => ({ DEFAULT: "30deg", ...a("rotate") }), animationRepeat: { 0: "0", 1: "1", infinite: "infinite" }, keyframes: { enter: { from: { opacity: "var(--tw-enter-opacity, 1)", transform: "translate3d(var(--tw-enter-translate-x, 0), var(--tw-enter-translate-y, 0), 0) scale3d(var(--tw-enter-scale, 1), var(--tw-enter-scale, 1), var(--tw-enter-scale, 1)) rotate(var(--tw-enter-rotate, 0))" } }, exit: { to: { opacity: "var(--tw-exit-opacity, 1)", transform: "translate3d(var(--tw-exit-translate-x, 0), var(--tw-exit-translate-y, 0), 0) scale3d(var(--tw-exit-scale, 1), var(--tw-exit-scale, 1), var(--tw-exit-scale, 1)) rotate(var(--tw-exit-rotate, 0))" } } } } } });
});
var r = p(m2());
var g2 = r.default ?? r;

// fs:/projects/traveltelly/tailwind.config.ts
var tailwind_config_default = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["Inter Variable", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [g2]
};

// esm:https://esm.sh/tailwindcss-cdn@3.4.10/es2022/tailwindcss-cdn.mjs
var Of = Object.create;
var ji = Object.defineProperty;
var _f = Object.getOwnPropertyDescriptor;
var Ef = Object.getOwnPropertyNames;
var Tf = Object.getPrototypeOf;
var If = Object.prototype.hasOwnProperty;
var fo = ((ve) => typeof __require < "u" ? __require : typeof Proxy < "u" ? new Proxy(ve, { get: (ge, Je) => (typeof __require < "u" ? __require : ge)[Je] }) : ve)(function(ve) {
  if (typeof __require < "u") return __require.apply(this, arguments);
  throw Error('Dynamic require of "' + ve + '" is not supported');
});
var Pf = (ve, ge) => () => (ge || ve((ge = { exports: {} }).exports, ge), ge.exports);
var jf = (ve, ge, Je, Gt) => {
  if (ge && typeof ge == "object" || typeof ge == "function") for (let lt of Ef(ge)) !If.call(ve, lt) && lt !== Je && ji(ve, lt, { get: () => ge[lt], enumerable: !(Gt = _f(ge, lt)) || Gt.enumerable });
  return ve;
};
var Bf = (ve, ge, Je) => (Je = ve != null ? Of(Tf(ve)) : {}, jf(ge || !ve || !ve.__esModule ? ji(Je, "default", { value: ve, enumerable: true }) : Je, ve));
var Bi = Pf(() => {
  (() => {
    var ve = Object.create, ge = Object.defineProperty, Je = Object.getOwnPropertyDescriptor, Gt = Object.getOwnPropertyNames, lt = Object.getPrototypeOf, Di = Object.prototype.hasOwnProperty, mo = (e) => ge(e, "__esModule", { value: true }), $i = (e) => {
      if (typeof fo < "u") return fo(e);
      throw new Error('Dynamic require of "' + e + '" is not supported');
    }, $ = (e, t) => () => (e && (t = e(e = 0)), t), T = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports), Fe = (e, t) => {
      mo(e);
      for (var r2 in t) ge(e, r2, { get: t[r2], enumerable: true });
    }, Ri = (e, t, r2) => {
      if (t && typeof t == "object" || typeof t == "function") for (let n of Gt(t)) !Di.call(e, n) && n !== "default" && ge(e, n, { get: () => t[n], enumerable: !(r2 = Je(t, n)) || r2.enumerable });
      return e;
    }, he = (e) => Ri(mo(ge(e != null ? ve(lt(e)) : {}, "default", e && e.__esModule && "default" in e ? { get: () => e.default, enumerable: true } : { value: e, enumerable: true })), e), je, O2 = $(() => {
      je = { platform: "", env: {}, versions: { node: "14.17.6" } };
    }), go, Be, rt = $(() => {
      O2(), go = 0, Be = { readFileSync: (e) => self[e] || "", statSync: () => ({ mtimeMs: go++ }), promises: { readFile: (e) => Promise.resolve(self[e] || "") } };
    }), vo = T((e, t) => {
      O2();
      var r2 = class {
        constructor(n = {}) {
          if (!(n.maxSize && n.maxSize > 0)) throw new TypeError("`maxSize` must be a number greater than 0");
          if (typeof n.maxAge == "number" && n.maxAge === 0) throw new TypeError("`maxAge` must be a number greater than 0");
          this.maxSize = n.maxSize, this.maxAge = n.maxAge || 1 / 0, this.onEviction = n.onEviction, this.cache = /* @__PURE__ */ new Map(), this.oldCache = /* @__PURE__ */ new Map(), this._size = 0;
        }
        _emitEvictions(n) {
          if (typeof this.onEviction == "function") for (let [o2, s2] of n) this.onEviction(o2, s2.value);
        }
        _deleteIfExpired(n, o2) {
          return typeof o2.expiry == "number" && o2.expiry <= Date.now() ? (typeof this.onEviction == "function" && this.onEviction(n, o2.value), this.delete(n)) : false;
        }
        _getOrDeleteIfExpired(n, o2) {
          if (this._deleteIfExpired(n, o2) === false) return o2.value;
        }
        _getItemValue(n, o2) {
          return o2.expiry ? this._getOrDeleteIfExpired(n, o2) : o2.value;
        }
        _peek(n, o2) {
          let s2 = o2.get(n);
          return this._getItemValue(n, s2);
        }
        _set(n, o2) {
          this.cache.set(n, o2), this._size++, this._size >= this.maxSize && (this._size = 0, this._emitEvictions(this.oldCache), this.oldCache = this.cache, this.cache = /* @__PURE__ */ new Map());
        }
        _moveToRecent(n, o2) {
          this.oldCache.delete(n), this._set(n, o2);
        }
        *_entriesAscending() {
          for (let n of this.oldCache) {
            let [o2, s2] = n;
            this.cache.has(o2) || this._deleteIfExpired(o2, s2) === false && (yield n);
          }
          for (let n of this.cache) {
            let [o2, s2] = n;
            this._deleteIfExpired(o2, s2) === false && (yield n);
          }
        }
        get(n) {
          if (this.cache.has(n)) {
            let o2 = this.cache.get(n);
            return this._getItemValue(n, o2);
          }
          if (this.oldCache.has(n)) {
            let o2 = this.oldCache.get(n);
            if (this._deleteIfExpired(n, o2) === false) return this._moveToRecent(n, o2), o2.value;
          }
        }
        set(n, o2, { maxAge: s2 = this.maxAge === 1 / 0 ? void 0 : Date.now() + this.maxAge } = {}) {
          this.cache.has(n) ? this.cache.set(n, { value: o2, maxAge: s2 }) : this._set(n, { value: o2, expiry: s2 });
        }
        has(n) {
          return this.cache.has(n) ? !this._deleteIfExpired(n, this.cache.get(n)) : this.oldCache.has(n) ? !this._deleteIfExpired(n, this.oldCache.get(n)) : false;
        }
        peek(n) {
          if (this.cache.has(n)) return this._peek(n, this.cache);
          if (this.oldCache.has(n)) return this._peek(n, this.oldCache);
        }
        delete(n) {
          let o2 = this.cache.delete(n);
          return o2 && this._size--, this.oldCache.delete(n) || o2;
        }
        clear() {
          this.cache.clear(), this.oldCache.clear(), this._size = 0;
        }
        resize(n) {
          if (!(n && n > 0)) throw new TypeError("`maxSize` must be a number greater than 0");
          let o2 = [...this._entriesAscending()], s2 = o2.length - n;
          s2 < 0 ? (this.cache = new Map(o2), this.oldCache = /* @__PURE__ */ new Map(), this._size = o2.length) : (s2 > 0 && this._emitEvictions(o2.slice(0, s2)), this.oldCache = new Map(o2.slice(s2)), this.cache = /* @__PURE__ */ new Map(), this._size = 0), this.maxSize = n;
        }
        *keys() {
          for (let [n] of this) yield n;
        }
        *values() {
          for (let [, n] of this) yield n;
        }
        *[Symbol.iterator]() {
          for (let n of this.cache) {
            let [o2, s2] = n;
            this._deleteIfExpired(o2, s2) === false && (yield [o2, s2.value]);
          }
          for (let n of this.oldCache) {
            let [o2, s2] = n;
            this.cache.has(o2) || this._deleteIfExpired(o2, s2) === false && (yield [o2, s2.value]);
          }
        }
        *entriesDescending() {
          let n = [...this.cache];
          for (let o2 = n.length - 1; o2 >= 0; --o2) {
            let s2 = n[o2], [a, l] = s2;
            this._deleteIfExpired(a, l) === false && (yield [a, l.value]);
          }
          n = [...this.oldCache];
          for (let o2 = n.length - 1; o2 >= 0; --o2) {
            let s2 = n[o2], [a, l] = s2;
            this.cache.has(a) || this._deleteIfExpired(a, l) === false && (yield [a, l.value]);
          }
        }
        *entriesAscending() {
          for (let [n, o2] of this._entriesAscending()) yield [n, o2.value];
        }
        get size() {
          if (!this._size) return this.oldCache.size;
          let n = 0;
          for (let o2 of this.oldCache.keys()) this.cache.has(o2) || n++;
          return Math.min(this._size + n, this.maxSize);
        }
      };
      t.exports = r2;
    }), yo, Mi = $(() => {
      O2(), yo = (e) => e && e._hash;
    });
    function bo(e) {
      return yo(e, { ignoreUnknown: true });
    }
    var Ui = $(() => {
      O2(), Mi();
    });
    function Yt(e) {
      if (e = `${e}`, e === "0") return "0";
      if (/^[+-]?(\d+|\d*\.\d+)(e[+-]?\d+)?(%|\w+)?$/.test(e)) return e.replace(/^[+-]?/, (r2) => r2 === "-" ? "" : "-");
      let t = ["var", "calc", "min", "max", "clamp"];
      for (let r2 of t) if (e.includes(`${r2}(`)) return `calc(${e} * -1)`;
    }
    var jr = $(() => {
      O2();
    }), wo, zi = $(() => {
      O2(), wo = ["preflight", "container", "accessibility", "pointerEvents", "visibility", "position", "inset", "isolation", "zIndex", "order", "gridColumn", "gridColumnStart", "gridColumnEnd", "gridRow", "gridRowStart", "gridRowEnd", "float", "clear", "margin", "boxSizing", "lineClamp", "display", "aspectRatio", "size", "height", "maxHeight", "minHeight", "width", "minWidth", "maxWidth", "flex", "flexShrink", "flexGrow", "flexBasis", "tableLayout", "captionSide", "borderCollapse", "borderSpacing", "transformOrigin", "translate", "rotate", "skew", "scale", "transform", "animation", "cursor", "touchAction", "userSelect", "resize", "scrollSnapType", "scrollSnapAlign", "scrollSnapStop", "scrollMargin", "scrollPadding", "listStylePosition", "listStyleType", "listStyleImage", "appearance", "columns", "breakBefore", "breakInside", "breakAfter", "gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateColumns", "gridTemplateRows", "flexDirection", "flexWrap", "placeContent", "placeItems", "alignContent", "alignItems", "justifyContent", "justifyItems", "gap", "space", "divideWidth", "divideStyle", "divideColor", "divideOpacity", "placeSelf", "alignSelf", "justifySelf", "overflow", "overscrollBehavior", "scrollBehavior", "textOverflow", "hyphens", "whitespace", "textWrap", "wordBreak", "borderRadius", "borderWidth", "borderStyle", "borderColor", "borderOpacity", "backgroundColor", "backgroundOpacity", "backgroundImage", "gradientColorStops", "boxDecorationBreak", "backgroundSize", "backgroundAttachment", "backgroundClip", "backgroundPosition", "backgroundRepeat", "backgroundOrigin", "fill", "stroke", "strokeWidth", "objectFit", "objectPosition", "padding", "textAlign", "textIndent", "verticalAlign", "fontFamily", "fontSize", "fontWeight", "textTransform", "fontStyle", "fontVariantNumeric", "lineHeight", "letterSpacing", "textColor", "textOpacity", "textDecoration", "textDecorationColor", "textDecorationStyle", "textDecorationThickness", "textUnderlineOffset", "fontSmoothing", "placeholderColor", "placeholderOpacity", "caretColor", "accentColor", "opacity", "backgroundBlendMode", "mixBlendMode", "boxShadow", "boxShadowColor", "outlineStyle", "outlineWidth", "outlineOffset", "outlineColor", "ringWidth", "ringColor", "ringOpacity", "ringOffsetWidth", "ringOffsetColor", "blur", "brightness", "contrast", "dropShadow", "grayscale", "hueRotate", "invert", "saturate", "sepia", "filter", "backdropBlur", "backdropBrightness", "backdropContrast", "backdropGrayscale", "backdropHueRotate", "backdropInvert", "backdropOpacity", "backdropSaturate", "backdropSepia", "backdropFilter", "transitionProperty", "transitionDelay", "transitionDuration", "transitionTimingFunction", "willChange", "contain", "content", "forcedColorAdjust"];
    });
    function Fi(e, t) {
      return e === void 0 ? t : Array.isArray(e) ? e : [...new Set(t.filter((r2) => e !== false && e[r2] !== false).concat(Object.keys(e).filter((r2) => e[r2] !== false)))];
    }
    var Li = $(() => {
      O2();
    }), xo = {};
    Fe(xo, { default: () => qe });
    var qe, Br = $(() => {
      O2(), qe = new Proxy({}, { get: () => String });
    });
    function Dr(e, t, r2) {
      typeof je < "u" && je.env.JEST_WORKER_ID || r2 && $r.has(r2) || (r2 && $r.add(r2), console.warn(""), t.forEach((n) => console.warn(e, "-", n)));
    }
    function ko(e) {
      return qe.dim(e);
    }
    var $r, de, Ge = $(() => {
      O2(), Br(), $r = /* @__PURE__ */ new Set(), de = { info(e, t) {
        Dr(qe.bold(qe.cyan("info")), ...Array.isArray(e) ? [e] : [t, e]);
      }, warn(e, t) {
        ["content-problems"].includes(e) || Dr(qe.bold(qe.yellow("warn")), ...Array.isArray(e) ? [e] : [t, e]);
      }, risk(e, t) {
        Dr(qe.bold(qe.magenta("risk")), ...Array.isArray(e) ? [e] : [t, e]);
      } };
    }), So = {};
    Fe(So, { default: () => Rr });
    function It({ version: e, from: t, to: r2 }) {
      de.warn(`${t}-color-renamed`, [`As of Tailwind CSS ${e}, \`${t}\` has been renamed to \`${r2}\`.`, "Update your configuration file to silence this warning."]);
    }
    var Rr, Co = $(() => {
      O2(), Ge(), Rr = { inherit: "inherit", current: "currentColor", transparent: "transparent", black: "#000", white: "#fff", slate: { 50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0", 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569", 700: "#334155", 800: "#1e293b", 900: "#0f172a", 950: "#020617" }, gray: { 50: "#f9fafb", 100: "#f3f4f6", 200: "#e5e7eb", 300: "#d1d5db", 400: "#9ca3af", 500: "#6b7280", 600: "#4b5563", 700: "#374151", 800: "#1f2937", 900: "#111827", 950: "#030712" }, zinc: { 50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa", 500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b", 950: "#09090b" }, neutral: { 50: "#fafafa", 100: "#f5f5f5", 200: "#e5e5e5", 300: "#d4d4d4", 400: "#a3a3a3", 500: "#737373", 600: "#525252", 700: "#404040", 800: "#262626", 900: "#171717", 950: "#0a0a0a" }, stone: { 50: "#fafaf9", 100: "#f5f5f4", 200: "#e7e5e4", 300: "#d6d3d1", 400: "#a8a29e", 500: "#78716c", 600: "#57534e", 700: "#44403c", 800: "#292524", 900: "#1c1917", 950: "#0c0a09" }, red: { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a" }, orange: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12", 950: "#431407" }, amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" }, yellow: { 50: "#fefce8", 100: "#fef9c3", 200: "#fef08a", 300: "#fde047", 400: "#facc15", 500: "#eab308", 600: "#ca8a04", 700: "#a16207", 800: "#854d0e", 900: "#713f12", 950: "#422006" }, lime: { 50: "#f7fee7", 100: "#ecfccb", 200: "#d9f99d", 300: "#bef264", 400: "#a3e635", 500: "#84cc16", 600: "#65a30d", 700: "#4d7c0f", 800: "#3f6212", 900: "#365314", 950: "#1a2e05" }, green: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" }, emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" }, teal: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a", 950: "#042f2e" }, cyan: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" }, sky: { 50: "#f0f9ff", 100: "#e0f2fe", 200: "#bae6fd", 300: "#7dd3fc", 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7", 700: "#0369a1", 800: "#075985", 900: "#0c4a6e", 950: "#082f49" }, blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" }, indigo: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b" }, violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065" }, purple: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87", 950: "#3b0764" }, fuchsia: { 50: "#fdf4ff", 100: "#fae8ff", 200: "#f5d0fe", 300: "#f0abfc", 400: "#e879f9", 500: "#d946ef", 600: "#c026d3", 700: "#a21caf", 800: "#86198f", 900: "#701a75", 950: "#4a044e" }, pink: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843", 950: "#500724" }, rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" }, get lightBlue() {
        return It({ version: "v2.2", from: "lightBlue", to: "sky" }), this.sky;
      }, get warmGray() {
        return It({ version: "v3.0", from: "warmGray", to: "stone" }), this.stone;
      }, get trueGray() {
        return It({ version: "v3.0", from: "trueGray", to: "neutral" }), this.neutral;
      }, get coolGray() {
        return It({ version: "v3.0", from: "coolGray", to: "gray" }), this.gray;
      }, get blueGray() {
        return It({ version: "v3.0", from: "blueGray", to: "slate" }), this.slate;
      } };
    });
    function Ao(e, ...t) {
      for (let r2 of t) {
        for (let n in r2) e?.hasOwnProperty?.(n) || (e[n] = r2[n]);
        for (let n of Object.getOwnPropertySymbols(r2)) e?.hasOwnProperty?.(n) || (e[n] = r2[n]);
      }
      return e;
    }
    var Ni = $(() => {
      O2();
    });
    function Pt(e) {
      if (Array.isArray(e)) return e;
      let t = e.split("[").length - 1, r2 = e.split("]").length - 1;
      if (t !== r2) throw new Error(`Path is invalid. Has unbalanced brackets: ${e}`);
      return e.split(/\.(?![^\[]*\])|[\[\]]/g).filter(Boolean);
    }
    var Mr = $(() => {
      O2();
    });
    function De(e, t) {
      return jt.future.includes(t) ? e.future === "all" || (e?.future?.[t] ?? Ur[t] ?? false) : jt.experimental.includes(t) ? e.experimental === "all" || (e?.experimental?.[t] ?? Ur[t] ?? false) : false;
    }
    function Oo(e) {
      return e.experimental === "all" ? jt.experimental : Object.keys(e?.experimental ?? {}).filter((t) => jt.experimental.includes(t) && e.experimental[t]);
    }
    function Vi(e) {
      if (je.env.JEST_WORKER_ID === void 0 && Oo(e).length > 0) {
        let t = Oo(e).map((r2) => qe.yellow(r2)).join(", ");
        de.warn("experimental-flags-enabled", [`You have enabled experimental features: ${t}`, "Experimental features in Tailwind CSS are not covered by semver, may introduce breaking changes, and can change at any time."]);
      }
    }
    var Ur, jt, nt = $(() => {
      O2(), Br(), Ge(), Ur = { optimizeUniversalDefaults: false, generalizedModifiers: true, disableColorOpacityUtilitiesByDefault: false, relativeContentPathsByDefault: false }, jt = { future: ["hoverOnlyWhenSupported", "respectDefaultRingColorOpacity", "disableColorOpacityUtilitiesByDefault", "relativeContentPathsByDefault"], experimental: ["optimizeUniversalDefaults", "generalizedModifiers"] };
    });
    function Wi(e) {
      (() => {
        if (e.purge || !e.content || !Array.isArray(e.content) && !(typeof e.content == "object" && e.content !== null)) return false;
        if (Array.isArray(e.content)) return e.content.every((t) => typeof t == "string" ? true : !(typeof t?.raw != "string" || t?.extension && typeof t?.extension != "string"));
        if (typeof e.content == "object" && e.content !== null) {
          if (Object.keys(e.content).some((t) => !["files", "relative", "extract", "transform"].includes(t))) return false;
          if (Array.isArray(e.content.files)) {
            if (!e.content.files.every((t) => typeof t == "string" ? true : !(typeof t?.raw != "string" || t?.extension && typeof t?.extension != "string"))) return false;
            if (typeof e.content.extract == "object") {
              for (let t of Object.values(e.content.extract)) if (typeof t != "function") return false;
            } else if (!(e.content.extract === void 0 || typeof e.content.extract == "function")) return false;
            if (typeof e.content.transform == "object") {
              for (let t of Object.values(e.content.transform)) if (typeof t != "function") return false;
            } else if (!(e.content.transform === void 0 || typeof e.content.transform == "function")) return false;
            if (typeof e.content.relative != "boolean" && typeof e.content.relative < "u") return false;
          }
          return true;
        }
        return false;
      })() || de.warn("purge-deprecation", ["The `purge`/`content` options have changed in Tailwind CSS v3.0.", "Update your configuration file to eliminate this warning.", "https://tailwindcss.com/docs/upgrade-guide#configure-content-sources"]), e.safelist = (() => {
        let { content: t, purge: r2, safelist: n } = e;
        return Array.isArray(n) ? n : Array.isArray(t?.safelist) ? t.safelist : Array.isArray(r2?.safelist) ? r2.safelist : Array.isArray(r2?.options?.safelist) ? r2.options.safelist : [];
      })(), e.blocklist = (() => {
        let { blocklist: t } = e;
        if (Array.isArray(t)) {
          if (t.every((r2) => typeof r2 == "string")) return t;
          de.warn("blocklist-invalid", ["The `blocklist` option must be an array of strings.", "https://tailwindcss.com/docs/content-configuration#discarding-classes"]);
        }
        return [];
      })(), typeof e.prefix == "function" ? (de.warn("prefix-function", ["As of Tailwind CSS v3.0, `prefix` cannot be a function.", "Update `prefix` in your configuration to be a string to eliminate this warning.", "https://tailwindcss.com/docs/upgrade-guide#prefix-cannot-be-a-function"]), e.prefix = "") : e.prefix = e.prefix ?? "", e.content = { relative: (() => {
        let { content: t } = e;
        return t?.relative ? t.relative : De(e, "relativeContentPathsByDefault");
      })(), files: (() => {
        let { content: t, purge: r2 } = e;
        return Array.isArray(r2) ? r2 : Array.isArray(r2?.content) ? r2.content : Array.isArray(t) ? t : Array.isArray(t?.content) ? t.content : Array.isArray(t?.files) ? t.files : [];
      })(), extract: (() => {
        let t = e.purge?.extract ? e.purge.extract : e.content?.extract ? e.content.extract : e.purge?.extract?.DEFAULT ? e.purge.extract.DEFAULT : e.content?.extract?.DEFAULT ? e.content.extract.DEFAULT : e.purge?.options?.extractors ? e.purge.options.extractors : e.content?.options?.extractors ? e.content.options.extractors : {}, r2 = {}, n = (() => {
          if (e.purge?.options?.defaultExtractor) return e.purge.options.defaultExtractor;
          if (e.content?.options?.defaultExtractor) return e.content.options.defaultExtractor;
        })();
        if (n !== void 0 && (r2.DEFAULT = n), typeof t == "function") r2.DEFAULT = t;
        else if (Array.isArray(t)) for (let { extensions: o2, extractor: s2 } of t ?? []) for (let a of o2) r2[a] = s2;
        else typeof t == "object" && t !== null && Object.assign(r2, t);
        return r2;
      })(), transform: (() => {
        let t = e.purge?.transform ? e.purge.transform : e.content?.transform ? e.content.transform : e.purge?.transform?.DEFAULT ? e.purge.transform.DEFAULT : e.content?.transform?.DEFAULT ? e.content.transform.DEFAULT : {}, r2 = {};
        return typeof t == "function" ? r2.DEFAULT = t : typeof t == "object" && t !== null && Object.assign(r2, t), r2;
      })() };
      for (let t of e.content.files) if (typeof t == "string" && /{([^,]*?)}/g.test(t)) {
        de.warn("invalid-glob-braces", [`The glob pattern ${ko(t)} in your Tailwind CSS configuration is invalid.`, `Update it to ${ko(t.replace(/{([^,]*?)}/g, "$1"))} to silence this warning.`]);
        break;
      }
      return e;
    }
    var qi = $(() => {
      O2(), nt(), Ge();
    });
    function Le(e) {
      if (Object.prototype.toString.call(e) !== "[object Object]") return false;
      let t = Object.getPrototypeOf(e);
      return t === null || Object.getPrototypeOf(t) === null;
    }
    var Bt = $(() => {
      O2();
    });
    function Dt(e) {
      return Array.isArray(e) ? e.map((t) => Dt(t)) : typeof e == "object" && e !== null ? Object.fromEntries(Object.entries(e).map(([t, r2]) => [t, Dt(r2)])) : e;
    }
    var zr = $(() => {
      O2();
    });
    function Fr(e) {
      return e.replace(/\\,/g, "\\2c ");
    }
    var Lr = $(() => {
      O2();
    }), Nr, Gi = $(() => {
      O2(), Nr = { aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255], aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220], bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205], blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42], burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0], chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237], cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255], darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11], darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169], darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47], darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0], darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139], darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209], darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255], dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255], firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34], fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255], gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128], green: [0, 128, 0], greenyellow: [173, 255, 47], grey: [128, 128, 128], honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92], indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140], lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0], lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128], lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211], lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193], lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250], lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222], lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50], linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0], mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211], mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238], mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133], midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225], moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128], oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35], orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214], palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238], palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185], peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221], powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153], red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225], saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96], seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45], silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205], slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250], springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140], teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71], turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179], white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0], yellowgreen: [154, 205, 50] };
    });
    function Vr(e, { loose: t = false } = {}) {
      if (typeof e != "string") return null;
      if (e = e.trim(), e === "transparent") return { mode: "rgb", color: ["0", "0", "0"], alpha: "0" };
      if (e in Nr) return { mode: "rgb", color: Nr[e].map((s2) => s2.toString()) };
      let r2 = e.replace(To, (s2, a, l, c2, i2) => ["#", a, a, l, l, c2, c2, i2 ? i2 + i2 : ""].join("")).match(Eo);
      if (r2 !== null) return { mode: "rgb", color: [parseInt(r2[1], 16), parseInt(r2[2], 16), parseInt(r2[3], 16)].map((s2) => s2.toString()), alpha: r2[4] ? (parseInt(r2[4], 16) / 255).toString() : void 0 };
      let n = e.match(Io) ?? e.match(Po);
      if (n === null) return null;
      let o2 = [n[2], n[3], n[4]].filter(Boolean).map((s2) => s2.toString());
      return o2.length === 2 && o2[0].startsWith("var(") ? { mode: n[1], color: [o2[0]], alpha: o2[1] } : !t && o2.length !== 3 || o2.length < 3 && !o2.some((s2) => /^var\(.*?\)$/.test(s2)) ? null : { mode: n[1], color: o2, alpha: n[5]?.toString?.() };
    }
    function _o({ mode: e, color: t, alpha: r2 }) {
      let n = r2 !== void 0;
      return e === "rgba" || e === "hsla" ? `${e}(${t.join(", ")}${n ? `, ${r2}` : ""})` : `${e}(${t.join(" ")}${n ? ` / ${r2}` : ""})`;
    }
    var Eo, To, Ze, $t, Wr, Xe, Io, Po, jo = $(() => {
      O2(), Gi(), Eo = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i, To = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i, Ze = /(?:\d+|\d*\.\d+)%?/, $t = /(?:\s*,\s*|\s+)/, Wr = /\s*[,/]\s*/, Xe = /var\(--(?:[^ )]*?)(?:,(?:[^ )]*?|var\(--[^ )]*?\)))?\)/, Io = new RegExp(`^(rgba?)\\(\\s*(${Ze.source}|${Xe.source})(?:${$t.source}(${Ze.source}|${Xe.source}))?(?:${$t.source}(${Ze.source}|${Xe.source}))?(?:${Wr.source}(${Ze.source}|${Xe.source}))?\\s*\\)$`), Po = new RegExp(`^(hsla?)\\(\\s*((?:${Ze.source})(?:deg|rad|grad|turn)?|${Xe.source})(?:${$t.source}(${Ze.source}|${Xe.source}))?(?:${$t.source}(${Ze.source}|${Xe.source}))?(?:${Wr.source}(${Ze.source}|${Xe.source}))?\\s*\\)$`);
    });
    function wt(e, t, r2) {
      if (typeof e == "function") return e({ opacityValue: t });
      let n = Vr(e, { loose: true });
      return n === null ? r2 : _o({ ...n, alpha: t });
    }
    function Oe({ color: e, property: t, variable: r2 }) {
      let n = [].concat(t);
      if (typeof e == "function") return { [r2]: "1", ...Object.fromEntries(n.map((s2) => [s2, e({ opacityVariable: r2, opacityValue: `var(${r2})` })])) };
      let o2 = Vr(e);
      return o2 === null ? Object.fromEntries(n.map((s2) => [s2, e])) : o2.alpha !== void 0 ? Object.fromEntries(n.map((s2) => [s2, e])) : { [r2]: "1", ...Object.fromEntries(n.map((s2) => [s2, _o({ ...o2, alpha: `var(${r2})` })])) };
    }
    var Ht = $(() => {
      O2(), jo();
    });
    function $e(e, t) {
      let r2 = [], n = [], o2 = 0, s2 = false;
      for (let a = 0; a < e.length; a++) {
        let l = e[a];
        r2.length === 0 && l === t[0] && !s2 && (t.length === 1 || e.slice(a, a + t.length) === t) && (n.push(e.slice(o2, a)), o2 = a + t.length), s2 = s2 ? false : l === "\\", l === "(" || l === "[" || l === "{" ? r2.push(l) : (l === ")" && r2[r2.length - 1] === "(" || l === "]" && r2[r2.length - 1] === "[" || l === "}" && r2[r2.length - 1] === "{") && r2.pop();
      }
      return n.push(e.slice(o2)), n;
    }
    var xt = $(() => {
      O2();
    });
    function Bo(e) {
      return $e(e, ",").map((t) => {
        let r2 = t.trim(), n = { raw: r2 }, o2 = r2.split($o), s2 = /* @__PURE__ */ new Set();
        for (let a of o2) qr.lastIndex = 0, !s2.has("KEYWORD") && Do.has(a) ? (n.keyword = a, s2.add("KEYWORD")) : qr.test(a) ? s2.has("X") ? s2.has("Y") ? s2.has("BLUR") ? s2.has("SPREAD") || (n.spread = a, s2.add("SPREAD")) : (n.blur = a, s2.add("BLUR")) : (n.y = a, s2.add("Y")) : (n.x = a, s2.add("X")) : n.color ? (n.unknown || (n.unknown = []), n.unknown.push(a)) : n.color = a;
        return n.valid = n.x !== void 0 && n.y !== void 0, n;
      });
    }
    function Yi(e) {
      return e.map((t) => t.valid ? [t.keyword, t.x, t.y, t.blur, t.spread, t.color].filter(Boolean).join(" ") : t.raw).join(", ");
    }
    var Do, $o, qr, Ro = $(() => {
      O2(), xt(), Do = /* @__PURE__ */ new Set(["inset", "inherit", "initial", "revert", "unset"]), $o = /\ +(?![^(]*\))/g, qr = /^-?(\d+|\.\d+)(.*?)$/g;
    });
    function Gr(e) {
      return zo.some((t) => new RegExp(`^${t}\\(.*\\)`).test(e));
    }
    function oe(e, t = null, r2 = true) {
      let n = t && Fo.has(t.property);
      return e.startsWith("--") && !n ? `var(${e})` : e.includes("url(") ? e.split(/(url\(.*?\))/g).filter(Boolean).map((o2) => /^url\(.*?\)$/.test(o2) ? o2 : oe(o2, t, false)).join("") : (e = e.replace(/([^\\])_+/g, (o2, s2) => s2 + " ".repeat(o2.length - 1)).replace(/^_/g, " ").replace(/\\_/g, "_"), r2 && (e = e.trim()), e = Hi(e), e);
    }
    function Hi(e) {
      let t = ["theme"], r2 = ["min-content", "max-content", "fit-content", "safe-area-inset-top", "safe-area-inset-right", "safe-area-inset-bottom", "safe-area-inset-left", "titlebar-area-x", "titlebar-area-y", "titlebar-area-width", "titlebar-area-height", "keyboard-inset-top", "keyboard-inset-right", "keyboard-inset-bottom", "keyboard-inset-left", "keyboard-inset-width", "keyboard-inset-height", "radial-gradient", "linear-gradient", "conic-gradient", "repeating-radial-gradient", "repeating-linear-gradient", "repeating-conic-gradient"];
      return e.replace(/(calc|min|max|clamp)\(.+\)/g, (n) => {
        let o2 = "";
        function s2() {
          let a = o2.trimEnd();
          return a[a.length - 1];
        }
        for (let a = 0; a < n.length; a++) {
          let l = function(d3) {
            return d3.split("").every((u2, p2) => n[a + p2] === u2);
          }, c2 = function(d3) {
            let u2 = 1 / 0;
            for (let f3 of d3) {
              let g3 = n.indexOf(f3, a);
              g3 !== -1 && g3 < u2 && (u2 = g3);
            }
            let p2 = n.slice(a, u2);
            return a += p2.length - 1, p2;
          }, i2 = n[a];
          if (l("var")) o2 += c2([")", ","]);
          else if (r2.some((d3) => l(d3))) {
            let d3 = r2.find((u2) => l(u2));
            o2 += d3, a += d3.length - 1;
          } else t.some((d3) => l(d3)) ? o2 += c2([")"]) : l("[") ? o2 += c2(["]"]) : ["+", "-", "*", "/"].includes(i2) && !["(", "+", "-", "*", "/", ","].includes(s2()) ? o2 += ` ${i2} ` : o2 += i2;
        }
        return o2.replace(/\s+/g, " ");
      });
    }
    function Mo(e) {
      return e.startsWith("url(");
    }
    function Uo(e) {
      return !isNaN(Number(e)) || Gr(e);
    }
    function Yr(e) {
      return e.endsWith("%") && Uo(e.slice(0, -1)) || Gr(e);
    }
    function Hr(e) {
      return e === "0" || new RegExp(`^[+-]?[0-9]*.?[0-9]+(?:[eE][+-]?[0-9]+)?${No}$`).test(e) || Gr(e);
    }
    function Qi(e) {
      return Vo.has(e);
    }
    function Ji(e) {
      let t = Bo(oe(e));
      for (let r2 of t) if (!r2.valid) return false;
      return true;
    }
    function Zi(e) {
      let t = 0;
      return $e(e, "_").every((r2) => (r2 = oe(r2), r2.startsWith("var(") ? true : Vr(r2, { loose: true }) !== null ? (t++, true) : false)) ? t > 0 : false;
    }
    function Xi(e) {
      let t = 0;
      return $e(e, ",").every((r2) => (r2 = oe(r2), r2.startsWith("var(") ? true : Mo(r2) || Ki(r2) || ["element(", "image(", "cross-fade(", "image-set("].some((n) => r2.startsWith(n)) ? (t++, true) : false)) ? t > 0 : false;
    }
    function Ki(e) {
      e = oe(e);
      for (let t of Wo) if (e.startsWith(`${t}(`)) return true;
      return false;
    }
    function el(e) {
      let t = 0;
      return $e(e, "_").every((r2) => (r2 = oe(r2), r2.startsWith("var(") ? true : qo.has(r2) || Hr(r2) || Yr(r2) ? (t++, true) : false)) ? t > 0 : false;
    }
    function tl(e) {
      let t = 0;
      return $e(e, ",").every((r2) => (r2 = oe(r2), r2.startsWith("var(") ? true : r2.includes(" ") && !/(['"])([^"']+)\1/g.test(r2) || /^\d/g.test(r2) ? false : (t++, true))) ? t > 0 : false;
    }
    function rl(e) {
      return Go.has(e);
    }
    function nl(e) {
      return Yo.has(e);
    }
    function ol(e) {
      return Ho.has(e);
    }
    var zo, Fo, Lo, No, Vo, Wo, qo, Go, Yo, Ho, Qt = $(() => {
      O2(), jo(), Ro(), xt(), zo = ["min", "max", "clamp", "calc"], Fo = /* @__PURE__ */ new Set(["scroll-timeline-name", "timeline-scope", "view-timeline-name", "font-palette", "anchor-name", "anchor-scope", "position-anchor", "position-try-options", "scroll-timeline", "animation-timeline", "view-timeline", "position-try"]), Lo = ["cm", "mm", "Q", "in", "pc", "pt", "px", "em", "ex", "ch", "rem", "lh", "rlh", "vw", "vh", "vmin", "vmax", "vb", "vi", "svw", "svh", "lvw", "lvh", "dvw", "dvh", "cqw", "cqh", "cqi", "cqb", "cqmin", "cqmax"], No = `(?:${Lo.join("|")})`, Vo = /* @__PURE__ */ new Set(["thin", "medium", "thick"]), Wo = /* @__PURE__ */ new Set(["conic-gradient", "linear-gradient", "radial-gradient", "repeating-conic-gradient", "repeating-linear-gradient", "repeating-radial-gradient"]), qo = /* @__PURE__ */ new Set(["center", "top", "right", "bottom", "left"]), Go = /* @__PURE__ */ new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-serif", "ui-sans-serif", "ui-monospace", "ui-rounded", "math", "emoji", "fangsong"]), Yo = /* @__PURE__ */ new Set(["xx-small", "x-small", "small", "medium", "large", "x-large", "xx-large", "xxx-large"]), Ho = /* @__PURE__ */ new Set(["larger", "smaller"]);
    });
    function sl(e) {
      let t = ["cover", "contain"];
      return $e(e, ",").every((r2) => {
        let n = $e(r2, "_").filter(Boolean);
        return n.length === 1 && t.includes(n[0]) ? true : n.length !== 1 && n.length !== 2 ? false : n.every((o2) => Hr(o2) || Yr(o2) || o2 === "auto");
      });
    }
    var al = $(() => {
      O2(), Qt(), xt();
    });
    function il(e, t) {
      e.walkClasses((r2) => {
        r2.value = t(r2.value), r2.raws && r2.raws.value && (r2.raws.value = Fr(r2.raws.value));
      });
    }
    function Qo(e, t) {
      if (!ot(e)) return;
      let r2 = e.slice(1, -1);
      if (t(r2)) return oe(r2);
    }
    function ll(e, t = {}, r2) {
      let n = t[e];
      if (n !== void 0) return Yt(n);
      if (ot(e)) {
        let o2 = Qo(e, r2);
        return o2 === void 0 ? void 0 : Yt(o2);
      }
    }
    function Jt(e, t = {}, { validate: r2 = () => true } = {}) {
      let n = t.values?.[e];
      return n !== void 0 ? n : t.supportsNegativeValues && e.startsWith("-") ? ll(e.slice(1), t.values, r2) : Qo(e, r2);
    }
    function ot(e) {
      return e.startsWith("[") && e.endsWith("]");
    }
    function Jo(e) {
      let t = e.lastIndexOf("/"), r2 = e.lastIndexOf("[", t), n = e.indexOf("]", t);
      return e[t - 1] === "]" || e[t + 1] === "[" || r2 !== -1 && n !== -1 && r2 < t && t < n && (t = e.lastIndexOf("/", r2)), t === -1 || t === e.length - 1 ? [e, void 0] : ot(e) && !e.includes("]/[") ? [e, void 0] : [e.slice(0, t), e.slice(t + 1)];
    }
    function Zt(e) {
      if (typeof e == "string" && e.includes("<alpha-value>")) {
        let t = e;
        return ({ opacityValue: r2 = 1 }) => t.replace(/<alpha-value>/g, r2);
      }
      return e;
    }
    function Zo(e) {
      return oe(e.slice(1, -1));
    }
    function cl(e, t = {}, { tailwindConfig: r2 = {} } = {}) {
      if (t.values?.[e] !== void 0) return Zt(t.values?.[e]);
      let [n, o2] = Jo(e);
      if (o2 !== void 0) {
        let s2 = t.values?.[n] ?? (ot(n) ? n.slice(1, -1) : void 0);
        return s2 === void 0 ? void 0 : (s2 = Zt(s2), ot(o2) ? wt(s2, Zo(o2)) : r2.theme?.opacity?.[o2] === void 0 ? void 0 : wt(s2, r2.theme.opacity[o2]));
      }
      return Jt(e, t, { validate: Zi });
    }
    function ul(e, t = {}) {
      return t.values?.[e];
    }
    function Ee(e) {
      return (t, r2) => Jt(t, r2, { validate: e });
    }
    function dl(e, t) {
      let r2 = e.indexOf(t);
      return r2 === -1 ? [void 0, e] : [e.slice(0, r2), e.slice(r2 + 1)];
    }
    function Xo(e, t, r2, n) {
      if (r2.values && t in r2.values) for (let { type: s2 } of e ?? []) {
        let a = Xt[s2](t, r2, { tailwindConfig: n });
        if (a !== void 0) return [a, s2, null];
      }
      if (ot(t)) {
        let s2 = t.slice(1, -1), [a, l] = dl(s2, ":");
        if (!/^[\w-_]+$/g.test(a)) l = s2;
        else if (a !== void 0 && !Qr.includes(a)) return [];
        if (l.length > 0 && Qr.includes(a)) return [Jt(`[${l}]`, r2), a, null];
      }
      let o2 = Ko(e, t, r2, n);
      for (let s2 of o2) return s2;
      return [];
    }
    function* Ko(e, t, r2, n) {
      let o2 = De(n, "generalizedModifiers"), [s2, a] = Jo(t);
      if (o2 && r2.modifiers != null && (r2.modifiers === "any" || typeof r2.modifiers == "object" && (a && ot(a) || a in r2.modifiers)) || (s2 = t, a = void 0), a !== void 0 && s2 === "" && (s2 = "DEFAULT"), a !== void 0 && typeof r2.modifiers == "object") {
        let l = r2.modifiers?.[a] ?? null;
        l !== null ? a = l : ot(a) && (a = Zo(a));
      }
      for (let { type: l } of e ?? []) {
        let c2 = Xt[l](s2, r2, { tailwindConfig: n });
        c2 !== void 0 && (yield [c2, l, a ?? null]);
      }
    }
    var Xt, Qr, Kt = $(() => {
      O2(), Lr(), Ht(), Qt(), jr(), al(), nt(), Xt = { any: Jt, color: cl, url: Ee(Mo), image: Ee(Xi), length: Ee(Hr), percentage: Ee(Yr), position: Ee(el), lookup: ul, "generic-name": Ee(rl), "family-name": Ee(tl), number: Ee(Uo), "line-width": Ee(Qi), "absolute-size": Ee(nl), "relative-size": Ee(ol), shadow: Ee(Ji), size: Ee(sl) }, Qr = Object.keys(Xt);
    });
    function se(e) {
      return typeof e == "function" ? e({}) : e;
    }
    var es = $(() => {
      O2();
    });
    function kt(e) {
      return typeof e == "function";
    }
    function Rt(e, ...t) {
      let r2 = t.pop();
      for (let n of t) for (let o2 in n) {
        let s2 = r2(e[o2], n[o2]);
        s2 === void 0 ? Le(e[o2]) && Le(n[o2]) ? e[o2] = Rt({}, e[o2], n[o2], r2) : e[o2] = n[o2] : e[o2] = s2;
      }
      return e;
    }
    function pl(e, ...t) {
      return kt(e) ? e(...t) : e;
    }
    function fl(e) {
      return e.reduce((t, { extend: r2 }) => Rt(t, r2, (n, o2) => n === void 0 ? [o2] : Array.isArray(n) ? [o2, ...n] : [o2, n]), {});
    }
    function hl(e) {
      return { ...e.reduce((t, r2) => Ao(t, r2), {}), extend: fl(e) };
    }
    function ts(e, t) {
      if (Array.isArray(e) && Le(e[0])) return e.concat(t);
      if (Array.isArray(t) && Le(t[0]) && Le(e)) return [e, ...t];
      if (Array.isArray(t)) return t;
    }
    function ml({ extend: e, ...t }) {
      return Rt(t, e, (r2, n) => !kt(r2) && !n.some(kt) ? Rt({}, r2, ...n, ts) : (o2, s2) => Rt({}, ...[r2, ...n].map((a) => pl(a, o2, s2)), ts));
    }
    function* gl(e) {
      let t = Pt(e);
      if (t.length === 0 || (yield t, Array.isArray(e))) return;
      let r2 = /^(.*?)\s*\/\s*([^/]+)$/, n = e.match(r2);
      if (n !== null) {
        let [, o2, s2] = n, a = Pt(o2);
        a.alpha = s2, yield a;
      }
    }
    function vl(e) {
      let t = (r2, n) => {
        for (let o2 of gl(r2)) {
          let s2 = 0, a = e;
          for (; a != null && s2 < o2.length; ) a = a[o2[s2++]], a = kt(a) && (o2.alpha === void 0 || s2 <= o2.length - 1) ? a(t, er) : a;
          if (a !== void 0) {
            if (o2.alpha !== void 0) {
              let l = Zt(a);
              return wt(l, o2.alpha, se(l));
            }
            return Le(a) ? Dt(a) : a;
          }
        }
        return n;
      };
      return Object.assign(t, { theme: t, ...er }), Object.keys(e).reduce((r2, n) => (r2[n] = kt(e[n]) ? e[n](t, er) : e[n], r2), {});
    }
    function rs(e) {
      let t = [];
      return e.forEach((r2) => {
        t = [...t, r2];
        let n = r2?.plugins ?? [];
        n.length !== 0 && n.forEach((o2) => {
          o2.__isOptionsFunction && (o2 = o2()), t = [...t, ...rs([o2?.config ?? {}])];
        });
      }), t;
    }
    function yl(e) {
      return [...e].reduceRight((t, r2) => kt(r2) ? r2({ corePlugins: t }) : Fi(r2, t), wo);
    }
    function bl(e) {
      return [...e].reduceRight((t, r2) => [...t, ...r2], []);
    }
    function wl(e) {
      let t = [...rs(e), { prefix: "", important: false, separator: ":" }];
      return Wi(Ao({ theme: vl(ml(hl(t.map((r2) => r2?.theme ?? {})))), corePlugins: yl(t.map((r2) => r2.corePlugins)), plugins: bl(e.map((r2) => r2?.plugins ?? [])) }, ...t));
    }
    var er, xl = $(() => {
      O2(), jr(), zi(), Li(), Co(), Ni(), Mr(), qi(), Bt(), zr(), Kt(), Ht(), es(), er = { colors: Rr, negative(e) {
        return Object.keys(e).filter((t) => e[t] !== "0").reduce((t, r2) => {
          let n = Yt(e[r2]);
          return n !== void 0 && (t[`-${r2}`] = n), t;
        }, {});
      }, breakpoints(e) {
        return Object.keys(e).filter((t) => typeof e[t] == "string").reduce((t, r2) => ({ ...t, [`screen-${r2}`]: e[r2] }), {});
      } };
    }), Jr = T((e, t) => {
      O2(), t.exports = { content: [], presets: [], darkMode: "media", theme: { accentColor: ({ theme: r2 }) => ({ ...r2("colors"), auto: "auto" }), animation: { none: "none", spin: "spin 1s linear infinite", ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite", pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", bounce: "bounce 1s infinite" }, aria: { busy: 'busy="true"', checked: 'checked="true"', disabled: 'disabled="true"', expanded: 'expanded="true"', hidden: 'hidden="true"', pressed: 'pressed="true"', readonly: 'readonly="true"', required: 'required="true"', selected: 'selected="true"' }, aspectRatio: { auto: "auto", square: "1 / 1", video: "16 / 9" }, backdropBlur: ({ theme: r2 }) => r2("blur"), backdropBrightness: ({ theme: r2 }) => r2("brightness"), backdropContrast: ({ theme: r2 }) => r2("contrast"), backdropGrayscale: ({ theme: r2 }) => r2("grayscale"), backdropHueRotate: ({ theme: r2 }) => r2("hueRotate"), backdropInvert: ({ theme: r2 }) => r2("invert"), backdropOpacity: ({ theme: r2 }) => r2("opacity"), backdropSaturate: ({ theme: r2 }) => r2("saturate"), backdropSepia: ({ theme: r2 }) => r2("sepia"), backgroundColor: ({ theme: r2 }) => r2("colors"), backgroundImage: { none: "none", "gradient-to-t": "linear-gradient(to top, var(--tw-gradient-stops))", "gradient-to-tr": "linear-gradient(to top right, var(--tw-gradient-stops))", "gradient-to-r": "linear-gradient(to right, var(--tw-gradient-stops))", "gradient-to-br": "linear-gradient(to bottom right, var(--tw-gradient-stops))", "gradient-to-b": "linear-gradient(to bottom, var(--tw-gradient-stops))", "gradient-to-bl": "linear-gradient(to bottom left, var(--tw-gradient-stops))", "gradient-to-l": "linear-gradient(to left, var(--tw-gradient-stops))", "gradient-to-tl": "linear-gradient(to top left, var(--tw-gradient-stops))" }, backgroundOpacity: ({ theme: r2 }) => r2("opacity"), backgroundPosition: { bottom: "bottom", center: "center", left: "left", "left-bottom": "left bottom", "left-top": "left top", right: "right", "right-bottom": "right bottom", "right-top": "right top", top: "top" }, backgroundSize: { auto: "auto", cover: "cover", contain: "contain" }, blur: { 0: "0", none: "", sm: "4px", DEFAULT: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "40px", "3xl": "64px" }, borderColor: ({ theme: r2 }) => ({ ...r2("colors"), DEFAULT: r2("colors.gray.200", "currentColor") }), borderOpacity: ({ theme: r2 }) => r2("opacity"), borderRadius: { none: "0px", sm: "0.125rem", DEFAULT: "0.25rem", md: "0.375rem", lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem", full: "9999px" }, borderSpacing: ({ theme: r2 }) => ({ ...r2("spacing") }), borderWidth: { DEFAULT: "1px", 0: "0px", 2: "2px", 4: "4px", 8: "8px" }, boxShadow: { sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)", inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)", none: "none" }, boxShadowColor: ({ theme: r2 }) => r2("colors"), brightness: { 0: "0", 50: ".5", 75: ".75", 90: ".9", 95: ".95", 100: "1", 105: "1.05", 110: "1.1", 125: "1.25", 150: "1.5", 200: "2" }, caretColor: ({ theme: r2 }) => r2("colors"), colors: ({ colors: r2 }) => ({ inherit: r2.inherit, current: r2.current, transparent: r2.transparent, black: r2.black, white: r2.white, slate: r2.slate, gray: r2.gray, zinc: r2.zinc, neutral: r2.neutral, stone: r2.stone, red: r2.red, orange: r2.orange, amber: r2.amber, yellow: r2.yellow, lime: r2.lime, green: r2.green, emerald: r2.emerald, teal: r2.teal, cyan: r2.cyan, sky: r2.sky, blue: r2.blue, indigo: r2.indigo, violet: r2.violet, purple: r2.purple, fuchsia: r2.fuchsia, pink: r2.pink, rose: r2.rose }), columns: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", "3xs": "16rem", "2xs": "18rem", xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem", "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem" }, container: {}, content: { none: "none" }, contrast: { 0: "0", 50: ".5", 75: ".75", 100: "1", 125: "1.25", 150: "1.5", 200: "2" }, cursor: { auto: "auto", default: "default", pointer: "pointer", wait: "wait", text: "text", move: "move", help: "help", "not-allowed": "not-allowed", none: "none", "context-menu": "context-menu", progress: "progress", cell: "cell", crosshair: "crosshair", "vertical-text": "vertical-text", alias: "alias", copy: "copy", "no-drop": "no-drop", grab: "grab", grabbing: "grabbing", "all-scroll": "all-scroll", "col-resize": "col-resize", "row-resize": "row-resize", "n-resize": "n-resize", "e-resize": "e-resize", "s-resize": "s-resize", "w-resize": "w-resize", "ne-resize": "ne-resize", "nw-resize": "nw-resize", "se-resize": "se-resize", "sw-resize": "sw-resize", "ew-resize": "ew-resize", "ns-resize": "ns-resize", "nesw-resize": "nesw-resize", "nwse-resize": "nwse-resize", "zoom-in": "zoom-in", "zoom-out": "zoom-out" }, divideColor: ({ theme: r2 }) => r2("borderColor"), divideOpacity: ({ theme: r2 }) => r2("borderOpacity"), divideWidth: ({ theme: r2 }) => r2("borderWidth"), dropShadow: { sm: "0 1px 1px rgb(0 0 0 / 0.05)", DEFAULT: ["0 1px 2px rgb(0 0 0 / 0.1)", "0 1px 1px rgb(0 0 0 / 0.06)"], md: ["0 4px 3px rgb(0 0 0 / 0.07)", "0 2px 2px rgb(0 0 0 / 0.06)"], lg: ["0 10px 8px rgb(0 0 0 / 0.04)", "0 4px 3px rgb(0 0 0 / 0.1)"], xl: ["0 20px 13px rgb(0 0 0 / 0.03)", "0 8px 5px rgb(0 0 0 / 0.08)"], "2xl": "0 25px 25px rgb(0 0 0 / 0.15)", none: "0 0 #0000" }, fill: ({ theme: r2 }) => ({ none: "none", ...r2("colors") }), flex: { 1: "1 1 0%", auto: "1 1 auto", initial: "0 1 auto", none: "none" }, flexBasis: ({ theme: r2 }) => ({ auto: "auto", ...r2("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", "1/12": "8.333333%", "2/12": "16.666667%", "3/12": "25%", "4/12": "33.333333%", "5/12": "41.666667%", "6/12": "50%", "7/12": "58.333333%", "8/12": "66.666667%", "9/12": "75%", "10/12": "83.333333%", "11/12": "91.666667%", full: "100%" }), flexGrow: { 0: "0", DEFAULT: "1" }, flexShrink: { 0: "0", DEFAULT: "1" }, fontFamily: { sans: ["ui-sans-serif", "system-ui", "sans-serif", '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'], serif: ["ui-serif", "Georgia", "Cambria", '"Times New Roman"', "Times", "serif"], mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", '"Liberation Mono"', '"Courier New"', "monospace"] }, fontSize: { xs: ["0.75rem", { lineHeight: "1rem" }], sm: ["0.875rem", { lineHeight: "1.25rem" }], base: ["1rem", { lineHeight: "1.5rem" }], lg: ["1.125rem", { lineHeight: "1.75rem" }], xl: ["1.25rem", { lineHeight: "1.75rem" }], "2xl": ["1.5rem", { lineHeight: "2rem" }], "3xl": ["1.875rem", { lineHeight: "2.25rem" }], "4xl": ["2.25rem", { lineHeight: "2.5rem" }], "5xl": ["3rem", { lineHeight: "1" }], "6xl": ["3.75rem", { lineHeight: "1" }], "7xl": ["4.5rem", { lineHeight: "1" }], "8xl": ["6rem", { lineHeight: "1" }], "9xl": ["8rem", { lineHeight: "1" }] }, fontWeight: { thin: "100", extralight: "200", light: "300", normal: "400", medium: "500", semibold: "600", bold: "700", extrabold: "800", black: "900" }, gap: ({ theme: r2 }) => r2("spacing"), gradientColorStops: ({ theme: r2 }) => r2("colors"), gradientColorStopPositions: { "0%": "0%", "5%": "5%", "10%": "10%", "15%": "15%", "20%": "20%", "25%": "25%", "30%": "30%", "35%": "35%", "40%": "40%", "45%": "45%", "50%": "50%", "55%": "55%", "60%": "60%", "65%": "65%", "70%": "70%", "75%": "75%", "80%": "80%", "85%": "85%", "90%": "90%", "95%": "95%", "100%": "100%" }, grayscale: { 0: "0", DEFAULT: "100%" }, gridAutoColumns: { auto: "auto", min: "min-content", max: "max-content", fr: "minmax(0, 1fr)" }, gridAutoRows: { auto: "auto", min: "min-content", max: "max-content", fr: "minmax(0, 1fr)" }, gridColumn: { auto: "auto", "span-1": "span 1 / span 1", "span-2": "span 2 / span 2", "span-3": "span 3 / span 3", "span-4": "span 4 / span 4", "span-5": "span 5 / span 5", "span-6": "span 6 / span 6", "span-7": "span 7 / span 7", "span-8": "span 8 / span 8", "span-9": "span 9 / span 9", "span-10": "span 10 / span 10", "span-11": "span 11 / span 11", "span-12": "span 12 / span 12", "span-full": "1 / -1" }, gridColumnEnd: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13" }, gridColumnStart: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13" }, gridRow: { auto: "auto", "span-1": "span 1 / span 1", "span-2": "span 2 / span 2", "span-3": "span 3 / span 3", "span-4": "span 4 / span 4", "span-5": "span 5 / span 5", "span-6": "span 6 / span 6", "span-7": "span 7 / span 7", "span-8": "span 8 / span 8", "span-9": "span 9 / span 9", "span-10": "span 10 / span 10", "span-11": "span 11 / span 11", "span-12": "span 12 / span 12", "span-full": "1 / -1" }, gridRowEnd: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13" }, gridRowStart: { auto: "auto", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12", 13: "13" }, gridTemplateColumns: { none: "none", subgrid: "subgrid", 1: "repeat(1, minmax(0, 1fr))", 2: "repeat(2, minmax(0, 1fr))", 3: "repeat(3, minmax(0, 1fr))", 4: "repeat(4, minmax(0, 1fr))", 5: "repeat(5, minmax(0, 1fr))", 6: "repeat(6, minmax(0, 1fr))", 7: "repeat(7, minmax(0, 1fr))", 8: "repeat(8, minmax(0, 1fr))", 9: "repeat(9, minmax(0, 1fr))", 10: "repeat(10, minmax(0, 1fr))", 11: "repeat(11, minmax(0, 1fr))", 12: "repeat(12, minmax(0, 1fr))" }, gridTemplateRows: { none: "none", subgrid: "subgrid", 1: "repeat(1, minmax(0, 1fr))", 2: "repeat(2, minmax(0, 1fr))", 3: "repeat(3, minmax(0, 1fr))", 4: "repeat(4, minmax(0, 1fr))", 5: "repeat(5, minmax(0, 1fr))", 6: "repeat(6, minmax(0, 1fr))", 7: "repeat(7, minmax(0, 1fr))", 8: "repeat(8, minmax(0, 1fr))", 9: "repeat(9, minmax(0, 1fr))", 10: "repeat(10, minmax(0, 1fr))", 11: "repeat(11, minmax(0, 1fr))", 12: "repeat(12, minmax(0, 1fr))" }, height: ({ theme: r2 }) => ({ auto: "auto", ...r2("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", full: "100%", screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh", min: "min-content", max: "max-content", fit: "fit-content" }), hueRotate: { 0: "0deg", 15: "15deg", 30: "30deg", 60: "60deg", 90: "90deg", 180: "180deg" }, inset: ({ theme: r2 }) => ({ auto: "auto", ...r2("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", full: "100%" }), invert: { 0: "0", DEFAULT: "100%" }, keyframes: { spin: { to: { transform: "rotate(360deg)" } }, ping: { "75%, 100%": { transform: "scale(2)", opacity: "0" } }, pulse: { "50%": { opacity: ".5" } }, bounce: { "0%, 100%": { transform: "translateY(-25%)", animationTimingFunction: "cubic-bezier(0.8,0,1,1)" }, "50%": { transform: "none", animationTimingFunction: "cubic-bezier(0,0,0.2,1)" } } }, letterSpacing: { tighter: "-0.05em", tight: "-0.025em", normal: "0em", wide: "0.025em", wider: "0.05em", widest: "0.1em" }, lineHeight: { none: "1", tight: "1.25", snug: "1.375", normal: "1.5", relaxed: "1.625", loose: "2", 3: ".75rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem", 9: "2.25rem", 10: "2.5rem" }, listStyleType: { none: "none", disc: "disc", decimal: "decimal" }, listStyleImage: { none: "none" }, margin: ({ theme: r2 }) => ({ auto: "auto", ...r2("spacing") }), lineClamp: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6" }, maxHeight: ({ theme: r2 }) => ({ ...r2("spacing"), none: "none", full: "100%", screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh", min: "min-content", max: "max-content", fit: "fit-content" }), maxWidth: ({ theme: r2, breakpoints: n }) => ({ ...r2("spacing"), none: "none", xs: "20rem", sm: "24rem", md: "28rem", lg: "32rem", xl: "36rem", "2xl": "42rem", "3xl": "48rem", "4xl": "56rem", "5xl": "64rem", "6xl": "72rem", "7xl": "80rem", full: "100%", min: "min-content", max: "max-content", fit: "fit-content", prose: "65ch", ...n(r2("screens")) }), minHeight: ({ theme: r2 }) => ({ ...r2("spacing"), full: "100%", screen: "100vh", svh: "100svh", lvh: "100lvh", dvh: "100dvh", min: "min-content", max: "max-content", fit: "fit-content" }), minWidth: ({ theme: r2 }) => ({ ...r2("spacing"), full: "100%", min: "min-content", max: "max-content", fit: "fit-content" }), objectPosition: { bottom: "bottom", center: "center", left: "left", "left-bottom": "left bottom", "left-top": "left top", right: "right", "right-bottom": "right bottom", "right-top": "right top", top: "top" }, opacity: { 0: "0", 5: "0.05", 10: "0.1", 15: "0.15", 20: "0.2", 25: "0.25", 30: "0.3", 35: "0.35", 40: "0.4", 45: "0.45", 50: "0.5", 55: "0.55", 60: "0.6", 65: "0.65", 70: "0.7", 75: "0.75", 80: "0.8", 85: "0.85", 90: "0.9", 95: "0.95", 100: "1" }, order: { first: "-9999", last: "9999", none: "0", 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "10", 11: "11", 12: "12" }, outlineColor: ({ theme: r2 }) => r2("colors"), outlineOffset: { 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, outlineWidth: { 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, padding: ({ theme: r2 }) => r2("spacing"), placeholderColor: ({ theme: r2 }) => r2("colors"), placeholderOpacity: ({ theme: r2 }) => r2("opacity"), ringColor: ({ theme: r2 }) => ({ DEFAULT: r2("colors.blue.500", "#3b82f6"), ...r2("colors") }), ringOffsetColor: ({ theme: r2 }) => r2("colors"), ringOffsetWidth: { 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, ringOpacity: ({ theme: r2 }) => ({ DEFAULT: "0.5", ...r2("opacity") }), ringWidth: { DEFAULT: "3px", 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, rotate: { 0: "0deg", 1: "1deg", 2: "2deg", 3: "3deg", 6: "6deg", 12: "12deg", 45: "45deg", 90: "90deg", 180: "180deg" }, saturate: { 0: "0", 50: ".5", 100: "1", 150: "1.5", 200: "2" }, scale: { 0: "0", 50: ".5", 75: ".75", 90: ".9", 95: ".95", 100: "1", 105: "1.05", 110: "1.1", 125: "1.25", 150: "1.5" }, screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" }, scrollMargin: ({ theme: r2 }) => ({ ...r2("spacing") }), scrollPadding: ({ theme: r2 }) => r2("spacing"), sepia: { 0: "0", DEFAULT: "100%" }, skew: { 0: "0deg", 1: "1deg", 2: "2deg", 3: "3deg", 6: "6deg", 12: "12deg" }, space: ({ theme: r2 }) => ({ ...r2("spacing") }), spacing: { px: "1px", 0: "0px", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem", 2: "0.5rem", 2.5: "0.625rem", 3: "0.75rem", 3.5: "0.875rem", 4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem", 9: "2.25rem", 10: "2.5rem", 11: "2.75rem", 12: "3rem", 14: "3.5rem", 16: "4rem", 20: "5rem", 24: "6rem", 28: "7rem", 32: "8rem", 36: "9rem", 40: "10rem", 44: "11rem", 48: "12rem", 52: "13rem", 56: "14rem", 60: "15rem", 64: "16rem", 72: "18rem", 80: "20rem", 96: "24rem" }, stroke: ({ theme: r2 }) => ({ none: "none", ...r2("colors") }), strokeWidth: { 0: "0", 1: "1", 2: "2" }, supports: {}, data: {}, textColor: ({ theme: r2 }) => r2("colors"), textDecorationColor: ({ theme: r2 }) => r2("colors"), textDecorationThickness: { auto: "auto", "from-font": "from-font", 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, textIndent: ({ theme: r2 }) => ({ ...r2("spacing") }), textOpacity: ({ theme: r2 }) => r2("opacity"), textUnderlineOffset: { auto: "auto", 0: "0px", 1: "1px", 2: "2px", 4: "4px", 8: "8px" }, transformOrigin: { center: "center", top: "top", "top-right": "top right", right: "right", "bottom-right": "bottom right", bottom: "bottom", "bottom-left": "bottom left", left: "left", "top-left": "top left" }, transitionDelay: { 0: "0s", 75: "75ms", 100: "100ms", 150: "150ms", 200: "200ms", 300: "300ms", 500: "500ms", 700: "700ms", 1e3: "1000ms" }, transitionDuration: { DEFAULT: "150ms", 0: "0s", 75: "75ms", 100: "100ms", 150: "150ms", 200: "200ms", 300: "300ms", 500: "500ms", 700: "700ms", 1e3: "1000ms" }, transitionProperty: { none: "none", all: "all", DEFAULT: "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter", colors: "color, background-color, border-color, text-decoration-color, fill, stroke", opacity: "opacity", shadow: "box-shadow", transform: "transform" }, transitionTimingFunction: { DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)", linear: "linear", in: "cubic-bezier(0.4, 0, 1, 1)", out: "cubic-bezier(0, 0, 0.2, 1)", "in-out": "cubic-bezier(0.4, 0, 0.2, 1)" }, translate: ({ theme: r2 }) => ({ ...r2("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", full: "100%" }), size: ({ theme: r2 }) => ({ auto: "auto", ...r2("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", "1/12": "8.333333%", "2/12": "16.666667%", "3/12": "25%", "4/12": "33.333333%", "5/12": "41.666667%", "6/12": "50%", "7/12": "58.333333%", "8/12": "66.666667%", "9/12": "75%", "10/12": "83.333333%", "11/12": "91.666667%", full: "100%", min: "min-content", max: "max-content", fit: "fit-content" }), width: ({ theme: r2 }) => ({ auto: "auto", ...r2("spacing"), "1/2": "50%", "1/3": "33.333333%", "2/3": "66.666667%", "1/4": "25%", "2/4": "50%", "3/4": "75%", "1/5": "20%", "2/5": "40%", "3/5": "60%", "4/5": "80%", "1/6": "16.666667%", "2/6": "33.333333%", "3/6": "50%", "4/6": "66.666667%", "5/6": "83.333333%", "1/12": "8.333333%", "2/12": "16.666667%", "3/12": "25%", "4/12": "33.333333%", "5/12": "41.666667%", "6/12": "50%", "7/12": "58.333333%", "8/12": "66.666667%", "9/12": "75%", "10/12": "83.333333%", "11/12": "91.666667%", full: "100%", screen: "100vw", svw: "100svw", lvw: "100lvw", dvw: "100dvw", min: "min-content", max: "max-content", fit: "fit-content" }), willChange: { auto: "auto", scroll: "scroll-position", contents: "contents", transform: "transform" }, zIndex: { auto: "auto", 0: "0", 10: "10", 20: "20", 30: "30", 40: "40", 50: "50" } }, plugins: [] };
    });
    function ns(e) {
      let t = (e?.presets ?? [os.default]).slice().reverse().flatMap((o2) => ns(o2 instanceof Function ? o2() : o2)), r2 = { respectDefaultRingColorOpacity: { theme: { ringColor: ({ theme: o2 }) => ({ DEFAULT: "#3b82f67f", ...o2("colors") }) } }, disableColorOpacityUtilitiesByDefault: { corePlugins: { backgroundOpacity: false, borderOpacity: false, divideOpacity: false, placeholderOpacity: false, ringOpacity: false, textOpacity: false } } }, n = Object.keys(r2).filter((o2) => De(e, o2)).map((o2) => r2[o2]);
      return [e, ...n, ...t];
    }
    var os, kl = $(() => {
      O2(), os = he(Jr()), nt();
    }), ss = {};
    Fe(ss, { default: () => Zr });
    function Zr(...e) {
      let [, ...t] = ns(e[0]);
      return wl([...e, ...t]);
    }
    var as = $(() => {
      O2(), xl(), kl();
    }), is = {};
    Fe(is, { default: () => xe });
    var xe, St = $(() => {
      O2(), xe = { resolve: (e) => e, extname: (e) => "." + e.split(".").pop() };
    });
    function tr(e) {
      return typeof e == "object" && e !== null;
    }
    function Sl(e) {
      return Object.keys(e).length === 0;
    }
    function ls(e) {
      return typeof e == "string" || e instanceof String;
    }
    function Cl(e) {
      return tr(e) && e.config === void 0 && !Sl(e) ? null : tr(e) && e.config !== void 0 && ls(e.config) ? xe.resolve(e.config) : tr(e) && e.config !== void 0 && tr(e.config) ? null : ls(e) ? xe.resolve(e) : Al();
    }
    function Al() {
      for (let e of cs) try {
        let t = xe.resolve(e);
        return Be.accessSync(t), t;
      } catch {
      }
      return null;
    }
    var cs, Ol = $(() => {
      O2(), rt(), St(), cs = ["./tailwind.config.js", "./tailwind.config.cjs", "./tailwind.config.mjs", "./tailwind.config.ts", "./tailwind.config.cts", "./tailwind.config.mts"];
    }), us = {};
    Fe(us, { default: () => Xr });
    var Xr, ds = $(() => {
      O2(), Xr = { parse: (e) => ({ href: e }) };
    }), ps = T(() => {
      O2();
    }), Kr = T((e, t) => {
      O2();
      var r2 = (Br(), xo), n = ps(), o2 = class extends Error {
        constructor(s2, a, l, c2, i2, d3) {
          super(s2), this.name = "CssSyntaxError", this.reason = s2, i2 && (this.file = i2), c2 && (this.source = c2), d3 && (this.plugin = d3), typeof a < "u" && typeof l < "u" && (typeof a == "number" ? (this.line = a, this.column = l) : (this.line = a.line, this.column = a.column, this.endLine = l.line, this.endColumn = l.column)), this.setMessage(), Error.captureStackTrace && Error.captureStackTrace(this, o2);
        }
        setMessage() {
          this.message = this.plugin ? this.plugin + ": " : "", this.message += this.file ? this.file : "<css input>", typeof this.line < "u" && (this.message += ":" + this.line + ":" + this.column), this.message += ": " + this.reason;
        }
        showSourceCode(s2) {
          if (!this.source) return "";
          let a = this.source;
          s2 == null && (s2 = r2.isColorSupported), n && s2 && (a = n(a));
          let l = a.split(/\r?\n/), c2 = Math.max(this.line - 3, 0), i2 = Math.min(this.line + 2, l.length), d3 = String(i2).length, u2, p2;
          if (s2) {
            let { bold: f3, red: g3, gray: h2 } = r2.createColors(true);
            u2 = (m3) => f3(g3(m3)), p2 = (m3) => h2(m3);
          } else u2 = p2 = (f3) => f3;
          return l.slice(c2, i2).map((f3, g3) => {
            let h2 = c2 + 1 + g3, m3 = " " + (" " + h2).slice(-d3) + " | ";
            if (h2 === this.line) {
              let y3 = p2(m3.replace(/\d/g, " ")) + f3.slice(0, this.column - 1).replace(/[^\t]/g, " ");
              return u2(">") + p2(m3) + f3 + `
 ` + y3 + u2("^");
            }
            return " " + p2(m3) + f3;
          }).join(`
`);
        }
        toString() {
          let s2 = this.showSourceCode();
          return s2 && (s2 = `

` + s2 + `
`), this.name + ": " + this.message + s2;
        }
      };
      t.exports = o2, o2.default = o2;
    }), en = T((e, t) => {
      O2(), t.exports.isClean = Symbol("isClean"), t.exports.my = Symbol("my");
    }), fs = T((e, t) => {
      O2();
      var r2 = { colon: ": ", indent: "    ", beforeDecl: `
`, beforeRule: `
`, beforeOpen: " ", beforeClose: `
`, beforeComment: `
`, after: `
`, emptyBody: "", commentLeft: " ", commentRight: " ", semicolon: false };
      function n(s2) {
        return s2[0].toUpperCase() + s2.slice(1);
      }
      var o2 = class {
        constructor(s2) {
          this.builder = s2;
        }
        stringify(s2, a) {
          if (!this[s2.type]) throw new Error("Unknown AST node type " + s2.type + ". Maybe you need to change PostCSS stringifier.");
          this[s2.type](s2, a);
        }
        document(s2) {
          this.body(s2);
        }
        root(s2) {
          this.body(s2), s2.raws.after && this.builder(s2.raws.after);
        }
        comment(s2) {
          let a = this.raw(s2, "left", "commentLeft"), l = this.raw(s2, "right", "commentRight");
          this.builder("/*" + a + s2.text + l + "*/", s2);
        }
        decl(s2, a) {
          let l = this.raw(s2, "between", "colon"), c2 = s2.prop + l + this.rawValue(s2, "value");
          s2.important && (c2 += s2.raws.important || " !important"), a && (c2 += ";"), this.builder(c2, s2);
        }
        rule(s2) {
          this.block(s2, this.rawValue(s2, "selector")), s2.raws.ownSemicolon && this.builder(s2.raws.ownSemicolon, s2, "end");
        }
        atrule(s2, a) {
          let l = "@" + s2.name, c2 = s2.params ? this.rawValue(s2, "params") : "";
          if (typeof s2.raws.afterName < "u" ? l += s2.raws.afterName : c2 && (l += " "), s2.nodes) this.block(s2, l + c2);
          else {
            let i2 = (s2.raws.between || "") + (a ? ";" : "");
            this.builder(l + c2 + i2, s2);
          }
        }
        body(s2) {
          let a = s2.nodes.length - 1;
          for (; a > 0 && s2.nodes[a].type === "comment"; ) a -= 1;
          let l = this.raw(s2, "semicolon");
          for (let c2 = 0; c2 < s2.nodes.length; c2++) {
            let i2 = s2.nodes[c2], d3 = this.raw(i2, "before");
            d3 && this.builder(d3), this.stringify(i2, a !== c2 || l);
          }
        }
        block(s2, a) {
          let l = this.raw(s2, "between", "beforeOpen");
          this.builder(a + l + "{", s2, "start");
          let c2;
          s2.nodes && s2.nodes.length ? (this.body(s2), c2 = this.raw(s2, "after")) : c2 = this.raw(s2, "after", "emptyBody"), c2 && this.builder(c2), this.builder("}", s2, "end");
        }
        raw(s2, a, l) {
          let c2;
          if (l || (l = a), a && (c2 = s2.raws[a], typeof c2 < "u")) return c2;
          let i2 = s2.parent;
          if (l === "before" && (!i2 || i2.type === "root" && i2.first === s2 || i2 && i2.type === "document")) return "";
          if (!i2) return r2[l];
          let d3 = s2.root();
          if (d3.rawCache || (d3.rawCache = {}), typeof d3.rawCache[l] < "u") return d3.rawCache[l];
          if (l === "before" || l === "after") return this.beforeAfter(s2, l);
          {
            let u2 = "raw" + n(l);
            this[u2] ? c2 = this[u2](d3, s2) : d3.walk((p2) => {
              if (c2 = p2.raws[a], typeof c2 < "u") return false;
            });
          }
          return typeof c2 > "u" && (c2 = r2[l]), d3.rawCache[l] = c2, c2;
        }
        rawSemicolon(s2) {
          let a;
          return s2.walk((l) => {
            if (l.nodes && l.nodes.length && l.last.type === "decl" && (a = l.raws.semicolon, typeof a < "u")) return false;
          }), a;
        }
        rawEmptyBody(s2) {
          let a;
          return s2.walk((l) => {
            if (l.nodes && l.nodes.length === 0 && (a = l.raws.after, typeof a < "u")) return false;
          }), a;
        }
        rawIndent(s2) {
          if (s2.raws.indent) return s2.raws.indent;
          let a;
          return s2.walk((l) => {
            let c2 = l.parent;
            if (c2 && c2 !== s2 && c2.parent && c2.parent === s2 && typeof l.raws.before < "u") {
              let i2 = l.raws.before.split(`
`);
              return a = i2[i2.length - 1], a = a.replace(/\S/g, ""), false;
            }
          }), a;
        }
        rawBeforeComment(s2, a) {
          let l;
          return s2.walkComments((c2) => {
            if (typeof c2.raws.before < "u") return l = c2.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), false;
          }), typeof l > "u" ? l = this.raw(a, null, "beforeDecl") : l && (l = l.replace(/\S/g, "")), l;
        }
        rawBeforeDecl(s2, a) {
          let l;
          return s2.walkDecls((c2) => {
            if (typeof c2.raws.before < "u") return l = c2.raws.before, l.includes(`
`) && (l = l.replace(/[^\n]+$/, "")), false;
          }), typeof l > "u" ? l = this.raw(a, null, "beforeRule") : l && (l = l.replace(/\S/g, "")), l;
        }
        rawBeforeRule(s2) {
          let a;
          return s2.walk((l) => {
            if (l.nodes && (l.parent !== s2 || s2.first !== l) && typeof l.raws.before < "u") return a = l.raws.before, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), false;
          }), a && (a = a.replace(/\S/g, "")), a;
        }
        rawBeforeClose(s2) {
          let a;
          return s2.walk((l) => {
            if (l.nodes && l.nodes.length > 0 && typeof l.raws.after < "u") return a = l.raws.after, a.includes(`
`) && (a = a.replace(/[^\n]+$/, "")), false;
          }), a && (a = a.replace(/\S/g, "")), a;
        }
        rawBeforeOpen(s2) {
          let a;
          return s2.walk((l) => {
            if (l.type !== "decl" && (a = l.raws.between, typeof a < "u")) return false;
          }), a;
        }
        rawColon(s2) {
          let a;
          return s2.walkDecls((l) => {
            if (typeof l.raws.between < "u") return a = l.raws.between.replace(/[^\s:]/g, ""), false;
          }), a;
        }
        beforeAfter(s2, a) {
          let l;
          s2.type === "decl" ? l = this.raw(s2, null, "beforeDecl") : s2.type === "comment" ? l = this.raw(s2, null, "beforeComment") : a === "before" ? l = this.raw(s2, null, "beforeRule") : l = this.raw(s2, null, "beforeClose");
          let c2 = s2.parent, i2 = 0;
          for (; c2 && c2.type !== "root"; ) i2 += 1, c2 = c2.parent;
          if (l.includes(`
`)) {
            let d3 = this.raw(s2, null, "indent");
            if (d3.length) for (let u2 = 0; u2 < i2; u2++) l += d3;
          }
          return l;
        }
        rawValue(s2, a) {
          let l = s2[a], c2 = s2.raws[a];
          return c2 && c2.value === l ? c2.raw : l;
        }
      };
      t.exports = o2, o2.default = o2;
    }), rr = T((e, t) => {
      O2();
      var r2 = fs();
      function n(o2, s2) {
        new r2(s2).stringify(o2);
      }
      t.exports = n, n.default = n;
    }), nr = T((e, t) => {
      O2();
      var { isClean: r2, my: n } = en(), o2 = Kr(), s2 = fs(), a = rr();
      function l(i2, d3) {
        let u2 = new i2.constructor();
        for (let p2 in i2) {
          if (!Object.prototype.hasOwnProperty.call(i2, p2) || p2 === "proxyCache") continue;
          let f3 = i2[p2], g3 = typeof f3;
          p2 === "parent" && g3 === "object" ? d3 && (u2[p2] = d3) : p2 === "source" ? u2[p2] = f3 : Array.isArray(f3) ? u2[p2] = f3.map((h2) => l(h2, u2)) : (g3 === "object" && f3 !== null && (f3 = l(f3)), u2[p2] = f3);
        }
        return u2;
      }
      var c2 = class {
        constructor(i2 = {}) {
          this.raws = {}, this[r2] = false, this[n] = true;
          for (let d3 in i2) if (d3 === "nodes") {
            this.nodes = [];
            for (let u2 of i2[d3]) typeof u2.clone == "function" ? this.append(u2.clone()) : this.append(u2);
          } else this[d3] = i2[d3];
        }
        error(i2, d3 = {}) {
          if (this.source) {
            let { start: u2, end: p2 } = this.rangeBy(d3);
            return this.source.input.error(i2, { line: u2.line, column: u2.column }, { line: p2.line, column: p2.column }, d3);
          }
          return new o2(i2);
        }
        warn(i2, d3, u2) {
          let p2 = { node: this };
          for (let f3 in u2) p2[f3] = u2[f3];
          return i2.warn(d3, p2);
        }
        remove() {
          return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
        }
        toString(i2 = a) {
          i2.stringify && (i2 = i2.stringify);
          let d3 = "";
          return i2(this, (u2) => {
            d3 += u2;
          }), d3;
        }
        assign(i2 = {}) {
          for (let d3 in i2) this[d3] = i2[d3];
          return this;
        }
        clone(i2 = {}) {
          let d3 = l(this);
          for (let u2 in i2) d3[u2] = i2[u2];
          return d3;
        }
        cloneBefore(i2 = {}) {
          let d3 = this.clone(i2);
          return this.parent.insertBefore(this, d3), d3;
        }
        cloneAfter(i2 = {}) {
          let d3 = this.clone(i2);
          return this.parent.insertAfter(this, d3), d3;
        }
        replaceWith(...i2) {
          if (this.parent) {
            let d3 = this, u2 = false;
            for (let p2 of i2) p2 === this ? u2 = true : u2 ? (this.parent.insertAfter(d3, p2), d3 = p2) : this.parent.insertBefore(d3, p2);
            u2 || this.remove();
          }
          return this;
        }
        next() {
          if (!this.parent) return;
          let i2 = this.parent.index(this);
          return this.parent.nodes[i2 + 1];
        }
        prev() {
          if (!this.parent) return;
          let i2 = this.parent.index(this);
          return this.parent.nodes[i2 - 1];
        }
        before(i2) {
          return this.parent.insertBefore(this, i2), this;
        }
        after(i2) {
          return this.parent.insertAfter(this, i2), this;
        }
        root() {
          let i2 = this;
          for (; i2.parent && i2.parent.type !== "document"; ) i2 = i2.parent;
          return i2;
        }
        raw(i2, d3) {
          return new s2().raw(this, i2, d3);
        }
        cleanRaws(i2) {
          delete this.raws.before, delete this.raws.after, i2 || delete this.raws.between;
        }
        toJSON(i2, d3) {
          let u2 = {}, p2 = d3 == null;
          d3 = d3 || /* @__PURE__ */ new Map();
          let f3 = 0;
          for (let g3 in this) {
            if (!Object.prototype.hasOwnProperty.call(this, g3) || g3 === "parent" || g3 === "proxyCache") continue;
            let h2 = this[g3];
            if (Array.isArray(h2)) u2[g3] = h2.map((m3) => typeof m3 == "object" && m3.toJSON ? m3.toJSON(null, d3) : m3);
            else if (typeof h2 == "object" && h2.toJSON) u2[g3] = h2.toJSON(null, d3);
            else if (g3 === "source") {
              let m3 = d3.get(h2.input);
              m3 == null && (m3 = f3, d3.set(h2.input, f3), f3++), u2[g3] = { inputId: m3, start: h2.start, end: h2.end };
            } else u2[g3] = h2;
          }
          return p2 && (u2.inputs = [...d3.keys()].map((g3) => g3.toJSON())), u2;
        }
        positionInside(i2) {
          let d3 = this.toString(), u2 = this.source.start.column, p2 = this.source.start.line;
          for (let f3 = 0; f3 < i2; f3++) d3[f3] === `
` ? (u2 = 1, p2 += 1) : u2 += 1;
          return { line: p2, column: u2 };
        }
        positionBy(i2) {
          let d3 = this.source.start;
          if (i2.index) d3 = this.positionInside(i2.index);
          else if (i2.word) {
            let u2 = this.toString().indexOf(i2.word);
            u2 !== -1 && (d3 = this.positionInside(u2));
          }
          return d3;
        }
        rangeBy(i2) {
          let d3 = { line: this.source.start.line, column: this.source.start.column }, u2 = this.source.end ? { line: this.source.end.line, column: this.source.end.column + 1 } : { line: d3.line, column: d3.column + 1 };
          if (i2.word) {
            let p2 = this.toString().indexOf(i2.word);
            p2 !== -1 && (d3 = this.positionInside(p2), u2 = this.positionInside(p2 + i2.word.length));
          } else i2.start ? d3 = { line: i2.start.line, column: i2.start.column } : i2.index && (d3 = this.positionInside(i2.index)), i2.end ? u2 = { line: i2.end.line, column: i2.end.column } : i2.endIndex ? u2 = this.positionInside(i2.endIndex) : i2.index && (u2 = this.positionInside(i2.index + 1));
          return (u2.line < d3.line || u2.line === d3.line && u2.column <= d3.column) && (u2 = { line: d3.line, column: d3.column + 1 }), { start: d3, end: u2 };
        }
        getProxyProcessor() {
          return { set(i2, d3, u2) {
            return i2[d3] === u2 || (i2[d3] = u2, (d3 === "prop" || d3 === "value" || d3 === "name" || d3 === "params" || d3 === "important" || d3 === "text") && i2.markDirty()), true;
          }, get(i2, d3) {
            return d3 === "proxyOf" ? i2 : d3 === "root" ? () => i2.root().toProxy() : i2[d3];
          } };
        }
        toProxy() {
          return this.proxyCache || (this.proxyCache = new Proxy(this, this.getProxyProcessor())), this.proxyCache;
        }
        addToError(i2) {
          if (i2.postcssNode = this, i2.stack && this.source && /\n\s{4}at /.test(i2.stack)) {
            let d3 = this.source;
            i2.stack = i2.stack.replace(/\n\s{4}at /, `$&${d3.input.from}:${d3.start.line}:${d3.start.column}$&`);
          }
          return i2;
        }
        markDirty() {
          if (this[r2]) {
            this[r2] = false;
            let i2 = this;
            for (; i2 = i2.parent; ) i2[r2] = false;
          }
        }
        get proxyOf() {
          return this;
        }
      };
      t.exports = c2, c2.default = c2;
    }), or = T((e, t) => {
      O2();
      var r2 = nr(), n = class extends r2 {
        constructor(o2) {
          o2 && typeof o2.value < "u" && typeof o2.value != "string" && (o2 = { ...o2, value: String(o2.value) }), super(o2), this.type = "decl";
        }
        get variable() {
          return this.prop.startsWith("--") || this.prop[0] === "$";
        }
      };
      t.exports = n, n.default = n;
    }), hs = T((e, t) => {
      O2(), t.exports = function(r2, n) {
        return { generate: () => {
          let o2 = "";
          return r2(n, (s2) => {
            o2 += s2;
          }), [o2];
        } };
      };
    }), sr = T((e, t) => {
      O2();
      var r2 = nr(), n = class extends r2 {
        constructor(o2) {
          super(o2), this.type = "comment";
        }
      };
      t.exports = n, n.default = n;
    }), ct = T((e, t) => {
      O2();
      var { isClean: r2, my: n } = en(), o2 = or(), s2 = sr(), a = nr(), l, c2, i2, d3;
      function u2(g3) {
        return g3.map((h2) => (h2.nodes && (h2.nodes = u2(h2.nodes)), delete h2.source, h2));
      }
      function p2(g3) {
        if (g3[r2] = false, g3.proxyOf.nodes) for (let h2 of g3.proxyOf.nodes) p2(h2);
      }
      var f3 = class extends a {
        push(g3) {
          return g3.parent = this, this.proxyOf.nodes.push(g3), this;
        }
        each(g3) {
          if (!this.proxyOf.nodes) return;
          let h2 = this.getIterator(), m3, y3;
          for (; this.indexes[h2] < this.proxyOf.nodes.length && (m3 = this.indexes[h2], y3 = g3(this.proxyOf.nodes[m3], m3), y3 !== false); ) this.indexes[h2] += 1;
          return delete this.indexes[h2], y3;
        }
        walk(g3) {
          return this.each((h2, m3) => {
            let y3;
            try {
              y3 = g3(h2, m3);
            } catch (v2) {
              throw h2.addToError(v2);
            }
            return y3 !== false && h2.walk && (y3 = h2.walk(g3)), y3;
          });
        }
        walkDecls(g3, h2) {
          return h2 ? g3 instanceof RegExp ? this.walk((m3, y3) => {
            if (m3.type === "decl" && g3.test(m3.prop)) return h2(m3, y3);
          }) : this.walk((m3, y3) => {
            if (m3.type === "decl" && m3.prop === g3) return h2(m3, y3);
          }) : (h2 = g3, this.walk((m3, y3) => {
            if (m3.type === "decl") return h2(m3, y3);
          }));
        }
        walkRules(g3, h2) {
          return h2 ? g3 instanceof RegExp ? this.walk((m3, y3) => {
            if (m3.type === "rule" && g3.test(m3.selector)) return h2(m3, y3);
          }) : this.walk((m3, y3) => {
            if (m3.type === "rule" && m3.selector === g3) return h2(m3, y3);
          }) : (h2 = g3, this.walk((m3, y3) => {
            if (m3.type === "rule") return h2(m3, y3);
          }));
        }
        walkAtRules(g3, h2) {
          return h2 ? g3 instanceof RegExp ? this.walk((m3, y3) => {
            if (m3.type === "atrule" && g3.test(m3.name)) return h2(m3, y3);
          }) : this.walk((m3, y3) => {
            if (m3.type === "atrule" && m3.name === g3) return h2(m3, y3);
          }) : (h2 = g3, this.walk((m3, y3) => {
            if (m3.type === "atrule") return h2(m3, y3);
          }));
        }
        walkComments(g3) {
          return this.walk((h2, m3) => {
            if (h2.type === "comment") return g3(h2, m3);
          });
        }
        append(...g3) {
          for (let h2 of g3) {
            let m3 = this.normalize(h2, this.last);
            for (let y3 of m3) this.proxyOf.nodes.push(y3);
          }
          return this.markDirty(), this;
        }
        prepend(...g3) {
          g3 = g3.reverse();
          for (let h2 of g3) {
            let m3 = this.normalize(h2, this.first, "prepend").reverse();
            for (let y3 of m3) this.proxyOf.nodes.unshift(y3);
            for (let y3 in this.indexes) this.indexes[y3] = this.indexes[y3] + m3.length;
          }
          return this.markDirty(), this;
        }
        cleanRaws(g3) {
          if (super.cleanRaws(g3), this.nodes) for (let h2 of this.nodes) h2.cleanRaws(g3);
        }
        insertBefore(g3, h2) {
          let m3 = this.index(g3), y3 = m3 === 0 ? "prepend" : false, v2 = this.normalize(h2, this.proxyOf.nodes[m3], y3).reverse();
          m3 = this.index(g3);
          for (let k of v2) this.proxyOf.nodes.splice(m3, 0, k);
          let x2;
          for (let k in this.indexes) x2 = this.indexes[k], m3 <= x2 && (this.indexes[k] = x2 + v2.length);
          return this.markDirty(), this;
        }
        insertAfter(g3, h2) {
          let m3 = this.index(g3), y3 = this.normalize(h2, this.proxyOf.nodes[m3]).reverse();
          m3 = this.index(g3);
          for (let x2 of y3) this.proxyOf.nodes.splice(m3 + 1, 0, x2);
          let v2;
          for (let x2 in this.indexes) v2 = this.indexes[x2], m3 < v2 && (this.indexes[x2] = v2 + y3.length);
          return this.markDirty(), this;
        }
        removeChild(g3) {
          g3 = this.index(g3), this.proxyOf.nodes[g3].parent = void 0, this.proxyOf.nodes.splice(g3, 1);
          let h2;
          for (let m3 in this.indexes) h2 = this.indexes[m3], h2 >= g3 && (this.indexes[m3] = h2 - 1);
          return this.markDirty(), this;
        }
        removeAll() {
          for (let g3 of this.proxyOf.nodes) g3.parent = void 0;
          return this.proxyOf.nodes = [], this.markDirty(), this;
        }
        replaceValues(g3, h2, m3) {
          return m3 || (m3 = h2, h2 = {}), this.walkDecls((y3) => {
            h2.props && !h2.props.includes(y3.prop) || h2.fast && !y3.value.includes(h2.fast) || (y3.value = y3.value.replace(g3, m3));
          }), this.markDirty(), this;
        }
        every(g3) {
          return this.nodes.every(g3);
        }
        some(g3) {
          return this.nodes.some(g3);
        }
        index(g3) {
          return typeof g3 == "number" ? g3 : (g3.proxyOf && (g3 = g3.proxyOf), this.proxyOf.nodes.indexOf(g3));
        }
        get first() {
          if (this.proxyOf.nodes) return this.proxyOf.nodes[0];
        }
        get last() {
          if (this.proxyOf.nodes) return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
        }
        normalize(g3, h2) {
          if (typeof g3 == "string") g3 = u2(l(g3).nodes);
          else if (Array.isArray(g3)) {
            g3 = g3.slice(0);
            for (let m3 of g3) m3.parent && m3.parent.removeChild(m3, "ignore");
          } else if (g3.type === "root" && this.type !== "document") {
            g3 = g3.nodes.slice(0);
            for (let m3 of g3) m3.parent && m3.parent.removeChild(m3, "ignore");
          } else if (g3.type) g3 = [g3];
          else if (g3.prop) {
            if (typeof g3.value > "u") throw new Error("Value field is missed in node creation");
            typeof g3.value != "string" && (g3.value = String(g3.value)), g3 = [new o2(g3)];
          } else if (g3.selector) g3 = [new c2(g3)];
          else if (g3.name) g3 = [new i2(g3)];
          else if (g3.text) g3 = [new s2(g3)];
          else throw new Error("Unknown node type in node creation");
          return g3.map((m3) => (m3[n] || f3.rebuild(m3), m3 = m3.proxyOf, m3.parent && m3.parent.removeChild(m3), m3[r2] && p2(m3), typeof m3.raws.before > "u" && h2 && typeof h2.raws.before < "u" && (m3.raws.before = h2.raws.before.replace(/\S/g, "")), m3.parent = this.proxyOf, m3));
        }
        getProxyProcessor() {
          return { set(g3, h2, m3) {
            return g3[h2] === m3 || (g3[h2] = m3, (h2 === "name" || h2 === "params" || h2 === "selector") && g3.markDirty()), true;
          }, get(g3, h2) {
            return h2 === "proxyOf" ? g3 : g3[h2] ? h2 === "each" || typeof h2 == "string" && h2.startsWith("walk") ? (...m3) => g3[h2](...m3.map((y3) => typeof y3 == "function" ? (v2, x2) => y3(v2.toProxy(), x2) : y3)) : h2 === "every" || h2 === "some" ? (m3) => g3[h2]((y3, ...v2) => m3(y3.toProxy(), ...v2)) : h2 === "root" ? () => g3.root().toProxy() : h2 === "nodes" ? g3.nodes.map((m3) => m3.toProxy()) : h2 === "first" || h2 === "last" ? g3[h2].toProxy() : g3[h2] : g3[h2];
          } };
        }
        getIterator() {
          this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach += 1;
          let g3 = this.lastEach;
          return this.indexes[g3] = 0, g3;
        }
      };
      f3.registerParse = (g3) => {
        l = g3;
      }, f3.registerRule = (g3) => {
        c2 = g3;
      }, f3.registerAtRule = (g3) => {
        i2 = g3;
      }, f3.registerRoot = (g3) => {
        d3 = g3;
      }, t.exports = f3, f3.default = f3, f3.rebuild = (g3) => {
        g3.type === "atrule" ? Object.setPrototypeOf(g3, i2.prototype) : g3.type === "rule" ? Object.setPrototypeOf(g3, c2.prototype) : g3.type === "decl" ? Object.setPrototypeOf(g3, o2.prototype) : g3.type === "comment" ? Object.setPrototypeOf(g3, s2.prototype) : g3.type === "root" && Object.setPrototypeOf(g3, d3.prototype), g3[n] = true, g3.nodes && g3.nodes.forEach((h2) => {
          f3.rebuild(h2);
        });
      };
    }), tn = T((e, t) => {
      O2();
      var r2 = ct(), n, o2, s2 = class extends r2 {
        constructor(a) {
          super({ type: "document", ...a }), this.nodes || (this.nodes = []);
        }
        toResult(a = {}) {
          return new n(new o2(), this, a).stringify();
        }
      };
      s2.registerLazyResult = (a) => {
        n = a;
      }, s2.registerProcessor = (a) => {
        o2 = a;
      }, t.exports = s2, s2.default = s2;
    }), ms = T((e, t) => {
      O2();
      var r2 = {};
      t.exports = function(n) {
        r2[n] || (r2[n] = true, typeof console < "u" && console.warn && console.warn(n));
      };
    }), gs = T((e, t) => {
      O2();
      var r2 = class {
        constructor(n, o2 = {}) {
          if (this.type = "warning", this.text = n, o2.node && o2.node.source) {
            let s2 = o2.node.rangeBy(o2);
            this.line = s2.start.line, this.column = s2.start.column, this.endLine = s2.end.line, this.endColumn = s2.end.column;
          }
          for (let s2 in o2) this[s2] = o2[s2];
        }
        toString() {
          return this.node ? this.node.error(this.text, { plugin: this.plugin, index: this.index, word: this.word }).message : this.plugin ? this.plugin + ": " + this.text : this.text;
        }
      };
      t.exports = r2, r2.default = r2;
    }), rn = T((e, t) => {
      O2();
      var r2 = gs(), n = class {
        constructor(o2, s2, a) {
          this.processor = o2, this.messages = [], this.root = s2, this.opts = a, this.css = void 0, this.map = void 0;
        }
        toString() {
          return this.css;
        }
        warn(o2, s2 = {}) {
          s2.plugin || this.lastPlugin && this.lastPlugin.postcssPlugin && (s2.plugin = this.lastPlugin.postcssPlugin);
          let a = new r2(o2, s2);
          return this.messages.push(a), a;
        }
        warnings() {
          return this.messages.filter((o2) => o2.type === "warning");
        }
        get content() {
          return this.css;
        }
      };
      t.exports = n, n.default = n;
    }), _l = T((e, t) => {
      O2();
      var r2 = 39, n = 34, o2 = 92, s2 = 47, a = 10, l = 32, c2 = 12, i2 = 9, d3 = 13, u2 = 91, p2 = 93, f3 = 40, g3 = 41, h2 = 123, m3 = 125, y3 = 59, v2 = 42, x2 = 58, k = 64, w2 = /[\t\n\f\r "#'()/;[\\\]{}]/g, b2 = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g, C = /.[\n"'(/\\]/, S = /[\da-f]/i;
      t.exports = function(E, A2 = {}) {
        let _2 = E.css.valueOf(), U = A2.ignoreErrors, D, j, L, F, H, Q, we, Ce, R, M2, P2 = _2.length, I = 0, G = [], B = [];
        function N() {
          return I;
        }
        function K(ie) {
          throw E.error("Unclosed " + ie, I);
        }
        function J() {
          return B.length === 0 && I >= P2;
        }
        function V(ie) {
          if (B.length) return B.pop();
          if (I >= P2) return;
          let q = ie ? ie.ignoreUnclosed : false;
          switch (D = _2.charCodeAt(I), D) {
            case a:
            case l:
            case i2:
            case d3:
            case c2: {
              j = I;
              do
                j += 1, D = _2.charCodeAt(j);
              while (D === l || D === a || D === i2 || D === d3 || D === c2);
              M2 = ["space", _2.slice(I, j)], I = j - 1;
              break;
            }
            case u2:
            case p2:
            case h2:
            case m3:
            case x2:
            case y3:
            case g3: {
              let le = String.fromCharCode(D);
              M2 = [le, le, I];
              break;
            }
            case f3: {
              if (Ce = G.length ? G.pop()[1] : "", R = _2.charCodeAt(I + 1), Ce === "url" && R !== r2 && R !== n && R !== l && R !== a && R !== i2 && R !== c2 && R !== d3) {
                j = I;
                do {
                  if (Q = false, j = _2.indexOf(")", j + 1), j === -1) if (U || q) {
                    j = I;
                    break;
                  } else K("bracket");
                  for (we = j; _2.charCodeAt(we - 1) === o2; ) we -= 1, Q = !Q;
                } while (Q);
                M2 = ["brackets", _2.slice(I, j + 1), I, j], I = j;
              } else j = _2.indexOf(")", I + 1), F = _2.slice(I, j + 1), j === -1 || C.test(F) ? M2 = ["(", "(", I] : (M2 = ["brackets", F, I, j], I = j);
              break;
            }
            case r2:
            case n: {
              L = D === r2 ? "'" : '"', j = I;
              do {
                if (Q = false, j = _2.indexOf(L, j + 1), j === -1) if (U || q) {
                  j = I + 1;
                  break;
                } else K("string");
                for (we = j; _2.charCodeAt(we - 1) === o2; ) we -= 1, Q = !Q;
              } while (Q);
              M2 = ["string", _2.slice(I, j + 1), I, j], I = j;
              break;
            }
            case k: {
              w2.lastIndex = I + 1, w2.test(_2), w2.lastIndex === 0 ? j = _2.length - 1 : j = w2.lastIndex - 2, M2 = ["at-word", _2.slice(I, j + 1), I, j], I = j;
              break;
            }
            case o2: {
              for (j = I, H = true; _2.charCodeAt(j + 1) === o2; ) j += 1, H = !H;
              if (D = _2.charCodeAt(j + 1), H && D !== s2 && D !== l && D !== a && D !== i2 && D !== d3 && D !== c2 && (j += 1, S.test(_2.charAt(j)))) {
                for (; S.test(_2.charAt(j + 1)); ) j += 1;
                _2.charCodeAt(j + 1) === l && (j += 1);
              }
              M2 = ["word", _2.slice(I, j + 1), I, j], I = j;
              break;
            }
            default: {
              D === s2 && _2.charCodeAt(I + 1) === v2 ? (j = _2.indexOf("*/", I + 2) + 1, j === 0 && (U || q ? j = _2.length : K("comment")), M2 = ["comment", _2.slice(I, j + 1), I, j], I = j) : (b2.lastIndex = I + 1, b2.test(_2), b2.lastIndex === 0 ? j = _2.length - 1 : j = b2.lastIndex - 2, M2 = ["word", _2.slice(I, j + 1), I, j], G.push(M2), I = j);
              break;
            }
          }
          return I++, M2;
        }
        function ne(ie) {
          B.push(ie);
        }
        return { back: ne, nextToken: V, endOfFile: J, position: N };
      };
    }), nn = T((e, t) => {
      O2();
      var r2 = ct(), n = class extends r2 {
        constructor(o2) {
          super(o2), this.type = "atrule";
        }
        append(...o2) {
          return this.proxyOf.nodes || (this.nodes = []), super.append(...o2);
        }
        prepend(...o2) {
          return this.proxyOf.nodes || (this.nodes = []), super.prepend(...o2);
        }
      };
      t.exports = n, n.default = n, r2.registerAtRule(n);
    }), Mt = T((e, t) => {
      O2();
      var r2 = ct(), n, o2, s2 = class extends r2 {
        constructor(a) {
          super(a), this.type = "root", this.nodes || (this.nodes = []);
        }
        removeChild(a, l) {
          let c2 = this.index(a);
          return !l && c2 === 0 && this.nodes.length > 1 && (this.nodes[1].raws.before = this.nodes[c2].raws.before), super.removeChild(a);
        }
        normalize(a, l, c2) {
          let i2 = super.normalize(a);
          if (l) {
            if (c2 === "prepend") this.nodes.length > 1 ? l.raws.before = this.nodes[1].raws.before : delete l.raws.before;
            else if (this.first !== l) for (let d3 of i2) d3.raws.before = l.raws.before;
          }
          return i2;
        }
        toResult(a = {}) {
          return new n(new o2(), this, a).stringify();
        }
      };
      s2.registerLazyResult = (a) => {
        n = a;
      }, s2.registerProcessor = (a) => {
        o2 = a;
      }, t.exports = s2, s2.default = s2, r2.registerRoot(s2);
    }), vs = T((e, t) => {
      O2();
      var r2 = { split(n, o2, s2) {
        let a = [], l = "", c2 = false, i2 = 0, d3 = false, u2 = "", p2 = false;
        for (let f3 of n) p2 ? p2 = false : f3 === "\\" ? p2 = true : d3 ? f3 === u2 && (d3 = false) : f3 === '"' || f3 === "'" ? (d3 = true, u2 = f3) : f3 === "(" ? i2 += 1 : f3 === ")" ? i2 > 0 && (i2 -= 1) : i2 === 0 && o2.includes(f3) && (c2 = true), c2 ? (l !== "" && a.push(l.trim()), l = "", c2 = false) : l += f3;
        return (s2 || l !== "") && a.push(l.trim()), a;
      }, space(n) {
        let o2 = [" ", `
`, "	"];
        return r2.split(n, o2);
      }, comma(n) {
        return r2.split(n, [","], true);
      } };
      t.exports = r2, r2.default = r2;
    }), on = T((e, t) => {
      O2();
      var r2 = ct(), n = vs(), o2 = class extends r2 {
        constructor(s2) {
          super(s2), this.type = "rule", this.nodes || (this.nodes = []);
        }
        get selectors() {
          return n.comma(this.selector);
        }
        set selectors(s2) {
          let a = this.selector ? this.selector.match(/,\s*/) : null, l = a ? a[0] : "," + this.raw("between", "beforeOpen");
          this.selector = s2.join(l);
        }
      };
      t.exports = o2, o2.default = o2, r2.registerRule(o2);
    }), El = T((e, t) => {
      O2();
      var r2 = or(), n = _l(), o2 = sr(), s2 = nn(), a = Mt(), l = on(), c2 = { empty: true, space: true };
      function i2(u2) {
        for (let p2 = u2.length - 1; p2 >= 0; p2--) {
          let f3 = u2[p2], g3 = f3[3] || f3[2];
          if (g3) return g3;
        }
      }
      var d3 = class {
        constructor(u2) {
          this.input = u2, this.root = new a(), this.current = this.root, this.spaces = "", this.semicolon = false, this.customProperty = false, this.createTokenizer(), this.root.source = { input: u2, start: { offset: 0, line: 1, column: 1 } };
        }
        createTokenizer() {
          this.tokenizer = n(this.input);
        }
        parse() {
          let u2;
          for (; !this.tokenizer.endOfFile(); ) switch (u2 = this.tokenizer.nextToken(), u2[0]) {
            case "space":
              this.spaces += u2[1];
              break;
            case ";":
              this.freeSemicolon(u2);
              break;
            case "}":
              this.end(u2);
              break;
            case "comment":
              this.comment(u2);
              break;
            case "at-word":
              this.atrule(u2);
              break;
            case "{":
              this.emptyRule(u2);
              break;
            default:
              this.other(u2);
              break;
          }
          this.endFile();
        }
        comment(u2) {
          let p2 = new o2();
          this.init(p2, u2[2]), p2.source.end = this.getPosition(u2[3] || u2[2]);
          let f3 = u2[1].slice(2, -2);
          if (/^\s*$/.test(f3)) p2.text = "", p2.raws.left = f3, p2.raws.right = "";
          else {
            let g3 = f3.match(/^(\s*)([^]*\S)(\s*)$/);
            p2.text = g3[2], p2.raws.left = g3[1], p2.raws.right = g3[3];
          }
        }
        emptyRule(u2) {
          let p2 = new l();
          this.init(p2, u2[2]), p2.selector = "", p2.raws.between = "", this.current = p2;
        }
        other(u2) {
          let p2 = false, f3 = null, g3 = false, h2 = null, m3 = [], y3 = u2[1].startsWith("--"), v2 = [], x2 = u2;
          for (; x2; ) {
            if (f3 = x2[0], v2.push(x2), f3 === "(" || f3 === "[") h2 || (h2 = x2), m3.push(f3 === "(" ? ")" : "]");
            else if (y3 && g3 && f3 === "{") h2 || (h2 = x2), m3.push("}");
            else if (m3.length === 0) if (f3 === ";") if (g3) {
              this.decl(v2, y3);
              return;
            } else break;
            else if (f3 === "{") {
              this.rule(v2);
              return;
            } else if (f3 === "}") {
              this.tokenizer.back(v2.pop()), p2 = true;
              break;
            } else f3 === ":" && (g3 = true);
            else f3 === m3[m3.length - 1] && (m3.pop(), m3.length === 0 && (h2 = null));
            x2 = this.tokenizer.nextToken();
          }
          if (this.tokenizer.endOfFile() && (p2 = true), m3.length > 0 && this.unclosedBracket(h2), p2 && g3) {
            if (!y3) for (; v2.length && (x2 = v2[v2.length - 1][0], !(x2 !== "space" && x2 !== "comment")); ) this.tokenizer.back(v2.pop());
            this.decl(v2, y3);
          } else this.unknownWord(v2);
        }
        rule(u2) {
          u2.pop();
          let p2 = new l();
          this.init(p2, u2[0][2]), p2.raws.between = this.spacesAndCommentsFromEnd(u2), this.raw(p2, "selector", u2), this.current = p2;
        }
        decl(u2, p2) {
          let f3 = new r2();
          this.init(f3, u2[0][2]);
          let g3 = u2[u2.length - 1];
          for (g3[0] === ";" && (this.semicolon = true, u2.pop()), f3.source.end = this.getPosition(g3[3] || g3[2] || i2(u2)); u2[0][0] !== "word"; ) u2.length === 1 && this.unknownWord(u2), f3.raws.before += u2.shift()[1];
          for (f3.source.start = this.getPosition(u2[0][2]), f3.prop = ""; u2.length; ) {
            let v2 = u2[0][0];
            if (v2 === ":" || v2 === "space" || v2 === "comment") break;
            f3.prop += u2.shift()[1];
          }
          f3.raws.between = "";
          let h2;
          for (; u2.length; ) if (h2 = u2.shift(), h2[0] === ":") {
            f3.raws.between += h2[1];
            break;
          } else h2[0] === "word" && /\w/.test(h2[1]) && this.unknownWord([h2]), f3.raws.between += h2[1];
          (f3.prop[0] === "_" || f3.prop[0] === "*") && (f3.raws.before += f3.prop[0], f3.prop = f3.prop.slice(1));
          let m3 = [], y3;
          for (; u2.length && (y3 = u2[0][0], !(y3 !== "space" && y3 !== "comment")); ) m3.push(u2.shift());
          this.precheckMissedSemicolon(u2);
          for (let v2 = u2.length - 1; v2 >= 0; v2--) {
            if (h2 = u2[v2], h2[1].toLowerCase() === "!important") {
              f3.important = true;
              let x2 = this.stringFrom(u2, v2);
              x2 = this.spacesFromEnd(u2) + x2, x2 !== " !important" && (f3.raws.important = x2);
              break;
            } else if (h2[1].toLowerCase() === "important") {
              let x2 = u2.slice(0), k = "";
              for (let w2 = v2; w2 > 0; w2--) {
                let b2 = x2[w2][0];
                if (k.trim().indexOf("!") === 0 && b2 !== "space") break;
                k = x2.pop()[1] + k;
              }
              k.trim().indexOf("!") === 0 && (f3.important = true, f3.raws.important = k, u2 = x2);
            }
            if (h2[0] !== "space" && h2[0] !== "comment") break;
          }
          u2.some((v2) => v2[0] !== "space" && v2[0] !== "comment") && (f3.raws.between += m3.map((v2) => v2[1]).join(""), m3 = []), this.raw(f3, "value", m3.concat(u2), p2), f3.value.includes(":") && !p2 && this.checkMissedSemicolon(u2);
        }
        atrule(u2) {
          let p2 = new s2();
          p2.name = u2[1].slice(1), p2.name === "" && this.unnamedAtrule(p2, u2), this.init(p2, u2[2]);
          let f3, g3, h2, m3 = false, y3 = false, v2 = [], x2 = [];
          for (; !this.tokenizer.endOfFile(); ) {
            if (u2 = this.tokenizer.nextToken(), f3 = u2[0], f3 === "(" || f3 === "[" ? x2.push(f3 === "(" ? ")" : "]") : f3 === "{" && x2.length > 0 ? x2.push("}") : f3 === x2[x2.length - 1] && x2.pop(), x2.length === 0) if (f3 === ";") {
              p2.source.end = this.getPosition(u2[2]), this.semicolon = true;
              break;
            } else if (f3 === "{") {
              y3 = true;
              break;
            } else if (f3 === "}") {
              if (v2.length > 0) {
                for (h2 = v2.length - 1, g3 = v2[h2]; g3 && g3[0] === "space"; ) g3 = v2[--h2];
                g3 && (p2.source.end = this.getPosition(g3[3] || g3[2]));
              }
              this.end(u2);
              break;
            } else v2.push(u2);
            else v2.push(u2);
            if (this.tokenizer.endOfFile()) {
              m3 = true;
              break;
            }
          }
          p2.raws.between = this.spacesAndCommentsFromEnd(v2), v2.length ? (p2.raws.afterName = this.spacesAndCommentsFromStart(v2), this.raw(p2, "params", v2), m3 && (u2 = v2[v2.length - 1], p2.source.end = this.getPosition(u2[3] || u2[2]), this.spaces = p2.raws.between, p2.raws.between = "")) : (p2.raws.afterName = "", p2.params = ""), y3 && (p2.nodes = [], this.current = p2);
        }
        end(u2) {
          this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.semicolon = false, this.current.raws.after = (this.current.raws.after || "") + this.spaces, this.spaces = "", this.current.parent ? (this.current.source.end = this.getPosition(u2[2]), this.current = this.current.parent) : this.unexpectedClose(u2);
        }
        endFile() {
          this.current.parent && this.unclosedBlock(), this.current.nodes && this.current.nodes.length && (this.current.raws.semicolon = this.semicolon), this.current.raws.after = (this.current.raws.after || "") + this.spaces;
        }
        freeSemicolon(u2) {
          if (this.spaces += u2[1], this.current.nodes) {
            let p2 = this.current.nodes[this.current.nodes.length - 1];
            p2 && p2.type === "rule" && !p2.raws.ownSemicolon && (p2.raws.ownSemicolon = this.spaces, this.spaces = "");
          }
        }
        getPosition(u2) {
          let p2 = this.input.fromOffset(u2);
          return { offset: u2, line: p2.line, column: p2.col };
        }
        init(u2, p2) {
          this.current.push(u2), u2.source = { start: this.getPosition(p2), input: this.input }, u2.raws.before = this.spaces, this.spaces = "", u2.type !== "comment" && (this.semicolon = false);
        }
        raw(u2, p2, f3, g3) {
          let h2, m3, y3 = f3.length, v2 = "", x2 = true, k, w2;
          for (let b2 = 0; b2 < y3; b2 += 1) h2 = f3[b2], m3 = h2[0], m3 === "space" && b2 === y3 - 1 && !g3 ? x2 = false : m3 === "comment" ? (w2 = f3[b2 - 1] ? f3[b2 - 1][0] : "empty", k = f3[b2 + 1] ? f3[b2 + 1][0] : "empty", !c2[w2] && !c2[k] ? v2.slice(-1) === "," ? x2 = false : v2 += h2[1] : x2 = false) : v2 += h2[1];
          if (!x2) {
            let b2 = f3.reduce((C, S) => C + S[1], "");
            u2.raws[p2] = { value: v2, raw: b2 };
          }
          u2[p2] = v2;
        }
        spacesAndCommentsFromEnd(u2) {
          let p2, f3 = "";
          for (; u2.length && (p2 = u2[u2.length - 1][0], !(p2 !== "space" && p2 !== "comment")); ) f3 = u2.pop()[1] + f3;
          return f3;
        }
        spacesAndCommentsFromStart(u2) {
          let p2, f3 = "";
          for (; u2.length && (p2 = u2[0][0], !(p2 !== "space" && p2 !== "comment")); ) f3 += u2.shift()[1];
          return f3;
        }
        spacesFromEnd(u2) {
          let p2, f3 = "";
          for (; u2.length && (p2 = u2[u2.length - 1][0], p2 === "space"); ) f3 = u2.pop()[1] + f3;
          return f3;
        }
        stringFrom(u2, p2) {
          let f3 = "";
          for (let g3 = p2; g3 < u2.length; g3++) f3 += u2[g3][1];
          return u2.splice(p2, u2.length - p2), f3;
        }
        colon(u2) {
          let p2 = 0, f3, g3, h2;
          for (let [m3, y3] of u2.entries()) {
            if (f3 = y3, g3 = f3[0], g3 === "(" && (p2 += 1), g3 === ")" && (p2 -= 1), p2 === 0 && g3 === ":") if (!h2) this.doubleColon(f3);
            else {
              if (h2[0] === "word" && h2[1] === "progid") continue;
              return m3;
            }
            h2 = f3;
          }
          return false;
        }
        unclosedBracket(u2) {
          throw this.input.error("Unclosed bracket", { offset: u2[2] }, { offset: u2[2] + 1 });
        }
        unknownWord(u2) {
          throw this.input.error("Unknown word", { offset: u2[0][2] }, { offset: u2[0][2] + u2[0][1].length });
        }
        unexpectedClose(u2) {
          throw this.input.error("Unexpected }", { offset: u2[2] }, { offset: u2[2] + 1 });
        }
        unclosedBlock() {
          let u2 = this.current.source.start;
          throw this.input.error("Unclosed block", u2.line, u2.column);
        }
        doubleColon(u2) {
          throw this.input.error("Double colon", { offset: u2[2] }, { offset: u2[2] + u2[1].length });
        }
        unnamedAtrule(u2, p2) {
          throw this.input.error("At-rule without name", { offset: p2[2] }, { offset: p2[2] + p2[1].length });
        }
        precheckMissedSemicolon() {
        }
        checkMissedSemicolon(u2) {
          let p2 = this.colon(u2);
          if (p2 === false) return;
          let f3 = 0, g3;
          for (let h2 = p2 - 1; h2 >= 0 && (g3 = u2[h2], !(g3[0] !== "space" && (f3 += 1, f3 === 2))); h2--) ;
          throw this.input.error("Missed semicolon", g3[0] === "word" ? g3[3] + 1 : g3[2]);
        }
      };
      t.exports = d3;
    }), Tl = T(() => {
      O2();
    }), Il = T((e, t) => {
      O2();
      var r2 = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict", n = (s2, a = 21) => (l = a) => {
        let c2 = "", i2 = l;
        for (; i2--; ) c2 += s2[Math.random() * s2.length | 0];
        return c2;
      }, o2 = (s2 = 21) => {
        let a = "", l = s2;
        for (; l--; ) a += r2[Math.random() * 64 | 0];
        return a;
      };
      t.exports = { nanoid: o2, customAlphabet: n };
    }), ys = T((e, t) => {
      O2(), t.exports = {};
    }), sn = T((e, t) => {
      O2();
      var { SourceMapConsumer: r2, SourceMapGenerator: n } = Tl(), { fileURLToPath: o2, pathToFileURL: s2 } = (ds(), us), { resolve: a, isAbsolute: l } = (St(), is), { nanoid: c2 } = Il(), i2 = ps(), d3 = Kr(), u2 = ys(), p2 = Symbol("fromOffsetCache"), f3 = !!(r2 && n), g3 = !!(a && l), h2 = class {
        constructor(m3, y3 = {}) {
          if (m3 === null || typeof m3 > "u" || typeof m3 == "object" && !m3.toString) throw new Error(`PostCSS received ${m3} instead of CSS string`);
          if (this.css = m3.toString(), this.css[0] === "\uFEFF" || this.css[0] === "\uFFFE" ? (this.hasBOM = true, this.css = this.css.slice(1)) : this.hasBOM = false, y3.from && (!g3 || /^\w+:\/\//.test(y3.from) || l(y3.from) ? this.file = y3.from : this.file = a(y3.from)), g3 && f3) {
            let v2 = new u2(this.css, y3);
            if (v2.text) {
              this.map = v2;
              let x2 = v2.consumer().file;
              !this.file && x2 && (this.file = this.mapResolve(x2));
            }
          }
          this.file || (this.id = "<input css " + c2(6) + ">"), this.map && (this.map.file = this.from);
        }
        fromOffset(m3) {
          let y3, v2;
          if (this[p2]) v2 = this[p2];
          else {
            let k = this.css.split(`
`);
            v2 = new Array(k.length);
            let w2 = 0;
            for (let b2 = 0, C = k.length; b2 < C; b2++) v2[b2] = w2, w2 += k[b2].length + 1;
            this[p2] = v2;
          }
          y3 = v2[v2.length - 1];
          let x2 = 0;
          if (m3 >= y3) x2 = v2.length - 1;
          else {
            let k = v2.length - 2, w2;
            for (; x2 < k; ) if (w2 = x2 + (k - x2 >> 1), m3 < v2[w2]) k = w2 - 1;
            else if (m3 >= v2[w2 + 1]) x2 = w2 + 1;
            else {
              x2 = w2;
              break;
            }
          }
          return { line: x2 + 1, col: m3 - v2[x2] + 1 };
        }
        error(m3, y3, v2, x2 = {}) {
          let k, w2, b2;
          if (y3 && typeof y3 == "object") {
            let S = y3, E = v2;
            if (typeof S.offset == "number") {
              let A2 = this.fromOffset(S.offset);
              y3 = A2.line, v2 = A2.col;
            } else y3 = S.line, v2 = S.column;
            if (typeof E.offset == "number") {
              let A2 = this.fromOffset(E.offset);
              w2 = A2.line, b2 = A2.col;
            } else w2 = E.line, b2 = E.column;
          } else if (!v2) {
            let S = this.fromOffset(y3);
            y3 = S.line, v2 = S.col;
          }
          let C = this.origin(y3, v2, w2, b2);
          return C ? k = new d3(m3, C.endLine === void 0 ? C.line : { line: C.line, column: C.column }, C.endLine === void 0 ? C.column : { line: C.endLine, column: C.endColumn }, C.source, C.file, x2.plugin) : k = new d3(m3, w2 === void 0 ? y3 : { line: y3, column: v2 }, w2 === void 0 ? v2 : { line: w2, column: b2 }, this.css, this.file, x2.plugin), k.input = { line: y3, column: v2, endLine: w2, endColumn: b2, source: this.css }, this.file && (s2 && (k.input.url = s2(this.file).toString()), k.input.file = this.file), k;
        }
        origin(m3, y3, v2, x2) {
          if (!this.map) return false;
          let k = this.map.consumer(), w2 = k.originalPositionFor({ line: m3, column: y3 });
          if (!w2.source) return false;
          let b2;
          typeof v2 == "number" && (b2 = k.originalPositionFor({ line: v2, column: x2 }));
          let C;
          l(w2.source) ? C = s2(w2.source) : C = new URL(w2.source, this.map.consumer().sourceRoot || s2(this.map.mapFile));
          let S = { url: C.toString(), line: w2.line, column: w2.column, endLine: b2 && b2.line, endColumn: b2 && b2.column };
          if (C.protocol === "file:") if (o2) S.file = o2(C);
          else throw new Error("file: protocol is not available in this PostCSS build");
          let E = k.sourceContentFor(w2.source);
          return E && (S.source = E), S;
        }
        mapResolve(m3) {
          return /^\w+:\/\//.test(m3) ? m3 : a(this.map.consumer().sourceRoot || this.map.root || ".", m3);
        }
        get from() {
          return this.file || this.id;
        }
        toJSON() {
          let m3 = {};
          for (let y3 of ["hasBOM", "css", "file", "id"]) this[y3] != null && (m3[y3] = this[y3]);
          return this.map && (m3.map = { ...this.map }, m3.map.consumerCache && (m3.map.consumerCache = void 0)), m3;
        }
      };
      t.exports = h2, h2.default = h2, i2 && i2.registerInput && i2.registerInput(h2);
    }), an = T((e, t) => {
      O2();
      var r2 = ct(), n = El(), o2 = sn();
      function s2(a, l) {
        let c2 = new o2(a, l), i2 = new n(c2);
        try {
          i2.parse();
        } catch (d3) {
          throw d3;
        }
        return i2.root;
      }
      t.exports = s2, s2.default = s2, r2.registerParse(s2);
    }), bs = T((e, t) => {
      O2();
      var { isClean: r2, my: n } = en(), o2 = hs(), s2 = rr(), a = ct(), l = tn(), c2 = ms(), i2 = rn(), d3 = an(), u2 = Mt(), p2 = { document: "Document", root: "Root", atrule: "AtRule", rule: "Rule", decl: "Declaration", comment: "Comment" }, f3 = { postcssPlugin: true, prepare: true, Once: true, Document: true, Root: true, Declaration: true, Rule: true, AtRule: true, Comment: true, DeclarationExit: true, RuleExit: true, AtRuleExit: true, CommentExit: true, RootExit: true, DocumentExit: true, OnceExit: true }, g3 = { postcssPlugin: true, prepare: true, Once: true }, h2 = 0;
      function m3(b2) {
        return typeof b2 == "object" && typeof b2.then == "function";
      }
      function y3(b2) {
        let C = false, S = p2[b2.type];
        return b2.type === "decl" ? C = b2.prop.toLowerCase() : b2.type === "atrule" && (C = b2.name.toLowerCase()), C && b2.append ? [S, S + "-" + C, h2, S + "Exit", S + "Exit-" + C] : C ? [S, S + "-" + C, S + "Exit", S + "Exit-" + C] : b2.append ? [S, h2, S + "Exit"] : [S, S + "Exit"];
      }
      function v2(b2) {
        let C;
        return b2.type === "document" ? C = ["Document", h2, "DocumentExit"] : b2.type === "root" ? C = ["Root", h2, "RootExit"] : C = y3(b2), { node: b2, events: C, eventIndex: 0, visitors: [], visitorIndex: 0, iterator: 0 };
      }
      function x2(b2) {
        return b2[r2] = false, b2.nodes && b2.nodes.forEach((C) => x2(C)), b2;
      }
      var k = {}, w2 = class {
        constructor(b2, C, S) {
          this.stringified = false, this.processed = false;
          let E;
          if (typeof C == "object" && C !== null && (C.type === "root" || C.type === "document")) E = x2(C);
          else if (C instanceof w2 || C instanceof i2) E = x2(C.root), C.map && (typeof S.map > "u" && (S.map = {}), S.map.inline || (S.map.inline = false), S.map.prev = C.map);
          else {
            let A2 = d3;
            S.syntax && (A2 = S.syntax.parse), S.parser && (A2 = S.parser), A2.parse && (A2 = A2.parse);
            try {
              E = A2(C, S);
            } catch (_2) {
              this.processed = true, this.error = _2;
            }
            E && !E[n] && a.rebuild(E);
          }
          this.result = new i2(b2, E, S), this.helpers = { ...k, result: this.result, postcss: k }, this.plugins = this.processor.plugins.map((A2) => typeof A2 == "object" && A2.prepare ? { ...A2, ...A2.prepare(this.result) } : A2);
        }
        get [Symbol.toStringTag]() {
          return "LazyResult";
        }
        get processor() {
          return this.result.processor;
        }
        get opts() {
          return this.result.opts;
        }
        get css() {
          return this.stringify().css;
        }
        get content() {
          return this.stringify().content;
        }
        get map() {
          return this.stringify().map;
        }
        get root() {
          return this.sync().root;
        }
        get messages() {
          return this.sync().messages;
        }
        warnings() {
          return this.sync().warnings();
        }
        toString() {
          return this.css;
        }
        then(b2, C) {
          return this.async().then(b2, C);
        }
        catch(b2) {
          return this.async().catch(b2);
        }
        finally(b2) {
          return this.async().then(b2, b2);
        }
        async() {
          return this.error ? Promise.reject(this.error) : this.processed ? Promise.resolve(this.result) : (this.processing || (this.processing = this.runAsync()), this.processing);
        }
        sync() {
          if (this.error) throw this.error;
          if (this.processed) return this.result;
          if (this.processed = true, this.processing) throw this.getAsyncError();
          for (let b2 of this.plugins) {
            let C = this.runOnRoot(b2);
            if (m3(C)) throw this.getAsyncError();
          }
          if (this.prepareVisitors(), this.hasListener) {
            let b2 = this.result.root;
            for (; !b2[r2]; ) b2[r2] = true, this.walkSync(b2);
            if (this.listeners.OnceExit) if (b2.type === "document") for (let C of b2.nodes) this.visitSync(this.listeners.OnceExit, C);
            else this.visitSync(this.listeners.OnceExit, b2);
          }
          return this.result;
        }
        stringify() {
          if (this.error) throw this.error;
          if (this.stringified) return this.result;
          this.stringified = true, this.sync();
          let b2 = this.result.opts, C = s2;
          b2.syntax && (C = b2.syntax.stringify), b2.stringifier && (C = b2.stringifier), C.stringify && (C = C.stringify);
          let S = new o2(C, this.result.root, this.result.opts).generate();
          return this.result.css = S[0], this.result.map = S[1], this.result;
        }
        walkSync(b2) {
          b2[r2] = true;
          let C = y3(b2);
          for (let S of C) if (S === h2) b2.nodes && b2.each((E) => {
            E[r2] || this.walkSync(E);
          });
          else {
            let E = this.listeners[S];
            if (E && this.visitSync(E, b2.toProxy())) return;
          }
        }
        visitSync(b2, C) {
          for (let [S, E] of b2) {
            this.result.lastPlugin = S;
            let A2;
            try {
              A2 = E(C, this.helpers);
            } catch (_2) {
              throw this.handleError(_2, C.proxyOf);
            }
            if (C.type !== "root" && C.type !== "document" && !C.parent) return true;
            if (m3(A2)) throw this.getAsyncError();
          }
        }
        runOnRoot(b2) {
          this.result.lastPlugin = b2;
          try {
            if (typeof b2 == "object" && b2.Once) {
              if (this.result.root.type === "document") {
                let C = this.result.root.nodes.map((S) => b2.Once(S, this.helpers));
                return m3(C[0]) ? Promise.all(C) : C;
              }
              return b2.Once(this.result.root, this.helpers);
            } else if (typeof b2 == "function") return b2(this.result.root, this.result);
          } catch (C) {
            throw this.handleError(C);
          }
        }
        getAsyncError() {
          throw new Error("Use process(css).then(cb) to work with async plugins");
        }
        handleError(b2, C) {
          let S = this.result.lastPlugin;
          try {
            C && C.addToError(b2), this.error = b2, b2.name === "CssSyntaxError" && !b2.plugin ? (b2.plugin = S.postcssPlugin, b2.setMessage()) : S.postcssVersion;
          } catch (E) {
            console && console.error && console.error(E);
          }
          return b2;
        }
        async runAsync() {
          this.plugin = 0;
          for (let b2 = 0; b2 < this.plugins.length; b2++) {
            let C = this.plugins[b2], S = this.runOnRoot(C);
            if (m3(S)) try {
              await S;
            } catch (E) {
              throw this.handleError(E);
            }
          }
          if (this.prepareVisitors(), this.hasListener) {
            let b2 = this.result.root;
            for (; !b2[r2]; ) {
              b2[r2] = true;
              let C = [v2(b2)];
              for (; C.length > 0; ) {
                let S = this.visitTick(C);
                if (m3(S)) try {
                  await S;
                } catch (E) {
                  let A2 = C[C.length - 1].node;
                  throw this.handleError(E, A2);
                }
              }
            }
            if (this.listeners.OnceExit) for (let [C, S] of this.listeners.OnceExit) {
              this.result.lastPlugin = C;
              try {
                if (b2.type === "document") {
                  let E = b2.nodes.map((A2) => S(A2, this.helpers));
                  await Promise.all(E);
                } else await S(b2, this.helpers);
              } catch (E) {
                throw this.handleError(E);
              }
            }
          }
          return this.processed = true, this.stringify();
        }
        prepareVisitors() {
          this.listeners = {};
          let b2 = (C, S, E) => {
            this.listeners[S] || (this.listeners[S] = []), this.listeners[S].push([C, E]);
          };
          for (let C of this.plugins) if (typeof C == "object") for (let S in C) {
            if (!f3[S] && /^[A-Z]/.test(S)) throw new Error(`Unknown event ${S} in ${C.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`);
            if (!g3[S]) if (typeof C[S] == "object") for (let E in C[S]) E === "*" ? b2(C, S, C[S][E]) : b2(C, S + "-" + E.toLowerCase(), C[S][E]);
            else typeof C[S] == "function" && b2(C, S, C[S]);
          }
          this.hasListener = Object.keys(this.listeners).length > 0;
        }
        visitTick(b2) {
          let C = b2[b2.length - 1], { node: S, visitors: E } = C;
          if (S.type !== "root" && S.type !== "document" && !S.parent) {
            b2.pop();
            return;
          }
          if (E.length > 0 && C.visitorIndex < E.length) {
            let [_2, U] = E[C.visitorIndex];
            C.visitorIndex += 1, C.visitorIndex === E.length && (C.visitors = [], C.visitorIndex = 0), this.result.lastPlugin = _2;
            try {
              return U(S.toProxy(), this.helpers);
            } catch (D) {
              throw this.handleError(D, S);
            }
          }
          if (C.iterator !== 0) {
            let _2 = C.iterator, U;
            for (; U = S.nodes[S.indexes[_2]]; ) if (S.indexes[_2] += 1, !U[r2]) {
              U[r2] = true, b2.push(v2(U));
              return;
            }
            C.iterator = 0, delete S.indexes[_2];
          }
          let A2 = C.events;
          for (; C.eventIndex < A2.length; ) {
            let _2 = A2[C.eventIndex];
            if (C.eventIndex += 1, _2 === h2) {
              S.nodes && S.nodes.length && (S[r2] = true, C.iterator = S.getIterator());
              return;
            } else if (this.listeners[_2]) {
              C.visitors = this.listeners[_2];
              return;
            }
          }
          b2.pop();
        }
      };
      w2.registerPostcss = (b2) => {
        k = b2;
      }, t.exports = w2, w2.default = w2, u2.registerLazyResult(w2), l.registerLazyResult(w2);
    }), Pl = T((e, t) => {
      O2();
      var r2 = hs(), n = rr(), o2 = ms(), s2 = an(), a = rn(), l = class {
        constructor(c2, i2, d3) {
          i2 = i2.toString(), this.stringified = false, this._processor = c2, this._css = i2, this._opts = d3, this._map = void 0;
          let u2, p2 = n;
          this.result = new a(this._processor, u2, this._opts), this.result.css = i2;
          let f3 = this;
          Object.defineProperty(this.result, "root", { get() {
            return f3.root;
          } });
          let g3 = new r2(p2, u2, this._opts, i2);
          if (g3.isMap()) {
            let [h2, m3] = g3.generate();
            h2 && (this.result.css = h2), m3 && (this.result.map = m3);
          }
        }
        get [Symbol.toStringTag]() {
          return "NoWorkResult";
        }
        get processor() {
          return this.result.processor;
        }
        get opts() {
          return this.result.opts;
        }
        get css() {
          return this.result.css;
        }
        get content() {
          return this.result.css;
        }
        get map() {
          return this.result.map;
        }
        get root() {
          if (this._root) return this._root;
          let c2, i2 = s2;
          try {
            c2 = i2(this._css, this._opts);
          } catch (d3) {
            this.error = d3;
          }
          if (this.error) throw this.error;
          return this._root = c2, c2;
        }
        get messages() {
          return [];
        }
        warnings() {
          return [];
        }
        toString() {
          return this._css;
        }
        then(c2, i2) {
          return this.async().then(c2, i2);
        }
        catch(c2) {
          return this.async().catch(c2);
        }
        finally(c2) {
          return this.async().then(c2, c2);
        }
        async() {
          return this.error ? Promise.reject(this.error) : Promise.resolve(this.result);
        }
        sync() {
          if (this.error) throw this.error;
          return this.result;
        }
      };
      t.exports = l, l.default = l;
    }), jl = T((e, t) => {
      O2();
      var r2 = Pl(), n = bs(), o2 = tn(), s2 = Mt(), a = class {
        constructor(l = []) {
          this.version = "8.4.24", this.plugins = this.normalize(l);
        }
        use(l) {
          return this.plugins = this.plugins.concat(this.normalize([l])), this;
        }
        process(l, c2 = {}) {
          return this.plugins.length === 0 && typeof c2.parser > "u" && typeof c2.stringifier > "u" && typeof c2.syntax > "u" ? new r2(this, l, c2) : new n(this, l, c2);
        }
        normalize(l) {
          let c2 = [];
          for (let i2 of l) if (i2.postcss === true ? i2 = i2() : i2.postcss && (i2 = i2.postcss), typeof i2 == "object" && Array.isArray(i2.plugins)) c2 = c2.concat(i2.plugins);
          else if (typeof i2 == "object" && i2.postcssPlugin) c2.push(i2);
          else if (typeof i2 == "function") c2.push(i2);
          else if (!(typeof i2 == "object" && (i2.parse || i2.stringify))) throw new Error(i2 + " is not a PostCSS plugin");
          return c2;
        }
      };
      t.exports = a, a.default = a, s2.registerProcessor(a), o2.registerProcessor(a);
    }), Bl = T((e, t) => {
      O2();
      var r2 = or(), n = ys(), o2 = sr(), s2 = nn(), a = sn(), l = Mt(), c2 = on();
      function i2(d3, u2) {
        if (Array.isArray(d3)) return d3.map((g3) => i2(g3));
        let { inputs: p2, ...f3 } = d3;
        if (p2) {
          u2 = [];
          for (let g3 of p2) {
            let h2 = { ...g3, __proto__: a.prototype };
            h2.map && (h2.map = { ...h2.map, __proto__: n.prototype }), u2.push(h2);
          }
        }
        if (f3.nodes && (f3.nodes = d3.nodes.map((g3) => i2(g3, u2))), f3.source) {
          let { inputId: g3, ...h2 } = f3.source;
          f3.source = h2, g3 != null && (f3.source.input = u2[g3]);
        }
        if (f3.type === "root") return new l(f3);
        if (f3.type === "decl") return new r2(f3);
        if (f3.type === "rule") return new c2(f3);
        if (f3.type === "comment") return new o2(f3);
        if (f3.type === "atrule") return new s2(f3);
        throw new Error("Unknown node type: " + d3.type);
      }
      t.exports = i2, i2.default = i2;
    }), Re = T((e, t) => {
      O2();
      var r2 = Kr(), n = or(), o2 = bs(), s2 = ct(), a = jl(), l = rr(), c2 = Bl(), i2 = tn(), d3 = gs(), u2 = sr(), p2 = nn(), f3 = rn(), g3 = sn(), h2 = an(), m3 = vs(), y3 = on(), v2 = Mt(), x2 = nr();
      function k(...w2) {
        return w2.length === 1 && Array.isArray(w2[0]) && (w2 = w2[0]), new a(w2);
      }
      k.plugin = function(w2, b2) {
        let C = false;
        function S(...A2) {
          console && console.warn && !C && (C = true, console.warn(w2 + `: postcss.plugin was deprecated. Migration guide:
https://evilmartians.com/chronicles/postcss-8-plugin-migration`), je.env.LANG && je.env.LANG.startsWith("cn") && console.warn(w2 + `: \u91CC\u9762 postcss.plugin \u88AB\u5F03\u7528. \u8FC1\u79FB\u6307\u5357:
https://www.w3ctech.com/topic/2226`));
          let _2 = b2(...A2);
          return _2.postcssPlugin = w2, _2.postcssVersion = new a().version, _2;
        }
        let E;
        return Object.defineProperty(S, "postcss", { get() {
          return E || (E = S()), E;
        } }), S.process = function(A2, _2, U) {
          return k([S(U)]).process(A2, _2);
        }, S;
      }, k.stringify = l, k.parse = h2, k.fromJSON = c2, k.list = m3, k.comment = (w2) => new u2(w2), k.atRule = (w2) => new p2(w2), k.decl = (w2) => new n(w2), k.rule = (w2) => new y3(w2), k.root = (w2) => new v2(w2), k.document = (w2) => new i2(w2), k.CssSyntaxError = r2, k.Declaration = n, k.Container = s2, k.Processor = a, k.Document = i2, k.Comment = u2, k.Warning = d3, k.AtRule = p2, k.Result = f3, k.Input = g3, k.Rule = y3, k.Root = v2, k.Node = x2, o2.registerPostcss(k), t.exports = k, k.default = k;
    }), ce, fe, Dl, $l, Rl, Ml, Ul, zl, Fl, Ll, Nl, Vl, Wl, ql, Gl, Yl, Hl, Ql, Jl, Zl, Xl, Kl, ec, tc, rc, nc, ut = $(() => {
      O2(), ce = he(Re()), fe = ce.default, Dl = ce.default.stringify, $l = ce.default.fromJSON, Rl = ce.default.plugin, Ml = ce.default.parse, Ul = ce.default.list, zl = ce.default.document, Fl = ce.default.comment, Ll = ce.default.atRule, Nl = ce.default.rule, Vl = ce.default.decl, Wl = ce.default.root, ql = ce.default.CssSyntaxError, Gl = ce.default.Declaration, Yl = ce.default.Container, Hl = ce.default.Processor, Ql = ce.default.Document, Jl = ce.default.Comment, Zl = ce.default.Warning, Xl = ce.default.AtRule, Kl = ce.default.Result, ec = ce.default.Input, tc = ce.default.Rule, rc = ce.default.Root, nc = ce.default.Node;
    }), ws = T((e, t) => {
      O2(), t.exports = function(r2, n, o2, s2, a) {
        for (n = n.split ? n.split(".") : n, s2 = 0; s2 < n.length; s2++) r2 = r2 ? r2[n[s2]] : a;
        return r2 === a ? o2 : r2;
      };
    }), ln = T((e, t) => {
      O2(), e.__esModule = true, e.default = o2;
      function r2(s2) {
        for (var a = s2.toLowerCase(), l = "", c2 = false, i2 = 0; i2 < 6 && a[i2] !== void 0; i2++) {
          var d3 = a.charCodeAt(i2), u2 = d3 >= 97 && d3 <= 102 || d3 >= 48 && d3 <= 57;
          if (c2 = d3 === 32, !u2) break;
          l += a[i2];
        }
        if (l.length !== 0) {
          var p2 = parseInt(l, 16), f3 = p2 >= 55296 && p2 <= 57343;
          return f3 || p2 === 0 || p2 > 1114111 ? ["\uFFFD", l.length + (c2 ? 1 : 0)] : [String.fromCodePoint(p2), l.length + (c2 ? 1 : 0)];
        }
      }
      var n = /\\/;
      function o2(s2) {
        var a = n.test(s2);
        if (!a) return s2;
        for (var l = "", c2 = 0; c2 < s2.length; c2++) {
          if (s2[c2] === "\\") {
            var i2 = r2(s2.slice(c2 + 1, c2 + 7));
            if (i2 !== void 0) {
              l += i2[0], c2 += i2[1];
              continue;
            }
            if (s2[c2 + 1] === "\\") {
              l += "\\", c2++;
              continue;
            }
            s2.length === c2 + 1 && (l += s2[c2]);
            continue;
          }
          l += s2[c2];
        }
        return l;
      }
      t.exports = e.default;
    }), oc = T((e, t) => {
      O2(), e.__esModule = true, e.default = r2;
      function r2(n) {
        for (var o2 = arguments.length, s2 = new Array(o2 > 1 ? o2 - 1 : 0), a = 1; a < o2; a++) s2[a - 1] = arguments[a];
        for (; s2.length > 0; ) {
          var l = s2.shift();
          if (!n[l]) return;
          n = n[l];
        }
        return n;
      }
      t.exports = e.default;
    }), sc = T((e, t) => {
      O2(), e.__esModule = true, e.default = r2;
      function r2(n) {
        for (var o2 = arguments.length, s2 = new Array(o2 > 1 ? o2 - 1 : 0), a = 1; a < o2; a++) s2[a - 1] = arguments[a];
        for (; s2.length > 0; ) {
          var l = s2.shift();
          n[l] || (n[l] = {}), n = n[l];
        }
      }
      t.exports = e.default;
    }), ac = T((e, t) => {
      O2(), e.__esModule = true, e.default = r2;
      function r2(n) {
        for (var o2 = "", s2 = n.indexOf("/*"), a = 0; s2 >= 0; ) {
          o2 = o2 + n.slice(a, s2);
          var l = n.indexOf("*/", s2 + 2);
          if (l < 0) return o2;
          a = l + 2, s2 = n.indexOf("/*", a);
        }
        return o2 = o2 + n.slice(a), o2;
      }
      t.exports = e.default;
    }), ar = T((e) => {
      O2(), e.__esModule = true, e.unesc = e.stripComments = e.getProp = e.ensureObject = void 0;
      var t = s2(ln());
      e.unesc = t.default;
      var r2 = s2(oc());
      e.getProp = r2.default;
      var n = s2(sc());
      e.ensureObject = n.default;
      var o2 = s2(ac());
      e.stripComments = o2.default;
      function s2(a) {
        return a && a.__esModule ? a : { default: a };
      }
    }), st = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = ar();
      function n(l, c2) {
        for (var i2 = 0; i2 < c2.length; i2++) {
          var d3 = c2[i2];
          d3.enumerable = d3.enumerable || false, d3.configurable = true, "value" in d3 && (d3.writable = true), Object.defineProperty(l, d3.key, d3);
        }
      }
      function o2(l, c2, i2) {
        return c2 && n(l.prototype, c2), i2 && n(l, i2), Object.defineProperty(l, "prototype", { writable: false }), l;
      }
      var s2 = function l(c2, i2) {
        if (typeof c2 != "object" || c2 === null) return c2;
        var d3 = new c2.constructor();
        for (var u2 in c2) if (c2.hasOwnProperty(u2)) {
          var p2 = c2[u2], f3 = typeof p2;
          u2 === "parent" && f3 === "object" ? i2 && (d3[u2] = i2) : p2 instanceof Array ? d3[u2] = p2.map(function(g3) {
            return l(g3, d3);
          }) : d3[u2] = l(p2, d3);
        }
        return d3;
      }, a = function() {
        function l(i2) {
          i2 === void 0 && (i2 = {}), Object.assign(this, i2), this.spaces = this.spaces || {}, this.spaces.before = this.spaces.before || "", this.spaces.after = this.spaces.after || "";
        }
        var c2 = l.prototype;
        return c2.remove = function() {
          return this.parent && this.parent.removeChild(this), this.parent = void 0, this;
        }, c2.replaceWith = function() {
          if (this.parent) {
            for (var i2 in arguments) this.parent.insertBefore(this, arguments[i2]);
            this.remove();
          }
          return this;
        }, c2.next = function() {
          return this.parent.at(this.parent.index(this) + 1);
        }, c2.prev = function() {
          return this.parent.at(this.parent.index(this) - 1);
        }, c2.clone = function(i2) {
          i2 === void 0 && (i2 = {});
          var d3 = s2(this);
          for (var u2 in i2) d3[u2] = i2[u2];
          return d3;
        }, c2.appendToPropertyAndEscape = function(i2, d3, u2) {
          this.raws || (this.raws = {});
          var p2 = this[i2], f3 = this.raws[i2];
          this[i2] = p2 + d3, f3 || u2 !== d3 ? this.raws[i2] = (f3 || p2) + u2 : delete this.raws[i2];
        }, c2.setPropertyAndEscape = function(i2, d3, u2) {
          this.raws || (this.raws = {}), this[i2] = d3, this.raws[i2] = u2;
        }, c2.setPropertyWithoutEscape = function(i2, d3) {
          this[i2] = d3, this.raws && delete this.raws[i2];
        }, c2.isAtPosition = function(i2, d3) {
          if (this.source && this.source.start && this.source.end) return !(this.source.start.line > i2 || this.source.end.line < i2 || this.source.start.line === i2 && this.source.start.column > d3 || this.source.end.line === i2 && this.source.end.column < d3);
        }, c2.stringifyProperty = function(i2) {
          return this.raws && this.raws[i2] || this[i2];
        }, c2.valueToString = function() {
          return String(this.stringifyProperty("value"));
        }, c2.toString = function() {
          return [this.rawSpaceBefore, this.valueToString(), this.rawSpaceAfter].join("");
        }, o2(l, [{ key: "rawSpaceBefore", get: function() {
          var i2 = this.raws && this.raws.spaces && this.raws.spaces.before;
          return i2 === void 0 && (i2 = this.spaces && this.spaces.before), i2 || "";
        }, set: function(i2) {
          (0, r2.ensureObject)(this, "raws", "spaces"), this.raws.spaces.before = i2;
        } }, { key: "rawSpaceAfter", get: function() {
          var i2 = this.raws && this.raws.spaces && this.raws.spaces.after;
          return i2 === void 0 && (i2 = this.spaces.after), i2 || "";
        }, set: function(i2) {
          (0, r2.ensureObject)(this, "raws", "spaces"), this.raws.spaces.after = i2;
        } }]), l;
      }();
      e.default = a, t.exports = e.default;
    }), ke = T((e) => {
      O2(), e.__esModule = true, e.UNIVERSAL = e.TAG = e.STRING = e.SELECTOR = e.ROOT = e.PSEUDO = e.NESTING = e.ID = e.COMMENT = e.COMBINATOR = e.CLASS = e.ATTRIBUTE = void 0;
      var t = "tag";
      e.TAG = t;
      var r2 = "string";
      e.STRING = r2;
      var n = "selector";
      e.SELECTOR = n;
      var o2 = "root";
      e.ROOT = o2;
      var s2 = "pseudo";
      e.PSEUDO = s2;
      var a = "nesting";
      e.NESTING = a;
      var l = "id";
      e.ID = l;
      var c2 = "comment";
      e.COMMENT = c2;
      var i2 = "combinator";
      e.COMBINATOR = i2;
      var d3 = "class";
      e.CLASS = d3;
      var u2 = "attribute";
      e.ATTRIBUTE = u2;
      var p2 = "universal";
      e.UNIVERSAL = p2;
    }), cn = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = a(st()), n = s2(ke());
      function o2(h2) {
        if (typeof WeakMap != "function") return null;
        var m3 = /* @__PURE__ */ new WeakMap(), y3 = /* @__PURE__ */ new WeakMap();
        return (o2 = function(v2) {
          return v2 ? y3 : m3;
        })(h2);
      }
      function s2(h2, m3) {
        if (!m3 && h2 && h2.__esModule) return h2;
        if (h2 === null || typeof h2 != "object" && typeof h2 != "function") return { default: h2 };
        var y3 = o2(m3);
        if (y3 && y3.has(h2)) return y3.get(h2);
        var v2 = {}, x2 = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var k in h2) if (k !== "default" && Object.prototype.hasOwnProperty.call(h2, k)) {
          var w2 = x2 ? Object.getOwnPropertyDescriptor(h2, k) : null;
          w2 && (w2.get || w2.set) ? Object.defineProperty(v2, k, w2) : v2[k] = h2[k];
        }
        return v2.default = h2, y3 && y3.set(h2, v2), v2;
      }
      function a(h2) {
        return h2 && h2.__esModule ? h2 : { default: h2 };
      }
      function l(h2, m3) {
        var y3 = typeof Symbol < "u" && h2[Symbol.iterator] || h2["@@iterator"];
        if (y3) return (y3 = y3.call(h2)).next.bind(y3);
        if (Array.isArray(h2) || (y3 = c2(h2)) || m3 && h2 && typeof h2.length == "number") {
          y3 && (h2 = y3);
          var v2 = 0;
          return function() {
            return v2 >= h2.length ? { done: true } : { done: false, value: h2[v2++] };
          };
        }
        throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`);
      }
      function c2(h2, m3) {
        if (h2) {
          if (typeof h2 == "string") return i2(h2, m3);
          var y3 = Object.prototype.toString.call(h2).slice(8, -1);
          if (y3 === "Object" && h2.constructor && (y3 = h2.constructor.name), y3 === "Map" || y3 === "Set") return Array.from(h2);
          if (y3 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(y3)) return i2(h2, m3);
        }
      }
      function i2(h2, m3) {
        (m3 == null || m3 > h2.length) && (m3 = h2.length);
        for (var y3 = 0, v2 = new Array(m3); y3 < m3; y3++) v2[y3] = h2[y3];
        return v2;
      }
      function d3(h2, m3) {
        for (var y3 = 0; y3 < m3.length; y3++) {
          var v2 = m3[y3];
          v2.enumerable = v2.enumerable || false, v2.configurable = true, "value" in v2 && (v2.writable = true), Object.defineProperty(h2, v2.key, v2);
        }
      }
      function u2(h2, m3, y3) {
        return m3 && d3(h2.prototype, m3), y3 && d3(h2, y3), Object.defineProperty(h2, "prototype", { writable: false }), h2;
      }
      function p2(h2, m3) {
        h2.prototype = Object.create(m3.prototype), h2.prototype.constructor = h2, f3(h2, m3);
      }
      function f3(h2, m3) {
        return f3 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(y3, v2) {
          return y3.__proto__ = v2, y3;
        }, f3(h2, m3);
      }
      var g3 = function(h2) {
        p2(m3, h2);
        function m3(v2) {
          var x2;
          return x2 = h2.call(this, v2) || this, x2.nodes || (x2.nodes = []), x2;
        }
        var y3 = m3.prototype;
        return y3.append = function(v2) {
          return v2.parent = this, this.nodes.push(v2), this;
        }, y3.prepend = function(v2) {
          return v2.parent = this, this.nodes.unshift(v2), this;
        }, y3.at = function(v2) {
          return this.nodes[v2];
        }, y3.index = function(v2) {
          return typeof v2 == "number" ? v2 : this.nodes.indexOf(v2);
        }, y3.removeChild = function(v2) {
          v2 = this.index(v2), this.at(v2).parent = void 0, this.nodes.splice(v2, 1);
          var x2;
          for (var k in this.indexes) x2 = this.indexes[k], x2 >= v2 && (this.indexes[k] = x2 - 1);
          return this;
        }, y3.removeAll = function() {
          for (var v2 = l(this.nodes), x2; !(x2 = v2()).done; ) {
            var k = x2.value;
            k.parent = void 0;
          }
          return this.nodes = [], this;
        }, y3.empty = function() {
          return this.removeAll();
        }, y3.insertAfter = function(v2, x2) {
          x2.parent = this;
          var k = this.index(v2);
          this.nodes.splice(k + 1, 0, x2), x2.parent = this;
          var w2;
          for (var b2 in this.indexes) w2 = this.indexes[b2], k <= w2 && (this.indexes[b2] = w2 + 1);
          return this;
        }, y3.insertBefore = function(v2, x2) {
          x2.parent = this;
          var k = this.index(v2);
          this.nodes.splice(k, 0, x2), x2.parent = this;
          var w2;
          for (var b2 in this.indexes) w2 = this.indexes[b2], w2 <= k && (this.indexes[b2] = w2 + 1);
          return this;
        }, y3._findChildAtPosition = function(v2, x2) {
          var k = void 0;
          return this.each(function(w2) {
            if (w2.atPosition) {
              var b2 = w2.atPosition(v2, x2);
              if (b2) return k = b2, false;
            } else if (w2.isAtPosition(v2, x2)) return k = w2, false;
          }), k;
        }, y3.atPosition = function(v2, x2) {
          if (this.isAtPosition(v2, x2)) return this._findChildAtPosition(v2, x2) || this;
        }, y3._inferEndPosition = function() {
          this.last && this.last.source && this.last.source.end && (this.source = this.source || {}, this.source.end = this.source.end || {}, Object.assign(this.source.end, this.last.source.end));
        }, y3.each = function(v2) {
          this.lastEach || (this.lastEach = 0), this.indexes || (this.indexes = {}), this.lastEach++;
          var x2 = this.lastEach;
          if (this.indexes[x2] = 0, !!this.length) {
            for (var k, w2; this.indexes[x2] < this.length && (k = this.indexes[x2], w2 = v2(this.at(k), k), w2 !== false); ) this.indexes[x2] += 1;
            if (delete this.indexes[x2], w2 === false) return false;
          }
        }, y3.walk = function(v2) {
          return this.each(function(x2, k) {
            var w2 = v2(x2, k);
            if (w2 !== false && x2.length && (w2 = x2.walk(v2)), w2 === false) return false;
          });
        }, y3.walkAttributes = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.ATTRIBUTE) return v2.call(x2, k);
          });
        }, y3.walkClasses = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.CLASS) return v2.call(x2, k);
          });
        }, y3.walkCombinators = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.COMBINATOR) return v2.call(x2, k);
          });
        }, y3.walkComments = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.COMMENT) return v2.call(x2, k);
          });
        }, y3.walkIds = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.ID) return v2.call(x2, k);
          });
        }, y3.walkNesting = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.NESTING) return v2.call(x2, k);
          });
        }, y3.walkPseudos = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.PSEUDO) return v2.call(x2, k);
          });
        }, y3.walkTags = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.TAG) return v2.call(x2, k);
          });
        }, y3.walkUniversals = function(v2) {
          var x2 = this;
          return this.walk(function(k) {
            if (k.type === n.UNIVERSAL) return v2.call(x2, k);
          });
        }, y3.split = function(v2) {
          var x2 = this, k = [];
          return this.reduce(function(w2, b2, C) {
            var S = v2.call(x2, b2);
            return k.push(b2), S ? (w2.push(k), k = []) : C === x2.length - 1 && w2.push(k), w2;
          }, []);
        }, y3.map = function(v2) {
          return this.nodes.map(v2);
        }, y3.reduce = function(v2, x2) {
          return this.nodes.reduce(v2, x2);
        }, y3.every = function(v2) {
          return this.nodes.every(v2);
        }, y3.some = function(v2) {
          return this.nodes.some(v2);
        }, y3.filter = function(v2) {
          return this.nodes.filter(v2);
        }, y3.sort = function(v2) {
          return this.nodes.sort(v2);
        }, y3.toString = function() {
          return this.map(String).join("");
        }, u2(m3, [{ key: "first", get: function() {
          return this.at(0);
        } }, { key: "last", get: function() {
          return this.at(this.length - 1);
        } }, { key: "length", get: function() {
          return this.nodes.length;
        } }]), m3;
      }(r2.default);
      e.default = g3, t.exports = e.default;
    }), xs = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(cn()), n = ke();
      function o2(d3) {
        return d3 && d3.__esModule ? d3 : { default: d3 };
      }
      function s2(d3, u2) {
        for (var p2 = 0; p2 < u2.length; p2++) {
          var f3 = u2[p2];
          f3.enumerable = f3.enumerable || false, f3.configurable = true, "value" in f3 && (f3.writable = true), Object.defineProperty(d3, f3.key, f3);
        }
      }
      function a(d3, u2, p2) {
        return u2 && s2(d3.prototype, u2), p2 && s2(d3, p2), Object.defineProperty(d3, "prototype", { writable: false }), d3;
      }
      function l(d3, u2) {
        d3.prototype = Object.create(u2.prototype), d3.prototype.constructor = d3, c2(d3, u2);
      }
      function c2(d3, u2) {
        return c2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(p2, f3) {
          return p2.__proto__ = f3, p2;
        }, c2(d3, u2);
      }
      var i2 = function(d3) {
        l(u2, d3);
        function u2(f3) {
          var g3;
          return g3 = d3.call(this, f3) || this, g3.type = n.ROOT, g3;
        }
        var p2 = u2.prototype;
        return p2.toString = function() {
          var f3 = this.reduce(function(g3, h2) {
            return g3.push(String(h2)), g3;
          }, []).join(",");
          return this.trailingComma ? f3 + "," : f3;
        }, p2.error = function(f3, g3) {
          return this._error ? this._error(f3, g3) : new Error(f3);
        }, a(u2, [{ key: "errorGenerator", set: function(f3) {
          this._error = f3;
        } }]), u2;
      }(r2.default);
      e.default = i2, t.exports = e.default;
    }), ks = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(cn()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.SELECTOR, u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), un = T((e, t) => {
      O2();
      var r2 = {}, n = r2.hasOwnProperty, o2 = function(i2, d3) {
        if (!i2) return d3;
        var u2 = {};
        for (var p2 in d3) u2[p2] = n.call(i2, p2) ? i2[p2] : d3[p2];
        return u2;
      }, s2 = /[ -,\.\/:-@\[-\^`\{-~]/, a = /[ -,\.\/:-@\[\]\^`\{-~]/, l = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g, c2 = function i2(d3, u2) {
        u2 = o2(u2, i2.options), u2.quotes != "single" && u2.quotes != "double" && (u2.quotes = "single");
        for (var p2 = u2.quotes == "double" ? '"' : "'", f3 = u2.isIdentifier, g3 = d3.charAt(0), h2 = "", m3 = 0, y3 = d3.length; m3 < y3; ) {
          var v2 = d3.charAt(m3++), x2 = v2.charCodeAt(), k = void 0;
          if (x2 < 32 || x2 > 126) {
            if (x2 >= 55296 && x2 <= 56319 && m3 < y3) {
              var w2 = d3.charCodeAt(m3++);
              (w2 & 64512) == 56320 ? x2 = ((x2 & 1023) << 10) + (w2 & 1023) + 65536 : m3--;
            }
            k = "\\" + x2.toString(16).toUpperCase() + " ";
          } else u2.escapeEverything ? s2.test(v2) ? k = "\\" + v2 : k = "\\" + x2.toString(16).toUpperCase() + " " : /[\t\n\f\r\x0B]/.test(v2) ? k = "\\" + x2.toString(16).toUpperCase() + " " : v2 == "\\" || !f3 && (v2 == '"' && p2 == v2 || v2 == "'" && p2 == v2) || f3 && a.test(v2) ? k = "\\" + v2 : k = v2;
          h2 += k;
        }
        return f3 && (/^-[-\d]/.test(h2) ? h2 = "\\-" + h2.slice(1) : /\d/.test(g3) && (h2 = "\\3" + g3 + " " + h2.slice(1))), h2 = h2.replace(l, function(b2, C, S) {
          return C && C.length % 2 ? b2 : (C || "") + S;
        }), !f3 && u2.wrap ? p2 + h2 + p2 : h2;
      };
      c2.options = { escapeEverything: false, isIdentifier: false, quotes: "single", wrap: false }, c2.version = "3.0.0", t.exports = c2;
    }), Ss = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = a(un()), n = ar(), o2 = a(st()), s2 = ke();
      function a(p2) {
        return p2 && p2.__esModule ? p2 : { default: p2 };
      }
      function l(p2, f3) {
        for (var g3 = 0; g3 < f3.length; g3++) {
          var h2 = f3[g3];
          h2.enumerable = h2.enumerable || false, h2.configurable = true, "value" in h2 && (h2.writable = true), Object.defineProperty(p2, h2.key, h2);
        }
      }
      function c2(p2, f3, g3) {
        return f3 && l(p2.prototype, f3), g3 && l(p2, g3), Object.defineProperty(p2, "prototype", { writable: false }), p2;
      }
      function i2(p2, f3) {
        p2.prototype = Object.create(f3.prototype), p2.prototype.constructor = p2, d3(p2, f3);
      }
      function d3(p2, f3) {
        return d3 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(g3, h2) {
          return g3.__proto__ = h2, g3;
        }, d3(p2, f3);
      }
      var u2 = function(p2) {
        i2(f3, p2);
        function f3(h2) {
          var m3;
          return m3 = p2.call(this, h2) || this, m3.type = s2.CLASS, m3._constructed = true, m3;
        }
        var g3 = f3.prototype;
        return g3.valueToString = function() {
          return "." + p2.prototype.valueToString.call(this);
        }, c2(f3, [{ key: "value", get: function() {
          return this._value;
        }, set: function(h2) {
          if (this._constructed) {
            var m3 = (0, r2.default)(h2, { isIdentifier: true });
            m3 !== h2 ? ((0, n.ensureObject)(this, "raws"), this.raws.value = m3) : this.raws && delete this.raws.value;
          }
          this._value = h2;
        } }]), f3;
      }(o2.default);
      e.default = u2, t.exports = e.default;
    }), Cs = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(st()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.COMMENT, u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), As = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(st()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(u2) {
          var p2;
          return p2 = c2.call(this, u2) || this, p2.type = n.ID, p2;
        }
        var d3 = i2.prototype;
        return d3.valueToString = function() {
          return "#" + c2.prototype.valueToString.call(this);
        }, i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), dn = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = s2(un()), n = ar(), o2 = s2(st());
      function s2(u2) {
        return u2 && u2.__esModule ? u2 : { default: u2 };
      }
      function a(u2, p2) {
        for (var f3 = 0; f3 < p2.length; f3++) {
          var g3 = p2[f3];
          g3.enumerable = g3.enumerable || false, g3.configurable = true, "value" in g3 && (g3.writable = true), Object.defineProperty(u2, g3.key, g3);
        }
      }
      function l(u2, p2, f3) {
        return p2 && a(u2.prototype, p2), f3 && a(u2, f3), Object.defineProperty(u2, "prototype", { writable: false }), u2;
      }
      function c2(u2, p2) {
        u2.prototype = Object.create(p2.prototype), u2.prototype.constructor = u2, i2(u2, p2);
      }
      function i2(u2, p2) {
        return i2 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(f3, g3) {
          return f3.__proto__ = g3, f3;
        }, i2(u2, p2);
      }
      var d3 = function(u2) {
        c2(p2, u2);
        function p2() {
          return u2.apply(this, arguments) || this;
        }
        var f3 = p2.prototype;
        return f3.qualifiedName = function(g3) {
          return this.namespace ? this.namespaceString + "|" + g3 : g3;
        }, f3.valueToString = function() {
          return this.qualifiedName(u2.prototype.valueToString.call(this));
        }, l(p2, [{ key: "namespace", get: function() {
          return this._namespace;
        }, set: function(g3) {
          if (g3 === true || g3 === "*" || g3 === "&") {
            this._namespace = g3, this.raws && delete this.raws.namespace;
            return;
          }
          var h2 = (0, r2.default)(g3, { isIdentifier: true });
          this._namespace = g3, h2 !== g3 ? ((0, n.ensureObject)(this, "raws"), this.raws.namespace = h2) : this.raws && delete this.raws.namespace;
        } }, { key: "ns", get: function() {
          return this._namespace;
        }, set: function(g3) {
          this.namespace = g3;
        } }, { key: "namespaceString", get: function() {
          if (this.namespace) {
            var g3 = this.stringifyProperty("namespace");
            return g3 === true ? "" : g3;
          } else return "";
        } }]), p2;
      }(o2.default);
      e.default = d3, t.exports = e.default;
    }), Os = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(dn()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.TAG, u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), _s = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(st()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.STRING, u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), Es = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(cn()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(u2) {
          var p2;
          return p2 = c2.call(this, u2) || this, p2.type = n.PSEUDO, p2;
        }
        var d3 = i2.prototype;
        return d3.toString = function() {
          var u2 = this.length ? "(" + this.map(String).join(",") + ")" : "";
          return [this.rawSpaceBefore, this.stringifyProperty("value"), u2, this.rawSpaceAfter].join("");
        }, i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), Ts = {};
    Fe(Ts, { deprecate: () => ic });
    function ic(e) {
      return e;
    }
    var lc = $(() => {
      O2();
    }), cc = T((e, t) => {
      O2(), t.exports = (lc(), Ts).deprecate;
    }), Is = T((e) => {
      O2(), e.__esModule = true, e.default = void 0, e.unescapeValue = m3;
      var t = a(un()), r2 = a(ln()), n = a(dn()), o2 = ke(), s2;
      function a(w2) {
        return w2 && w2.__esModule ? w2 : { default: w2 };
      }
      function l(w2, b2) {
        for (var C = 0; C < b2.length; C++) {
          var S = b2[C];
          S.enumerable = S.enumerable || false, S.configurable = true, "value" in S && (S.writable = true), Object.defineProperty(w2, S.key, S);
        }
      }
      function c2(w2, b2, C) {
        return b2 && l(w2.prototype, b2), C && l(w2, C), Object.defineProperty(w2, "prototype", { writable: false }), w2;
      }
      function i2(w2, b2) {
        w2.prototype = Object.create(b2.prototype), w2.prototype.constructor = w2, d3(w2, b2);
      }
      function d3(w2, b2) {
        return d3 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(C, S) {
          return C.__proto__ = S, C;
        }, d3(w2, b2);
      }
      var u2 = cc(), p2 = /^('|")([^]*)\1$/, f3 = u2(function() {
      }, "Assigning an attribute a value containing characters that might need to be escaped is deprecated. Call attribute.setValue() instead."), g3 = u2(function() {
      }, "Assigning attr.quoted is deprecated and has no effect. Assign to attr.quoteMark instead."), h2 = u2(function() {
      }, "Constructing an Attribute selector with a value without specifying quoteMark is deprecated. Note: The value should be unescaped now.");
      function m3(w2) {
        var b2 = false, C = null, S = w2, E = S.match(p2);
        return E && (C = E[1], S = E[2]), S = (0, r2.default)(S), S !== w2 && (b2 = true), { deprecatedUsage: b2, unescaped: S, quoteMark: C };
      }
      function y3(w2) {
        if (w2.quoteMark !== void 0 || w2.value === void 0) return w2;
        h2();
        var b2 = m3(w2.value), C = b2.quoteMark, S = b2.unescaped;
        return w2.raws || (w2.raws = {}), w2.raws.value === void 0 && (w2.raws.value = w2.value), w2.value = S, w2.quoteMark = C, w2;
      }
      var v2 = function(w2) {
        i2(b2, w2);
        function b2(S) {
          var E;
          return S === void 0 && (S = {}), E = w2.call(this, y3(S)) || this, E.type = o2.ATTRIBUTE, E.raws = E.raws || {}, Object.defineProperty(E.raws, "unquoted", { get: u2(function() {
            return E.value;
          }, "attr.raws.unquoted is deprecated. Call attr.value instead."), set: u2(function() {
            return E.value;
          }, "Setting attr.raws.unquoted is deprecated and has no effect. attr.value is unescaped by default now.") }), E._constructed = true, E;
        }
        var C = b2.prototype;
        return C.getQuotedValue = function(S) {
          S === void 0 && (S = {});
          var E = this._determineQuoteMark(S), A2 = x2[E], _2 = (0, t.default)(this._value, A2);
          return _2;
        }, C._determineQuoteMark = function(S) {
          return S.smart ? this.smartQuoteMark(S) : this.preferredQuoteMark(S);
        }, C.setValue = function(S, E) {
          E === void 0 && (E = {}), this._value = S, this._quoteMark = this._determineQuoteMark(E), this._syncRawValue();
        }, C.smartQuoteMark = function(S) {
          var E = this.value, A2 = E.replace(/[^']/g, "").length, _2 = E.replace(/[^"]/g, "").length;
          if (A2 + _2 === 0) {
            var U = (0, t.default)(E, { isIdentifier: true });
            if (U === E) return b2.NO_QUOTE;
            var D = this.preferredQuoteMark(S);
            if (D === b2.NO_QUOTE) {
              var j = this.quoteMark || S.quoteMark || b2.DOUBLE_QUOTE, L = x2[j], F = (0, t.default)(E, L);
              if (F.length < U.length) return j;
            }
            return D;
          } else return _2 === A2 ? this.preferredQuoteMark(S) : _2 < A2 ? b2.DOUBLE_QUOTE : b2.SINGLE_QUOTE;
        }, C.preferredQuoteMark = function(S) {
          var E = S.preferCurrentQuoteMark ? this.quoteMark : S.quoteMark;
          return E === void 0 && (E = S.preferCurrentQuoteMark ? S.quoteMark : this.quoteMark), E === void 0 && (E = b2.DOUBLE_QUOTE), E;
        }, C._syncRawValue = function() {
          var S = (0, t.default)(this._value, x2[this.quoteMark]);
          S === this._value ? this.raws && delete this.raws.value : this.raws.value = S;
        }, C._handleEscapes = function(S, E) {
          if (this._constructed) {
            var A2 = (0, t.default)(E, { isIdentifier: true });
            A2 !== E ? this.raws[S] = A2 : delete this.raws[S];
          }
        }, C._spacesFor = function(S) {
          var E = { before: "", after: "" }, A2 = this.spaces[S] || {}, _2 = this.raws.spaces && this.raws.spaces[S] || {};
          return Object.assign(E, A2, _2);
        }, C._stringFor = function(S, E, A2) {
          E === void 0 && (E = S), A2 === void 0 && (A2 = k);
          var _2 = this._spacesFor(E);
          return A2(this.stringifyProperty(S), _2);
        }, C.offsetOf = function(S) {
          var E = 1, A2 = this._spacesFor("attribute");
          if (E += A2.before.length, S === "namespace" || S === "ns") return this.namespace ? E : -1;
          if (S === "attributeNS" || (E += this.namespaceString.length, this.namespace && (E += 1), S === "attribute")) return E;
          E += this.stringifyProperty("attribute").length, E += A2.after.length;
          var _2 = this._spacesFor("operator");
          E += _2.before.length;
          var U = this.stringifyProperty("operator");
          if (S === "operator") return U ? E : -1;
          E += U.length, E += _2.after.length;
          var D = this._spacesFor("value");
          E += D.before.length;
          var j = this.stringifyProperty("value");
          if (S === "value") return j ? E : -1;
          E += j.length, E += D.after.length;
          var L = this._spacesFor("insensitive");
          return E += L.before.length, S === "insensitive" && this.insensitive ? E : -1;
        }, C.toString = function() {
          var S = this, E = [this.rawSpaceBefore, "["];
          return E.push(this._stringFor("qualifiedAttribute", "attribute")), this.operator && (this.value || this.value === "") && (E.push(this._stringFor("operator")), E.push(this._stringFor("value")), E.push(this._stringFor("insensitiveFlag", "insensitive", function(A2, _2) {
            return A2.length > 0 && !S.quoted && _2.before.length === 0 && !(S.spaces.value && S.spaces.value.after) && (_2.before = " "), k(A2, _2);
          }))), E.push("]"), E.push(this.rawSpaceAfter), E.join("");
        }, c2(b2, [{ key: "quoted", get: function() {
          var S = this.quoteMark;
          return S === "'" || S === '"';
        }, set: function(S) {
          g3();
        } }, { key: "quoteMark", get: function() {
          return this._quoteMark;
        }, set: function(S) {
          if (!this._constructed) {
            this._quoteMark = S;
            return;
          }
          this._quoteMark !== S && (this._quoteMark = S, this._syncRawValue());
        } }, { key: "qualifiedAttribute", get: function() {
          return this.qualifiedName(this.raws.attribute || this.attribute);
        } }, { key: "insensitiveFlag", get: function() {
          return this.insensitive ? "i" : "";
        } }, { key: "value", get: function() {
          return this._value;
        }, set: function(S) {
          if (this._constructed) {
            var E = m3(S), A2 = E.deprecatedUsage, _2 = E.unescaped, U = E.quoteMark;
            if (A2 && f3(), _2 === this._value && U === this._quoteMark) return;
            this._value = _2, this._quoteMark = U, this._syncRawValue();
          } else this._value = S;
        } }, { key: "insensitive", get: function() {
          return this._insensitive;
        }, set: function(S) {
          S || (this._insensitive = false, this.raws && (this.raws.insensitiveFlag === "I" || this.raws.insensitiveFlag === "i") && (this.raws.insensitiveFlag = void 0)), this._insensitive = S;
        } }, { key: "attribute", get: function() {
          return this._attribute;
        }, set: function(S) {
          this._handleEscapes("attribute", S), this._attribute = S;
        } }]), b2;
      }(n.default);
      e.default = v2, v2.NO_QUOTE = null, v2.SINGLE_QUOTE = "'", v2.DOUBLE_QUOTE = '"';
      var x2 = (s2 = { "'": { quotes: "single", wrap: true }, '"': { quotes: "double", wrap: true } }, s2[null] = { isIdentifier: true }, s2);
      function k(w2, b2) {
        return "" + b2.before + w2 + b2.after;
      }
    }), Ps = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(dn()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.UNIVERSAL, u2.value = "*", u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), js = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(st()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.COMBINATOR, u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), Bs = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = o2(st()), n = ke();
      function o2(c2) {
        return c2 && c2.__esModule ? c2 : { default: c2 };
      }
      function s2(c2, i2) {
        c2.prototype = Object.create(i2.prototype), c2.prototype.constructor = c2, a(c2, i2);
      }
      function a(c2, i2) {
        return a = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(d3, u2) {
          return d3.__proto__ = u2, d3;
        }, a(c2, i2);
      }
      var l = function(c2) {
        s2(i2, c2);
        function i2(d3) {
          var u2;
          return u2 = c2.call(this, d3) || this, u2.type = n.NESTING, u2.value = "&", u2;
        }
        return i2;
      }(r2.default);
      e.default = l, t.exports = e.default;
    }), uc = T((e, t) => {
      O2(), e.__esModule = true, e.default = r2;
      function r2(n) {
        return n.sort(function(o2, s2) {
          return o2 - s2;
        });
      }
      t.exports = e.default;
    }), Ds = T((e) => {
      O2(), e.__esModule = true, e.word = e.tilde = e.tab = e.str = e.space = e.slash = e.singleQuote = e.semicolon = e.plus = e.pipe = e.openSquare = e.openParenthesis = e.newline = e.greaterThan = e.feed = e.equals = e.doubleQuote = e.dollar = e.cr = e.comment = e.comma = e.combinator = e.colon = e.closeSquare = e.closeParenthesis = e.caret = e.bang = e.backslash = e.at = e.asterisk = e.ampersand = void 0;
      var t = 38;
      e.ampersand = t;
      var r2 = 42;
      e.asterisk = r2;
      var n = 64;
      e.at = n;
      var o2 = 44;
      e.comma = o2;
      var s2 = 58;
      e.colon = s2;
      var a = 59;
      e.semicolon = a;
      var l = 40;
      e.openParenthesis = l;
      var c2 = 41;
      e.closeParenthesis = c2;
      var i2 = 91;
      e.openSquare = i2;
      var d3 = 93;
      e.closeSquare = d3;
      var u2 = 36;
      e.dollar = u2;
      var p2 = 126;
      e.tilde = p2;
      var f3 = 94;
      e.caret = f3;
      var g3 = 43;
      e.plus = g3;
      var h2 = 61;
      e.equals = h2;
      var m3 = 124;
      e.pipe = m3;
      var y3 = 62;
      e.greaterThan = y3;
      var v2 = 32;
      e.space = v2;
      var x2 = 39;
      e.singleQuote = x2;
      var k = 34;
      e.doubleQuote = k;
      var w2 = 47;
      e.slash = w2;
      var b2 = 33;
      e.bang = b2;
      var C = 92;
      e.backslash = C;
      var S = 13;
      e.cr = S;
      var E = 12;
      e.feed = E;
      var A2 = 10;
      e.newline = A2;
      var _2 = 9;
      e.tab = _2;
      var U = x2;
      e.str = U;
      var D = -1;
      e.comment = D;
      var j = -2;
      e.word = j;
      var L = -3;
      e.combinator = L;
    }), dc = T((e) => {
      O2(), e.__esModule = true, e.FIELDS = void 0, e.default = g3;
      var t = s2(Ds()), r2, n;
      function o2(h2) {
        if (typeof WeakMap != "function") return null;
        var m3 = /* @__PURE__ */ new WeakMap(), y3 = /* @__PURE__ */ new WeakMap();
        return (o2 = function(v2) {
          return v2 ? y3 : m3;
        })(h2);
      }
      function s2(h2, m3) {
        if (!m3 && h2 && h2.__esModule) return h2;
        if (h2 === null || typeof h2 != "object" && typeof h2 != "function") return { default: h2 };
        var y3 = o2(m3);
        if (y3 && y3.has(h2)) return y3.get(h2);
        var v2 = {}, x2 = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var k in h2) if (k !== "default" && Object.prototype.hasOwnProperty.call(h2, k)) {
          var w2 = x2 ? Object.getOwnPropertyDescriptor(h2, k) : null;
          w2 && (w2.get || w2.set) ? Object.defineProperty(v2, k, w2) : v2[k] = h2[k];
        }
        return v2.default = h2, y3 && y3.set(h2, v2), v2;
      }
      var a = (r2 = {}, r2[t.tab] = true, r2[t.newline] = true, r2[t.cr] = true, r2[t.feed] = true, r2), l = (n = {}, n[t.space] = true, n[t.tab] = true, n[t.newline] = true, n[t.cr] = true, n[t.feed] = true, n[t.ampersand] = true, n[t.asterisk] = true, n[t.bang] = true, n[t.comma] = true, n[t.colon] = true, n[t.semicolon] = true, n[t.openParenthesis] = true, n[t.closeParenthesis] = true, n[t.openSquare] = true, n[t.closeSquare] = true, n[t.singleQuote] = true, n[t.doubleQuote] = true, n[t.plus] = true, n[t.pipe] = true, n[t.tilde] = true, n[t.greaterThan] = true, n[t.equals] = true, n[t.dollar] = true, n[t.caret] = true, n[t.slash] = true, n), c2 = {}, i2 = "0123456789abcdefABCDEF";
      for (d3 = 0; d3 < i2.length; d3++) c2[i2.charCodeAt(d3)] = true;
      var d3;
      function u2(h2, m3) {
        var y3 = m3, v2;
        do {
          if (v2 = h2.charCodeAt(y3), l[v2]) return y3 - 1;
          v2 === t.backslash ? y3 = p2(h2, y3) + 1 : y3++;
        } while (y3 < h2.length);
        return y3 - 1;
      }
      function p2(h2, m3) {
        var y3 = m3, v2 = h2.charCodeAt(y3 + 1);
        if (!a[v2]) if (c2[v2]) {
          var x2 = 0;
          do
            y3++, x2++, v2 = h2.charCodeAt(y3 + 1);
          while (c2[v2] && x2 < 6);
          x2 < 6 && v2 === t.space && y3++;
        } else y3++;
        return y3;
      }
      var f3 = { TYPE: 0, START_LINE: 1, START_COL: 2, END_LINE: 3, END_COL: 4, START_POS: 5, END_POS: 6 };
      e.FIELDS = f3;
      function g3(h2) {
        var m3 = [], y3 = h2.css.valueOf(), v2 = y3, x2 = v2.length, k = -1, w2 = 1, b2 = 0, C = 0, S, E, A2, _2, U, D, j, L, F, H, Q, we, Ce;
        function R(M2, P2) {
          if (h2.safe) y3 += P2, F = y3.length - 1;
          else throw h2.error("Unclosed " + M2, w2, b2 - k, b2);
        }
        for (; b2 < x2; ) {
          switch (S = y3.charCodeAt(b2), S === t.newline && (k = b2, w2 += 1), S) {
            case t.space:
            case t.tab:
            case t.newline:
            case t.cr:
            case t.feed:
              F = b2;
              do
                F += 1, S = y3.charCodeAt(F), S === t.newline && (k = F, w2 += 1);
              while (S === t.space || S === t.newline || S === t.tab || S === t.cr || S === t.feed);
              Ce = t.space, _2 = w2, A2 = F - k - 1, C = F;
              break;
            case t.plus:
            case t.greaterThan:
            case t.tilde:
            case t.pipe:
              F = b2;
              do
                F += 1, S = y3.charCodeAt(F);
              while (S === t.plus || S === t.greaterThan || S === t.tilde || S === t.pipe);
              Ce = t.combinator, _2 = w2, A2 = b2 - k, C = F;
              break;
            case t.asterisk:
            case t.ampersand:
            case t.bang:
            case t.comma:
            case t.equals:
            case t.dollar:
            case t.caret:
            case t.openSquare:
            case t.closeSquare:
            case t.colon:
            case t.semicolon:
            case t.openParenthesis:
            case t.closeParenthesis:
              F = b2, Ce = S, _2 = w2, A2 = b2 - k, C = F + 1;
              break;
            case t.singleQuote:
            case t.doubleQuote:
              we = S === t.singleQuote ? "'" : '"', F = b2;
              do
                for (U = false, F = y3.indexOf(we, F + 1), F === -1 && R("quote", we), D = F; y3.charCodeAt(D - 1) === t.backslash; ) D -= 1, U = !U;
              while (U);
              Ce = t.str, _2 = w2, A2 = b2 - k, C = F + 1;
              break;
            default:
              S === t.slash && y3.charCodeAt(b2 + 1) === t.asterisk ? (F = y3.indexOf("*/", b2 + 2) + 1, F === 0 && R("comment", "*/"), E = y3.slice(b2, F + 1), L = E.split(`
`), j = L.length - 1, j > 0 ? (H = w2 + j, Q = F - L[j].length) : (H = w2, Q = k), Ce = t.comment, w2 = H, _2 = H, A2 = F - Q) : S === t.slash ? (F = b2, Ce = S, _2 = w2, A2 = b2 - k, C = F + 1) : (F = u2(y3, b2), Ce = t.word, _2 = w2, A2 = F - k), C = F + 1;
              break;
          }
          m3.push([Ce, w2, b2 - k, _2, A2, b2, C]), Q && (k = Q, Q = null), b2 = C;
        }
        return m3;
      }
    }), pc = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = C(xs()), n = C(ks()), o2 = C(Ss()), s2 = C(Cs()), a = C(As()), l = C(Os()), c2 = C(_s()), i2 = C(Es()), d3 = b2(Is()), u2 = C(Ps()), p2 = C(js()), f3 = C(Bs()), g3 = C(uc()), h2 = b2(dc()), m3 = b2(Ds()), y3 = b2(ke()), v2 = ar(), x2, k;
      function w2(R) {
        if (typeof WeakMap != "function") return null;
        var M2 = /* @__PURE__ */ new WeakMap(), P2 = /* @__PURE__ */ new WeakMap();
        return (w2 = function(I) {
          return I ? P2 : M2;
        })(R);
      }
      function b2(R, M2) {
        if (!M2 && R && R.__esModule) return R;
        if (R === null || typeof R != "object" && typeof R != "function") return { default: R };
        var P2 = w2(M2);
        if (P2 && P2.has(R)) return P2.get(R);
        var I = {}, G = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var B in R) if (B !== "default" && Object.prototype.hasOwnProperty.call(R, B)) {
          var N = G ? Object.getOwnPropertyDescriptor(R, B) : null;
          N && (N.get || N.set) ? Object.defineProperty(I, B, N) : I[B] = R[B];
        }
        return I.default = R, P2 && P2.set(R, I), I;
      }
      function C(R) {
        return R && R.__esModule ? R : { default: R };
      }
      function S(R, M2) {
        for (var P2 = 0; P2 < M2.length; P2++) {
          var I = M2[P2];
          I.enumerable = I.enumerable || false, I.configurable = true, "value" in I && (I.writable = true), Object.defineProperty(R, I.key, I);
        }
      }
      function E(R, M2, P2) {
        return M2 && S(R.prototype, M2), P2 && S(R, P2), Object.defineProperty(R, "prototype", { writable: false }), R;
      }
      var A2 = (x2 = {}, x2[m3.space] = true, x2[m3.cr] = true, x2[m3.feed] = true, x2[m3.newline] = true, x2[m3.tab] = true, x2), _2 = Object.assign({}, A2, (k = {}, k[m3.comment] = true, k));
      function U(R) {
        return { line: R[h2.FIELDS.START_LINE], column: R[h2.FIELDS.START_COL] };
      }
      function D(R) {
        return { line: R[h2.FIELDS.END_LINE], column: R[h2.FIELDS.END_COL] };
      }
      function j(R, M2, P2, I) {
        return { start: { line: R, column: M2 }, end: { line: P2, column: I } };
      }
      function L(R) {
        return j(R[h2.FIELDS.START_LINE], R[h2.FIELDS.START_COL], R[h2.FIELDS.END_LINE], R[h2.FIELDS.END_COL]);
      }
      function F(R, M2) {
        if (R) return j(R[h2.FIELDS.START_LINE], R[h2.FIELDS.START_COL], M2[h2.FIELDS.END_LINE], M2[h2.FIELDS.END_COL]);
      }
      function H(R, M2) {
        var P2 = R[M2];
        if (typeof P2 == "string") return P2.indexOf("\\") !== -1 && ((0, v2.ensureObject)(R, "raws"), R[M2] = (0, v2.unesc)(P2), R.raws[M2] === void 0 && (R.raws[M2] = P2)), R;
      }
      function Q(R, M2) {
        for (var P2 = -1, I = []; (P2 = R.indexOf(M2, P2 + 1)) !== -1; ) I.push(P2);
        return I;
      }
      function we() {
        var R = Array.prototype.concat.apply([], arguments);
        return R.filter(function(M2, P2) {
          return P2 === R.indexOf(M2);
        });
      }
      var Ce = function() {
        function R(P2, I) {
          I === void 0 && (I = {}), this.rule = P2, this.options = Object.assign({ lossy: false, safe: false }, I), this.position = 0, this.css = typeof this.rule == "string" ? this.rule : this.rule.selector, this.tokens = (0, h2.default)({ css: this.css, error: this._errorGenerator(), safe: this.options.safe });
          var G = F(this.tokens[0], this.tokens[this.tokens.length - 1]);
          this.root = new r2.default({ source: G }), this.root.errorGenerator = this._errorGenerator();
          var B = new n.default({ source: { start: { line: 1, column: 1 } } });
          this.root.append(B), this.current = B, this.loop();
        }
        var M2 = R.prototype;
        return M2._errorGenerator = function() {
          var P2 = this;
          return function(I, G) {
            return typeof P2.rule == "string" ? new Error(I) : P2.rule.error(I, G);
          };
        }, M2.attribute = function() {
          var P2 = [], I = this.currToken;
          for (this.position++; this.position < this.tokens.length && this.currToken[h2.FIELDS.TYPE] !== m3.closeSquare; ) P2.push(this.currToken), this.position++;
          if (this.currToken[h2.FIELDS.TYPE] !== m3.closeSquare) return this.expected("closing square bracket", this.currToken[h2.FIELDS.START_POS]);
          var G = P2.length, B = { source: j(I[1], I[2], this.currToken[3], this.currToken[4]), sourceIndex: I[h2.FIELDS.START_POS] };
          if (G === 1 && !~[m3.word].indexOf(P2[0][h2.FIELDS.TYPE])) return this.expected("attribute", P2[0][h2.FIELDS.START_POS]);
          for (var N = 0, K = "", J = "", V = null, ne = false; N < G; ) {
            var ie = P2[N], q = this.content(ie), le = P2[N + 1];
            switch (ie[h2.FIELDS.TYPE]) {
              case m3.space:
                if (ne = true, this.options.lossy) break;
                if (V) {
                  (0, v2.ensureObject)(B, "spaces", V);
                  var We = B.spaces[V].after || "";
                  B.spaces[V].after = We + q;
                  var ze = (0, v2.getProp)(B, "raws", "spaces", V, "after") || null;
                  ze && (B.raws.spaces[V].after = ze + q);
                } else K = K + q, J = J + q;
                break;
              case m3.asterisk:
                if (le[h2.FIELDS.TYPE] === m3.equals) B.operator = q, V = "operator";
                else if ((!B.namespace || V === "namespace" && !ne) && le) {
                  K && ((0, v2.ensureObject)(B, "spaces", "attribute"), B.spaces.attribute.before = K, K = ""), J && ((0, v2.ensureObject)(B, "raws", "spaces", "attribute"), B.raws.spaces.attribute.before = K, J = ""), B.namespace = (B.namespace || "") + q;
                  var Ae = (0, v2.getProp)(B, "raws", "namespace") || null;
                  Ae && (B.raws.namespace += q), V = "namespace";
                }
                ne = false;
                break;
              case m3.dollar:
                if (V === "value") {
                  var be = (0, v2.getProp)(B, "raws", "value");
                  B.value += "$", be && (B.raws.value = be + "$");
                  break;
                }
              case m3.caret:
                le[h2.FIELDS.TYPE] === m3.equals && (B.operator = q, V = "operator"), ne = false;
                break;
              case m3.combinator:
                if (q === "~" && le[h2.FIELDS.TYPE] === m3.equals && (B.operator = q, V = "operator"), q !== "|") {
                  ne = false;
                  break;
                }
                le[h2.FIELDS.TYPE] === m3.equals ? (B.operator = q, V = "operator") : !B.namespace && !B.attribute && (B.namespace = true), ne = false;
                break;
              case m3.word:
                if (le && this.content(le) === "|" && P2[N + 2] && P2[N + 2][h2.FIELDS.TYPE] !== m3.equals && !B.operator && !B.namespace) B.namespace = q, V = "namespace";
                else if (!B.attribute || V === "attribute" && !ne) {
                  K && ((0, v2.ensureObject)(B, "spaces", "attribute"), B.spaces.attribute.before = K, K = ""), J && ((0, v2.ensureObject)(B, "raws", "spaces", "attribute"), B.raws.spaces.attribute.before = J, J = ""), B.attribute = (B.attribute || "") + q;
                  var Ie = (0, v2.getProp)(B, "raws", "attribute") || null;
                  Ie && (B.raws.attribute += q), V = "attribute";
                } else if (!B.value && B.value !== "" || V === "value" && !(ne || B.quoteMark)) {
                  var Pe = (0, v2.unesc)(q), Qe = (0, v2.getProp)(B, "raws", "value") || "", Et = B.value || "";
                  B.value = Et + Pe, B.quoteMark = null, (Pe !== q || Qe) && ((0, v2.ensureObject)(B, "raws"), B.raws.value = (Qe || Et) + q), V = "value";
                } else {
                  var Tt = q === "i" || q === "I";
                  (B.value || B.value === "") && (B.quoteMark || ne) ? (B.insensitive = Tt, (!Tt || q === "I") && ((0, v2.ensureObject)(B, "raws"), B.raws.insensitiveFlag = q), V = "insensitive", K && ((0, v2.ensureObject)(B, "spaces", "insensitive"), B.spaces.insensitive.before = K, K = ""), J && ((0, v2.ensureObject)(B, "raws", "spaces", "insensitive"), B.raws.spaces.insensitive.before = J, J = "")) : (B.value || B.value === "") && (V = "value", B.value += q, B.raws.value && (B.raws.value += q));
                }
                ne = false;
                break;
              case m3.str:
                if (!B.attribute || !B.operator) return this.error("Expected an attribute followed by an operator preceding the string.", { index: ie[h2.FIELDS.START_POS] });
                var bt = (0, d3.unescapeValue)(q), oo = bt.unescaped, so = bt.quoteMark;
                B.value = oo, B.quoteMark = so, V = "value", (0, v2.ensureObject)(B, "raws"), B.raws.value = q, ne = false;
                break;
              case m3.equals:
                if (!B.attribute) return this.expected("attribute", ie[h2.FIELDS.START_POS], q);
                if (B.value) return this.error('Unexpected "=" found; an operator was already defined.', { index: ie[h2.FIELDS.START_POS] });
                B.operator = B.operator ? B.operator + q : q, V = "operator", ne = false;
                break;
              case m3.comment:
                if (V) if (ne || le && le[h2.FIELDS.TYPE] === m3.space || V === "insensitive") {
                  var ao = (0, v2.getProp)(B, "spaces", V, "after") || "", io = (0, v2.getProp)(B, "raws", "spaces", V, "after") || ao;
                  (0, v2.ensureObject)(B, "raws", "spaces", V), B.raws.spaces[V].after = io + q;
                } else {
                  var lo = B[V] || "", co = (0, v2.getProp)(B, "raws", V) || lo;
                  (0, v2.ensureObject)(B, "raws"), B.raws[V] = co + q;
                }
                else J = J + q;
                break;
              default:
                return this.error('Unexpected "' + q + '" found.', { index: ie[h2.FIELDS.START_POS] });
            }
            N++;
          }
          H(B, "attribute"), H(B, "namespace"), this.newNode(new d3.default(B)), this.position++;
        }, M2.parseWhitespaceEquivalentTokens = function(P2) {
          P2 < 0 && (P2 = this.tokens.length);
          var I = this.position, G = [], B = "", N = void 0;
          do
            if (A2[this.currToken[h2.FIELDS.TYPE]]) this.options.lossy || (B += this.content());
            else if (this.currToken[h2.FIELDS.TYPE] === m3.comment) {
              var K = {};
              B && (K.before = B, B = ""), N = new s2.default({ value: this.content(), source: L(this.currToken), sourceIndex: this.currToken[h2.FIELDS.START_POS], spaces: K }), G.push(N);
            }
          while (++this.position < P2);
          if (B) {
            if (N) N.spaces.after = B;
            else if (!this.options.lossy) {
              var J = this.tokens[I], V = this.tokens[this.position - 1];
              G.push(new c2.default({ value: "", source: j(J[h2.FIELDS.START_LINE], J[h2.FIELDS.START_COL], V[h2.FIELDS.END_LINE], V[h2.FIELDS.END_COL]), sourceIndex: J[h2.FIELDS.START_POS], spaces: { before: B, after: "" } }));
            }
          }
          return G;
        }, M2.convertWhitespaceNodesToSpace = function(P2, I) {
          var G = this;
          I === void 0 && (I = false);
          var B = "", N = "";
          P2.forEach(function(J) {
            var V = G.lossySpace(J.spaces.before, I), ne = G.lossySpace(J.rawSpaceBefore, I);
            B += V + G.lossySpace(J.spaces.after, I && V.length === 0), N += V + J.value + G.lossySpace(J.rawSpaceAfter, I && ne.length === 0);
          }), N === B && (N = void 0);
          var K = { space: B, rawSpace: N };
          return K;
        }, M2.isNamedCombinator = function(P2) {
          return P2 === void 0 && (P2 = this.position), this.tokens[P2 + 0] && this.tokens[P2 + 0][h2.FIELDS.TYPE] === m3.slash && this.tokens[P2 + 1] && this.tokens[P2 + 1][h2.FIELDS.TYPE] === m3.word && this.tokens[P2 + 2] && this.tokens[P2 + 2][h2.FIELDS.TYPE] === m3.slash;
        }, M2.namedCombinator = function() {
          if (this.isNamedCombinator()) {
            var P2 = this.content(this.tokens[this.position + 1]), I = (0, v2.unesc)(P2).toLowerCase(), G = {};
            I !== P2 && (G.value = "/" + P2 + "/");
            var B = new p2.default({ value: "/" + I + "/", source: j(this.currToken[h2.FIELDS.START_LINE], this.currToken[h2.FIELDS.START_COL], this.tokens[this.position + 2][h2.FIELDS.END_LINE], this.tokens[this.position + 2][h2.FIELDS.END_COL]), sourceIndex: this.currToken[h2.FIELDS.START_POS], raws: G });
            return this.position = this.position + 3, B;
          } else this.unexpected();
        }, M2.combinator = function() {
          var P2 = this;
          if (this.content() === "|") return this.namespace();
          var I = this.locateNextMeaningfulToken(this.position);
          if (I < 0 || this.tokens[I][h2.FIELDS.TYPE] === m3.comma) {
            var G = this.parseWhitespaceEquivalentTokens(I);
            if (G.length > 0) {
              var B = this.current.last;
              if (B) {
                var N = this.convertWhitespaceNodesToSpace(G), K = N.space, J = N.rawSpace;
                J !== void 0 && (B.rawSpaceAfter += J), B.spaces.after += K;
              } else G.forEach(function(Qe) {
                return P2.newNode(Qe);
              });
            }
            return;
          }
          var V = this.currToken, ne = void 0;
          I > this.position && (ne = this.parseWhitespaceEquivalentTokens(I));
          var ie;
          if (this.isNamedCombinator() ? ie = this.namedCombinator() : this.currToken[h2.FIELDS.TYPE] === m3.combinator ? (ie = new p2.default({ value: this.content(), source: L(this.currToken), sourceIndex: this.currToken[h2.FIELDS.START_POS] }), this.position++) : A2[this.currToken[h2.FIELDS.TYPE]] || ne || this.unexpected(), ie) {
            if (ne) {
              var q = this.convertWhitespaceNodesToSpace(ne), le = q.space, We = q.rawSpace;
              ie.spaces.before = le, ie.rawSpaceBefore = We;
            }
          } else {
            var ze = this.convertWhitespaceNodesToSpace(ne, true), Ae = ze.space, be = ze.rawSpace;
            be || (be = Ae);
            var Ie = {}, Pe = { spaces: {} };
            Ae.endsWith(" ") && be.endsWith(" ") ? (Ie.before = Ae.slice(0, Ae.length - 1), Pe.spaces.before = be.slice(0, be.length - 1)) : Ae.startsWith(" ") && be.startsWith(" ") ? (Ie.after = Ae.slice(1), Pe.spaces.after = be.slice(1)) : Pe.value = be, ie = new p2.default({ value: " ", source: F(V, this.tokens[this.position - 1]), sourceIndex: V[h2.FIELDS.START_POS], spaces: Ie, raws: Pe });
          }
          return this.currToken && this.currToken[h2.FIELDS.TYPE] === m3.space && (ie.spaces.after = this.optionalSpace(this.content()), this.position++), this.newNode(ie);
        }, M2.comma = function() {
          if (this.position === this.tokens.length - 1) {
            this.root.trailingComma = true, this.position++;
            return;
          }
          this.current._inferEndPosition();
          var P2 = new n.default({ source: { start: U(this.tokens[this.position + 1]) } });
          this.current.parent.append(P2), this.current = P2, this.position++;
        }, M2.comment = function() {
          var P2 = this.currToken;
          this.newNode(new s2.default({ value: this.content(), source: L(P2), sourceIndex: P2[h2.FIELDS.START_POS] })), this.position++;
        }, M2.error = function(P2, I) {
          throw this.root.error(P2, I);
        }, M2.missingBackslash = function() {
          return this.error("Expected a backslash preceding the semicolon.", { index: this.currToken[h2.FIELDS.START_POS] });
        }, M2.missingParenthesis = function() {
          return this.expected("opening parenthesis", this.currToken[h2.FIELDS.START_POS]);
        }, M2.missingSquareBracket = function() {
          return this.expected("opening square bracket", this.currToken[h2.FIELDS.START_POS]);
        }, M2.unexpected = function() {
          return this.error("Unexpected '" + this.content() + "'. Escaping special characters with \\ may help.", this.currToken[h2.FIELDS.START_POS]);
        }, M2.unexpectedPipe = function() {
          return this.error("Unexpected '|'.", this.currToken[h2.FIELDS.START_POS]);
        }, M2.namespace = function() {
          var P2 = this.prevToken && this.content(this.prevToken) || true;
          if (this.nextToken[h2.FIELDS.TYPE] === m3.word) return this.position++, this.word(P2);
          if (this.nextToken[h2.FIELDS.TYPE] === m3.asterisk) return this.position++, this.universal(P2);
          this.unexpectedPipe();
        }, M2.nesting = function() {
          if (this.nextToken) {
            var P2 = this.content(this.nextToken);
            if (P2 === "|") {
              this.position++;
              return;
            }
          }
          var I = this.currToken;
          this.newNode(new f3.default({ value: this.content(), source: L(I), sourceIndex: I[h2.FIELDS.START_POS] })), this.position++;
        }, M2.parentheses = function() {
          var P2 = this.current.last, I = 1;
          if (this.position++, P2 && P2.type === y3.PSEUDO) {
            var G = new n.default({ source: { start: U(this.tokens[this.position - 1]) } }), B = this.current;
            for (P2.append(G), this.current = G; this.position < this.tokens.length && I; ) this.currToken[h2.FIELDS.TYPE] === m3.openParenthesis && I++, this.currToken[h2.FIELDS.TYPE] === m3.closeParenthesis && I--, I ? this.parse() : (this.current.source.end = D(this.currToken), this.current.parent.source.end = D(this.currToken), this.position++);
            this.current = B;
          } else {
            for (var N = this.currToken, K = "(", J; this.position < this.tokens.length && I; ) this.currToken[h2.FIELDS.TYPE] === m3.openParenthesis && I++, this.currToken[h2.FIELDS.TYPE] === m3.closeParenthesis && I--, J = this.currToken, K += this.parseParenthesisToken(this.currToken), this.position++;
            P2 ? P2.appendToPropertyAndEscape("value", K, K) : this.newNode(new c2.default({ value: K, source: j(N[h2.FIELDS.START_LINE], N[h2.FIELDS.START_COL], J[h2.FIELDS.END_LINE], J[h2.FIELDS.END_COL]), sourceIndex: N[h2.FIELDS.START_POS] }));
          }
          if (I) return this.expected("closing parenthesis", this.currToken[h2.FIELDS.START_POS]);
        }, M2.pseudo = function() {
          for (var P2 = this, I = "", G = this.currToken; this.currToken && this.currToken[h2.FIELDS.TYPE] === m3.colon; ) I += this.content(), this.position++;
          if (!this.currToken) return this.expected(["pseudo-class", "pseudo-element"], this.position - 1);
          if (this.currToken[h2.FIELDS.TYPE] === m3.word) this.splitWord(false, function(B, N) {
            I += B, P2.newNode(new i2.default({ value: I, source: F(G, P2.currToken), sourceIndex: G[h2.FIELDS.START_POS] })), N > 1 && P2.nextToken && P2.nextToken[h2.FIELDS.TYPE] === m3.openParenthesis && P2.error("Misplaced parenthesis.", { index: P2.nextToken[h2.FIELDS.START_POS] });
          });
          else return this.expected(["pseudo-class", "pseudo-element"], this.currToken[h2.FIELDS.START_POS]);
        }, M2.space = function() {
          var P2 = this.content();
          this.position === 0 || this.prevToken[h2.FIELDS.TYPE] === m3.comma || this.prevToken[h2.FIELDS.TYPE] === m3.openParenthesis || this.current.nodes.every(function(I) {
            return I.type === "comment";
          }) ? (this.spaces = this.optionalSpace(P2), this.position++) : this.position === this.tokens.length - 1 || this.nextToken[h2.FIELDS.TYPE] === m3.comma || this.nextToken[h2.FIELDS.TYPE] === m3.closeParenthesis ? (this.current.last.spaces.after = this.optionalSpace(P2), this.position++) : this.combinator();
        }, M2.string = function() {
          var P2 = this.currToken;
          this.newNode(new c2.default({ value: this.content(), source: L(P2), sourceIndex: P2[h2.FIELDS.START_POS] })), this.position++;
        }, M2.universal = function(P2) {
          var I = this.nextToken;
          if (I && this.content(I) === "|") return this.position++, this.namespace();
          var G = this.currToken;
          this.newNode(new u2.default({ value: this.content(), source: L(G), sourceIndex: G[h2.FIELDS.START_POS] }), P2), this.position++;
        }, M2.splitWord = function(P2, I) {
          for (var G = this, B = this.nextToken, N = this.content(); B && ~[m3.dollar, m3.caret, m3.equals, m3.word].indexOf(B[h2.FIELDS.TYPE]); ) {
            this.position++;
            var K = this.content();
            if (N += K, K.lastIndexOf("\\") === K.length - 1) {
              var J = this.nextToken;
              J && J[h2.FIELDS.TYPE] === m3.space && (N += this.requiredSpace(this.content(J)), this.position++);
            }
            B = this.nextToken;
          }
          var V = Q(N, ".").filter(function(le) {
            var We = N[le - 1] === "\\", ze = /^\d+\.\d+%$/.test(N);
            return !We && !ze;
          }), ne = Q(N, "#").filter(function(le) {
            return N[le - 1] !== "\\";
          }), ie = Q(N, "#{");
          ie.length && (ne = ne.filter(function(le) {
            return !~ie.indexOf(le);
          }));
          var q = (0, g3.default)(we([0].concat(V, ne)));
          q.forEach(function(le, We) {
            var ze = q[We + 1] || N.length, Ae = N.slice(le, ze);
            if (We === 0 && I) return I.call(G, Ae, q.length);
            var be, Ie = G.currToken, Pe = Ie[h2.FIELDS.START_POS] + q[We], Qe = j(Ie[1], Ie[2] + le, Ie[3], Ie[2] + (ze - 1));
            if (~V.indexOf(le)) {
              var Et = { value: Ae.slice(1), source: Qe, sourceIndex: Pe };
              be = new o2.default(H(Et, "value"));
            } else if (~ne.indexOf(le)) {
              var Tt = { value: Ae.slice(1), source: Qe, sourceIndex: Pe };
              be = new a.default(H(Tt, "value"));
            } else {
              var bt = { value: Ae, source: Qe, sourceIndex: Pe };
              H(bt, "value"), be = new l.default(bt);
            }
            G.newNode(be, P2), P2 = null;
          }), this.position++;
        }, M2.word = function(P2) {
          var I = this.nextToken;
          return I && this.content(I) === "|" ? (this.position++, this.namespace()) : this.splitWord(P2);
        }, M2.loop = function() {
          for (; this.position < this.tokens.length; ) this.parse(true);
          return this.current._inferEndPosition(), this.root;
        }, M2.parse = function(P2) {
          switch (this.currToken[h2.FIELDS.TYPE]) {
            case m3.space:
              this.space();
              break;
            case m3.comment:
              this.comment();
              break;
            case m3.openParenthesis:
              this.parentheses();
              break;
            case m3.closeParenthesis:
              P2 && this.missingParenthesis();
              break;
            case m3.openSquare:
              this.attribute();
              break;
            case m3.dollar:
            case m3.caret:
            case m3.equals:
            case m3.word:
              this.word();
              break;
            case m3.colon:
              this.pseudo();
              break;
            case m3.comma:
              this.comma();
              break;
            case m3.asterisk:
              this.universal();
              break;
            case m3.ampersand:
              this.nesting();
              break;
            case m3.slash:
            case m3.combinator:
              this.combinator();
              break;
            case m3.str:
              this.string();
              break;
            case m3.closeSquare:
              this.missingSquareBracket();
            case m3.semicolon:
              this.missingBackslash();
            default:
              this.unexpected();
          }
        }, M2.expected = function(P2, I, G) {
          if (Array.isArray(P2)) {
            var B = P2.pop();
            P2 = P2.join(", ") + " or " + B;
          }
          var N = /^[aeiou]/.test(P2[0]) ? "an" : "a";
          return G ? this.error("Expected " + N + " " + P2 + ', found "' + G + '" instead.', { index: I }) : this.error("Expected " + N + " " + P2 + ".", { index: I });
        }, M2.requiredSpace = function(P2) {
          return this.options.lossy ? " " : P2;
        }, M2.optionalSpace = function(P2) {
          return this.options.lossy ? "" : P2;
        }, M2.lossySpace = function(P2, I) {
          return this.options.lossy ? I ? " " : "" : P2;
        }, M2.parseParenthesisToken = function(P2) {
          var I = this.content(P2);
          return P2[h2.FIELDS.TYPE] === m3.space ? this.requiredSpace(I) : I;
        }, M2.newNode = function(P2, I) {
          return I && (/^ +$/.test(I) && (this.options.lossy || (this.spaces = (this.spaces || "") + I), I = true), P2.namespace = I, H(P2, "namespace")), this.spaces && (P2.spaces.before = this.spaces, this.spaces = ""), this.current.append(P2);
        }, M2.content = function(P2) {
          return P2 === void 0 && (P2 = this.currToken), this.css.slice(P2[h2.FIELDS.START_POS], P2[h2.FIELDS.END_POS]);
        }, M2.locateNextMeaningfulToken = function(P2) {
          P2 === void 0 && (P2 = this.position + 1);
          for (var I = P2; I < this.tokens.length; ) if (_2[this.tokens[I][h2.FIELDS.TYPE]]) {
            I++;
            continue;
          } else return I;
          return -1;
        }, E(R, [{ key: "currToken", get: function() {
          return this.tokens[this.position];
        } }, { key: "nextToken", get: function() {
          return this.tokens[this.position + 1];
        } }, { key: "prevToken", get: function() {
          return this.tokens[this.position - 1];
        } }]), R;
      }();
      e.default = Ce, t.exports = e.default;
    }), fc = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = n(pc());
      function n(s2) {
        return s2 && s2.__esModule ? s2 : { default: s2 };
      }
      var o2 = function() {
        function s2(l, c2) {
          this.func = l || function() {
          }, this.funcRes = null, this.options = c2;
        }
        var a = s2.prototype;
        return a._shouldUpdateSelector = function(l, c2) {
          c2 === void 0 && (c2 = {});
          var i2 = Object.assign({}, this.options, c2);
          return i2.updateSelector === false ? false : typeof l != "string";
        }, a._isLossy = function(l) {
          l === void 0 && (l = {});
          var c2 = Object.assign({}, this.options, l);
          return c2.lossless === false;
        }, a._root = function(l, c2) {
          c2 === void 0 && (c2 = {});
          var i2 = new r2.default(l, this._parseOptions(c2));
          return i2.root;
        }, a._parseOptions = function(l) {
          return { lossy: this._isLossy(l) };
        }, a._run = function(l, c2) {
          var i2 = this;
          return c2 === void 0 && (c2 = {}), new Promise(function(d3, u2) {
            try {
              var p2 = i2._root(l, c2);
              Promise.resolve(i2.func(p2)).then(function(f3) {
                var g3 = void 0;
                return i2._shouldUpdateSelector(l, c2) && (g3 = p2.toString(), l.selector = g3), { transform: f3, root: p2, string: g3 };
              }).then(d3, u2);
            } catch (f3) {
              u2(f3);
              return;
            }
          });
        }, a._runSync = function(l, c2) {
          c2 === void 0 && (c2 = {});
          var i2 = this._root(l, c2), d3 = this.func(i2);
          if (d3 && typeof d3.then == "function") throw new Error("Selector processor returned a promise to a synchronous call.");
          var u2 = void 0;
          return c2.updateSelector && typeof l != "string" && (u2 = i2.toString(), l.selector = u2), { transform: d3, root: i2, string: u2 };
        }, a.ast = function(l, c2) {
          return this._run(l, c2).then(function(i2) {
            return i2.root;
          });
        }, a.astSync = function(l, c2) {
          return this._runSync(l, c2).root;
        }, a.transform = function(l, c2) {
          return this._run(l, c2).then(function(i2) {
            return i2.transform;
          });
        }, a.transformSync = function(l, c2) {
          return this._runSync(l, c2).transform;
        }, a.process = function(l, c2) {
          return this._run(l, c2).then(function(i2) {
            return i2.string || i2.root.toString();
          });
        }, a.processSync = function(l, c2) {
          var i2 = this._runSync(l, c2);
          return i2.string || i2.root.toString();
        }, s2;
      }();
      e.default = o2, t.exports = e.default;
    }), hc = T((e) => {
      O2(), e.__esModule = true, e.universal = e.tag = e.string = e.selector = e.root = e.pseudo = e.nesting = e.id = e.comment = e.combinator = e.className = e.attribute = void 0;
      var t = f3(Is()), r2 = f3(Ss()), n = f3(js()), o2 = f3(Cs()), s2 = f3(As()), a = f3(Bs()), l = f3(Es()), c2 = f3(xs()), i2 = f3(ks()), d3 = f3(_s()), u2 = f3(Os()), p2 = f3(Ps());
      function f3(A2) {
        return A2 && A2.__esModule ? A2 : { default: A2 };
      }
      var g3 = function(A2) {
        return new t.default(A2);
      };
      e.attribute = g3;
      var h2 = function(A2) {
        return new r2.default(A2);
      };
      e.className = h2;
      var m3 = function(A2) {
        return new n.default(A2);
      };
      e.combinator = m3;
      var y3 = function(A2) {
        return new o2.default(A2);
      };
      e.comment = y3;
      var v2 = function(A2) {
        return new s2.default(A2);
      };
      e.id = v2;
      var x2 = function(A2) {
        return new a.default(A2);
      };
      e.nesting = x2;
      var k = function(A2) {
        return new l.default(A2);
      };
      e.pseudo = k;
      var w2 = function(A2) {
        return new c2.default(A2);
      };
      e.root = w2;
      var b2 = function(A2) {
        return new i2.default(A2);
      };
      e.selector = b2;
      var C = function(A2) {
        return new d3.default(A2);
      };
      e.string = C;
      var S = function(A2) {
        return new u2.default(A2);
      };
      e.tag = S;
      var E = function(A2) {
        return new p2.default(A2);
      };
      e.universal = E;
    }), mc = T((e) => {
      O2(), e.__esModule = true, e.isComment = e.isCombinator = e.isClassName = e.isAttribute = void 0, e.isContainer = k, e.isIdentifier = void 0, e.isNamespace = w2, e.isNesting = void 0, e.isNode = o2, e.isPseudo = void 0, e.isPseudoClass = x2, e.isPseudoElement = v2, e.isUniversal = e.isTag = e.isString = e.isSelector = e.isRoot = void 0;
      var t = ke(), r2, n = (r2 = {}, r2[t.ATTRIBUTE] = true, r2[t.CLASS] = true, r2[t.COMBINATOR] = true, r2[t.COMMENT] = true, r2[t.ID] = true, r2[t.NESTING] = true, r2[t.PSEUDO] = true, r2[t.ROOT] = true, r2[t.SELECTOR] = true, r2[t.STRING] = true, r2[t.TAG] = true, r2[t.UNIVERSAL] = true, r2);
      function o2(b2) {
        return typeof b2 == "object" && n[b2.type];
      }
      function s2(b2, C) {
        return o2(C) && C.type === b2;
      }
      var a = s2.bind(null, t.ATTRIBUTE);
      e.isAttribute = a;
      var l = s2.bind(null, t.CLASS);
      e.isClassName = l;
      var c2 = s2.bind(null, t.COMBINATOR);
      e.isCombinator = c2;
      var i2 = s2.bind(null, t.COMMENT);
      e.isComment = i2;
      var d3 = s2.bind(null, t.ID);
      e.isIdentifier = d3;
      var u2 = s2.bind(null, t.NESTING);
      e.isNesting = u2;
      var p2 = s2.bind(null, t.PSEUDO);
      e.isPseudo = p2;
      var f3 = s2.bind(null, t.ROOT);
      e.isRoot = f3;
      var g3 = s2.bind(null, t.SELECTOR);
      e.isSelector = g3;
      var h2 = s2.bind(null, t.STRING);
      e.isString = h2;
      var m3 = s2.bind(null, t.TAG);
      e.isTag = m3;
      var y3 = s2.bind(null, t.UNIVERSAL);
      e.isUniversal = y3;
      function v2(b2) {
        return p2(b2) && b2.value && (b2.value.startsWith("::") || b2.value.toLowerCase() === ":before" || b2.value.toLowerCase() === ":after" || b2.value.toLowerCase() === ":first-letter" || b2.value.toLowerCase() === ":first-line");
      }
      function x2(b2) {
        return p2(b2) && !v2(b2);
      }
      function k(b2) {
        return !!(o2(b2) && b2.walk);
      }
      function w2(b2) {
        return a(b2) || m3(b2);
      }
    }), gc = T((e) => {
      O2(), e.__esModule = true;
      var t = ke();
      Object.keys(t).forEach(function(o2) {
        o2 === "default" || o2 === "__esModule" || o2 in e && e[o2] === t[o2] || (e[o2] = t[o2]);
      });
      var r2 = hc();
      Object.keys(r2).forEach(function(o2) {
        o2 === "default" || o2 === "__esModule" || o2 in e && e[o2] === r2[o2] || (e[o2] = r2[o2]);
      });
      var n = mc();
      Object.keys(n).forEach(function(o2) {
        o2 === "default" || o2 === "__esModule" || o2 in e && e[o2] === n[o2] || (e[o2] = n[o2]);
      });
    }), Ke = T((e, t) => {
      O2(), e.__esModule = true, e.default = void 0;
      var r2 = a(fc()), n = s2(gc());
      function o2(i2) {
        if (typeof WeakMap != "function") return null;
        var d3 = /* @__PURE__ */ new WeakMap(), u2 = /* @__PURE__ */ new WeakMap();
        return (o2 = function(p2) {
          return p2 ? u2 : d3;
        })(i2);
      }
      function s2(i2, d3) {
        if (!d3 && i2 && i2.__esModule) return i2;
        if (i2 === null || typeof i2 != "object" && typeof i2 != "function") return { default: i2 };
        var u2 = o2(d3);
        if (u2 && u2.has(i2)) return u2.get(i2);
        var p2 = {}, f3 = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for (var g3 in i2) if (g3 !== "default" && Object.prototype.hasOwnProperty.call(i2, g3)) {
          var h2 = f3 ? Object.getOwnPropertyDescriptor(i2, g3) : null;
          h2 && (h2.get || h2.set) ? Object.defineProperty(p2, g3, h2) : p2[g3] = i2[g3];
        }
        return p2.default = i2, u2 && u2.set(i2, p2), p2;
      }
      function a(i2) {
        return i2 && i2.__esModule ? i2 : { default: i2 };
      }
      var l = function(i2) {
        return new r2.default(i2);
      };
      Object.assign(l, n), delete l.__esModule;
      var c2 = l;
      e.default = c2, t.exports = e.default;
    });
    function ir(e) {
      return ["fontSize", "outline"].includes(e) ? (t) => (typeof t == "function" && (t = t({})), Array.isArray(t) && (t = t[0]), t) : e === "fontFamily" ? (t) => {
        typeof t == "function" && (t = t({}));
        let r2 = Array.isArray(t) && Le(t[1]) ? t[0] : t;
        return Array.isArray(r2) ? r2.join(", ") : r2;
      } : ["boxShadow", "transitionProperty", "transitionDuration", "transitionDelay", "transitionTimingFunction", "backgroundImage", "backgroundSize", "backgroundColor", "cursor", "animation"].includes(e) ? (t) => (typeof t == "function" && (t = t({})), Array.isArray(t) && (t = t.join(", ")), t) : ["gridTemplateColumns", "gridTemplateRows", "objectPosition"].includes(e) ? (t) => (typeof t == "function" && (t = t({})), typeof t == "string" && (t = fe.list.comma(t).join(" ")), t) : (t, r2 = {}) => (typeof t == "function" && (t = t(r2)), t);
    }
    var lr = $(() => {
      O2(), ut(), Bt();
    }), vc = T((e, t) => {
      O2();
      var { Rule: r2, AtRule: n } = Re(), o2 = Ke();
      function s2(x2, k) {
        let w2;
        try {
          o2((b2) => {
            w2 = b2;
          }).processSync(x2);
        } catch (b2) {
          throw x2.includes(":") ? k ? k.error("Missed semicolon") : b2 : k ? k.error(b2.message) : b2;
        }
        return w2.at(0);
      }
      function a(x2, k) {
        let w2 = false;
        return x2.each((b2) => {
          if (b2.type === "nesting") {
            let C = k.clone({});
            b2.value !== "&" ? b2.replaceWith(s2(b2.value.replace("&", C.toString()))) : b2.replaceWith(C), w2 = true;
          } else "nodes" in b2 && b2.nodes && a(b2, k) && (w2 = true);
        }), w2;
      }
      function l(x2, k) {
        let w2 = [];
        return x2.selectors.forEach((b2) => {
          let C = s2(b2, x2);
          k.selectors.forEach((S) => {
            if (!S) return;
            let E = s2(S, k);
            a(E, C) || (E.prepend(o2.combinator({ value: " " })), E.prepend(C.clone({}))), w2.push(E.toString());
          });
        }), w2;
      }
      function c2(x2, k) {
        let w2 = x2.prev();
        for (k.after(x2); w2 && w2.type === "comment"; ) {
          let b2 = w2.prev();
          k.after(w2), w2 = b2;
        }
        return x2;
      }
      function i2(x2) {
        return function k(w2, b2, C, S = C) {
          let E = [];
          if (b2.each((A2) => {
            A2.type === "rule" && C ? S && (A2.selectors = l(w2, A2)) : A2.type === "atrule" && A2.nodes ? x2[A2.name] ? k(w2, A2, S) : b2[h2] !== false && E.push(A2) : E.push(A2);
          }), C && E.length) {
            let A2 = w2.clone({ nodes: [] });
            for (let _2 of E) A2.append(_2);
            b2.prepend(A2);
          }
        };
      }
      function d3(x2, k, w2) {
        let b2 = new r2({ selector: x2, nodes: [] });
        return b2.append(k), w2.after(b2), b2;
      }
      function u2(x2, k) {
        let w2 = {};
        for (let b2 of x2) w2[b2] = true;
        if (k) for (let b2 of k) w2[b2.replace(/^@/, "")] = true;
        return w2;
      }
      function p2(x2) {
        x2 = x2.trim();
        let k = x2.match(/^\((.*)\)$/);
        if (!k) return { type: "basic", selector: x2 };
        let w2 = k[1].match(/^(with(?:out)?):(.+)$/);
        if (w2) {
          let b2 = w2[1] === "with", C = Object.fromEntries(w2[2].trim().split(/\s+/).map((E) => [E, true]));
          if (b2 && C.all) return { type: "noop" };
          let S = (E) => !!C[E];
          return C.all ? S = () => true : b2 && (S = (E) => E === "all" ? false : !C[E]), { type: "withrules", escapes: S };
        }
        return { type: "unknown" };
      }
      function f3(x2) {
        let k = [], w2 = x2.parent;
        for (; w2 && w2 instanceof n; ) k.push(w2), w2 = w2.parent;
        return k;
      }
      function g3(x2) {
        let k = x2[m3];
        if (!k) x2.after(x2.nodes);
        else {
          let w2 = x2.nodes, b2, C = -1, S, E, A2, _2 = f3(x2);
          if (_2.forEach((U, D) => {
            if (k(U.name)) b2 = U, C = D, E = A2;
            else {
              let j = A2;
              A2 = U.clone({ nodes: [] }), j && A2.append(j), S = S || A2;
            }
          }), b2 ? E ? (S.append(w2), b2.after(E)) : b2.after(w2) : x2.after(w2), x2.next() && b2) {
            let U;
            _2.slice(0, C + 1).forEach((D, j, L) => {
              let F = U;
              U = D.clone({ nodes: [] }), F && U.append(F);
              let H = [], Q = (L[j - 1] || x2).next();
              for (; Q; ) H.push(Q), Q = Q.next();
              U.append(H);
            }), U && (E || w2[w2.length - 1]).after(U);
          }
        }
        x2.remove();
      }
      var h2 = Symbol("rootRuleMergeSel"), m3 = Symbol("rootRuleEscapes");
      function y3(x2) {
        let { params: k } = x2, { type: w2, selector: b2, escapes: C } = p2(k);
        if (w2 === "unknown") throw x2.error(`Unknown @${x2.name} parameter ${JSON.stringify(k)}`);
        if (w2 === "basic" && b2) {
          let S = new r2({ selector: b2, nodes: x2.nodes });
          x2.removeAll(), x2.append(S);
        }
        x2[m3] = C, x2[h2] = C ? !C("all") : w2 === "noop";
      }
      var v2 = Symbol("hasRootRule");
      t.exports = (x2 = {}) => {
        let k = u2(["media", "supports", "layer", "container"], x2.bubble), w2 = i2(k), b2 = u2(["document", "font-face", "keyframes", "-webkit-keyframes", "-moz-keyframes"], x2.unwrap), C = (x2.rootRuleName || "at-root").replace(/^@/, ""), S = x2.preserveEmpty;
        return { postcssPlugin: "postcss-nested", Once(E) {
          E.walkAtRules(C, (A2) => {
            y3(A2), E[v2] = true;
          });
        }, Rule(E) {
          let A2 = false, _2 = E, U = false, D = [];
          E.each((j) => {
            j.type === "rule" ? (D.length && (_2 = d3(E.selector, D, _2), D = []), U = true, A2 = true, j.selectors = l(E, j), _2 = c2(j, _2)) : j.type === "atrule" ? (D.length && (_2 = d3(E.selector, D, _2), D = []), j.name === C ? (A2 = true, w2(E, j, true, j[h2]), _2 = c2(j, _2)) : k[j.name] ? (U = true, A2 = true, w2(E, j, true), _2 = c2(j, _2)) : b2[j.name] ? (U = true, A2 = true, w2(E, j, false), _2 = c2(j, _2)) : U && D.push(j)) : j.type === "decl" && U && D.push(j);
          }), D.length && (_2 = d3(E.selector, D, _2)), A2 && S !== true && (E.raws.semicolon = true, E.nodes.length === 0 && E.remove());
        }, RootExit(E) {
          E[v2] && (E.walkAtRules(C, g3), E[v2] = false);
        } };
      }, t.exports.postcss = true;
    }), yc = T((e, t) => {
      O2();
      var r2 = /-(\w|$)/g, n = (s2, a) => a.toUpperCase(), o2 = (s2) => (s2 = s2.toLowerCase(), s2 === "float" ? "cssFloat" : s2.startsWith("-ms-") ? s2.substr(1).replace(r2, n) : s2.replace(r2, n));
      t.exports = o2;
    }), $s = T((e, t) => {
      O2();
      var r2 = yc(), n = { boxFlex: true, boxFlexGroup: true, columnCount: true, flex: true, flexGrow: true, flexPositive: true, flexShrink: true, flexNegative: true, fontWeight: true, lineClamp: true, lineHeight: true, opacity: true, order: true, orphans: true, tabSize: true, widows: true, zIndex: true, zoom: true, fillOpacity: true, strokeDashoffset: true, strokeOpacity: true, strokeWidth: true };
      function o2(a) {
        return typeof a.nodes > "u" ? true : s2(a);
      }
      function s2(a) {
        let l, c2 = {};
        return a.each((i2) => {
          if (i2.type === "atrule") l = "@" + i2.name, i2.params && (l += " " + i2.params), typeof c2[l] > "u" ? c2[l] = o2(i2) : Array.isArray(c2[l]) ? c2[l].push(o2(i2)) : c2[l] = [c2[l], o2(i2)];
          else if (i2.type === "rule") {
            let d3 = s2(i2);
            if (c2[i2.selector]) for (let u2 in d3) c2[i2.selector][u2] = d3[u2];
            else c2[i2.selector] = d3;
          } else if (i2.type === "decl") {
            i2.prop[0] === "-" && i2.prop[1] === "-" || i2.parent && i2.parent.selector === ":export" ? l = i2.prop : l = r2(i2.prop);
            let d3 = i2.value;
            !isNaN(i2.value) && n[l] && (d3 = parseFloat(i2.value)), i2.important && (d3 += " !important"), typeof c2[l] > "u" ? c2[l] = d3 : Array.isArray(c2[l]) ? c2[l].push(d3) : c2[l] = [c2[l], d3];
          }
        }), c2;
      }
      t.exports = s2;
    }), pn = T((e, t) => {
      O2();
      var r2 = Re(), n = /\s*!important\s*$/i, o2 = { "box-flex": true, "box-flex-group": true, "column-count": true, flex: true, "flex-grow": true, "flex-positive": true, "flex-shrink": true, "flex-negative": true, "font-weight": true, "line-clamp": true, "line-height": true, opacity: true, order: true, orphans: true, "tab-size": true, widows: true, "z-index": true, zoom: true, "fill-opacity": true, "stroke-dashoffset": true, "stroke-opacity": true, "stroke-width": true };
      function s2(i2) {
        return i2.replace(/([A-Z])/g, "-$1").replace(/^ms-/, "-ms-").toLowerCase();
      }
      function a(i2, d3, u2) {
        u2 === false || u2 === null || (d3.startsWith("--") || (d3 = s2(d3)), typeof u2 == "number" && (u2 === 0 || o2[d3] ? u2 = u2.toString() : u2 += "px"), d3 === "css-float" && (d3 = "float"), n.test(u2) ? (u2 = u2.replace(n, ""), i2.push(r2.decl({ prop: d3, value: u2, important: true }))) : i2.push(r2.decl({ prop: d3, value: u2 })));
      }
      function l(i2, d3, u2) {
        let p2 = r2.atRule({ name: d3[1], params: d3[3] || "" });
        typeof u2 == "object" && (p2.nodes = [], c2(u2, p2)), i2.push(p2);
      }
      function c2(i2, d3) {
        let u2, p2, f3;
        for (u2 in i2) if (p2 = i2[u2], !(p2 === null || typeof p2 > "u")) if (u2[0] === "@") {
          let g3 = u2.match(/@(\S+)(\s+([\W\w]*)\s*)?/);
          if (Array.isArray(p2)) for (let h2 of p2) l(d3, g3, h2);
          else l(d3, g3, p2);
        } else if (Array.isArray(p2)) for (let g3 of p2) a(d3, u2, g3);
        else typeof p2 == "object" ? (f3 = r2.rule({ selector: u2 }), c2(p2, f3), d3.push(f3)) : a(d3, u2, p2);
      }
      t.exports = function(i2) {
        let d3 = r2.root();
        return c2(i2, d3), d3;
      };
    }), Rs = T((e, t) => {
      O2();
      var r2 = $s();
      t.exports = function(n) {
        return console && console.warn && n.warnings().forEach((o2) => {
          let s2 = o2.plugin || "PostCSS";
          console.warn(s2 + ": " + o2.text);
        }), r2(n.root);
      };
    }), bc = T((e, t) => {
      O2();
      var r2 = Re(), n = Rs(), o2 = pn();
      t.exports = function(s2) {
        let a = r2(s2);
        return async (l) => {
          let c2 = await a.process(l, { parser: o2, from: void 0 });
          return n(c2);
        };
      };
    }), wc = T((e, t) => {
      O2();
      var r2 = Re(), n = Rs(), o2 = pn();
      t.exports = function(s2) {
        let a = r2(s2);
        return (l) => {
          let c2 = a.process(l, { parser: o2, from: void 0 });
          return n(c2);
        };
      };
    }), xc = T((e, t) => {
      O2();
      var r2 = $s(), n = pn(), o2 = bc(), s2 = wc();
      t.exports = { objectify: r2, parse: n, async: o2, sync: s2 };
    }), Ct, Ms, kc, Sc, Cc, Ac, Oc = $(() => {
      O2(), Ct = he(xc()), Ms = Ct.default, kc = Ct.default.objectify, Sc = Ct.default.parse, Cc = Ct.default.async, Ac = Ct.default.sync;
    });
    function fn(e) {
      return Array.isArray(e) ? e.flatMap((t) => fe([(0, Us.default)({ bubble: ["screen"] })]).process(t, { parser: Ms }).root.nodes) : fn([e]);
    }
    var Us, zs = $(() => {
      O2(), ut(), Us = he(vc()), Oc();
    });
    function hn(e, t, r2 = false) {
      if (e === "") return t;
      let n = typeof t == "string" ? (0, Fs.default)().astSync(t) : t;
      return n.walkClasses((o2) => {
        let s2 = o2.value, a = r2 && s2.startsWith("-");
        o2.value = a ? `-${e}${s2.slice(1)}` : `${e}${s2}`;
      }), typeof t == "string" ? n.toString() : n;
    }
    var Fs, mn = $(() => {
      O2(), Fs = he(Ke());
    });
    function at(e) {
      let t = Ls.default.className();
      return t.value = e, Fr(t?.raws?.value ?? t.value);
    }
    var Ls, Ut = $(() => {
      O2(), Ls = he(Ke()), Lr();
    });
    function Ns(e) {
      return Fr(`.${at(e)}`);
    }
    function Vs(e, t) {
      return Ns(cr(e, t));
    }
    function cr(e, t) {
      return t === "DEFAULT" ? e : t === "-" || t === "-DEFAULT" ? `-${e}` : t.startsWith("-") ? `-${e}${t}` : t.startsWith("/") ? `${e}${t}` : `${e}-${t}`;
    }
    var Ws = $(() => {
      O2(), Ut(), Lr();
    });
    function z(e, t = [[e, [e]]], { filterDefault: r2 = false, ...n } = {}) {
      let o2 = ir(e);
      return function({ matchUtilities: s2, theme: a }) {
        for (let l of t) {
          let c2 = Array.isArray(l[0]) ? l : [l];
          s2(c2.reduce((i2, [d3, u2]) => Object.assign(i2, { [d3]: (p2) => u2.reduce((f3, g3) => Array.isArray(g3) ? Object.assign(f3, { [g3[0]]: g3[1] }) : Object.assign(f3, { [g3]: o2(p2) }), {}) }), {}), { ...n, values: r2 ? Object.fromEntries(Object.entries(a(e) ?? {}).filter(([i2]) => i2 !== "DEFAULT")) : a(e) });
        }
      };
    }
    var _c = $(() => {
      O2(), lr();
    });
    function ur(e) {
      return e = Array.isArray(e) ? e : [e], e.map((t) => {
        let r2 = t.values.map((n) => n.raw !== void 0 ? n.raw : [n.min && `(min-width: ${n.min})`, n.max && `(max-width: ${n.max})`].filter(Boolean).join(" and "));
        return t.not ? `not all and ${r2}` : r2;
      }).join(", ");
    }
    var gn = $(() => {
      O2();
    });
    function Ec(e) {
      return e.split(Zs).map((t) => {
        let r2 = t.trim(), n = { value: r2 }, o2 = r2.split(Xs), s2 = /* @__PURE__ */ new Set();
        for (let a of o2) !s2.has("DIRECTIONS") && qs.has(a) ? (n.direction = a, s2.add("DIRECTIONS")) : !s2.has("PLAY_STATES") && Gs.has(a) ? (n.playState = a, s2.add("PLAY_STATES")) : !s2.has("FILL_MODES") && Ys.has(a) ? (n.fillMode = a, s2.add("FILL_MODES")) : !s2.has("ITERATION_COUNTS") && (Hs.has(a) || Ks.test(a)) ? (n.iterationCount = a, s2.add("ITERATION_COUNTS")) : !s2.has("TIMING_FUNCTION") && Qs.has(a) || !s2.has("TIMING_FUNCTION") && Js.some((l) => a.startsWith(`${l}(`)) ? (n.timingFunction = a, s2.add("TIMING_FUNCTION")) : !s2.has("DURATION") && vn.test(a) ? (n.duration = a, s2.add("DURATION")) : !s2.has("DELAY") && vn.test(a) ? (n.delay = a, s2.add("DELAY")) : s2.has("NAME") ? (n.unknown || (n.unknown = []), n.unknown.push(a)) : (n.name = a, s2.add("NAME"));
        return n;
      });
    }
    var qs, Gs, Ys, Hs, Qs, Js, Zs, Xs, vn, Ks, Tc = $(() => {
      O2(), qs = /* @__PURE__ */ new Set(["normal", "reverse", "alternate", "alternate-reverse"]), Gs = /* @__PURE__ */ new Set(["running", "paused"]), Ys = /* @__PURE__ */ new Set(["none", "forwards", "backwards", "both"]), Hs = /* @__PURE__ */ new Set(["infinite"]), Qs = /* @__PURE__ */ new Set(["linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end"]), Js = ["cubic-bezier", "steps"], Zs = /\,(?![^(]*\))/g, Xs = /\ +(?![^(]*\))/g, vn = /^(-?[\d.]+m?s)$/, Ks = /^(\d+)$/;
    }), yn, ye, Ic = $(() => {
      O2(), yn = (e) => Object.assign({}, ...Object.entries(e ?? {}).flatMap(([t, r2]) => typeof r2 == "object" ? Object.entries(yn(r2)).map(([n, o2]) => ({ [t + (n === "DEFAULT" ? "" : `-${n}`)]: o2 })) : [{ [`${t}`]: r2 }])), ye = yn;
    }), ea, Pc = $(() => {
      ea = "3.4.5";
    });
    function zt(e, t = true) {
      return Array.isArray(e) ? e.map((r2) => {
        if (t && Array.isArray(r2)) throw new Error("The tuple syntax is not supported for `screens`.");
        if (typeof r2 == "string") return { name: r2.toString(), not: false, values: [{ min: r2, max: void 0 }] };
        let [n, o2] = r2;
        return n = n.toString(), typeof o2 == "string" ? { name: n, not: false, values: [{ min: o2, max: void 0 }] } : Array.isArray(o2) ? { name: n, not: false, values: o2.map((s2) => ta(s2)) } : { name: n, not: false, values: [ta(o2)] };
      }) : zt(Object.entries(e ?? {}), false);
    }
    function bn(e) {
      return e.values.length !== 1 ? { result: false, reason: "multiple-values" } : e.values[0].raw !== void 0 ? { result: false, reason: "raw-values" } : e.values[0].min !== void 0 && e.values[0].max !== void 0 ? { result: false, reason: "min-and-max" } : { result: true, reason: null };
    }
    function jc(e, t, r2) {
      let n = wn(t, e), o2 = wn(r2, e), s2 = bn(n), a = bn(o2);
      if (s2.reason === "multiple-values" || a.reason === "multiple-values") throw new Error("Attempted to sort a screen with multiple values. This should never happen. Please open a bug report.");
      if (s2.reason === "raw-values" || a.reason === "raw-values") throw new Error("Attempted to sort a screen with raw values. This should never happen. Please open a bug report.");
      if (s2.reason === "min-and-max" || a.reason === "min-and-max") throw new Error("Attempted to sort a screen with both min and max values. This should never happen. Please open a bug report.");
      let { min: l, max: c2 } = n.values[0], { min: i2, max: d3 } = o2.values[0];
      t.not && ([l, c2] = [c2, l]), r2.not && ([i2, d3] = [d3, i2]), l = l === void 0 ? l : parseFloat(l), c2 = c2 === void 0 ? c2 : parseFloat(c2), i2 = i2 === void 0 ? i2 : parseFloat(i2), d3 = d3 === void 0 ? d3 : parseFloat(d3);
      let [u2, p2] = e === "min" ? [l, i2] : [d3, c2];
      return u2 - p2;
    }
    function wn(e, t) {
      return typeof e == "object" ? e : { name: "arbitrary-screen", values: [{ [t]: e }] };
    }
    function ta({ "min-width": e, min: t = e, max: r2, raw: n } = {}) {
      return { min: t, max: r2, raw: n };
    }
    var xn = $(() => {
      O2();
    });
    function kn(e, t) {
      e.walkDecls((r2) => {
        if (t.includes(r2.prop)) {
          r2.remove();
          return;
        }
        for (let n of t) r2.value.includes(`/ var(${n})`) && (r2.value = r2.value.replace(`/ var(${n})`, ""));
      });
    }
    var Bc = $(() => {
      O2();
    }), ue, Me, Ne, me, ra, Dc = $(() => {
      O2(), rt(), St(), ut(), _c(), gn(), Ut(), Tc(), Ic(), Ht(), es(), Bt(), lr(), Pc(), Ge(), xn(), Ro(), Bc(), nt(), Qt(), kr(), ue = { childVariant: ({ addVariant: e }) => {
        e("*", "& > *");
      }, pseudoElementVariants: ({ addVariant: e }) => {
        e("first-letter", "&::first-letter"), e("first-line", "&::first-line"), e("marker", [({ container: t }) => (kn(t, ["--tw-text-opacity"]), "& *::marker"), ({ container: t }) => (kn(t, ["--tw-text-opacity"]), "&::marker")]), e("selection", ["& *::selection", "&::selection"]), e("file", "&::file-selector-button"), e("placeholder", "&::placeholder"), e("backdrop", "&::backdrop"), e("before", ({ container: t }) => (t.walkRules((r2) => {
          let n = false;
          r2.walkDecls("content", () => {
            n = true;
          }), n || r2.prepend(fe.decl({ prop: "content", value: "var(--tw-content)" }));
        }), "&::before")), e("after", ({ container: t }) => (t.walkRules((r2) => {
          let n = false;
          r2.walkDecls("content", () => {
            n = true;
          }), n || r2.prepend(fe.decl({ prop: "content", value: "var(--tw-content)" }));
        }), "&::after"));
      }, pseudoClassVariants: ({ addVariant: e, matchVariant: t, config: r2, prefix: n }) => {
        let o2 = [["first", "&:first-child"], ["last", "&:last-child"], ["only", "&:only-child"], ["odd", "&:nth-child(odd)"], ["even", "&:nth-child(even)"], "first-of-type", "last-of-type", "only-of-type", ["visited", ({ container: a }) => (kn(a, ["--tw-text-opacity", "--tw-border-opacity", "--tw-bg-opacity"]), "&:visited")], "target", ["open", "&[open]"], "default", "checked", "indeterminate", "placeholder-shown", "autofill", "optional", "required", "valid", "invalid", "in-range", "out-of-range", "read-only", "empty", "focus-within", ["hover", De(r2(), "hoverOnlyWhenSupported") ? "@media (hover: hover) and (pointer: fine) { &:hover }" : "&:hover"], "focus", "focus-visible", "active", "enabled", "disabled"].map((a) => Array.isArray(a) ? a : [a, `&:${a}`]);
        for (let [a, l] of o2) e(a, (c2) => typeof l == "function" ? l(c2) : l);
        let s2 = { group: (a, { modifier: l }) => l ? [`:merge(${n(".group")}\\/${at(l)})`, " &"] : [`:merge(${n(".group")})`, " &"], peer: (a, { modifier: l }) => l ? [`:merge(${n(".peer")}\\/${at(l)})`, " ~ &"] : [`:merge(${n(".peer")})`, " ~ &"] };
        for (let [a, l] of Object.entries(s2)) t(a, (c2 = "", i2) => {
          let d3 = oe(typeof c2 == "function" ? c2(i2) : c2);
          d3.includes("&") || (d3 = "&" + d3);
          let [u2, p2] = l("", i2), f3 = null, g3 = null, h2 = 0;
          for (let m3 = 0; m3 < d3.length; ++m3) {
            let y3 = d3[m3];
            y3 === "&" ? f3 = m3 : y3 === "'" || y3 === '"' ? h2 += 1 : f3 !== null && y3 === " " && !h2 && (g3 = m3);
          }
          return f3 !== null && g3 === null && (g3 = d3.length), d3.slice(0, f3) + u2 + d3.slice(f3 + 1, g3) + p2 + d3.slice(g3);
        }, { values: Object.fromEntries(o2), [ft]: { respectPrefix: false } });
      }, directionVariants: ({ addVariant: e }) => {
        e("ltr", '&:where([dir="ltr"], [dir="ltr"] *)'), e("rtl", '&:where([dir="rtl"], [dir="rtl"] *)');
      }, reducedMotionVariants: ({ addVariant: e }) => {
        e("motion-safe", "@media (prefers-reduced-motion: no-preference)"), e("motion-reduce", "@media (prefers-reduced-motion: reduce)");
      }, darkVariants: ({ config: e, addVariant: t }) => {
        let [r2, n = ".dark"] = [].concat(e("darkMode", "media"));
        if (r2 === false && (r2 = "media", de.warn("darkmode-false", ["The `darkMode` option in your Tailwind CSS configuration is set to `false`, which now behaves the same as `media`.", "Change `darkMode` to `media` or remove it entirely.", "https://tailwindcss.com/docs/upgrade-guide#remove-dark-mode-configuration"])), r2 === "variant") {
          let o2;
          if (Array.isArray(n) || typeof n == "function" ? o2 = n : typeof n == "string" && (o2 = [n]), Array.isArray(o2)) for (let s2 of o2) s2 === ".dark" ? (r2 = false, de.warn("darkmode-variant-without-selector", ["When using `variant` for `darkMode`, you must provide a selector.", 'Example: `darkMode: ["variant", ".your-selector &"]`'])) : s2.includes("&") || (r2 = false, de.warn("darkmode-variant-without-ampersand", ["When using `variant` for `darkMode`, your selector must contain `&`.", 'Example `darkMode: ["variant", ".your-selector &"]`']));
          n = o2;
        }
        r2 === "selector" ? t("dark", `&:where(${n}, ${n} *)`) : r2 === "media" ? t("dark", "@media (prefers-color-scheme: dark)") : r2 === "variant" ? t("dark", n) : r2 === "class" && t("dark", `&:is(${n} *)`);
      }, printVariant: ({ addVariant: e }) => {
        e("print", "@media print");
      }, screenVariants: ({ theme: e, addVariant: t, matchVariant: r2 }) => {
        let n = e("screens") ?? {}, o2 = Object.values(n).every((y3) => typeof y3 == "string"), s2 = zt(e("screens")), a = /* @__PURE__ */ new Set([]);
        function l(y3) {
          return y3.match(/(\D+)$/)?.[1] ?? "(none)";
        }
        function c2(y3) {
          y3 !== void 0 && a.add(l(y3));
        }
        function i2(y3) {
          return c2(y3), a.size === 1;
        }
        for (let y3 of s2) for (let v2 of y3.values) c2(v2.min), c2(v2.max);
        let d3 = a.size <= 1;
        function u2(y3) {
          return Object.fromEntries(s2.filter((v2) => bn(v2).result).map((v2) => {
            let { min: x2, max: k } = v2.values[0];
            if (y3 === "min" && x2 !== void 0) return v2;
            if (y3 === "min" && k !== void 0) return { ...v2, not: !v2.not };
            if (y3 === "max" && k !== void 0) return v2;
            if (y3 === "max" && x2 !== void 0) return { ...v2, not: !v2.not };
          }).map((v2) => [v2.name, v2]));
        }
        function p2(y3) {
          return (v2, x2) => jc(y3, v2.value, x2.value);
        }
        let f3 = p2("max"), g3 = p2("min");
        function h2(y3) {
          return (v2) => {
            if (o2) if (d3) {
              if (typeof v2 == "string" && !i2(v2)) return de.warn("minmax-have-mixed-units", ["The `min-*` and `max-*` variants are not supported with a `screens` configuration containing mixed units."]), [];
            } else return de.warn("mixed-screen-units", ["The `min-*` and `max-*` variants are not supported with a `screens` configuration containing mixed units."]), [];
            else return de.warn("complex-screen-config", ["The `min-*` and `max-*` variants are not supported with a `screens` configuration containing objects."]), [];
            return [`@media ${ur(wn(v2, y3))}`];
          };
        }
        r2("max", h2("max"), { sort: f3, values: o2 ? u2("max") : {} });
        let m3 = "min-screens";
        for (let y3 of s2) t(y3.name, `@media ${ur(y3)}`, { id: m3, sort: o2 && d3 ? g3 : void 0, value: y3 });
        r2("min", h2("min"), { id: m3, sort: g3 });
      }, supportsVariants: ({ matchVariant: e, theme: t }) => {
        e("supports", (r2 = "") => {
          let n = oe(r2), o2 = /^\w*\s*\(/.test(n);
          return n = o2 ? n.replace(/\b(and|or|not)\b/g, " $1 ") : n, o2 ? `@supports ${n}` : (n.includes(":") || (n = `${n}: var(--tw)`), n.startsWith("(") && n.endsWith(")") || (n = `(${n})`), `@supports ${n}`);
        }, { values: t("supports") ?? {} });
      }, hasVariants: ({ matchVariant: e, prefix: t }) => {
        e("has", (r2) => `&:has(${oe(r2)})`, { values: {}, [ft]: { respectPrefix: false } }), e("group-has", (r2, { modifier: n }) => n ? `:merge(${t(".group")}\\/${n}):has(${oe(r2)}) &` : `:merge(${t(".group")}):has(${oe(r2)}) &`, { values: {}, [ft]: { respectPrefix: false } }), e("peer-has", (r2, { modifier: n }) => n ? `:merge(${t(".peer")}\\/${n}):has(${oe(r2)}) ~ &` : `:merge(${t(".peer")}):has(${oe(r2)}) ~ &`, { values: {}, [ft]: { respectPrefix: false } });
      }, ariaVariants: ({ matchVariant: e, theme: t }) => {
        e("aria", (r2) => `&[aria-${oe(r2)}]`, { values: t("aria") ?? {} }), e("group-aria", (r2, { modifier: n }) => n ? `:merge(.group\\/${n})[aria-${oe(r2)}] &` : `:merge(.group)[aria-${oe(r2)}] &`, { values: t("aria") ?? {} }), e("peer-aria", (r2, { modifier: n }) => n ? `:merge(.peer\\/${n})[aria-${oe(r2)}] ~ &` : `:merge(.peer)[aria-${oe(r2)}] ~ &`, { values: t("aria") ?? {} });
      }, dataVariants: ({ matchVariant: e, theme: t }) => {
        e("data", (r2) => `&[data-${oe(r2)}]`, { values: t("data") ?? {} }), e("group-data", (r2, { modifier: n }) => n ? `:merge(.group\\/${n})[data-${oe(r2)}] &` : `:merge(.group)[data-${oe(r2)}] &`, { values: t("data") ?? {} }), e("peer-data", (r2, { modifier: n }) => n ? `:merge(.peer\\/${n})[data-${oe(r2)}] ~ &` : `:merge(.peer)[data-${oe(r2)}] ~ &`, { values: t("data") ?? {} });
      }, orientationVariants: ({ addVariant: e }) => {
        e("portrait", "@media (orientation: portrait)"), e("landscape", "@media (orientation: landscape)");
      }, prefersContrastVariants: ({ addVariant: e }) => {
        e("contrast-more", "@media (prefers-contrast: more)"), e("contrast-less", "@media (prefers-contrast: less)");
      }, forcedColorsVariants: ({ addVariant: e }) => {
        e("forced-colors", "@media (forced-colors: active)");
      } }, Me = ["translate(var(--tw-translate-x), var(--tw-translate-y))", "rotate(var(--tw-rotate))", "skewX(var(--tw-skew-x))", "skewY(var(--tw-skew-y))", "scaleX(var(--tw-scale-x))", "scaleY(var(--tw-scale-y))"].join(" "), Ne = ["var(--tw-blur)", "var(--tw-brightness)", "var(--tw-contrast)", "var(--tw-grayscale)", "var(--tw-hue-rotate)", "var(--tw-invert)", "var(--tw-saturate)", "var(--tw-sepia)", "var(--tw-drop-shadow)"].join(" "), me = ["var(--tw-backdrop-blur)", "var(--tw-backdrop-brightness)", "var(--tw-backdrop-contrast)", "var(--tw-backdrop-grayscale)", "var(--tw-backdrop-hue-rotate)", "var(--tw-backdrop-invert)", "var(--tw-backdrop-opacity)", "var(--tw-backdrop-saturate)", "var(--tw-backdrop-sepia)"].join(" "), ra = { preflight: ({ addBase: e }) => {
        let t = fe.parse(`*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:theme('borderColor.DEFAULT', currentColor)}::after,::before{--tw-content:''}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:theme('fontFamily.sans', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");font-feature-settings:theme('fontFamily.sans[1].fontFeatureSettings', normal);font-variation-settings:theme('fontFamily.sans[1].fontVariationSettings', normal);-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:theme('fontFamily.mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);font-feature-settings:theme('fontFamily.mono[1].fontFeatureSettings', normal);font-variation-settings:theme('fontFamily.mono[1].fontVariationSettings', normal);font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:theme('colors.gray.4', #9ca3af)}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]{display:none}`);
        e([fe.comment({ text: `! tailwindcss v${ea} | MIT License | https://tailwindcss.com` }), ...t.nodes]);
      }, container: /* @__PURE__ */ (() => {
        function e(r2 = []) {
          return r2.flatMap((n) => n.values.map((o2) => o2.min)).filter((n) => n !== void 0);
        }
        function t(r2, n, o2) {
          if (typeof o2 > "u") return [];
          if (!(typeof o2 == "object" && o2 !== null)) return [{ screen: "DEFAULT", minWidth: 0, padding: o2 }];
          let s2 = [];
          o2.DEFAULT && s2.push({ screen: "DEFAULT", minWidth: 0, padding: o2.DEFAULT });
          for (let a of r2) for (let l of n) for (let { min: c2 } of l.values) c2 === a && s2.push({ minWidth: a, padding: o2[l.name] });
          return s2;
        }
        return function({ addComponents: r2, theme: n }) {
          let o2 = zt(n("container.screens", n("screens"))), s2 = e(o2), a = t(s2, o2, n("container.padding")), l = (i2) => {
            let d3 = a.find((u2) => u2.minWidth === i2);
            return d3 ? { paddingRight: d3.padding, paddingLeft: d3.padding } : {};
          }, c2 = Array.from(new Set(s2.slice().sort((i2, d3) => parseInt(i2) - parseInt(d3)))).map((i2) => ({ [`@media (min-width: ${i2})`]: { ".container": { "max-width": i2, ...l(i2) } } }));
          r2([{ ".container": Object.assign({ width: "100%" }, n("container.center", false) ? { marginRight: "auto", marginLeft: "auto" } : {}, l(0)) }, ...c2]);
        };
      })(), accessibility: ({ addUtilities: e }) => {
        e({ ".sr-only": { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" }, ".not-sr-only": { position: "static", width: "auto", height: "auto", padding: "0", margin: "0", overflow: "visible", clip: "auto", whiteSpace: "normal" } });
      }, pointerEvents: ({ addUtilities: e }) => {
        e({ ".pointer-events-none": { "pointer-events": "none" }, ".pointer-events-auto": { "pointer-events": "auto" } });
      }, visibility: ({ addUtilities: e }) => {
        e({ ".visible": { visibility: "visible" }, ".invisible": { visibility: "hidden" }, ".collapse": { visibility: "collapse" } });
      }, position: ({ addUtilities: e }) => {
        e({ ".static": { position: "static" }, ".fixed": { position: "fixed" }, ".absolute": { position: "absolute" }, ".relative": { position: "relative" }, ".sticky": { position: "sticky" } });
      }, inset: z("inset", [["inset", ["inset"]], [["inset-x", ["left", "right"]], ["inset-y", ["top", "bottom"]]], [["start", ["inset-inline-start"]], ["end", ["inset-inline-end"]], ["top", ["top"]], ["right", ["right"]], ["bottom", ["bottom"]], ["left", ["left"]]]], { supportsNegativeValues: true }), isolation: ({ addUtilities: e }) => {
        e({ ".isolate": { isolation: "isolate" }, ".isolation-auto": { isolation: "auto" } });
      }, zIndex: z("zIndex", [["z", ["zIndex"]]], { supportsNegativeValues: true }), order: z("order", void 0, { supportsNegativeValues: true }), gridColumn: z("gridColumn", [["col", ["gridColumn"]]]), gridColumnStart: z("gridColumnStart", [["col-start", ["gridColumnStart"]]], { supportsNegativeValues: true }), gridColumnEnd: z("gridColumnEnd", [["col-end", ["gridColumnEnd"]]], { supportsNegativeValues: true }), gridRow: z("gridRow", [["row", ["gridRow"]]]), gridRowStart: z("gridRowStart", [["row-start", ["gridRowStart"]]], { supportsNegativeValues: true }), gridRowEnd: z("gridRowEnd", [["row-end", ["gridRowEnd"]]], { supportsNegativeValues: true }), float: ({ addUtilities: e }) => {
        e({ ".float-start": { float: "inline-start" }, ".float-end": { float: "inline-end" }, ".float-right": { float: "right" }, ".float-left": { float: "left" }, ".float-none": { float: "none" } });
      }, clear: ({ addUtilities: e }) => {
        e({ ".clear-start": { clear: "inline-start" }, ".clear-end": { clear: "inline-end" }, ".clear-left": { clear: "left" }, ".clear-right": { clear: "right" }, ".clear-both": { clear: "both" }, ".clear-none": { clear: "none" } });
      }, margin: z("margin", [["m", ["margin"]], [["mx", ["margin-left", "margin-right"]], ["my", ["margin-top", "margin-bottom"]]], [["ms", ["margin-inline-start"]], ["me", ["margin-inline-end"]], ["mt", ["margin-top"]], ["mr", ["margin-right"]], ["mb", ["margin-bottom"]], ["ml", ["margin-left"]]]], { supportsNegativeValues: true }), boxSizing: ({ addUtilities: e }) => {
        e({ ".box-border": { "box-sizing": "border-box" }, ".box-content": { "box-sizing": "content-box" } });
      }, lineClamp: ({ matchUtilities: e, addUtilities: t, theme: r2 }) => {
        e({ "line-clamp": (n) => ({ overflow: "hidden", display: "-webkit-box", "-webkit-box-orient": "vertical", "-webkit-line-clamp": `${n}` }) }, { values: r2("lineClamp") }), t({ ".line-clamp-none": { overflow: "visible", display: "block", "-webkit-box-orient": "horizontal", "-webkit-line-clamp": "none" } });
      }, display: ({ addUtilities: e }) => {
        e({ ".block": { display: "block" }, ".inline-block": { display: "inline-block" }, ".inline": { display: "inline" }, ".flex": { display: "flex" }, ".inline-flex": { display: "inline-flex" }, ".table": { display: "table" }, ".inline-table": { display: "inline-table" }, ".table-caption": { display: "table-caption" }, ".table-cell": { display: "table-cell" }, ".table-column": { display: "table-column" }, ".table-column-group": { display: "table-column-group" }, ".table-footer-group": { display: "table-footer-group" }, ".table-header-group": { display: "table-header-group" }, ".table-row-group": { display: "table-row-group" }, ".table-row": { display: "table-row" }, ".flow-root": { display: "flow-root" }, ".grid": { display: "grid" }, ".inline-grid": { display: "inline-grid" }, ".contents": { display: "contents" }, ".list-item": { display: "list-item" }, ".hidden": { display: "none" } });
      }, aspectRatio: z("aspectRatio", [["aspect", ["aspect-ratio"]]]), size: z("size", [["size", ["width", "height"]]]), height: z("height", [["h", ["height"]]]), maxHeight: z("maxHeight", [["max-h", ["maxHeight"]]]), minHeight: z("minHeight", [["min-h", ["minHeight"]]]), width: z("width", [["w", ["width"]]]), minWidth: z("minWidth", [["min-w", ["minWidth"]]]), maxWidth: z("maxWidth", [["max-w", ["maxWidth"]]]), flex: z("flex"), flexShrink: z("flexShrink", [["flex-shrink", ["flex-shrink"]], ["shrink", ["flex-shrink"]]]), flexGrow: z("flexGrow", [["flex-grow", ["flex-grow"]], ["grow", ["flex-grow"]]]), flexBasis: z("flexBasis", [["basis", ["flex-basis"]]]), tableLayout: ({ addUtilities: e }) => {
        e({ ".table-auto": { "table-layout": "auto" }, ".table-fixed": { "table-layout": "fixed" } });
      }, captionSide: ({ addUtilities: e }) => {
        e({ ".caption-top": { "caption-side": "top" }, ".caption-bottom": { "caption-side": "bottom" } });
      }, borderCollapse: ({ addUtilities: e }) => {
        e({ ".border-collapse": { "border-collapse": "collapse" }, ".border-separate": { "border-collapse": "separate" } });
      }, borderSpacing: ({ addDefaults: e, matchUtilities: t, theme: r2 }) => {
        e("border-spacing", { "--tw-border-spacing-x": 0, "--tw-border-spacing-y": 0 }), t({ "border-spacing": (n) => ({ "--tw-border-spacing-x": n, "--tw-border-spacing-y": n, "@defaults border-spacing": {}, "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)" }), "border-spacing-x": (n) => ({ "--tw-border-spacing-x": n, "@defaults border-spacing": {}, "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)" }), "border-spacing-y": (n) => ({ "--tw-border-spacing-y": n, "@defaults border-spacing": {}, "border-spacing": "var(--tw-border-spacing-x) var(--tw-border-spacing-y)" }) }, { values: r2("borderSpacing") });
      }, transformOrigin: z("transformOrigin", [["origin", ["transformOrigin"]]]), translate: z("translate", [[["translate-x", [["@defaults transform", {}], "--tw-translate-x", ["transform", Me]]], ["translate-y", [["@defaults transform", {}], "--tw-translate-y", ["transform", Me]]]]], { supportsNegativeValues: true }), rotate: z("rotate", [["rotate", [["@defaults transform", {}], "--tw-rotate", ["transform", Me]]]], { supportsNegativeValues: true }), skew: z("skew", [[["skew-x", [["@defaults transform", {}], "--tw-skew-x", ["transform", Me]]], ["skew-y", [["@defaults transform", {}], "--tw-skew-y", ["transform", Me]]]]], { supportsNegativeValues: true }), scale: z("scale", [["scale", [["@defaults transform", {}], "--tw-scale-x", "--tw-scale-y", ["transform", Me]]], [["scale-x", [["@defaults transform", {}], "--tw-scale-x", ["transform", Me]]], ["scale-y", [["@defaults transform", {}], "--tw-scale-y", ["transform", Me]]]]], { supportsNegativeValues: true }), transform: ({ addDefaults: e, addUtilities: t }) => {
        e("transform", { "--tw-translate-x": "0", "--tw-translate-y": "0", "--tw-rotate": "0", "--tw-skew-x": "0", "--tw-skew-y": "0", "--tw-scale-x": "1", "--tw-scale-y": "1" }), t({ ".transform": { "@defaults transform": {}, transform: Me }, ".transform-cpu": { transform: Me }, ".transform-gpu": { transform: Me.replace("translate(var(--tw-translate-x), var(--tw-translate-y))", "translate3d(var(--tw-translate-x), var(--tw-translate-y), 0)") }, ".transform-none": { transform: "none" } });
      }, animation: ({ matchUtilities: e, theme: t, config: r2 }) => {
        let n = (s2) => at(r2("prefix") + s2), o2 = Object.fromEntries(Object.entries(t("keyframes") ?? {}).map(([s2, a]) => [s2, { [`@keyframes ${n(s2)}`]: a }]));
        e({ animate: (s2) => {
          let a = Ec(s2);
          return [...a.flatMap((l) => o2[l.name]), { animation: a.map(({ name: l, value: c2 }) => l === void 0 || o2[l] === void 0 ? c2 : c2.replace(l, n(l))).join(", ") }];
        } }, { values: t("animation") });
      }, cursor: z("cursor"), touchAction: ({ addDefaults: e, addUtilities: t }) => {
        e("touch-action", { "--tw-pan-x": " ", "--tw-pan-y": " ", "--tw-pinch-zoom": " " });
        let r2 = "var(--tw-pan-x) var(--tw-pan-y) var(--tw-pinch-zoom)";
        t({ ".touch-auto": { "touch-action": "auto" }, ".touch-none": { "touch-action": "none" }, ".touch-pan-x": { "@defaults touch-action": {}, "--tw-pan-x": "pan-x", "touch-action": r2 }, ".touch-pan-left": { "@defaults touch-action": {}, "--tw-pan-x": "pan-left", "touch-action": r2 }, ".touch-pan-right": { "@defaults touch-action": {}, "--tw-pan-x": "pan-right", "touch-action": r2 }, ".touch-pan-y": { "@defaults touch-action": {}, "--tw-pan-y": "pan-y", "touch-action": r2 }, ".touch-pan-up": { "@defaults touch-action": {}, "--tw-pan-y": "pan-up", "touch-action": r2 }, ".touch-pan-down": { "@defaults touch-action": {}, "--tw-pan-y": "pan-down", "touch-action": r2 }, ".touch-pinch-zoom": { "@defaults touch-action": {}, "--tw-pinch-zoom": "pinch-zoom", "touch-action": r2 }, ".touch-manipulation": { "touch-action": "manipulation" } });
      }, userSelect: ({ addUtilities: e }) => {
        e({ ".select-none": { "user-select": "none" }, ".select-text": { "user-select": "text" }, ".select-all": { "user-select": "all" }, ".select-auto": { "user-select": "auto" } });
      }, resize: ({ addUtilities: e }) => {
        e({ ".resize-none": { resize: "none" }, ".resize-y": { resize: "vertical" }, ".resize-x": { resize: "horizontal" }, ".resize": { resize: "both" } });
      }, scrollSnapType: ({ addDefaults: e, addUtilities: t }) => {
        e("scroll-snap-type", { "--tw-scroll-snap-strictness": "proximity" }), t({ ".snap-none": { "scroll-snap-type": "none" }, ".snap-x": { "@defaults scroll-snap-type": {}, "scroll-snap-type": "x var(--tw-scroll-snap-strictness)" }, ".snap-y": { "@defaults scroll-snap-type": {}, "scroll-snap-type": "y var(--tw-scroll-snap-strictness)" }, ".snap-both": { "@defaults scroll-snap-type": {}, "scroll-snap-type": "both var(--tw-scroll-snap-strictness)" }, ".snap-mandatory": { "--tw-scroll-snap-strictness": "mandatory" }, ".snap-proximity": { "--tw-scroll-snap-strictness": "proximity" } });
      }, scrollSnapAlign: ({ addUtilities: e }) => {
        e({ ".snap-start": { "scroll-snap-align": "start" }, ".snap-end": { "scroll-snap-align": "end" }, ".snap-center": { "scroll-snap-align": "center" }, ".snap-align-none": { "scroll-snap-align": "none" } });
      }, scrollSnapStop: ({ addUtilities: e }) => {
        e({ ".snap-normal": { "scroll-snap-stop": "normal" }, ".snap-always": { "scroll-snap-stop": "always" } });
      }, scrollMargin: z("scrollMargin", [["scroll-m", ["scroll-margin"]], [["scroll-mx", ["scroll-margin-left", "scroll-margin-right"]], ["scroll-my", ["scroll-margin-top", "scroll-margin-bottom"]]], [["scroll-ms", ["scroll-margin-inline-start"]], ["scroll-me", ["scroll-margin-inline-end"]], ["scroll-mt", ["scroll-margin-top"]], ["scroll-mr", ["scroll-margin-right"]], ["scroll-mb", ["scroll-margin-bottom"]], ["scroll-ml", ["scroll-margin-left"]]]], { supportsNegativeValues: true }), scrollPadding: z("scrollPadding", [["scroll-p", ["scroll-padding"]], [["scroll-px", ["scroll-padding-left", "scroll-padding-right"]], ["scroll-py", ["scroll-padding-top", "scroll-padding-bottom"]]], [["scroll-ps", ["scroll-padding-inline-start"]], ["scroll-pe", ["scroll-padding-inline-end"]], ["scroll-pt", ["scroll-padding-top"]], ["scroll-pr", ["scroll-padding-right"]], ["scroll-pb", ["scroll-padding-bottom"]], ["scroll-pl", ["scroll-padding-left"]]]]), listStylePosition: ({ addUtilities: e }) => {
        e({ ".list-inside": { "list-style-position": "inside" }, ".list-outside": { "list-style-position": "outside" } });
      }, listStyleType: z("listStyleType", [["list", ["listStyleType"]]]), listStyleImage: z("listStyleImage", [["list-image", ["listStyleImage"]]]), appearance: ({ addUtilities: e }) => {
        e({ ".appearance-none": { appearance: "none" }, ".appearance-auto": { appearance: "auto" } });
      }, columns: z("columns", [["columns", ["columns"]]]), breakBefore: ({ addUtilities: e }) => {
        e({ ".break-before-auto": { "break-before": "auto" }, ".break-before-avoid": { "break-before": "avoid" }, ".break-before-all": { "break-before": "all" }, ".break-before-avoid-page": { "break-before": "avoid-page" }, ".break-before-page": { "break-before": "page" }, ".break-before-left": { "break-before": "left" }, ".break-before-right": { "break-before": "right" }, ".break-before-column": { "break-before": "column" } });
      }, breakInside: ({ addUtilities: e }) => {
        e({ ".break-inside-auto": { "break-inside": "auto" }, ".break-inside-avoid": { "break-inside": "avoid" }, ".break-inside-avoid-page": { "break-inside": "avoid-page" }, ".break-inside-avoid-column": { "break-inside": "avoid-column" } });
      }, breakAfter: ({ addUtilities: e }) => {
        e({ ".break-after-auto": { "break-after": "auto" }, ".break-after-avoid": { "break-after": "avoid" }, ".break-after-all": { "break-after": "all" }, ".break-after-avoid-page": { "break-after": "avoid-page" }, ".break-after-page": { "break-after": "page" }, ".break-after-left": { "break-after": "left" }, ".break-after-right": { "break-after": "right" }, ".break-after-column": { "break-after": "column" } });
      }, gridAutoColumns: z("gridAutoColumns", [["auto-cols", ["gridAutoColumns"]]]), gridAutoFlow: ({ addUtilities: e }) => {
        e({ ".grid-flow-row": { gridAutoFlow: "row" }, ".grid-flow-col": { gridAutoFlow: "column" }, ".grid-flow-dense": { gridAutoFlow: "dense" }, ".grid-flow-row-dense": { gridAutoFlow: "row dense" }, ".grid-flow-col-dense": { gridAutoFlow: "column dense" } });
      }, gridAutoRows: z("gridAutoRows", [["auto-rows", ["gridAutoRows"]]]), gridTemplateColumns: z("gridTemplateColumns", [["grid-cols", ["gridTemplateColumns"]]]), gridTemplateRows: z("gridTemplateRows", [["grid-rows", ["gridTemplateRows"]]]), flexDirection: ({ addUtilities: e }) => {
        e({ ".flex-row": { "flex-direction": "row" }, ".flex-row-reverse": { "flex-direction": "row-reverse" }, ".flex-col": { "flex-direction": "column" }, ".flex-col-reverse": { "flex-direction": "column-reverse" } });
      }, flexWrap: ({ addUtilities: e }) => {
        e({ ".flex-wrap": { "flex-wrap": "wrap" }, ".flex-wrap-reverse": { "flex-wrap": "wrap-reverse" }, ".flex-nowrap": { "flex-wrap": "nowrap" } });
      }, placeContent: ({ addUtilities: e }) => {
        e({ ".place-content-center": { "place-content": "center" }, ".place-content-start": { "place-content": "start" }, ".place-content-end": { "place-content": "end" }, ".place-content-between": { "place-content": "space-between" }, ".place-content-around": { "place-content": "space-around" }, ".place-content-evenly": { "place-content": "space-evenly" }, ".place-content-baseline": { "place-content": "baseline" }, ".place-content-stretch": { "place-content": "stretch" } });
      }, placeItems: ({ addUtilities: e }) => {
        e({ ".place-items-start": { "place-items": "start" }, ".place-items-end": { "place-items": "end" }, ".place-items-center": { "place-items": "center" }, ".place-items-baseline": { "place-items": "baseline" }, ".place-items-stretch": { "place-items": "stretch" } });
      }, alignContent: ({ addUtilities: e }) => {
        e({ ".content-normal": { "align-content": "normal" }, ".content-center": { "align-content": "center" }, ".content-start": { "align-content": "flex-start" }, ".content-end": { "align-content": "flex-end" }, ".content-between": { "align-content": "space-between" }, ".content-around": { "align-content": "space-around" }, ".content-evenly": { "align-content": "space-evenly" }, ".content-baseline": { "align-content": "baseline" }, ".content-stretch": { "align-content": "stretch" } });
      }, alignItems: ({ addUtilities: e }) => {
        e({ ".items-start": { "align-items": "flex-start" }, ".items-end": { "align-items": "flex-end" }, ".items-center": { "align-items": "center" }, ".items-baseline": { "align-items": "baseline" }, ".items-stretch": { "align-items": "stretch" } });
      }, justifyContent: ({ addUtilities: e }) => {
        e({ ".justify-normal": { "justify-content": "normal" }, ".justify-start": { "justify-content": "flex-start" }, ".justify-end": { "justify-content": "flex-end" }, ".justify-center": { "justify-content": "center" }, ".justify-between": { "justify-content": "space-between" }, ".justify-around": { "justify-content": "space-around" }, ".justify-evenly": { "justify-content": "space-evenly" }, ".justify-stretch": { "justify-content": "stretch" } });
      }, justifyItems: ({ addUtilities: e }) => {
        e({ ".justify-items-start": { "justify-items": "start" }, ".justify-items-end": { "justify-items": "end" }, ".justify-items-center": { "justify-items": "center" }, ".justify-items-stretch": { "justify-items": "stretch" } });
      }, gap: z("gap", [["gap", ["gap"]], [["gap-x", ["columnGap"]], ["gap-y", ["rowGap"]]]]), space: ({ matchUtilities: e, addUtilities: t, theme: r2 }) => {
        e({ "space-x": (n) => (n = n === "0" ? "0px" : n, { "& > :not([hidden]) ~ :not([hidden])": { "--tw-space-x-reverse": "0", "margin-right": `calc(${n} * var(--tw-space-x-reverse))`, "margin-left": `calc(${n} * calc(1 - var(--tw-space-x-reverse)))` } }), "space-y": (n) => (n = n === "0" ? "0px" : n, { "& > :not([hidden]) ~ :not([hidden])": { "--tw-space-y-reverse": "0", "margin-top": `calc(${n} * calc(1 - var(--tw-space-y-reverse)))`, "margin-bottom": `calc(${n} * var(--tw-space-y-reverse))` } }) }, { values: r2("space"), supportsNegativeValues: true }), t({ ".space-y-reverse > :not([hidden]) ~ :not([hidden])": { "--tw-space-y-reverse": "1" }, ".space-x-reverse > :not([hidden]) ~ :not([hidden])": { "--tw-space-x-reverse": "1" } });
      }, divideWidth: ({ matchUtilities: e, addUtilities: t, theme: r2 }) => {
        e({ "divide-x": (n) => (n = n === "0" ? "0px" : n, { "& > :not([hidden]) ~ :not([hidden])": { "@defaults border-width": {}, "--tw-divide-x-reverse": "0", "border-right-width": `calc(${n} * var(--tw-divide-x-reverse))`, "border-left-width": `calc(${n} * calc(1 - var(--tw-divide-x-reverse)))` } }), "divide-y": (n) => (n = n === "0" ? "0px" : n, { "& > :not([hidden]) ~ :not([hidden])": { "@defaults border-width": {}, "--tw-divide-y-reverse": "0", "border-top-width": `calc(${n} * calc(1 - var(--tw-divide-y-reverse)))`, "border-bottom-width": `calc(${n} * var(--tw-divide-y-reverse))` } }) }, { values: r2("divideWidth"), type: ["line-width", "length", "any"] }), t({ ".divide-y-reverse > :not([hidden]) ~ :not([hidden])": { "@defaults border-width": {}, "--tw-divide-y-reverse": "1" }, ".divide-x-reverse > :not([hidden]) ~ :not([hidden])": { "@defaults border-width": {}, "--tw-divide-x-reverse": "1" } });
      }, divideStyle: ({ addUtilities: e }) => {
        e({ ".divide-solid > :not([hidden]) ~ :not([hidden])": { "border-style": "solid" }, ".divide-dashed > :not([hidden]) ~ :not([hidden])": { "border-style": "dashed" }, ".divide-dotted > :not([hidden]) ~ :not([hidden])": { "border-style": "dotted" }, ".divide-double > :not([hidden]) ~ :not([hidden])": { "border-style": "double" }, ".divide-none > :not([hidden]) ~ :not([hidden])": { "border-style": "none" } });
      }, divideColor: ({ matchUtilities: e, theme: t, corePlugins: r2 }) => {
        e({ divide: (n) => r2("divideOpacity") ? { "& > :not([hidden]) ~ :not([hidden])": Oe({ color: n, property: "border-color", variable: "--tw-divide-opacity" }) } : { "& > :not([hidden]) ~ :not([hidden])": { "border-color": se(n) } } }, { values: (({ DEFAULT: n, ...o2 }) => o2)(ye(t("divideColor"))), type: ["color", "any"] });
      }, divideOpacity: ({ matchUtilities: e, theme: t }) => {
        e({ "divide-opacity": (r2) => ({ "& > :not([hidden]) ~ :not([hidden])": { "--tw-divide-opacity": r2 } }) }, { values: t("divideOpacity") });
      }, placeSelf: ({ addUtilities: e }) => {
        e({ ".place-self-auto": { "place-self": "auto" }, ".place-self-start": { "place-self": "start" }, ".place-self-end": { "place-self": "end" }, ".place-self-center": { "place-self": "center" }, ".place-self-stretch": { "place-self": "stretch" } });
      }, alignSelf: ({ addUtilities: e }) => {
        e({ ".self-auto": { "align-self": "auto" }, ".self-start": { "align-self": "flex-start" }, ".self-end": { "align-self": "flex-end" }, ".self-center": { "align-self": "center" }, ".self-stretch": { "align-self": "stretch" }, ".self-baseline": { "align-self": "baseline" } });
      }, justifySelf: ({ addUtilities: e }) => {
        e({ ".justify-self-auto": { "justify-self": "auto" }, ".justify-self-start": { "justify-self": "start" }, ".justify-self-end": { "justify-self": "end" }, ".justify-self-center": { "justify-self": "center" }, ".justify-self-stretch": { "justify-self": "stretch" } });
      }, overflow: ({ addUtilities: e }) => {
        e({ ".overflow-auto": { overflow: "auto" }, ".overflow-hidden": { overflow: "hidden" }, ".overflow-clip": { overflow: "clip" }, ".overflow-visible": { overflow: "visible" }, ".overflow-scroll": { overflow: "scroll" }, ".overflow-x-auto": { "overflow-x": "auto" }, ".overflow-y-auto": { "overflow-y": "auto" }, ".overflow-x-hidden": { "overflow-x": "hidden" }, ".overflow-y-hidden": { "overflow-y": "hidden" }, ".overflow-x-clip": { "overflow-x": "clip" }, ".overflow-y-clip": { "overflow-y": "clip" }, ".overflow-x-visible": { "overflow-x": "visible" }, ".overflow-y-visible": { "overflow-y": "visible" }, ".overflow-x-scroll": { "overflow-x": "scroll" }, ".overflow-y-scroll": { "overflow-y": "scroll" } });
      }, overscrollBehavior: ({ addUtilities: e }) => {
        e({ ".overscroll-auto": { "overscroll-behavior": "auto" }, ".overscroll-contain": { "overscroll-behavior": "contain" }, ".overscroll-none": { "overscroll-behavior": "none" }, ".overscroll-y-auto": { "overscroll-behavior-y": "auto" }, ".overscroll-y-contain": { "overscroll-behavior-y": "contain" }, ".overscroll-y-none": { "overscroll-behavior-y": "none" }, ".overscroll-x-auto": { "overscroll-behavior-x": "auto" }, ".overscroll-x-contain": { "overscroll-behavior-x": "contain" }, ".overscroll-x-none": { "overscroll-behavior-x": "none" } });
      }, scrollBehavior: ({ addUtilities: e }) => {
        e({ ".scroll-auto": { "scroll-behavior": "auto" }, ".scroll-smooth": { "scroll-behavior": "smooth" } });
      }, textOverflow: ({ addUtilities: e }) => {
        e({ ".truncate": { overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }, ".overflow-ellipsis": { "text-overflow": "ellipsis" }, ".text-ellipsis": { "text-overflow": "ellipsis" }, ".text-clip": { "text-overflow": "clip" } });
      }, hyphens: ({ addUtilities: e }) => {
        e({ ".hyphens-none": { hyphens: "none" }, ".hyphens-manual": { hyphens: "manual" }, ".hyphens-auto": { hyphens: "auto" } });
      }, whitespace: ({ addUtilities: e }) => {
        e({ ".whitespace-normal": { "white-space": "normal" }, ".whitespace-nowrap": { "white-space": "nowrap" }, ".whitespace-pre": { "white-space": "pre" }, ".whitespace-pre-line": { "white-space": "pre-line" }, ".whitespace-pre-wrap": { "white-space": "pre-wrap" }, ".whitespace-break-spaces": { "white-space": "break-spaces" } });
      }, textWrap: ({ addUtilities: e }) => {
        e({ ".text-wrap": { "text-wrap": "wrap" }, ".text-nowrap": { "text-wrap": "nowrap" }, ".text-balance": { "text-wrap": "balance" }, ".text-pretty": { "text-wrap": "pretty" } });
      }, wordBreak: ({ addUtilities: e }) => {
        e({ ".break-normal": { "overflow-wrap": "normal", "word-break": "normal" }, ".break-words": { "overflow-wrap": "break-word" }, ".break-all": { "word-break": "break-all" }, ".break-keep": { "word-break": "keep-all" } });
      }, borderRadius: z("borderRadius", [["rounded", ["border-radius"]], [["rounded-s", ["border-start-start-radius", "border-end-start-radius"]], ["rounded-e", ["border-start-end-radius", "border-end-end-radius"]], ["rounded-t", ["border-top-left-radius", "border-top-right-radius"]], ["rounded-r", ["border-top-right-radius", "border-bottom-right-radius"]], ["rounded-b", ["border-bottom-right-radius", "border-bottom-left-radius"]], ["rounded-l", ["border-top-left-radius", "border-bottom-left-radius"]]], [["rounded-ss", ["border-start-start-radius"]], ["rounded-se", ["border-start-end-radius"]], ["rounded-ee", ["border-end-end-radius"]], ["rounded-es", ["border-end-start-radius"]], ["rounded-tl", ["border-top-left-radius"]], ["rounded-tr", ["border-top-right-radius"]], ["rounded-br", ["border-bottom-right-radius"]], ["rounded-bl", ["border-bottom-left-radius"]]]]), borderWidth: z("borderWidth", [["border", [["@defaults border-width", {}], "border-width"]], [["border-x", [["@defaults border-width", {}], "border-left-width", "border-right-width"]], ["border-y", [["@defaults border-width", {}], "border-top-width", "border-bottom-width"]]], [["border-s", [["@defaults border-width", {}], "border-inline-start-width"]], ["border-e", [["@defaults border-width", {}], "border-inline-end-width"]], ["border-t", [["@defaults border-width", {}], "border-top-width"]], ["border-r", [["@defaults border-width", {}], "border-right-width"]], ["border-b", [["@defaults border-width", {}], "border-bottom-width"]], ["border-l", [["@defaults border-width", {}], "border-left-width"]]]], { type: ["line-width", "length"] }), borderStyle: ({ addUtilities: e }) => {
        e({ ".border-solid": { "border-style": "solid" }, ".border-dashed": { "border-style": "dashed" }, ".border-dotted": { "border-style": "dotted" }, ".border-double": { "border-style": "double" }, ".border-hidden": { "border-style": "hidden" }, ".border-none": { "border-style": "none" } });
      }, borderColor: ({ matchUtilities: e, theme: t, corePlugins: r2 }) => {
        e({ border: (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-color", variable: "--tw-border-opacity" }) : { "border-color": se(n) } }, { values: (({ DEFAULT: n, ...o2 }) => o2)(ye(t("borderColor"))), type: ["color", "any"] }), e({ "border-x": (n) => r2("borderOpacity") ? Oe({ color: n, property: ["border-left-color", "border-right-color"], variable: "--tw-border-opacity" }) : { "border-left-color": se(n), "border-right-color": se(n) }, "border-y": (n) => r2("borderOpacity") ? Oe({ color: n, property: ["border-top-color", "border-bottom-color"], variable: "--tw-border-opacity" }) : { "border-top-color": se(n), "border-bottom-color": se(n) } }, { values: (({ DEFAULT: n, ...o2 }) => o2)(ye(t("borderColor"))), type: ["color", "any"] }), e({ "border-s": (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-inline-start-color", variable: "--tw-border-opacity" }) : { "border-inline-start-color": se(n) }, "border-e": (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-inline-end-color", variable: "--tw-border-opacity" }) : { "border-inline-end-color": se(n) }, "border-t": (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-top-color", variable: "--tw-border-opacity" }) : { "border-top-color": se(n) }, "border-r": (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-right-color", variable: "--tw-border-opacity" }) : { "border-right-color": se(n) }, "border-b": (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-bottom-color", variable: "--tw-border-opacity" }) : { "border-bottom-color": se(n) }, "border-l": (n) => r2("borderOpacity") ? Oe({ color: n, property: "border-left-color", variable: "--tw-border-opacity" }) : { "border-left-color": se(n) } }, { values: (({ DEFAULT: n, ...o2 }) => o2)(ye(t("borderColor"))), type: ["color", "any"] });
      }, borderOpacity: z("borderOpacity", [["border-opacity", ["--tw-border-opacity"]]]), backgroundColor: ({ matchUtilities: e, theme: t, corePlugins: r2 }) => {
        e({ bg: (n) => r2("backgroundOpacity") ? Oe({ color: n, property: "background-color", variable: "--tw-bg-opacity" }) : { "background-color": se(n) } }, { values: ye(t("backgroundColor")), type: ["color", "any"] });
      }, backgroundOpacity: z("backgroundOpacity", [["bg-opacity", ["--tw-bg-opacity"]]]), backgroundImage: z("backgroundImage", [["bg", ["background-image"]]], { type: ["lookup", "image", "url"] }), gradientColorStops: /* @__PURE__ */ (() => {
        function e(t) {
          return wt(t, 0, "rgb(255 255 255 / 0)");
        }
        return function({ matchUtilities: t, theme: r2, addDefaults: n }) {
          n("gradient-color-stops", { "--tw-gradient-from-position": " ", "--tw-gradient-via-position": " ", "--tw-gradient-to-position": " " });
          let o2 = { values: ye(r2("gradientColorStops")), type: ["color", "any"] }, s2 = { values: r2("gradientColorStopPositions"), type: ["length", "percentage"] };
          t({ from: (a) => {
            let l = e(a);
            return { "@defaults gradient-color-stops": {}, "--tw-gradient-from": `${se(a)} var(--tw-gradient-from-position)`, "--tw-gradient-to": `${l} var(--tw-gradient-to-position)`, "--tw-gradient-stops": "var(--tw-gradient-from), var(--tw-gradient-to)" };
          } }, o2), t({ from: (a) => ({ "--tw-gradient-from-position": a }) }, s2), t({ via: (a) => {
            let l = e(a);
            return { "@defaults gradient-color-stops": {}, "--tw-gradient-to": `${l}  var(--tw-gradient-to-position)`, "--tw-gradient-stops": `var(--tw-gradient-from), ${se(a)} var(--tw-gradient-via-position), var(--tw-gradient-to)` };
          } }, o2), t({ via: (a) => ({ "--tw-gradient-via-position": a }) }, s2), t({ to: (a) => ({ "@defaults gradient-color-stops": {}, "--tw-gradient-to": `${se(a)} var(--tw-gradient-to-position)` }) }, o2), t({ to: (a) => ({ "--tw-gradient-to-position": a }) }, s2);
        };
      })(), boxDecorationBreak: ({ addUtilities: e }) => {
        e({ ".decoration-slice": { "box-decoration-break": "slice" }, ".decoration-clone": { "box-decoration-break": "clone" }, ".box-decoration-slice": { "box-decoration-break": "slice" }, ".box-decoration-clone": { "box-decoration-break": "clone" } });
      }, backgroundSize: z("backgroundSize", [["bg", ["background-size"]]], { type: ["lookup", "length", "percentage", "size"] }), backgroundAttachment: ({ addUtilities: e }) => {
        e({ ".bg-fixed": { "background-attachment": "fixed" }, ".bg-local": { "background-attachment": "local" }, ".bg-scroll": { "background-attachment": "scroll" } });
      }, backgroundClip: ({ addUtilities: e }) => {
        e({ ".bg-clip-border": { "background-clip": "border-box" }, ".bg-clip-padding": { "background-clip": "padding-box" }, ".bg-clip-content": { "background-clip": "content-box" }, ".bg-clip-text": { "background-clip": "text" } });
      }, backgroundPosition: z("backgroundPosition", [["bg", ["background-position"]]], { type: ["lookup", ["position", { preferOnConflict: true }]] }), backgroundRepeat: ({ addUtilities: e }) => {
        e({ ".bg-repeat": { "background-repeat": "repeat" }, ".bg-no-repeat": { "background-repeat": "no-repeat" }, ".bg-repeat-x": { "background-repeat": "repeat-x" }, ".bg-repeat-y": { "background-repeat": "repeat-y" }, ".bg-repeat-round": { "background-repeat": "round" }, ".bg-repeat-space": { "background-repeat": "space" } });
      }, backgroundOrigin: ({ addUtilities: e }) => {
        e({ ".bg-origin-border": { "background-origin": "border-box" }, ".bg-origin-padding": { "background-origin": "padding-box" }, ".bg-origin-content": { "background-origin": "content-box" } });
      }, fill: ({ matchUtilities: e, theme: t }) => {
        e({ fill: (r2) => ({ fill: se(r2) }) }, { values: ye(t("fill")), type: ["color", "any"] });
      }, stroke: ({ matchUtilities: e, theme: t }) => {
        e({ stroke: (r2) => ({ stroke: se(r2) }) }, { values: ye(t("stroke")), type: ["color", "url", "any"] });
      }, strokeWidth: z("strokeWidth", [["stroke", ["stroke-width"]]], { type: ["length", "number", "percentage"] }), objectFit: ({ addUtilities: e }) => {
        e({ ".object-contain": { "object-fit": "contain" }, ".object-cover": { "object-fit": "cover" }, ".object-fill": { "object-fit": "fill" }, ".object-none": { "object-fit": "none" }, ".object-scale-down": { "object-fit": "scale-down" } });
      }, objectPosition: z("objectPosition", [["object", ["object-position"]]]), padding: z("padding", [["p", ["padding"]], [["px", ["padding-left", "padding-right"]], ["py", ["padding-top", "padding-bottom"]]], [["ps", ["padding-inline-start"]], ["pe", ["padding-inline-end"]], ["pt", ["padding-top"]], ["pr", ["padding-right"]], ["pb", ["padding-bottom"]], ["pl", ["padding-left"]]]]), textAlign: ({ addUtilities: e }) => {
        e({ ".text-left": { "text-align": "left" }, ".text-center": { "text-align": "center" }, ".text-right": { "text-align": "right" }, ".text-justify": { "text-align": "justify" }, ".text-start": { "text-align": "start" }, ".text-end": { "text-align": "end" } });
      }, textIndent: z("textIndent", [["indent", ["text-indent"]]], { supportsNegativeValues: true }), verticalAlign: ({ addUtilities: e, matchUtilities: t }) => {
        e({ ".align-baseline": { "vertical-align": "baseline" }, ".align-top": { "vertical-align": "top" }, ".align-middle": { "vertical-align": "middle" }, ".align-bottom": { "vertical-align": "bottom" }, ".align-text-top": { "vertical-align": "text-top" }, ".align-text-bottom": { "vertical-align": "text-bottom" }, ".align-sub": { "vertical-align": "sub" }, ".align-super": { "vertical-align": "super" } }), t({ align: (r2) => ({ "vertical-align": r2 }) });
      }, fontFamily: ({ matchUtilities: e, theme: t }) => {
        e({ font: (r2) => {
          let [n, o2 = {}] = Array.isArray(r2) && Le(r2[1]) ? r2 : [r2], { fontFeatureSettings: s2, fontVariationSettings: a } = o2;
          return { "font-family": Array.isArray(n) ? n.join(", ") : n, ...s2 === void 0 ? {} : { "font-feature-settings": s2 }, ...a === void 0 ? {} : { "font-variation-settings": a } };
        } }, { values: t("fontFamily"), type: ["lookup", "generic-name", "family-name"] });
      }, fontSize: ({ matchUtilities: e, theme: t }) => {
        e({ text: (r2, { modifier: n }) => {
          let [o2, s2] = Array.isArray(r2) ? r2 : [r2];
          if (n) return { "font-size": o2, "line-height": n };
          let { lineHeight: a, letterSpacing: l, fontWeight: c2 } = Le(s2) ? s2 : { lineHeight: s2 };
          return { "font-size": o2, ...a === void 0 ? {} : { "line-height": a }, ...l === void 0 ? {} : { "letter-spacing": l }, ...c2 === void 0 ? {} : { "font-weight": c2 } };
        } }, { values: t("fontSize"), modifiers: t("lineHeight"), type: ["absolute-size", "relative-size", "length", "percentage"] });
      }, fontWeight: z("fontWeight", [["font", ["fontWeight"]]], { type: ["lookup", "number", "any"] }), textTransform: ({ addUtilities: e }) => {
        e({ ".uppercase": { "text-transform": "uppercase" }, ".lowercase": { "text-transform": "lowercase" }, ".capitalize": { "text-transform": "capitalize" }, ".normal-case": { "text-transform": "none" } });
      }, fontStyle: ({ addUtilities: e }) => {
        e({ ".italic": { "font-style": "italic" }, ".not-italic": { "font-style": "normal" } });
      }, fontVariantNumeric: ({ addDefaults: e, addUtilities: t }) => {
        let r2 = "var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)";
        e("font-variant-numeric", { "--tw-ordinal": " ", "--tw-slashed-zero": " ", "--tw-numeric-figure": " ", "--tw-numeric-spacing": " ", "--tw-numeric-fraction": " " }), t({ ".normal-nums": { "font-variant-numeric": "normal" }, ".ordinal": { "@defaults font-variant-numeric": {}, "--tw-ordinal": "ordinal", "font-variant-numeric": r2 }, ".slashed-zero": { "@defaults font-variant-numeric": {}, "--tw-slashed-zero": "slashed-zero", "font-variant-numeric": r2 }, ".lining-nums": { "@defaults font-variant-numeric": {}, "--tw-numeric-figure": "lining-nums", "font-variant-numeric": r2 }, ".oldstyle-nums": { "@defaults font-variant-numeric": {}, "--tw-numeric-figure": "oldstyle-nums", "font-variant-numeric": r2 }, ".proportional-nums": { "@defaults font-variant-numeric": {}, "--tw-numeric-spacing": "proportional-nums", "font-variant-numeric": r2 }, ".tabular-nums": { "@defaults font-variant-numeric": {}, "--tw-numeric-spacing": "tabular-nums", "font-variant-numeric": r2 }, ".diagonal-fractions": { "@defaults font-variant-numeric": {}, "--tw-numeric-fraction": "diagonal-fractions", "font-variant-numeric": r2 }, ".stacked-fractions": { "@defaults font-variant-numeric": {}, "--tw-numeric-fraction": "stacked-fractions", "font-variant-numeric": r2 } });
      }, lineHeight: z("lineHeight", [["leading", ["lineHeight"]]]), letterSpacing: z("letterSpacing", [["tracking", ["letterSpacing"]]], { supportsNegativeValues: true }), textColor: ({ matchUtilities: e, theme: t, corePlugins: r2 }) => {
        e({ text: (n) => r2("textOpacity") ? Oe({ color: n, property: "color", variable: "--tw-text-opacity" }) : { color: se(n) } }, { values: ye(t("textColor")), type: ["color", "any"] });
      }, textOpacity: z("textOpacity", [["text-opacity", ["--tw-text-opacity"]]]), textDecoration: ({ addUtilities: e }) => {
        e({ ".underline": { "text-decoration-line": "underline" }, ".overline": { "text-decoration-line": "overline" }, ".line-through": { "text-decoration-line": "line-through" }, ".no-underline": { "text-decoration-line": "none" } });
      }, textDecorationColor: ({ matchUtilities: e, theme: t }) => {
        e({ decoration: (r2) => ({ "text-decoration-color": se(r2) }) }, { values: ye(t("textDecorationColor")), type: ["color", "any"] });
      }, textDecorationStyle: ({ addUtilities: e }) => {
        e({ ".decoration-solid": { "text-decoration-style": "solid" }, ".decoration-double": { "text-decoration-style": "double" }, ".decoration-dotted": { "text-decoration-style": "dotted" }, ".decoration-dashed": { "text-decoration-style": "dashed" }, ".decoration-wavy": { "text-decoration-style": "wavy" } });
      }, textDecorationThickness: z("textDecorationThickness", [["decoration", ["text-decoration-thickness"]]], { type: ["length", "percentage"] }), textUnderlineOffset: z("textUnderlineOffset", [["underline-offset", ["text-underline-offset"]]], { type: ["length", "percentage", "any"] }), fontSmoothing: ({ addUtilities: e }) => {
        e({ ".antialiased": { "-webkit-font-smoothing": "antialiased", "-moz-osx-font-smoothing": "grayscale" }, ".subpixel-antialiased": { "-webkit-font-smoothing": "auto", "-moz-osx-font-smoothing": "auto" } });
      }, placeholderColor: ({ matchUtilities: e, theme: t, corePlugins: r2 }) => {
        e({ placeholder: (n) => r2("placeholderOpacity") ? { "&::placeholder": Oe({ color: n, property: "color", variable: "--tw-placeholder-opacity" }) } : { "&::placeholder": { color: se(n) } } }, { values: ye(t("placeholderColor")), type: ["color", "any"] });
      }, placeholderOpacity: ({ matchUtilities: e, theme: t }) => {
        e({ "placeholder-opacity": (r2) => ({ "&::placeholder": { "--tw-placeholder-opacity": r2 } }) }, { values: t("placeholderOpacity") });
      }, caretColor: ({ matchUtilities: e, theme: t }) => {
        e({ caret: (r2) => ({ "caret-color": se(r2) }) }, { values: ye(t("caretColor")), type: ["color", "any"] });
      }, accentColor: ({ matchUtilities: e, theme: t }) => {
        e({ accent: (r2) => ({ "accent-color": se(r2) }) }, { values: ye(t("accentColor")), type: ["color", "any"] });
      }, opacity: z("opacity", [["opacity", ["opacity"]]]), backgroundBlendMode: ({ addUtilities: e }) => {
        e({ ".bg-blend-normal": { "background-blend-mode": "normal" }, ".bg-blend-multiply": { "background-blend-mode": "multiply" }, ".bg-blend-screen": { "background-blend-mode": "screen" }, ".bg-blend-overlay": { "background-blend-mode": "overlay" }, ".bg-blend-darken": { "background-blend-mode": "darken" }, ".bg-blend-lighten": { "background-blend-mode": "lighten" }, ".bg-blend-color-dodge": { "background-blend-mode": "color-dodge" }, ".bg-blend-color-burn": { "background-blend-mode": "color-burn" }, ".bg-blend-hard-light": { "background-blend-mode": "hard-light" }, ".bg-blend-soft-light": { "background-blend-mode": "soft-light" }, ".bg-blend-difference": { "background-blend-mode": "difference" }, ".bg-blend-exclusion": { "background-blend-mode": "exclusion" }, ".bg-blend-hue": { "background-blend-mode": "hue" }, ".bg-blend-saturation": { "background-blend-mode": "saturation" }, ".bg-blend-color": { "background-blend-mode": "color" }, ".bg-blend-luminosity": { "background-blend-mode": "luminosity" } });
      }, mixBlendMode: ({ addUtilities: e }) => {
        e({ ".mix-blend-normal": { "mix-blend-mode": "normal" }, ".mix-blend-multiply": { "mix-blend-mode": "multiply" }, ".mix-blend-screen": { "mix-blend-mode": "screen" }, ".mix-blend-overlay": { "mix-blend-mode": "overlay" }, ".mix-blend-darken": { "mix-blend-mode": "darken" }, ".mix-blend-lighten": { "mix-blend-mode": "lighten" }, ".mix-blend-color-dodge": { "mix-blend-mode": "color-dodge" }, ".mix-blend-color-burn": { "mix-blend-mode": "color-burn" }, ".mix-blend-hard-light": { "mix-blend-mode": "hard-light" }, ".mix-blend-soft-light": { "mix-blend-mode": "soft-light" }, ".mix-blend-difference": { "mix-blend-mode": "difference" }, ".mix-blend-exclusion": { "mix-blend-mode": "exclusion" }, ".mix-blend-hue": { "mix-blend-mode": "hue" }, ".mix-blend-saturation": { "mix-blend-mode": "saturation" }, ".mix-blend-color": { "mix-blend-mode": "color" }, ".mix-blend-luminosity": { "mix-blend-mode": "luminosity" }, ".mix-blend-plus-darker": { "mix-blend-mode": "plus-darker" }, ".mix-blend-plus-lighter": { "mix-blend-mode": "plus-lighter" } });
      }, boxShadow: (() => {
        let e = ir("boxShadow"), t = ["var(--tw-ring-offset-shadow, 0 0 #0000)", "var(--tw-ring-shadow, 0 0 #0000)", "var(--tw-shadow)"].join(", ");
        return function({ matchUtilities: r2, addDefaults: n, theme: o2 }) {
          n("box-shadow", { "--tw-ring-offset-shadow": "0 0 #0000", "--tw-ring-shadow": "0 0 #0000", "--tw-shadow": "0 0 #0000", "--tw-shadow-colored": "0 0 #0000" }), r2({ shadow: (s2) => {
            s2 = e(s2);
            let a = Bo(s2);
            for (let l of a) !l.valid || (l.color = "var(--tw-shadow-color)");
            return { "@defaults box-shadow": {}, "--tw-shadow": s2 === "none" ? "0 0 #0000" : s2, "--tw-shadow-colored": s2 === "none" ? "0 0 #0000" : Yi(a), "box-shadow": t };
          } }, { values: o2("boxShadow"), type: ["shadow"] });
        };
      })(), boxShadowColor: ({ matchUtilities: e, theme: t }) => {
        e({ shadow: (r2) => ({ "--tw-shadow-color": se(r2), "--tw-shadow": "var(--tw-shadow-colored)" }) }, { values: ye(t("boxShadowColor")), type: ["color", "any"] });
      }, outlineStyle: ({ addUtilities: e }) => {
        e({ ".outline-none": { outline: "2px solid transparent", "outline-offset": "2px" }, ".outline": { "outline-style": "solid" }, ".outline-dashed": { "outline-style": "dashed" }, ".outline-dotted": { "outline-style": "dotted" }, ".outline-double": { "outline-style": "double" } });
      }, outlineWidth: z("outlineWidth", [["outline", ["outline-width"]]], { type: ["length", "number", "percentage"] }), outlineOffset: z("outlineOffset", [["outline-offset", ["outline-offset"]]], { type: ["length", "number", "percentage", "any"], supportsNegativeValues: true }), outlineColor: ({ matchUtilities: e, theme: t }) => {
        e({ outline: (r2) => ({ "outline-color": se(r2) }) }, { values: ye(t("outlineColor")), type: ["color", "any"] });
      }, ringWidth: ({ matchUtilities: e, addDefaults: t, addUtilities: r2, theme: n, config: o2 }) => {
        let s2 = (() => {
          if (De(o2(), "respectDefaultRingColorOpacity")) return n("ringColor.DEFAULT");
          let a = n("ringOpacity.DEFAULT", "0.5");
          return n("ringColor")?.DEFAULT ? wt(n("ringColor")?.DEFAULT, a, `rgb(147 197 253 / ${a})`) : `rgb(147 197 253 / ${a})`;
        })();
        t("ring-width", { "--tw-ring-inset": " ", "--tw-ring-offset-width": n("ringOffsetWidth.DEFAULT", "0px"), "--tw-ring-offset-color": n("ringOffsetColor.DEFAULT", "#fff"), "--tw-ring-color": s2, "--tw-ring-offset-shadow": "0 0 #0000", "--tw-ring-shadow": "0 0 #0000", "--tw-shadow": "0 0 #0000", "--tw-shadow-colored": "0 0 #0000" }), e({ ring: (a) => ({ "@defaults ring-width": {}, "--tw-ring-offset-shadow": "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)", "--tw-ring-shadow": `var(--tw-ring-inset) 0 0 0 calc(${a} + var(--tw-ring-offset-width)) var(--tw-ring-color)`, "box-shadow": ["var(--tw-ring-offset-shadow)", "var(--tw-ring-shadow)", "var(--tw-shadow, 0 0 #0000)"].join(", ") }) }, { values: n("ringWidth"), type: "length" }), r2({ ".ring-inset": { "@defaults ring-width": {}, "--tw-ring-inset": "inset" } });
      }, ringColor: ({ matchUtilities: e, theme: t, corePlugins: r2 }) => {
        e({ ring: (n) => r2("ringOpacity") ? Oe({ color: n, property: "--tw-ring-color", variable: "--tw-ring-opacity" }) : { "--tw-ring-color": se(n) } }, { values: Object.fromEntries(Object.entries(ye(t("ringColor"))).filter(([n]) => n !== "DEFAULT")), type: ["color", "any"] });
      }, ringOpacity: (e) => {
        let { config: t } = e;
        return z("ringOpacity", [["ring-opacity", ["--tw-ring-opacity"]]], { filterDefault: !De(t(), "respectDefaultRingColorOpacity") })(e);
      }, ringOffsetWidth: z("ringOffsetWidth", [["ring-offset", ["--tw-ring-offset-width"]]], { type: "length" }), ringOffsetColor: ({ matchUtilities: e, theme: t }) => {
        e({ "ring-offset": (r2) => ({ "--tw-ring-offset-color": se(r2) }) }, { values: ye(t("ringOffsetColor")), type: ["color", "any"] });
      }, blur: ({ matchUtilities: e, theme: t }) => {
        e({ blur: (r2) => ({ "--tw-blur": r2.trim() === "" ? " " : `blur(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("blur") });
      }, brightness: ({ matchUtilities: e, theme: t }) => {
        e({ brightness: (r2) => ({ "--tw-brightness": `brightness(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("brightness") });
      }, contrast: ({ matchUtilities: e, theme: t }) => {
        e({ contrast: (r2) => ({ "--tw-contrast": `contrast(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("contrast") });
      }, dropShadow: ({ matchUtilities: e, theme: t }) => {
        e({ "drop-shadow": (r2) => ({ "--tw-drop-shadow": Array.isArray(r2) ? r2.map((n) => `drop-shadow(${n})`).join(" ") : `drop-shadow(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("dropShadow") });
      }, grayscale: ({ matchUtilities: e, theme: t }) => {
        e({ grayscale: (r2) => ({ "--tw-grayscale": `grayscale(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("grayscale") });
      }, hueRotate: ({ matchUtilities: e, theme: t }) => {
        e({ "hue-rotate": (r2) => ({ "--tw-hue-rotate": `hue-rotate(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("hueRotate"), supportsNegativeValues: true });
      }, invert: ({ matchUtilities: e, theme: t }) => {
        e({ invert: (r2) => ({ "--tw-invert": `invert(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("invert") });
      }, saturate: ({ matchUtilities: e, theme: t }) => {
        e({ saturate: (r2) => ({ "--tw-saturate": `saturate(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("saturate") });
      }, sepia: ({ matchUtilities: e, theme: t }) => {
        e({ sepia: (r2) => ({ "--tw-sepia": `sepia(${r2})`, "@defaults filter": {}, filter: Ne }) }, { values: t("sepia") });
      }, filter: ({ addDefaults: e, addUtilities: t }) => {
        e("filter", { "--tw-blur": " ", "--tw-brightness": " ", "--tw-contrast": " ", "--tw-grayscale": " ", "--tw-hue-rotate": " ", "--tw-invert": " ", "--tw-saturate": " ", "--tw-sepia": " ", "--tw-drop-shadow": " " }), t({ ".filter": { "@defaults filter": {}, filter: Ne }, ".filter-none": { filter: "none" } });
      }, backdropBlur: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-blur": (r2) => ({ "--tw-backdrop-blur": r2.trim() === "" ? " " : `blur(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropBlur") });
      }, backdropBrightness: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-brightness": (r2) => ({ "--tw-backdrop-brightness": `brightness(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropBrightness") });
      }, backdropContrast: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-contrast": (r2) => ({ "--tw-backdrop-contrast": `contrast(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropContrast") });
      }, backdropGrayscale: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-grayscale": (r2) => ({ "--tw-backdrop-grayscale": `grayscale(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropGrayscale") });
      }, backdropHueRotate: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-hue-rotate": (r2) => ({ "--tw-backdrop-hue-rotate": `hue-rotate(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropHueRotate"), supportsNegativeValues: true });
      }, backdropInvert: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-invert": (r2) => ({ "--tw-backdrop-invert": `invert(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropInvert") });
      }, backdropOpacity: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-opacity": (r2) => ({ "--tw-backdrop-opacity": `opacity(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropOpacity") });
      }, backdropSaturate: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-saturate": (r2) => ({ "--tw-backdrop-saturate": `saturate(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropSaturate") });
      }, backdropSepia: ({ matchUtilities: e, theme: t }) => {
        e({ "backdrop-sepia": (r2) => ({ "--tw-backdrop-sepia": `sepia(${r2})`, "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }) }, { values: t("backdropSepia") });
      }, backdropFilter: ({ addDefaults: e, addUtilities: t }) => {
        e("backdrop-filter", { "--tw-backdrop-blur": " ", "--tw-backdrop-brightness": " ", "--tw-backdrop-contrast": " ", "--tw-backdrop-grayscale": " ", "--tw-backdrop-hue-rotate": " ", "--tw-backdrop-invert": " ", "--tw-backdrop-opacity": " ", "--tw-backdrop-saturate": " ", "--tw-backdrop-sepia": " " }), t({ ".backdrop-filter": { "@defaults backdrop-filter": {}, "-webkit-backdrop-filter": me, "backdrop-filter": me }, ".backdrop-filter-none": { "-webkit-backdrop-filter": "none", "backdrop-filter": "none" } });
      }, transitionProperty: ({ matchUtilities: e, theme: t }) => {
        let r2 = t("transitionTimingFunction.DEFAULT"), n = t("transitionDuration.DEFAULT");
        e({ transition: (o2) => ({ "transition-property": o2, ...o2 === "none" ? {} : { "transition-timing-function": r2, "transition-duration": n } }) }, { values: t("transitionProperty") });
      }, transitionDelay: z("transitionDelay", [["delay", ["transitionDelay"]]]), transitionDuration: z("transitionDuration", [["duration", ["transitionDuration"]]], { filterDefault: true }), transitionTimingFunction: z("transitionTimingFunction", [["ease", ["transitionTimingFunction"]]], { filterDefault: true }), willChange: z("willChange", [["will-change", ["will-change"]]]), contain: ({ addDefaults: e, addUtilities: t }) => {
        let r2 = "var(--tw-contain-size) var(--tw-contain-layout) var(--tw-contain-paint) var(--tw-contain-style)";
        e("contain", { "--tw-contain-size": " ", "--tw-contain-layout": " ", "--tw-contain-paint": " ", "--tw-contain-style": " " }), t({ ".contain-none": { contain: "none" }, ".contain-content": { contain: "content" }, ".contain-strict": { contain: "strict" }, ".contain-size": { "@defaults contain": {}, "--tw-contain-size": "size", contain: r2 }, ".contain-inline-size": { "@defaults contain": {}, "--tw-contain-size": "inline-size", contain: r2 }, ".contain-layout": { "@defaults contain": {}, "--tw-contain-layout": "layout", contain: r2 }, ".contain-paint": { "@defaults contain": {}, "--tw-contain-paint": "paint", contain: r2 }, ".contain-style": { "@defaults contain": {}, "--tw-contain-style": "style", contain: r2 } });
      }, content: z("content", [["content", ["--tw-content", ["content", "var(--tw-content)"]]]]), forcedColorAdjust: ({ addUtilities: e }) => {
        e({ ".forced-color-adjust-auto": { "forced-color-adjust": "auto" }, ".forced-color-adjust-none": { "forced-color-adjust": "none" } });
      } };
    });
    function $c(e) {
      if (e === void 0) return false;
      if (e === "true" || e === "1") return true;
      if (e === "false" || e === "0") return false;
      if (e === "*") return true;
      let t = e.split(",").map((r2) => r2.split(":")[0]);
      return t.includes("-tailwindcss") ? false : !!t.includes("tailwindcss");
    }
    var it, na, oa, Sn, Cn, dt, dr, pt = $(() => {
      O2(), it = typeof je < "u" ? { NODE_ENV: "production", DEBUG: $c(je.env.DEBUG) } : { NODE_ENV: "production", DEBUG: false }, na = /* @__PURE__ */ new Map(), oa = /* @__PURE__ */ new Map(), Sn = /* @__PURE__ */ new Map(), Cn = /* @__PURE__ */ new Map(), dt = new String("*"), dr = Symbol("__NONE__");
    });
    function An(e) {
      let t = [], r2 = false;
      for (let n = 0; n < e.length; n++) {
        let o2 = e[n];
        if (o2 === ":" && !r2 && t.length === 0) return false;
        if (sa.has(o2) && e[n - 1] !== "\\" && (r2 = !r2), !r2 && e[n - 1] !== "\\") {
          if (On.has(o2)) t.push(o2);
          else if (_n.has(o2)) {
            let s2 = _n.get(o2);
            if (t.length <= 0 || t.pop() !== s2) return false;
          }
        }
      }
      return !(t.length > 0);
    }
    var On, _n, sa, aa = $(() => {
      O2(), On = /* @__PURE__ */ new Map([["{", "}"], ["[", "]"], ["(", ")"]]), _n = new Map(Array.from(On.entries()).map(([e, t]) => [t, e])), sa = /* @__PURE__ */ new Set(['"', "'", "`"]);
    });
    function En(e) {
      let [t] = ia(e);
      return t.forEach(([r2, n]) => r2.removeChild(n)), e.nodes.push(...t.map(([, r2]) => r2)), e;
    }
    function ia(e) {
      let t = [], r2 = null;
      for (let n of e.nodes) if (n.type === "combinator") t = t.filter(([, o2]) => Tn(o2).includes("jumpable")), r2 = null;
      else if (n.type === "pseudo") {
        Rc(n) ? (r2 = n, t.push([e, n, null])) : r2 && Mc(n, r2) ? t.push([e, n, r2]) : r2 = null;
        for (let o2 of n.nodes ?? []) {
          let [s2, a] = ia(o2);
          r2 = a || r2, t.push(...s2);
        }
      }
      return [t, r2];
    }
    function la(e) {
      return e.value.startsWith("::") || pr[e.value] !== void 0;
    }
    function Rc(e) {
      return la(e) && Tn(e).includes("terminal");
    }
    function Mc(e, t) {
      return e.type !== "pseudo" || la(e) ? false : Tn(t).includes("actionable");
    }
    function Tn(e) {
      return pr[e.value] ?? pr.__default__;
    }
    var pr, In = $(() => {
      O2(), pr = { "::after": ["terminal", "jumpable"], "::backdrop": ["terminal", "jumpable"], "::before": ["terminal", "jumpable"], "::cue": ["terminal"], "::cue-region": ["terminal"], "::first-letter": ["terminal", "jumpable"], "::first-line": ["terminal", "jumpable"], "::grammar-error": ["terminal"], "::marker": ["terminal", "jumpable"], "::part": ["terminal", "actionable"], "::placeholder": ["terminal", "jumpable"], "::selection": ["terminal", "jumpable"], "::slotted": ["terminal"], "::spelling-error": ["terminal"], "::target-text": ["terminal"], "::file-selector-button": ["terminal", "actionable"], "::deep": ["actionable"], "::v-deep": ["actionable"], "::ng-deep": ["actionable"], ":after": ["terminal", "jumpable"], ":before": ["terminal", "jumpable"], ":first-letter": ["terminal", "jumpable"], ":first-line": ["terminal", "jumpable"], ":where": [], ":is": [], ":has": [], __default__: ["terminal", "actionable"] };
    });
    function fr(e, { context: t, candidate: r2 }) {
      let n = t?.tailwindConfig.prefix ?? "", o2 = e.map((a) => {
        let l = (0, Ye.default)().astSync(a.format);
        return { ...a, ast: a.respectPrefix ? hn(n, l) : l };
      }), s2 = Ye.default.root({ nodes: [Ye.default.selector({ nodes: [Ye.default.className({ value: at(r2) })] })] });
      for (let { ast: a } of o2) [s2, a] = zc(s2, a), a.walkNesting((l) => l.replaceWith(...s2.nodes[0].nodes)), s2 = a;
      return s2;
    }
    function ca(e) {
      let t = [];
      for (; e.prev() && e.prev().type !== "combinator"; ) e = e.prev();
      for (; e && e.type !== "combinator"; ) t.push(e), e = e.next();
      return t;
    }
    function Uc(e) {
      return e.sort((t, r2) => t.type === "tag" && r2.type === "class" ? -1 : t.type === "class" && r2.type === "tag" ? 1 : t.type === "class" && r2.type === "pseudo" && r2.value.startsWith("::") ? -1 : t.type === "pseudo" && t.value.startsWith("::") && r2.type === "class" ? 1 : e.index(t) - e.index(r2)), e;
    }
    function ua(e, t) {
      let r2 = false;
      e.walk((n) => {
        if (n.type === "class" && n.value === t) return r2 = true, false;
      }), r2 || e.remove();
    }
    function da(e, t, { context: r2, candidate: n, base: o2 }) {
      let s2 = r2?.tailwindConfig?.separator ?? ":";
      o2 = o2 ?? $e(n, s2).pop();
      let a = (0, Ye.default)().astSync(e);
      if (a.walkClasses((d3) => {
        d3.raws && d3.value.includes(o2) && (d3.raws.value = at((0, pa.default)(d3.raws.value)));
      }), a.each((d3) => ua(d3, o2)), a.length === 0) return null;
      let l = Array.isArray(t) ? fr(t, { context: r2, candidate: n }) : t;
      if (l === null) return a.toString();
      let c2 = Ye.default.comment({ value: "/*__simple__*/" }), i2 = Ye.default.comment({ value: "/*__simple__*/" });
      return a.walkClasses((d3) => {
        if (d3.value !== o2) return;
        let u2 = d3.parent, p2 = l.nodes[0].nodes;
        if (u2.nodes.length === 1) {
          d3.replaceWith(...p2);
          return;
        }
        let f3 = ca(d3);
        u2.insertBefore(f3[0], c2), u2.insertAfter(f3[f3.length - 1], i2);
        for (let h2 of p2) u2.insertBefore(f3[0], h2.clone());
        d3.remove(), f3 = ca(c2);
        let g3 = u2.index(c2);
        u2.nodes.splice(g3, f3.length, ...Uc(Ye.default.selector({ nodes: f3 })).nodes), c2.remove(), i2.remove();
      }), a.walkPseudos((d3) => {
        d3.value === hr && d3.replaceWith(d3.nodes);
      }), a.each((d3) => En(d3)), a.toString();
    }
    function zc(e, t) {
      let r2 = [];
      return e.walkPseudos((n) => {
        n.value === hr && r2.push({ pseudo: n, value: n.nodes[0].toString() });
      }), t.walkPseudos((n) => {
        if (n.value !== hr) return;
        let o2 = n.nodes[0].toString(), s2 = r2.find((i2) => i2.value === o2);
        if (!s2) return;
        let a = [], l = n.next();
        for (; l && l.type !== "combinator"; ) a.push(l), l = l.next();
        let c2 = l;
        s2.pseudo.parent.insertAfter(s2.pseudo, Ye.default.selector({ nodes: a.map((i2) => i2.clone()) })), n.remove(), a.forEach((i2) => i2.remove()), c2 && c2.type === "combinator" && c2.remove();
      }), [e, t];
    }
    var Ye, pa, hr, fa = $(() => {
      O2(), Ye = he(Ke()), pa = he(ln()), Ut(), mn(), In(), xt(), hr = ":merge";
    });
    function ha(e, t) {
      let r2 = (0, Pn.default)().astSync(e);
      return r2.each((n) => {
        n.nodes[0].type === "pseudo" && n.nodes[0].value === ":is" && n.nodes.every((o2) => o2.type !== "combinator") || (n.nodes = [Pn.default.pseudo({ value: ":is", nodes: [n.clone()] })]), En(n);
      }), `${t} ${r2.toString()}`;
    }
    var Pn, ma = $(() => {
      O2(), Pn = he(Ke()), In();
    });
    function ga(e) {
      return xa.transformSync(e);
    }
    function* Fc(e) {
      let t = 1 / 0;
      for (; t >= 0; ) {
        let r2, n = false;
        if (t === 1 / 0 && e.endsWith("]")) {
          let a = e.indexOf("[");
          e[a - 1] === "-" ? r2 = a - 1 : e[a - 1] === "/" ? (r2 = a - 1, n = true) : r2 = -1;
        } else t === 1 / 0 && e.includes("/") ? (r2 = e.lastIndexOf("/"), n = true) : r2 = e.lastIndexOf("-", t);
        if (r2 < 0) break;
        let o2 = e.slice(0, r2), s2 = e.slice(n ? r2 : r2 + 1);
        t = r2 - 1, !(o2 === "" || s2 === "/") && (yield [o2, s2]);
      }
    }
    function Lc(e, t) {
      if (e.length === 0 || t.tailwindConfig.prefix === "") return e;
      for (let r2 of e) {
        let [n] = r2;
        if (n.options.respectPrefix) {
          let o2 = fe.root({ nodes: [r2[1].clone()] }), s2 = r2[1].raws.tailwind.classCandidate;
          o2.walkRules((a) => {
            let l = s2.startsWith("-");
            a.selector = hn(t.tailwindConfig.prefix, a.selector, l);
          }), r2[1] = o2.nodes[0];
        }
      }
      return e;
    }
    function Nc(e, t) {
      if (e.length === 0) return e;
      let r2 = [];
      function n(o2) {
        return o2.parent && o2.parent.type === "atrule" && o2.parent.name === "keyframes";
      }
      for (let [o2, s2] of e) {
        let a = fe.root({ nodes: [s2.clone()] });
        a.walkRules((l) => {
          if (n(l)) return;
          let c2 = (0, gr.default)().astSync(l.selector);
          c2.each((i2) => ua(i2, t)), il(c2, (i2) => i2 === t ? `!${i2}` : i2), l.selector = c2.toString(), l.walkDecls((i2) => i2.important = true);
        }), r2.push([{ ...o2, important: true }, a.nodes[0]]);
      }
      return r2;
    }
    function Vc(e, t, r2) {
      if (t.length === 0) return t;
      let n = { modifier: null, value: dr };
      {
        let [o2, ...s2] = $e(e, "/");
        if (s2.length > 1 && (o2 = o2 + "/" + s2.slice(0, -1).join("/"), s2 = s2.slice(-1)), s2.length && !r2.variantMap.has(e) && (e = o2, n.modifier = s2[0], !De(r2.tailwindConfig, "generalizedModifiers"))) return [];
      }
      if (e.endsWith("]") && !e.startsWith("[")) {
        let o2 = /(.)(-?)\[(.*)\]/g.exec(e);
        if (o2) {
          let [, s2, a, l] = o2;
          if (s2 === "@" && a === "-") return [];
          if (s2 !== "@" && a === "") return [];
          e = e.replace(`${a}[${l}]`, ""), n.value = l;
        }
      }
      if (Bn(e) && !r2.variantMap.has(e)) {
        let o2 = r2.offsets.recordVariant(e), s2 = oe(e.slice(1, -1)), a = $e(s2, ",");
        if (a.length > 1) return [];
        if (!a.every(Rn)) return [];
        let l = a.map((c2, i2) => [r2.offsets.applyParallelOffset(o2, i2), yr(c2.trim())]);
        r2.variantMap.set(e, l);
      }
      if (r2.variantMap.has(e)) {
        let o2 = Bn(e), s2 = r2.variantOptions.get(e)?.[ft] ?? {}, a = r2.variantMap.get(e).slice(), l = [], c2 = !(o2 || s2.respectPrefix === false);
        for (let [i2, d3] of t) {
          if (i2.layer === "user") continue;
          let u2 = fe.root({ nodes: [d3.clone()] });
          for (let [p2, f3, g3] of a) {
            let h2 = function() {
              y3.raws.neededBackup || (y3.raws.neededBackup = true, y3.walkRules((w2) => w2.raws.originalSelector = w2.selector));
            }, m3 = function(w2) {
              return h2(), y3.each((b2) => {
                b2.type === "rule" && (b2.selectors = b2.selectors.map((C) => w2({ get className() {
                  return ga(C);
                }, selector: C })));
              }), y3;
            }, y3 = (g3 ?? u2).clone(), v2 = [], x2 = f3({ get container() {
              return h2(), y3;
            }, separator: r2.tailwindConfig.separator, modifySelectors: m3, wrap(w2) {
              let b2 = y3.nodes;
              y3.removeAll(), w2.append(b2), y3.append(w2);
            }, format(w2) {
              v2.push({ format: w2, respectPrefix: c2 });
            }, args: n });
            if (Array.isArray(x2)) {
              for (let [w2, b2] of x2.entries()) a.push([r2.offsets.applyParallelOffset(p2, w2), b2, y3.clone()]);
              continue;
            }
            if (typeof x2 == "string" && v2.push({ format: x2, respectPrefix: c2 }), x2 === null) continue;
            y3.raws.neededBackup && (delete y3.raws.neededBackup, y3.walkRules((w2) => {
              let b2 = w2.raws.originalSelector;
              if (!b2 || (delete w2.raws.originalSelector, b2 === w2.selector)) return;
              let C = w2.selector, S = (0, gr.default)((E) => {
                E.walkClasses((A2) => {
                  A2.value = `${e}${r2.tailwindConfig.separator}${A2.value}`;
                });
              }).processSync(b2);
              v2.push({ format: C.replace(S, "&"), respectPrefix: c2 }), w2.selector = b2;
            })), y3.nodes[0].raws.tailwind = { ...y3.nodes[0].raws.tailwind, parentLayer: i2.layer };
            let k = [{ ...i2, sort: r2.offsets.applyVariantOffset(i2.sort, p2, Object.assign(n, r2.variantOptions.get(e))), collectedFormats: (i2.collectedFormats ?? []).concat(v2) }, y3.nodes[0]];
            l.push(k);
          }
        }
        return l;
      }
      return [];
    }
    function jn(e, t, r2 = {}) {
      return !Le(e) && !Array.isArray(e) ? [[e], r2] : Array.isArray(e) ? jn(e[0], t, e[1]) : (t.has(e) || t.set(e, fn(e)), [t.get(e), r2]);
    }
    function Wc(e) {
      return ka.test(e);
    }
    function qc(e) {
      if (!e.includes("://")) return false;
      try {
        let t = new URL(e);
        return t.scheme !== "" && t.host !== "";
      } catch {
        return false;
      }
    }
    function va(e) {
      let t = true;
      return e.walkDecls((r2) => {
        if (!ya(r2.prop, r2.value)) return t = false, false;
      }), t;
    }
    function ya(e, t) {
      if (qc(`${e}:${t}`)) return false;
      try {
        return fe.parse(`a{${e}:${t}}`).toResult(), true;
      } catch {
        return false;
      }
    }
    function Gc(e, t) {
      let [, r2, n] = e.match(/^\[([a-zA-Z0-9-_]+):(\S+)\]$/) ?? [];
      if (n === void 0 || !Wc(r2) || !An(n)) return null;
      let o2 = oe(n, { property: r2 });
      return ya(r2, o2) ? [[{ sort: t.offsets.arbitraryProperty(e), layer: "utilities", options: { respectImportant: true } }, () => ({ [Ns(e)]: { [r2]: o2 } })]] : null;
    }
    function* Yc(e, t) {
      t.candidateRuleMap.has(e) && (yield [t.candidateRuleMap.get(e), "DEFAULT"]), yield* function* (l) {
        l !== null && (yield [l, "DEFAULT"]);
      }(Gc(e, t));
      let r2 = e, n = false, o2 = t.tailwindConfig.prefix, s2 = o2.length, a = r2.startsWith(o2) || r2.startsWith(`-${o2}`);
      r2[s2] === "-" && a && (n = true, r2 = o2 + r2.slice(s2 + 1)), n && t.candidateRuleMap.has(r2) && (yield [t.candidateRuleMap.get(r2), "-DEFAULT"]);
      for (let [l, c2] of Fc(r2)) t.candidateRuleMap.has(l) && (yield [t.candidateRuleMap.get(l), n ? `-${c2}` : c2]);
    }
    function Hc(e, t) {
      return e === dt ? [dt] : $e(e, t);
    }
    function* Qc(e, t) {
      for (let r2 of e) r2[1].raws.tailwind = { ...r2[1].raws.tailwind, classCandidate: t, preserveSource: r2[0].options?.preserveSource ?? false }, yield r2;
    }
    function* ba(e, t) {
      let r2 = t.tailwindConfig.separator, [n, ...o2] = Hc(e, r2).reverse(), s2 = false;
      n.startsWith("!") && (s2 = true, n = n.slice(1));
      for (let a of Yc(n, t)) {
        let l = [], c2 = /* @__PURE__ */ new Map(), [i2, d3] = a, u2 = i2.length === 1;
        for (let [p2, f3] of i2) {
          let g3 = [];
          if (typeof f3 == "function") for (let h2 of [].concat(f3(d3, { isOnlyPlugin: u2 }))) {
            let [m3, y3] = jn(h2, t.postCssNodeCache);
            for (let v2 of m3) g3.push([{ ...p2, options: { ...p2.options, ...y3 } }, v2]);
          }
          else if (d3 === "DEFAULT" || d3 === "-DEFAULT") {
            let h2 = f3, [m3, y3] = jn(h2, t.postCssNodeCache);
            for (let v2 of m3) g3.push([{ ...p2, options: { ...p2.options, ...y3 } }, v2]);
          }
          if (g3.length > 0) {
            let h2 = Array.from(Ko(p2.options?.types ?? [], d3, p2.options ?? {}, t.tailwindConfig)).map(([m3, y3]) => y3);
            h2.length > 0 && c2.set(g3, h2), l.push(g3);
          }
        }
        if (Bn(d3)) {
          if (l.length > 1) {
            let p2 = function(m3) {
              return m3.length === 1 ? m3[0] : m3.find((y3) => {
                let v2 = c2.get(y3);
                return y3.some(([{ options: x2 }, k]) => va(k) ? x2.types.some(({ type: w2, preferOnConflict: b2 }) => v2.includes(w2) && b2) : false);
              });
            }, [f3, g3] = l.reduce((m3, y3) => (y3.some(([{ options: v2 }]) => v2.types.some(({ type: x2 }) => x2 === "any")) ? m3[0].push(y3) : m3[1].push(y3), m3), [[], []]), h2 = p2(g3) ?? p2(f3);
            if (h2) l = [h2];
            else {
              let m3 = l.map((v2) => /* @__PURE__ */ new Set([...c2.get(v2) ?? []]));
              for (let v2 of m3) for (let x2 of v2) {
                let k = false;
                for (let w2 of m3) v2 !== w2 && w2.has(x2) && (w2.delete(x2), k = true);
                k && v2.delete(x2);
              }
              let y3 = [];
              for (let [v2, x2] of m3.entries()) for (let k of x2) {
                let w2 = l[v2].map(([, b2]) => b2).flat().map((b2) => b2.toString().split(`
`).slice(1, -1).map((C) => C.trim()).map((C) => `      ${C}`).join(`
`)).join(`

`);
                y3.push(`  Use \`${e.replace("[", `[${k}:`)}\` for \`${w2.trim()}\``);
                break;
              }
              de.warn([`The class \`${e}\` is ambiguous and matches multiple utilities.`, ...y3, `If this is content and not a class, replace it with \`${e.replace("[", "&lsqb;").replace("]", "&rsqb;")}\` to silence this warning.`]);
              continue;
            }
          }
          l = l.map((p2) => p2.filter((f3) => va(f3[1])));
        }
        l = l.flat(), l = Array.from(Qc(l, n)), l = Lc(l, t), s2 && (l = Nc(l, n));
        for (let p2 of o2) l = Vc(p2, l, t);
        for (let p2 of l) p2[1].raws.tailwind = { ...p2[1].raws.tailwind, candidate: e }, p2 = Jc(p2, { context: t, candidate: e }), p2 !== null && (yield p2);
      }
    }
    function Jc(e, { context: t, candidate: r2 }) {
      if (!e[0].collectedFormats) return e;
      let n = true, o2;
      try {
        o2 = fr(e[0].collectedFormats, { context: t, candidate: r2 });
      } catch {
        return null;
      }
      let s2 = fe.root({ nodes: [e[1].clone()] });
      return s2.walkRules((a) => {
        if (!mr(a)) try {
          let l = da(a.selector, o2, { candidate: r2, context: t });
          if (l === null) {
            a.remove();
            return;
          }
          a.selector = l;
        } catch {
          return n = false, false;
        }
      }), !n || s2.nodes.length === 0 ? null : (e[1] = s2.nodes[0], e);
    }
    function mr(e) {
      return e.parent && e.parent.type === "atrule" && e.parent.name === "keyframes";
    }
    function Zc(e) {
      if (e === true) return (t) => {
        mr(t) || t.walkDecls((r2) => {
          r2.parent.type === "rule" && !mr(r2.parent) && (r2.important = true);
        });
      };
      if (typeof e == "string") return (t) => {
        mr(t) || (t.selectors = t.selectors.map((r2) => ha(r2, e)));
      };
    }
    function wa(e, t, r2 = false) {
      let n = [], o2 = Zc(t.tailwindConfig.important);
      for (let s2 of e) {
        if (t.notClassCache.has(s2)) continue;
        if (t.candidateRuleCache.has(s2)) {
          n = n.concat(Array.from(t.candidateRuleCache.get(s2)));
          continue;
        }
        let a = Array.from(ba(s2, t));
        if (a.length === 0) {
          t.notClassCache.add(s2);
          continue;
        }
        t.classCache.set(s2, a);
        let l = t.candidateRuleCache.get(s2) ?? /* @__PURE__ */ new Set();
        t.candidateRuleCache.set(s2, l);
        for (let c2 of a) {
          let [{ sort: i2, options: d3 }, u2] = c2;
          if (d3.respectImportant && o2) {
            let f3 = fe.root({ nodes: [u2.clone()] });
            f3.walkRules(o2), u2 = f3.nodes[0];
          }
          let p2 = [i2, r2 ? u2.clone() : u2];
          l.add(p2), t.ruleCache.add(p2), n.push(p2);
        }
      }
      return n;
    }
    function Bn(e) {
      return e.startsWith("[") && e.endsWith("]");
    }
    var gr, xa, ka, Dn = $(() => {
      O2(), ut(), gr = he(Ke()), zs(), Bt(), mn(), Kt(), Ge(), pt(), fa(), Ws(), Qt(), kr(), aa(), xt(), nt(), ma(), xa = (0, gr.default)((e) => e.first.filter(({ type: t }) => t === "class").pop().value), ka = /^[a-z_-]/;
    }), Sa, Xc = $(() => {
      O2(), Sa = {};
    });
    function Kc(e) {
      try {
        return Sa.createHash("md5").update(e, "utf-8").digest("binary");
      } catch {
        return "";
      }
    }
    function eu(e, t) {
      let r2 = t.toString();
      if (!r2.includes("@tailwind")) return false;
      let n = Cn.get(e), o2 = Kc(r2), s2 = n !== o2;
      return Cn.set(e, o2), s2;
    }
    var tu = $(() => {
      O2(), Xc(), pt();
    });
    function Ca(e) {
      return (e > 0n) - (e < 0n);
    }
    var ru = $(() => {
      O2();
    });
    function nu(e, t) {
      let r2 = 0n, n = 0n;
      for (let [o2, s2] of t) e & o2 && (r2 = r2 | o2, n = n | s2);
      return e & ~r2 | n;
    }
    var ou = $(() => {
      O2();
    });
    function Aa(e) {
      let t = null;
      for (let r2 of e) t = t ?? r2, t = t > r2 ? t : r2;
      return t;
    }
    function su(e, t) {
      let r2 = e.length, n = t.length, o2 = r2 < n ? r2 : n;
      for (let s2 = 0; s2 < o2; s2++) {
        let a = e.charCodeAt(s2) - t.charCodeAt(s2);
        if (a !== 0) return a;
      }
      return r2 - n;
    }
    var Oa, au = $(() => {
      O2(), ru(), ou(), Oa = class {
        constructor() {
          this.offsets = { defaults: 0n, base: 0n, components: 0n, utilities: 0n, variants: 0n, user: 0n }, this.layerPositions = { defaults: 0n, base: 1n, components: 2n, utilities: 3n, user: 4n, variants: 5n }, this.reservedVariantBits = 0n, this.variantOffsets = /* @__PURE__ */ new Map();
        }
        create(e) {
          return { layer: e, parentLayer: e, arbitrary: 0n, variants: 0n, parallelIndex: 0n, index: this.offsets[e]++, propertyOffset: 0n, property: "", options: [] };
        }
        arbitraryProperty(e) {
          return { ...this.create("utilities"), arbitrary: 1n, property: e };
        }
        forVariant(e, t = 0) {
          let r2 = this.variantOffsets.get(e);
          if (r2 === void 0) throw new Error(`Cannot find offset for unknown variant ${e}`);
          return { ...this.create("variants"), variants: r2 << BigInt(t) };
        }
        applyVariantOffset(e, t, r2) {
          return r2.variant = t.variants, { ...e, layer: "variants", parentLayer: e.layer === "variants" ? e.parentLayer : e.layer, variants: e.variants | t.variants, options: r2.sort ? [].concat(r2, e.options) : e.options, parallelIndex: Aa([e.parallelIndex, t.parallelIndex]) };
        }
        applyParallelOffset(e, t) {
          return { ...e, parallelIndex: BigInt(t) };
        }
        recordVariants(e, t) {
          for (let r2 of e) this.recordVariant(r2, t(r2));
        }
        recordVariant(e, t = 1) {
          return this.variantOffsets.set(e, 1n << this.reservedVariantBits), this.reservedVariantBits += BigInt(t), { ...this.create("variants"), variants: this.variantOffsets.get(e) };
        }
        compare(e, t) {
          if (e.layer !== t.layer) return this.layerPositions[e.layer] - this.layerPositions[t.layer];
          if (e.parentLayer !== t.parentLayer) return this.layerPositions[e.parentLayer] - this.layerPositions[t.parentLayer];
          for (let r2 of e.options) for (let n of t.options) {
            if (r2.id !== n.id || !r2.sort || !n.sort) continue;
            let o2 = Aa([r2.variant, n.variant]) ?? 0n, s2 = ~(o2 | o2 - 1n), a = e.variants & s2, l = t.variants & s2;
            if (a !== l) continue;
            let c2 = r2.sort({ value: r2.value, modifier: r2.modifier }, { value: n.value, modifier: n.modifier });
            if (c2 !== 0) return c2;
          }
          return e.variants !== t.variants ? e.variants - t.variants : e.parallelIndex !== t.parallelIndex ? e.parallelIndex - t.parallelIndex : e.arbitrary !== t.arbitrary ? e.arbitrary - t.arbitrary : e.propertyOffset !== t.propertyOffset ? e.propertyOffset - t.propertyOffset : e.index - t.index;
        }
        recalculateVariantOffsets() {
          let e = Array.from(this.variantOffsets.entries()).filter(([r2]) => r2.startsWith("[")).sort(([r2], [n]) => su(r2, n)), t = e.map(([, r2]) => r2).sort((r2, n) => Ca(r2 - n));
          return e.map(([, r2], n) => [r2, t[n]]).filter(([r2, n]) => r2 !== n);
        }
        remapArbitraryVariantOffsets(e) {
          let t = this.recalculateVariantOffsets();
          return t.length === 0 ? e : e.map((r2) => {
            let [n, o2] = r2;
            return n = { ...n, variants: nu(n.variants, t) }, [n, o2];
          });
        }
        sortArbitraryProperties(e) {
          let t = /* @__PURE__ */ new Set();
          for (let [s2] of e) s2.arbitrary === 1n && t.add(s2.property);
          if (t.size === 0) return e;
          let r2 = Array.from(t).sort(), n = /* @__PURE__ */ new Map(), o2 = 1n;
          for (let s2 of r2) n.set(s2, o2++);
          return e.map((s2) => {
            let [a, l] = s2;
            return a = { ...a, propertyOffset: n.get(a.property) ?? 0n }, [a, l];
          });
        }
        sort(e) {
          return e = this.remapArbitraryVariantOffsets(e), e = this.sortArbitraryProperties(e), e.sort(([t], [r2]) => Ca(this.compare(t, r2)));
        }
      };
    });
    function $n(e, t) {
      let r2 = e.tailwindConfig.prefix;
      return typeof r2 == "function" ? r2(t) : r2 + t;
    }
    function _a({ type: e = "any", ...t }) {
      let r2 = [].concat(e);
      return { ...t, types: r2.map((n) => Array.isArray(n) ? { type: n[0], ...n[1] } : { type: n, preferOnConflict: false }) };
    }
    function iu(e) {
      let t = [], r2 = "", n = 0;
      for (let o2 = 0; o2 < e.length; o2++) {
        let s2 = e[o2];
        if (s2 === "\\") r2 += "\\" + e[++o2];
        else if (s2 === "{") ++n, t.push(r2.trim()), r2 = "";
        else if (s2 === "}") {
          if (--n < 0) throw new Error("Your { and } are unbalanced.");
          t.push(r2.trim()), r2 = "";
        } else r2 += s2;
      }
      return r2.length > 0 && t.push(r2.trim()), t = t.filter((o2) => o2 !== ""), t;
    }
    function lu(e, t, { before: r2 = [] } = {}) {
      if (r2 = [].concat(r2), r2.length <= 0) {
        e.push(t);
        return;
      }
      let n = e.length - 1;
      for (let o2 of r2) {
        let s2 = e.indexOf(o2);
        s2 !== -1 && (n = Math.min(n, s2));
      }
      e.splice(n, 0, t);
    }
    function Ea(e) {
      return Array.isArray(e) ? e.flatMap((t) => !Array.isArray(t) && !Le(t) ? t : fn(t)) : Ea([e]);
    }
    function cu(e, t) {
      return (0, Un.default)((r2) => {
        let n = [];
        return t && t(r2), r2.walkClasses((o2) => {
          n.push(o2.value);
        }), n;
      }).transformSync(e);
    }
    function uu(e) {
      e.walkPseudos((t) => {
        t.value === ":not" && t.remove();
      });
    }
    function du(e, t = { containsNonOnDemandable: false }, r2 = 0) {
      let n = [], o2 = [];
      e.type === "rule" ? o2.push(...e.selectors) : e.type === "atrule" && e.walkRules((s2) => o2.push(...s2.selectors));
      for (let s2 of o2) {
        let a = cu(s2, uu);
        a.length === 0 && (t.containsNonOnDemandable = true);
        for (let l of a) n.push(l);
      }
      return r2 === 0 ? [t.containsNonOnDemandable || n.length === 0, n] : n;
    }
    function vr(e) {
      return Ea(e).flatMap((t) => {
        let r2 = /* @__PURE__ */ new Map(), [n, o2] = du(t);
        return n && o2.unshift(dt), o2.map((s2) => (r2.has(t) || r2.set(t, t), [s2, r2.get(t)]));
      });
    }
    function Rn(e) {
      return e.startsWith("@") || e.includes("&");
    }
    function yr(e) {
      e = e.replace(/\n+/g, "").replace(/\s{1,}/g, " ").trim();
      let t = iu(e).map((r2) => {
        if (!r2.startsWith("@")) return ({ format: s2 }) => s2(r2);
        let [, n, o2] = /@(\S*)( .+|[({].*)?/g.exec(r2);
        return ({ wrap: s2 }) => s2(fe.atRule({ name: n, params: o2?.trim() ?? "" }));
      }).reverse();
      return (r2) => {
        for (let n of t) n(r2);
      };
    }
    function pu(e, t, { variantList: r2, variantMap: n, offsets: o2, classList: s2 }) {
      function a(p2, f3) {
        return p2 ? (0, Ba.default)(e, p2, f3) : e;
      }
      function l(p2) {
        return hn(e.prefix, p2);
      }
      function c2(p2, f3) {
        return p2 === dt ? dt : f3.respectPrefix ? t.tailwindConfig.prefix + p2 : p2;
      }
      function i2(p2, f3, g3 = {}) {
        let h2 = Pt(p2), m3 = a(["theme", ...h2], f3);
        return ir(h2[0])(m3, g3);
      }
      let d3 = 0, u2 = { postcss: fe, prefix: l, e: at, config: a, theme: i2, corePlugins: (p2) => Array.isArray(e.corePlugins) ? e.corePlugins.includes(p2) : a(["corePlugins", p2], true), variants: () => [], addBase(p2) {
        for (let [f3, g3] of vr(p2)) {
          let h2 = c2(f3, {}), m3 = o2.create("base");
          t.candidateRuleMap.has(h2) || t.candidateRuleMap.set(h2, []), t.candidateRuleMap.get(h2).push([{ sort: m3, layer: "base" }, g3]);
        }
      }, addDefaults(p2, f3) {
        let g3 = { [`@defaults ${p2}`]: f3 };
        for (let [h2, m3] of vr(g3)) {
          let y3 = c2(h2, {});
          t.candidateRuleMap.has(y3) || t.candidateRuleMap.set(y3, []), t.candidateRuleMap.get(y3).push([{ sort: o2.create("defaults"), layer: "defaults" }, m3]);
        }
      }, addComponents(p2, f3) {
        f3 = Object.assign({}, { preserveSource: false, respectPrefix: true, respectImportant: false }, Array.isArray(f3) ? {} : f3);
        for (let [g3, h2] of vr(p2)) {
          let m3 = c2(g3, f3);
          s2.add(m3), t.candidateRuleMap.has(m3) || t.candidateRuleMap.set(m3, []), t.candidateRuleMap.get(m3).push([{ sort: o2.create("components"), layer: "components", options: f3 }, h2]);
        }
      }, addUtilities(p2, f3) {
        f3 = Object.assign({}, { preserveSource: false, respectPrefix: true, respectImportant: true }, Array.isArray(f3) ? {} : f3);
        for (let [g3, h2] of vr(p2)) {
          let m3 = c2(g3, f3);
          s2.add(m3), t.candidateRuleMap.has(m3) || t.candidateRuleMap.set(m3, []), t.candidateRuleMap.get(m3).push([{ sort: o2.create("utilities"), layer: "utilities", options: f3 }, h2]);
        }
      }, matchUtilities: function(p2, f3) {
        f3 = _a({ respectPrefix: true, respectImportant: true, modifiers: false, ...f3 });
        let g3 = o2.create("utilities");
        for (let h2 in p2) {
          let m3 = function(k, { isOnlyPlugin: w2 }) {
            let [b2, C, S] = Xo(f3.types, k, f3, e);
            if (b2 === void 0) return [];
            if (!f3.types.some(({ type: _2 }) => _2 === C)) if (w2) de.warn([`Unnecessary typehint \`${C}\` in \`${h2}-${k}\`.`, `You can safely update it to \`${h2}-${k.replace(C + ":", "")}\`.`]);
            else return [];
            if (!An(b2)) return [];
            let E = { get modifier() {
              return f3.modifiers || de.warn(`modifier-used-without-options-for-${h2}`, ["Your plugin must set `modifiers: true` in its options to support modifiers."]), S;
            } }, A2 = De(e, "generalizedModifiers");
            return [].concat(A2 ? v2(b2, E) : v2(b2)).filter(Boolean).map((_2) => ({ [Vs(h2, k)]: _2 }));
          }, y3 = c2(h2, f3), v2 = p2[h2];
          s2.add([y3, f3]);
          let x2 = [{ sort: g3, layer: "utilities", options: f3 }, m3];
          t.candidateRuleMap.has(y3) || t.candidateRuleMap.set(y3, []), t.candidateRuleMap.get(y3).push(x2);
        }
      }, matchComponents: function(p2, f3) {
        f3 = _a({ respectPrefix: true, respectImportant: false, modifiers: false, ...f3 });
        let g3 = o2.create("components");
        for (let h2 in p2) {
          let m3 = function(k, { isOnlyPlugin: w2 }) {
            let [b2, C, S] = Xo(f3.types, k, f3, e);
            if (b2 === void 0) return [];
            if (!f3.types.some(({ type: _2 }) => _2 === C)) if (w2) de.warn([`Unnecessary typehint \`${C}\` in \`${h2}-${k}\`.`, `You can safely update it to \`${h2}-${k.replace(C + ":", "")}\`.`]);
            else return [];
            if (!An(b2)) return [];
            let E = { get modifier() {
              return f3.modifiers || de.warn(`modifier-used-without-options-for-${h2}`, ["Your plugin must set `modifiers: true` in its options to support modifiers."]), S;
            } }, A2 = De(e, "generalizedModifiers");
            return [].concat(A2 ? v2(b2, E) : v2(b2)).filter(Boolean).map((_2) => ({ [Vs(h2, k)]: _2 }));
          }, y3 = c2(h2, f3), v2 = p2[h2];
          s2.add([y3, f3]);
          let x2 = [{ sort: g3, layer: "components", options: f3 }, m3];
          t.candidateRuleMap.has(y3) || t.candidateRuleMap.set(y3, []), t.candidateRuleMap.get(y3).push(x2);
        }
      }, addVariant(p2, f3, g3 = {}) {
        f3 = [].concat(f3).map((h2) => {
          if (typeof h2 != "string") return (m3 = {}) => {
            let { args: y3, modifySelectors: v2, container: x2, separator: k, wrap: w2, format: b2 } = m3, C = h2(Object.assign({ modifySelectors: v2, container: x2, separator: k }, g3.type === br.MatchVariant && { args: y3, wrap: w2, format: b2 }));
            if (typeof C == "string" && !Rn(C)) throw new Error(`Your custom variant \`${p2}\` has an invalid format string. Make sure it's an at-rule or contains a \`&\` placeholder.`);
            return Array.isArray(C) ? C.filter((S) => typeof S == "string").map((S) => yr(S)) : C && typeof C == "string" && yr(C)(m3);
          };
          if (!Rn(h2)) throw new Error(`Your custom variant \`${p2}\` has an invalid format string. Make sure it's an at-rule or contains a \`&\` placeholder.`);
          return yr(h2);
        }), lu(r2, p2, g3), n.set(p2, f3), t.variantOptions.set(p2, g3);
      }, matchVariant(p2, f3, g3) {
        let h2 = g3?.id ?? ++d3, m3 = p2 === "@", y3 = De(e, "generalizedModifiers");
        for (let [x2, k] of Object.entries(g3?.values ?? {})) x2 !== "DEFAULT" && u2.addVariant(m3 ? `${p2}${x2}` : `${p2}-${x2}`, ({ args: w2, container: b2 }) => f3(k, y3 ? { modifier: w2?.modifier, container: b2 } : { container: b2 }), { ...g3, value: k, id: h2, type: br.MatchVariant, variantInfo: wr.Base });
        let v2 = "DEFAULT" in (g3?.values ?? {});
        u2.addVariant(p2, ({ args: x2, container: k }) => x2?.value === dr && !v2 ? null : f3(x2?.value === dr ? g3.values.DEFAULT : x2?.value ?? (typeof x2 == "string" ? x2 : ""), y3 ? { modifier: x2?.modifier, container: k } : { container: k }), { ...g3, id: h2, type: br.MatchVariant, variantInfo: wr.Dynamic });
      } };
      return u2;
    }
    function Mn(e) {
      return xr.has(e) || xr.set(e, /* @__PURE__ */ new Map()), xr.get(e);
    }
    function Ta(e, t) {
      let r2 = false, n = /* @__PURE__ */ new Map();
      for (let o2 of e) {
        if (!o2) continue;
        let s2 = Xr.parse(o2), a = s2.hash ? s2.href.replace(s2.hash, "") : s2.href;
        a = s2.search ? a.replace(s2.search, "") : a;
        let l = Be.statSync(decodeURIComponent(a), { throwIfNoEntry: false })?.mtimeMs;
        !l || ((!t.has(o2) || l > t.get(o2)) && (r2 = true), n.set(o2, l));
      }
      return [r2, n];
    }
    function Ia(e) {
      e.walkAtRules((t) => {
        ["responsive", "variants"].includes(t.name) && (Ia(t), t.before(t.nodes), t.remove());
      });
    }
    function fu(e) {
      let t = [];
      return e.each((r2) => {
        r2.type === "atrule" && ["responsive", "variants"].includes(r2.name) && (r2.name = "layer", r2.params = "utilities");
      }), e.walkAtRules("layer", (r2) => {
        if (Ia(r2), r2.params === "base") {
          for (let n of r2.nodes) t.push(function({ addBase: o2 }) {
            o2(n, { respectPrefix: false });
          });
          r2.remove();
        } else if (r2.params === "components") {
          for (let n of r2.nodes) t.push(function({ addComponents: o2 }) {
            o2(n, { respectPrefix: false, preserveSource: true });
          });
          r2.remove();
        } else if (r2.params === "utilities") {
          for (let n of r2.nodes) t.push(function({ addUtilities: o2 }) {
            o2(n, { respectPrefix: false, preserveSource: true });
          });
          r2.remove();
        }
      }), t;
    }
    function hu(e, t) {
      let r2 = Object.entries({ ...ue, ...ra }).map(([l, c2]) => e.tailwindConfig.corePlugins.includes(l) ? c2 : null).filter(Boolean), n = e.tailwindConfig.plugins.map((l) => (l.__isOptionsFunction && (l = l()), typeof l == "function" ? l : l.handler)), o2 = fu(t), s2 = [ue.childVariant, ue.pseudoElementVariants, ue.pseudoClassVariants, ue.hasVariants, ue.ariaVariants, ue.dataVariants], a = [ue.supportsVariants, ue.reducedMotionVariants, ue.prefersContrastVariants, ue.screenVariants, ue.orientationVariants, ue.directionVariants, ue.darkVariants, ue.forcedColorsVariants, ue.printVariant];
      return (e.tailwindConfig.darkMode === "class" || Array.isArray(e.tailwindConfig.darkMode) && e.tailwindConfig.darkMode[0] === "class") && (a = [ue.supportsVariants, ue.reducedMotionVariants, ue.prefersContrastVariants, ue.darkVariants, ue.screenVariants, ue.orientationVariants, ue.directionVariants, ue.forcedColorsVariants, ue.printVariant]), [...r2, ...s2, ...n, ...a, ...o2];
    }
    function mu(e, t) {
      let r2 = [], n = /* @__PURE__ */ new Map();
      t.variantMap = n;
      let o2 = new Oa();
      t.offsets = o2;
      let s2 = /* @__PURE__ */ new Set(), a = pu(t.tailwindConfig, t, { variantList: r2, variantMap: n, offsets: o2, classList: s2 });
      for (let d3 of e) if (Array.isArray(d3)) for (let u2 of d3) u2(a);
      else d3?.(a);
      o2.recordVariants(r2, (d3) => n.get(d3).length);
      for (let [d3, u2] of n.entries()) t.variantMap.set(d3, u2.map((p2, f3) => [o2.forVariant(d3, f3), p2]));
      let l = (t.tailwindConfig.safelist ?? []).filter(Boolean);
      if (l.length > 0) {
        let d3 = [];
        for (let u2 of l) {
          if (typeof u2 == "string") {
            t.changedContent.push({ content: u2, extension: "html" });
            continue;
          }
          if (u2 instanceof RegExp) {
            de.warn("root-regex", ["Regular expressions in `safelist` work differently in Tailwind CSS v3.0.", "Update your `safelist` configuration to eliminate this warning.", "https://tailwindcss.com/docs/content-configuration#safelisting-classes"]);
            continue;
          }
          d3.push(u2);
        }
        if (d3.length > 0) {
          let u2 = /* @__PURE__ */ new Map(), p2 = t.tailwindConfig.prefix.length, f3 = d3.some((g3) => g3.pattern.source.includes("!"));
          for (let g3 of s2) {
            let h2 = Array.isArray(g3) ? (() => {
              let [m3, y3] = g3, v2 = Object.keys(y3?.values ?? {}).map((x2) => cr(m3, x2));
              return y3?.supportsNegativeValues && (v2 = [...v2, ...v2.map((x2) => "-" + x2)], v2 = [...v2, ...v2.map((x2) => x2.slice(0, p2) + "-" + x2.slice(p2))]), y3.types.some(({ type: x2 }) => x2 === "color") && (v2 = [...v2, ...v2.flatMap((x2) => Object.keys(t.tailwindConfig.theme.opacity).map((k) => `${x2}/${k}`))]), f3 && y3?.respectImportant && (v2 = [...v2, ...v2.map((x2) => "!" + x2)]), v2;
            })() : [g3];
            for (let m3 of h2) for (let { pattern: y3, variants: v2 = [] } of d3) if (y3.lastIndex = 0, u2.has(y3) || u2.set(y3, 0), !!y3.test(m3)) {
              u2.set(y3, u2.get(y3) + 1), t.changedContent.push({ content: m3, extension: "html" });
              for (let x2 of v2) t.changedContent.push({ content: x2 + t.tailwindConfig.separator + m3, extension: "html" });
            }
          }
          for (let [g3, h2] of u2.entries()) h2 === 0 && de.warn([`The safelist pattern \`${g3}\` doesn't match any Tailwind CSS classes.`, "Fix this pattern or remove it from your `safelist` configuration.", "https://tailwindcss.com/docs/content-configuration#safelisting-classes"]);
        }
      }
      let c2 = [].concat(t.tailwindConfig.darkMode ?? "media")[1] ?? "dark", i2 = [$n(t, c2), $n(t, "group"), $n(t, "peer")];
      t.getClassOrder = function(d3) {
        let u2 = [...d3].sort((h2, m3) => h2 === m3 ? 0 : h2 < m3 ? -1 : 1), p2 = new Map(u2.map((h2) => [h2, null])), f3 = wa(new Set(u2), t, true);
        f3 = t.offsets.sort(f3);
        let g3 = BigInt(i2.length);
        for (let [, h2] of f3) {
          let m3 = h2.raws.tailwind.candidate;
          p2.set(m3, p2.get(m3) ?? g3++);
        }
        return d3.map((h2) => {
          let m3 = p2.get(h2) ?? null, y3 = i2.indexOf(h2);
          return m3 === null && y3 !== -1 && (m3 = BigInt(y3)), [h2, m3];
        });
      }, t.getClassList = function(d3 = {}) {
        let u2 = [];
        for (let p2 of s2) if (Array.isArray(p2)) {
          let [f3, g3] = p2, h2 = [], m3 = Object.keys(g3?.modifiers ?? {});
          g3?.types?.some(({ type: x2 }) => x2 === "color") && m3.push(...Object.keys(t.tailwindConfig.theme.opacity ?? {}));
          let y3 = { modifiers: m3 }, v2 = d3.includeMetadata && m3.length > 0;
          for (let [x2, k] of Object.entries(g3?.values ?? {})) {
            if (k == null) continue;
            let w2 = cr(f3, x2);
            if (u2.push(v2 ? [w2, y3] : w2), g3?.supportsNegativeValues && Yt(k)) {
              let b2 = cr(f3, `-${x2}`);
              h2.push(v2 ? [b2, y3] : b2);
            }
          }
          u2.push(...h2);
        } else u2.push(p2);
        return u2;
      }, t.getVariants = function() {
        let d3 = Math.random().toString(36).substring(7).toUpperCase(), u2 = [];
        for (let [p2, f3] of t.variantOptions.entries()) f3.variantInfo !== wr.Base && u2.push({ name: p2, isArbitrary: f3.type === Symbol.for("MATCH_VARIANT"), values: Object.keys(f3.values ?? {}), hasDash: p2 !== "@", selectors({ modifier: g3, value: h2 } = {}) {
          let m3 = `TAILWINDPLACEHOLDER${d3}`, y3 = fe.rule({ selector: `.${m3}` }), v2 = fe.root({ nodes: [y3.clone()] }), x2 = v2.toString(), k = (t.variantMap.get(p2) ?? []).flatMap(([D, j]) => j), w2 = [];
          for (let D of k) {
            let j = [], L = { args: { modifier: g3, value: f3.values?.[h2] ?? h2 }, separator: t.tailwindConfig.separator, modifySelectors(H) {
              return v2.each((Q) => {
                Q.type === "rule" && (Q.selectors = Q.selectors.map((we) => H({ get className() {
                  return ga(we);
                }, selector: we })));
              }), v2;
            }, format(H) {
              j.push(H);
            }, wrap(H) {
              j.push(`@${H.name} ${H.params} { & }`);
            }, container: v2 }, F = D(L);
            if (j.length > 0 && w2.push(j), Array.isArray(F)) for (let H of F) j = [], H(L), w2.push(j);
          }
          let b2 = [], C = v2.toString();
          x2 !== C && (v2.walkRules((D) => {
            let j = D.selector, L = (0, Un.default)((F) => {
              F.walkClasses((H) => {
                H.value = `${p2}${t.tailwindConfig.separator}${H.value}`;
              });
            }).processSync(j);
            b2.push(j.replace(L, "&").replace(m3, "&"));
          }), v2.walkAtRules((D) => {
            b2.push(`@${D.name} (${D.params}) { & }`);
          }));
          let S = !(h2 in (f3.values ?? {})), E = f3[ft] ?? {}, A2 = !(S || E.respectPrefix === false);
          w2 = w2.map((D) => D.map((j) => ({ format: j, respectPrefix: A2 }))), b2 = b2.map((D) => ({ format: D, respectPrefix: A2 }));
          let _2 = { candidate: m3, context: t }, U = w2.map((D) => da(`.${m3}`, fr(D, _2), _2).replace(`.${m3}`, "&").replace("{ & }", "").trim());
          return b2.length > 0 && U.push(fr(b2, _2).toString().replace(`.${m3}`, "&")), U;
        } });
        return u2;
      };
    }
    function Pa(e, t) {
      !e.classCache.has(t) || (e.notClassCache.add(t), e.classCache.delete(t), e.applyClassCache.delete(t), e.candidateRuleMap.delete(t), e.candidateRuleCache.delete(t), e.stylesheetCache = null);
    }
    function gu(e, t) {
      let r2 = t.raws.tailwind.candidate;
      if (r2) {
        for (let n of e.ruleCache) n[1].raws.tailwind.candidate === r2 && e.ruleCache.delete(n);
        Pa(e, r2);
      }
    }
    function ja(e, t = [], r2 = fe.root()) {
      let n = { disposables: [], ruleCache: /* @__PURE__ */ new Set(), candidateRuleCache: /* @__PURE__ */ new Map(), classCache: /* @__PURE__ */ new Map(), applyClassCache: /* @__PURE__ */ new Map(), notClassCache: new Set(e.blocklist ?? []), postCssNodeCache: /* @__PURE__ */ new Map(), candidateRuleMap: /* @__PURE__ */ new Map(), tailwindConfig: e, changedContent: t, variantMap: /* @__PURE__ */ new Map(), stylesheetCache: null, variantOptions: /* @__PURE__ */ new Map(), markInvalidUtilityCandidate: (s2) => Pa(n, s2), markInvalidUtilityNode: (s2) => gu(n, s2) }, o2 = hu(n, r2);
      return mu(o2, n), n;
    }
    function vu(e, t, r2, n, o2, s2) {
      let a = t.opts.from, l = n !== null;
      it.DEBUG && console.log("Source path:", a);
      let c2;
      if (l && ht.has(a)) c2 = ht.get(a);
      else if (At.has(o2)) {
        let p2 = At.get(o2);
        et.get(p2).add(a), ht.set(a, p2), c2 = p2;
      }
      let i2 = eu(a, e);
      if (c2) {
        let [p2, f3] = Ta([...s2], Mn(c2));
        if (!p2 && !i2) return [c2, false, f3];
      }
      if (ht.has(a)) {
        let p2 = ht.get(a);
        if (et.has(p2) && (et.get(p2).delete(a), et.get(p2).size === 0)) {
          et.delete(p2);
          for (let [f3, g3] of At) g3 === p2 && At.delete(f3);
          for (let f3 of p2.disposables.splice(0)) f3(p2);
        }
      }
      it.DEBUG && console.log("Setting up new context...");
      let d3 = ja(r2, [], e);
      Object.assign(d3, { userConfigPath: n });
      let [, u2] = Ta([...s2], Mn(d3));
      return At.set(o2, d3), ht.set(a, d3), et.has(d3) || et.set(d3, /* @__PURE__ */ new Set()), et.get(d3).add(a), [d3, true, u2];
    }
    var Ba, Un, ft, br, wr, xr, ht, At, et, kr = $(() => {
      O2(), rt(), ds(), ut(), Ba = he(ws()), Un = he(Ke()), lr(), zs(), mn(), Bt(), Ut(), Ws(), Kt(), Dc(), pt(), pt(), Mr(), Ge(), jr(), aa(), Dn(), tu(), au(), nt(), fa(), ft = Symbol(), br = { AddVariant: Symbol.for("ADD_VARIANT"), MatchVariant: Symbol.for("MATCH_VARIANT") }, wr = { Base: 1, Dynamic: 2 }, xr = /* @__PURE__ */ new WeakMap(), ht = na, At = oa, et = Sn;
    });
    function yu(e) {
      return e.ignore ? [] : e.glob ? je.env.ROLLUP_WATCH === "true" ? [{ type: "dependency", file: e.base }] : [{ type: "dir-dependency", dir: e.base, glob: e.glob }] : [{ type: "dependency", file: e.base }];
    }
    var bu = $(() => {
      O2();
    });
    function Da(e, t) {
      return { handler: e, config: t };
    }
    var $a, wu = $(() => {
      O2(), Da.withOptions = function(e, t = () => ({})) {
        let r2 = function(n) {
          return { __options: n, handler: e(n), config: t(n) };
        };
        return r2.__isOptionsFunction = true, r2.__pluginFunction = e, r2.__configFunction = t, r2;
      }, $a = Da;
    }), zn = {};
    Fe(zn, { default: () => Ra });
    var Ra, Ma = $(() => {
      O2(), wu(), Ra = $a;
    }), xu = T((e, t) => {
      O2();
      var r2 = (Ma(), zn).default, n = { overflow: "hidden", display: "-webkit-box", "-webkit-box-orient": "vertical" }, o2 = r2(function({ matchUtilities: s2, addUtilities: a, theme: l, variants: c2 }) {
        let i2 = l("lineClamp");
        s2({ "line-clamp": (d3) => ({ ...n, "-webkit-line-clamp": `${d3}` }) }, { values: i2 }), a([{ ".line-clamp-none": { "-webkit-line-clamp": "unset" } }], c2("lineClamp"));
      }, { theme: { lineClamp: { 1: "1", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6" } }, variants: { lineClamp: ["responsive"] } });
      t.exports = o2;
    });
    function Ua(e) {
      e.content.files.length === 0 && de.warn("content-problems", ["The `content` option in your Tailwind CSS configuration is missing or empty.", "Configure your content sources or your generated CSS will be missing styles.", "https://tailwindcss.com/docs/content-configuration"]);
      try {
        let t = xu();
        e.plugins.includes(t) && (de.warn("line-clamp-in-core", ["As of Tailwind CSS v3.3, the `@tailwindcss/line-clamp` plugin is now included by default.", "Remove it from the `plugins` array in your configuration to eliminate this warning."]), e.plugins = e.plugins.filter((r2) => r2 !== t));
      } catch {
      }
      return e;
    }
    var ku = $(() => {
      O2(), Ge();
    }), za, Su = $(() => {
      O2(), za = () => false;
    }), Sr, Cu = $(() => {
      O2(), Sr = { sync: (e) => [].concat(e), generateTasks: (e) => [{ dynamic: false, base: ".", negative: [], positive: [].concat(e), patterns: [].concat(e) }], escapePath: (e) => e };
    }), Fn, Au = $(() => {
      O2(), Fn = (e) => e;
    }), Fa, Ou = $(() => {
      O2(), Fa = () => "";
    });
    function _u(e) {
      let t = e, r2 = Fa(e);
      return r2 !== "." && (t = e.substr(r2.length), t.charAt(0) === "/" && (t = t.substr(1))), t.substr(0, 2) === "./" ? t = t.substr(2) : t.charAt(0) === "/" && (t = t.substr(1)), { base: r2, glob: t };
    }
    var Eu = $(() => {
      O2(), Ou();
    });
    function Tu(e, t) {
      let r2 = t.content.files;
      r2 = r2.filter((l) => typeof l == "string"), r2 = r2.map(Fn);
      let n = Sr.generateTasks(r2), o2 = [], s2 = [];
      for (let l of n) o2.push(...l.positive.map((c2) => La(c2, false))), s2.push(...l.negative.map((c2) => La(c2, true)));
      let a = [...o2, ...s2];
      return a = Pu(e, a), a = a.flatMap(ju), a = a.map(Iu), a;
    }
    function La(e, t) {
      let r2 = { original: e, base: e, ignore: t, pattern: e, glob: null };
      return za(e) && Object.assign(r2, _u(e)), r2;
    }
    function Iu(e) {
      let t = Fn(e.base);
      return t = Sr.escapePath(t), e.pattern = e.glob ? `${t}/${e.glob}` : t, e.pattern = e.ignore ? `!${e.pattern}` : e.pattern, e;
    }
    function Pu(e, t) {
      let r2 = [];
      return e.userConfigPath && e.tailwindConfig.content.relative && (r2 = [xe.dirname(e.userConfigPath)]), t.map((n) => (n.base = xe.resolve(...r2, n.base), n));
    }
    function ju(e) {
      let t = [e];
      try {
        let r2 = Be.realpathSync(e.base);
        r2 !== e.base && t.push({ ...e, base: r2 });
      } catch {
      }
      return t;
    }
    function Bu(e, t, r2) {
      let n = e.tailwindConfig.content.files.filter((a) => typeof a.raw == "string").map(({ raw: a, extension: l = "html" }) => ({ content: a, extension: l })), [o2, s2] = Du(t, r2);
      for (let a of o2) {
        let l = xe.extname(a).slice(1);
        n.push({ file: a, extension: l });
      }
      return [n, s2];
    }
    function Du(e, t) {
      let r2 = e.map((a) => a.pattern), n = /* @__PURE__ */ new Map(), o2 = /* @__PURE__ */ new Set();
      it.DEBUG && console.time("Finding changed files");
      let s2 = Sr.sync(r2, { absolute: true });
      for (let a of s2) {
        let l = t.get(a) || -1 / 0, c2 = Be.statSync(a).mtimeMs;
        c2 > l && (o2.add(a), n.set(a, c2));
      }
      return it.DEBUG && console.timeEnd("Finding changed files"), [o2, n];
    }
    var $u = $(() => {
      O2(), rt(), St(), Su(), Cu(), Au(), Eu(), pt();
    });
    function Df() {
    }
    var Ru = $(() => {
      O2();
    });
    function Mu(e, t) {
      for (let r2 of t) {
        let n = `${e}${r2}`;
        if (Be.existsSync(n) && Be.statSync(n).isFile()) return n;
      }
      for (let r2 of t) {
        let n = `${e}/index${r2}`;
        if (Be.existsSync(n)) return n;
      }
      return null;
    }
    function* Na(e, t, r2, n = xe.extname(e)) {
      let o2 = Mu(xe.resolve(t, e), Va.includes(n) ? Wa : qa);
      if (o2 === null || r2.has(o2)) return;
      r2.add(o2), yield o2, t = xe.dirname(o2), n = xe.extname(o2);
      let s2 = Be.readFileSync(o2, "utf-8");
      for (let a of [...s2.matchAll(/import[\s\S]*?['"](.{3,}?)['"]/gi), ...s2.matchAll(/import[\s\S]*from[\s\S]*?['"](.{3,}?)['"]/gi), ...s2.matchAll(/require\(['"`](.+)['"`]\)/gi)]) !a[1].startsWith(".") || (yield* Na(a[1], t, r2, n));
    }
    function Uu(e) {
      return e === null ? /* @__PURE__ */ new Set() : new Set(Na(e, xe.dirname(e), /* @__PURE__ */ new Set()));
    }
    var Va, Wa, qa, zu = $(() => {
      O2(), rt(), St(), Va = [".js", ".cjs", ".mjs"], Wa = ["", ".js", ".cjs", ".mjs", ".ts", ".cts", ".mts", ".jsx", ".tsx"], qa = ["", ".ts", ".cts", ".mts", ".tsx", ".js", ".cjs", ".mjs", ".jsx"];
    });
    function Fu(e, t) {
      if (Cr.has(e)) return Cr.get(e);
      let r2 = Tu(e, t);
      return Cr.set(e, r2).get(e);
    }
    function Lu(e) {
      let t = Cl(e);
      if (t !== null) {
        let [n, o2, s2, a] = Ln.get(t) || [], l = Uu(t), c2 = false, i2 = /* @__PURE__ */ new Map();
        for (let p2 of l) {
          let f3 = Be.statSync(p2).mtimeMs;
          i2.set(p2, f3), (!a || !a.has(p2) || f3 > a.get(p2)) && (c2 = true);
        }
        if (!c2) return [n, t, o2, s2];
        for (let p2 of l) delete $i.cache[p2];
        let d3 = Ua(Zr(void 0)), u2 = bo(d3);
        return Ln.set(t, [d3, u2, l, i2]), [d3, t, u2, l];
      }
      let r2 = Zr(e?.config ?? e ?? {});
      return r2 = Ua(r2), [r2, null, bo(r2), []];
    }
    function Nu(e) {
      return ({ tailwindDirectives: t, registerDependency: r2 }) => (n, o2) => {
        let [s2, a, l, c2] = Lu(e), i2 = new Set(c2);
        if (t.size > 0) {
          i2.add(o2.opts.from);
          for (let g3 of o2.messages) g3.type === "dependency" && i2.add(g3.file);
        }
        let [d3, , u2] = vu(n, o2, s2, a, l, i2), p2 = Mn(d3), f3 = Fu(d3, s2);
        if (t.size > 0) {
          for (let m3 of f3) for (let y3 of yu(m3)) r2(y3);
          let [g3, h2] = Bu(d3, f3, p2);
          for (let m3 of g3) d3.changedContent.push(m3);
          for (let [m3, y3] of h2.entries()) u2.set(m3, y3);
        }
        for (let g3 of c2) r2({ type: "dependency", file: g3 });
        for (let [g3, h2] of u2.entries()) p2.set(g3, h2);
        return d3;
      };
    }
    var Ga, Ln, Cr, Vu = $(() => {
      O2(), rt(), Ga = he(vo()), Ui(), as(), Ol(), kr(), bu(), ku(), $u(), Ru(), zu(), Ln = new Ga.default({ maxSize: 100 }), Cr = /* @__PURE__ */ new WeakMap();
    });
    function Wu(e) {
      let t = /* @__PURE__ */ new Set(), r2 = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set();
      if (e.walkAtRules((o2) => {
        o2.name === "apply" && n.add(o2), o2.name === "import" && (o2.params === '"tailwindcss/base"' || o2.params === "'tailwindcss/base'" ? (o2.name = "tailwind", o2.params = "base") : o2.params === '"tailwindcss/components"' || o2.params === "'tailwindcss/components'" ? (o2.name = "tailwind", o2.params = "components") : o2.params === '"tailwindcss/utilities"' || o2.params === "'tailwindcss/utilities'" ? (o2.name = "tailwind", o2.params = "utilities") : (o2.params === '"tailwindcss/screens"' || o2.params === "'tailwindcss/screens'" || o2.params === '"tailwindcss/variants"' || o2.params === "'tailwindcss/variants'") && (o2.name = "tailwind", o2.params = "variants")), o2.name === "tailwind" && (o2.params === "screens" && (o2.params = "variants"), t.add(o2.params)), ["layer", "responsive", "variants"].includes(o2.name) && (["responsive", "variants"].includes(o2.name) && de.warn(`${o2.name}-at-rule-deprecated`, [`The \`@${o2.name}\` directive has been deprecated in Tailwind CSS v3.0.`, "Use `@layer utilities` or `@layer components` instead.", "https://tailwindcss.com/docs/upgrade-guide#replace-variants-with-layer"]), r2.add(o2));
      }), !t.has("base") || !t.has("components") || !t.has("utilities")) {
        for (let o2 of r2) if (o2.name === "layer" && ["base", "components", "utilities"].includes(o2.params)) {
          if (!t.has(o2.params)) throw o2.error(`\`@layer ${o2.params}\` is used but no matching \`@tailwind ${o2.params}\` directive is present.`);
        } else if (o2.name === "responsive") {
          if (!t.has("utilities")) throw o2.error("`@responsive` is used but `@tailwind utilities` is missing.");
        } else if (o2.name === "variants" && !t.has("utilities")) throw o2.error("`@variants` is used but `@tailwind utilities` is missing.");
      }
      return { tailwindDirectives: t, applyDirectives: n };
    }
    var qu = $(() => {
      O2(), Ge();
    });
    function Ft(e, t = void 0, r2 = void 0) {
      return e.map((n) => {
        let o2 = n.clone();
        return r2 !== void 0 && (o2.raws.tailwind = { ...o2.raws.tailwind, ...r2 }), t !== void 0 && Ya(o2, (s2) => {
          if (s2.raws.tailwind?.preserveSource === true && s2.source) return false;
          s2.source = t;
        }), o2;
      });
    }
    function Ya(e, t) {
      t(e) !== false && e.each?.((r2) => Ya(r2, t));
    }
    var Gu = $(() => {
      O2();
    });
    function Nn(e) {
      return e = Array.isArray(e) ? e : [e], e = e.map((t) => t instanceof RegExp ? t.source : t), e.join("");
    }
    function Ue(e) {
      return new RegExp(Nn(e), "g");
    }
    function mt(e) {
      return `(?:${e.map(Nn).join("|")})`;
    }
    function Ha(e) {
      return `(?:${Nn(e)})?`;
    }
    function Yu(e) {
      return e && Qa.test(e) ? e.replace(Vn, "\\$&") : e || "";
    }
    var Vn, Qa, Hu = $(() => {
      O2(), Vn = /[\\^$.*+?()[\]{}|]/g, Qa = RegExp(Vn.source);
    });
    function Qu(e) {
      let t = Array.from(Ju(e));
      return (r2) => {
        let n = [];
        for (let o2 of t) for (let s2 of r2.match(o2) ?? []) n.push(Zu(s2));
        for (let o2 of n.slice()) {
          let s2 = $e(o2, ".");
          for (let a = 0; a < s2.length; a++) {
            let l = s2[a];
            if (a >= s2.length - 1) {
              n.push(l);
              continue;
            }
            let c2 = parseInt(s2[a + 1]);
            isNaN(c2) ? n.push(l) : a++;
          }
        }
        return n;
      };
    }
    function* Ju(e) {
      let t = e.tailwindConfig.separator, r2 = e.tailwindConfig.prefix !== "" ? Ha(Ue([/-?/, Yu(e.tailwindConfig.prefix)])) : "", n = mt([/\[[^\s:'"`]+:[^\s\[\]]+\]/, /\[[^\s:'"`\]]+:[^\s]+?\[[^\s]+\][^\s]+?\]/, Ue([mt([/-?(?:\w+)/, /@(?:\w+)/]), Ha(mt([Ue([mt([/-(?:\w+-)*\['[^\s]+'\]/, /-(?:\w+-)*\["[^\s]+"\]/, /-(?:\w+-)*\[`[^\s]+`\]/, /-(?:\w+-)*\[(?:[^\s\[\]]+\[[^\s\[\]]+\])*[^\s:\[\]]+\]/]), /(?![{([]])/, /(?:\/[^\s'"`\\><$]*)?/]), Ue([mt([/-(?:\w+-)*\['[^\s]+'\]/, /-(?:\w+-)*\["[^\s]+"\]/, /-(?:\w+-)*\[`[^\s]+`\]/, /-(?:\w+-)*\[(?:[^\s\[\]]+\[[^\s\[\]]+\])*[^\s\[\]]+\]/]), /(?![{([]])/, /(?:\/[^\s'"`\\$]*)?/]), /[-\/][^\s'"`\\$={><]*/]))])]), o2 = [mt([Ue([/@\[[^\s"'`]+\](\/[^\s"'`]+)?/, t]), Ue([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]\/[\w_-]+/, t]), Ue([/([^\s"'`\[\\]+-)?\[[^\s"'`]+\]/, t]), Ue([/[^\s"'`\[\\]+/, t])]), mt([Ue([/([^\s"'`\[\\]+-)?\[[^\s`]+\]\/[\w_-]+/, t]), Ue([/([^\s"'`\[\\]+-)?\[[^\s`]+\]/, t]), Ue([/[^\s`\[\\]+/, t])])];
      for (let s2 of o2) yield Ue(["((?=((", s2, ")+))\\2)?", /!?/, r2, n]);
    }
    function Zu(e) {
      if (!e.includes("-[")) return e;
      let t = 0, r2 = [], n = e.matchAll(Ja);
      n = Array.from(n).flatMap((o2) => {
        let [, ...s2] = o2;
        return s2.map((a, l) => Object.assign([], o2, { index: o2.index + l, 0: a }));
      });
      for (let o2 of n) {
        let s2 = o2[0], a = r2[r2.length - 1];
        if (s2 === a ? r2.pop() : (s2 === "'" || s2 === '"' || s2 === "`") && r2.push(s2), !a) {
          if (s2 === "[") {
            t++;
            continue;
          } else if (s2 === "]") {
            t--;
            continue;
          }
          if (t < 0) return e.substring(0, o2.index - 1);
          if (t === 0 && !Za.test(s2)) return e.substring(0, o2.index);
        }
      }
      return e;
    }
    var Ja, Za, Xu = $(() => {
      O2(), Hu(), xt(), Ja = /([\[\]'"`])([^\[\]'"`])?/g, Za = /[^"'`\s<>\]]+/;
    });
    function Ku(e, t) {
      let r2 = e.tailwindConfig.content.extract;
      return r2[t] || r2.DEFAULT || Wn[t] || Wn.DEFAULT(e);
    }
    function ed(e, t) {
      let r2 = e.content.transform;
      return r2[t] || r2.DEFAULT || qn[t] || qn.DEFAULT;
    }
    function td(e, t, r2, n) {
      Ot.has(t) || Ot.set(t, new Xa.default({ maxSize: 25e3 }));
      for (let o2 of e.split(`
`)) if (o2 = o2.trim(), !n.has(o2)) if (n.add(o2), Ot.get(t).has(o2)) for (let s2 of Ot.get(t).get(o2)) r2.add(s2);
      else {
        let s2 = t(o2).filter((l) => l !== "!*"), a = new Set(s2);
        for (let l of a) r2.add(l);
        Ot.get(t).set(o2, a);
      }
    }
    function rd(e, t) {
      let r2 = t.offsets.sort(e), n = { base: /* @__PURE__ */ new Set(), defaults: /* @__PURE__ */ new Set(), components: /* @__PURE__ */ new Set(), utilities: /* @__PURE__ */ new Set(), variants: /* @__PURE__ */ new Set() };
      for (let [o2, s2] of r2) n[o2.layer].add(s2);
      return n;
    }
    function nd(e) {
      return async (t) => {
        let r2 = { base: null, components: null, utilities: null, variants: null };
        if (t.walkAtRules((m3) => {
          m3.name === "tailwind" && Object.keys(r2).includes(m3.params) && (r2[m3.params] = m3);
        }), Object.values(r2).every((m3) => m3 === null)) return t;
        let n = /* @__PURE__ */ new Set([...e.candidates ?? [], dt]), o2 = /* @__PURE__ */ new Set();
        He.DEBUG && console.time("Reading changed files");
        let s2 = [];
        for (let m3 of e.changedContent) {
          let y3 = ed(e.tailwindConfig, m3.extension), v2 = Ku(e, m3.extension);
          s2.push([m3, { transformer: y3, extractor: v2 }]);
        }
        let a = 500;
        for (let m3 = 0; m3 < s2.length; m3 += a) {
          let y3 = s2.slice(m3, m3 + a);
          await Promise.all(y3.map(async ([{ file: v2, content: x2 }, { transformer: k, extractor: w2 }]) => {
            x2 = v2 ? await Be.promises.readFile(v2, "utf8") : x2, td(k(x2), w2, n, o2);
          }));
        }
        He.DEBUG && console.timeEnd("Reading changed files");
        let l = e.classCache.size;
        He.DEBUG && console.time("Generate rules"), He.DEBUG && console.time("Sorting candidates");
        let c2 = new Set([...n].sort((m3, y3) => m3 === y3 ? 0 : m3 < y3 ? -1 : 1));
        He.DEBUG && console.timeEnd("Sorting candidates"), wa(c2, e), He.DEBUG && console.timeEnd("Generate rules"), He.DEBUG && console.time("Build stylesheet"), (e.stylesheetCache === null || e.classCache.size !== l) && (e.stylesheetCache = rd([...e.ruleCache], e)), He.DEBUG && console.timeEnd("Build stylesheet");
        let { defaults: i2, base: d3, components: u2, utilities: p2, variants: f3 } = e.stylesheetCache;
        r2.base && (r2.base.before(Ft([...d3, ...i2], r2.base.source, { layer: "base" })), r2.base.remove()), r2.components && (r2.components.before(Ft([...u2], r2.components.source, { layer: "components" })), r2.components.remove()), r2.utilities && (r2.utilities.before(Ft([...p2], r2.utilities.source, { layer: "utilities" })), r2.utilities.remove());
        let g3 = Array.from(f3).filter((m3) => {
          let y3 = m3.raws.tailwind?.parentLayer;
          return y3 === "components" ? r2.components !== null : y3 === "utilities" ? r2.utilities !== null : true;
        });
        r2.variants ? (r2.variants.before(Ft(g3, r2.variants.source, { layer: "variants" })), r2.variants.remove()) : g3.length > 0 && t.append(Ft(g3, t.source, { layer: "variants" })), t.source.end = t.source.end ?? t.source.start;
        let h2 = g3.some((m3) => m3.raws.tailwind?.parentLayer === "utilities");
        r2.utilities && p2.size === 0 && !h2 && de.warn("content-problems", ["No utility classes were detected in your source files. If this is unexpected, double-check the `content` option in your Tailwind CSS configuration.", "https://tailwindcss.com/docs/content-configuration"]), He.DEBUG && (console.log("Potential classes: ", n.size), console.log("Active contexts: ", Sn.size)), e.changedContent = [], t.walkAtRules("layer", (m3) => {
          Object.keys(r2).includes(m3.params) && m3.remove();
        });
      };
    }
    var Xa, He, Wn, qn, Ot, od = $(() => {
      O2(), rt(), Xa = he(vo()), pt(), Dn(), Ge(), Gu(), Xu(), He = it, Wn = { DEFAULT: Qu }, qn = { DEFAULT: (e) => e, svelte: (e) => e.replace(/(?:^|\s)class:/g, " ") }, Ot = /* @__PURE__ */ new WeakMap();
    });
    function Ar(e) {
      let t = /* @__PURE__ */ new Map();
      fe.root({ nodes: [e.clone()] }).walkRules((o2) => {
        (0, Or.default)((s2) => {
          s2.walkClasses((a) => {
            let l = a.parent.toString(), c2 = t.get(l);
            c2 || t.set(l, c2 = /* @__PURE__ */ new Set()), c2.add(a.value);
          });
        }).processSync(o2.selector);
      });
      let r2 = Array.from(t.values(), (o2) => Array.from(o2)), n = r2.flat();
      return Object.assign(n, { groups: r2 });
    }
    function Gn(e) {
      return oi.astSync(e);
    }
    function Ka(e, t) {
      let r2 = /* @__PURE__ */ new Set();
      for (let n of e) r2.add(n.split(t).pop());
      return Array.from(r2);
    }
    function ei(e, t) {
      let r2 = e.tailwindConfig.prefix;
      return typeof r2 == "function" ? r2(t) : r2 + t;
    }
    function* ti(e) {
      for (yield e; e.parent; ) yield e.parent, e = e.parent;
    }
    function sd(e, t = {}) {
      let r2 = e.nodes;
      e.nodes = [];
      let n = e.clone(t);
      return e.nodes = r2, n;
    }
    function ad(e) {
      for (let t of ti(e)) if (e !== t) {
        if (t.type === "root") break;
        e = sd(t, { nodes: [e] });
      }
      return e;
    }
    function id(e, t) {
      let r2 = /* @__PURE__ */ new Map();
      return e.walkRules((n) => {
        for (let a of ti(n)) if (a.raws.tailwind?.layer !== void 0) return;
        let o2 = ad(n), s2 = t.offsets.create("user");
        for (let a of Ar(n)) {
          let l = r2.get(a) || [];
          r2.set(a, l), l.push([{ layer: "user", sort: s2, important: false }, o2]);
        }
      }), r2;
    }
    function ld(e, t) {
      for (let r2 of e) {
        if (t.notClassCache.has(r2) || t.applyClassCache.has(r2)) continue;
        if (t.classCache.has(r2)) {
          t.applyClassCache.set(r2, t.classCache.get(r2).map(([o2, s2]) => [o2, s2.clone()]));
          continue;
        }
        let n = Array.from(ba(r2, t));
        if (n.length === 0) {
          t.notClassCache.add(r2);
          continue;
        }
        t.applyClassCache.set(r2, n);
      }
      return t.applyClassCache;
    }
    function cd(e) {
      let t = null;
      return { get: (r2) => (t = t || e(), t.get(r2)), has: (r2) => (t = t || e(), t.has(r2)) };
    }
    function ud(e) {
      return { get: (t) => e.flatMap((r2) => r2.get(t) || []), has: (t) => e.some((r2) => r2.has(t)) };
    }
    function ri(e) {
      let t = e.split(/[\s\t\n]+/g);
      return t[t.length - 1] === "!important" ? [t.slice(0, -1), true] : [t, false];
    }
    function ni(e, t, r2) {
      let n = /* @__PURE__ */ new Set(), o2 = [];
      if (e.walkAtRules("apply", (c2) => {
        let [i2] = ri(c2.params);
        for (let d3 of i2) n.add(d3);
        o2.push(c2);
      }), o2.length === 0) return;
      let s2 = ud([r2, ld(n, t)]);
      function a(c2, i2, d3) {
        let u2 = Gn(c2), p2 = Gn(i2), f3 = Gn(`.${at(d3)}`).nodes[0].nodes[0];
        return u2.each((g3) => {
          let h2 = /* @__PURE__ */ new Set();
          p2.each((m3) => {
            let y3 = false;
            m3 = m3.clone(), m3.walkClasses((v2) => {
              v2.value === f3.value && (y3 || (v2.replaceWith(...g3.nodes.map((x2) => x2.clone())), h2.add(m3), y3 = true));
            });
          });
          for (let m3 of h2) {
            let y3 = [[]];
            for (let v2 of m3.nodes) v2.type === "combinator" ? (y3.push(v2), y3.push([])) : y3[y3.length - 1].push(v2);
            m3.nodes = [];
            for (let v2 of y3) Array.isArray(v2) && v2.sort((x2, k) => x2.type === "tag" && k.type === "class" ? -1 : x2.type === "class" && k.type === "tag" ? 1 : x2.type === "class" && k.type === "pseudo" && k.value.startsWith("::") ? -1 : x2.type === "pseudo" && x2.value.startsWith("::") && k.type === "class" ? 1 : 0), m3.nodes = m3.nodes.concat(v2);
          }
          g3.replaceWith(...h2);
        }), u2.toString();
      }
      let l = /* @__PURE__ */ new Map();
      for (let c2 of o2) {
        let [i2] = l.get(c2.parent) || [[], c2.source];
        l.set(c2.parent, [i2, c2.source]);
        let [d3, u2] = ri(c2.params);
        if (c2.parent.type === "atrule") {
          if (c2.parent.name === "screen") {
            let p2 = c2.parent.params;
            throw c2.error(`@apply is not supported within nested at-rules like @screen. We suggest you write this as @apply ${d3.map((f3) => `${p2}:${f3}`).join(" ")} instead.`);
          }
          throw c2.error(`@apply is not supported within nested at-rules like @${c2.parent.name}. You can fix this by un-nesting @${c2.parent.name}.`);
        }
        for (let p2 of d3) {
          if ([ei(t, "group"), ei(t, "peer")].includes(p2)) throw c2.error(`@apply should not be used with the '${p2}' utility`);
          if (!s2.has(p2)) throw c2.error(`The \`${p2}\` class does not exist. If \`${p2}\` is a custom class, make sure it is defined within a \`@layer\` directive.`);
          let f3 = s2.get(p2);
          for (let [, g3] of f3) g3.type !== "atrule" && g3.walkRules(() => {
            throw c2.error([`The \`${p2}\` class cannot be used with \`@apply\` because \`@apply\` does not currently support nested CSS.`, "Rewrite the selector without nesting or configure the `tailwindcss/nesting` plugin:", "https://tailwindcss.com/docs/using-with-preprocessors#nesting"].join(`
`));
          });
          i2.push([p2, u2, f3]);
        }
      }
      for (let [c2, [i2, d3]] of l) {
        let u2 = [];
        for (let [f3, g3, h2] of i2) {
          let m3 = [f3, ...Ka([f3], t.tailwindConfig.separator)];
          for (let [y3, v2] of h2) {
            let x2 = Ar(c2), k = Ar(v2);
            if (k = k.groups.filter((b2) => b2.some((C) => m3.includes(C))).flat(), k = k.concat(Ka(k, t.tailwindConfig.separator)), x2.some((b2) => k.includes(b2))) throw v2.error(`You cannot \`@apply\` the \`${f3}\` utility here because it creates a circular dependency.`);
            let w2 = fe.root({ nodes: [v2.clone()] });
            w2.walk((b2) => {
              b2.source = d3;
            }), (v2.type !== "atrule" || v2.type === "atrule" && v2.name !== "keyframes") && w2.walkRules((b2) => {
              if (!Ar(b2).some((A2) => A2 === f3)) {
                b2.remove();
                return;
              }
              let C = typeof t.tailwindConfig.important == "string" ? t.tailwindConfig.important : null, S = c2.raws.tailwind !== void 0 && C && c2.selector.indexOf(C) === 0 ? c2.selector.slice(C.length) : c2.selector;
              S === "" && (S = c2.selector), b2.selector = a(S, b2.selector, f3), C && S !== c2.selector && (b2.selector = ha(b2.selector, C)), b2.walkDecls((A2) => {
                A2.important = y3.important || g3;
              });
              let E = (0, Or.default)().astSync(b2.selector);
              E.each((A2) => En(A2)), b2.selector = E.toString();
            }), w2.nodes[0] && u2.push([y3.sort, w2.nodes[0]]);
          }
        }
        let p2 = t.offsets.sort(u2).map((f3) => f3[1]);
        c2.after(p2);
      }
      for (let c2 of o2) c2.parent.nodes.length > 1 ? c2.remove() : c2.parent.remove();
      ni(e, t, r2);
    }
    function dd(e) {
      return (t) => {
        let r2 = cd(() => id(t, e));
        ni(t, e, r2);
      };
    }
    var Or, oi, pd = $(() => {
      O2(), ut(), Or = he(Ke()), Dn(), Ut(), ma(), In(), oi = (0, Or.default)();
    }), fd = T((e, t) => {
      O2(), function() {
        "use strict";
        function r2(s2, a, l) {
          if (!s2) return null;
          r2.caseSensitive || (s2 = s2.toLowerCase());
          var c2 = r2.threshold === null ? null : r2.threshold * s2.length, i2 = r2.thresholdAbsolute, d3;
          c2 !== null && i2 !== null ? d3 = Math.min(c2, i2) : c2 !== null ? d3 = c2 : i2 !== null ? d3 = i2 : d3 = null;
          var u2, p2, f3, g3, h2, m3 = a.length;
          for (h2 = 0; h2 < m3; h2++) if (p2 = a[h2], l && (p2 = p2[l]), !!p2 && (r2.caseSensitive ? f3 = p2 : f3 = p2.toLowerCase(), g3 = o2(s2, f3, d3), (d3 === null || g3 < d3) && (d3 = g3, l && r2.returnWinningObject ? u2 = a[h2] : u2 = p2, r2.returnFirstMatch))) return u2;
          return u2 || r2.nullResultValue;
        }
        r2.threshold = 0.4, r2.thresholdAbsolute = 20, r2.caseSensitive = false, r2.nullResultValue = null, r2.returnWinningObject = null, r2.returnFirstMatch = false, typeof t < "u" && t.exports ? t.exports = r2 : window.didYouMean = r2;
        var n = Math.pow(2, 32) - 1;
        function o2(s2, a, l) {
          l = l || l === 0 ? l : n;
          var c2 = s2.length, i2 = a.length;
          if (c2 === 0) return Math.min(l + 1, i2);
          if (i2 === 0) return Math.min(l + 1, c2);
          if (Math.abs(c2 - i2) > l) return l + 1;
          var d3 = [], u2, p2, f3, g3, h2;
          for (u2 = 0; u2 <= i2; u2++) d3[u2] = [u2];
          for (p2 = 0; p2 <= c2; p2++) d3[0][p2] = p2;
          for (u2 = 1; u2 <= i2; u2++) {
            for (f3 = n, g3 = 1, u2 > l && (g3 = u2 - l), h2 = i2 + 1, h2 > l + u2 && (h2 = l + u2), p2 = 1; p2 <= c2; p2++) p2 < g3 || p2 > h2 ? d3[u2][p2] = l + 1 : a.charAt(u2 - 1) === s2.charAt(p2 - 1) ? d3[u2][p2] = d3[u2 - 1][p2 - 1] : d3[u2][p2] = Math.min(d3[u2 - 1][p2 - 1] + 1, Math.min(d3[u2][p2 - 1] + 1, d3[u2 - 1][p2] + 1)), d3[u2][p2] < f3 && (f3 = d3[u2][p2]);
            if (f3 > l) return l + 1;
          }
          return d3[i2][c2];
        }
      }();
    }), hd = T((e, t) => {
      O2();
      var r2 = 40, n = 41, o2 = 39, s2 = 34, a = 92, l = 47, c2 = 44, i2 = 58, d3 = 42, u2 = 117, p2 = 85, f3 = 43, g3 = /^[a-f0-9?-]+$/i;
      t.exports = function(h2) {
        for (var m3 = [], y3 = h2, v2, x2, k, w2, b2, C, S, E, A2 = 0, _2 = y3.charCodeAt(A2), U = y3.length, D = [{ nodes: m3 }], j = 0, L, F = "", H = "", Q = ""; A2 < U; ) if (_2 <= 32) {
          v2 = A2;
          do
            v2 += 1, _2 = y3.charCodeAt(v2);
          while (_2 <= 32);
          w2 = y3.slice(A2, v2), k = m3[m3.length - 1], _2 === n && j ? Q = w2 : k && k.type === "div" ? (k.after = w2, k.sourceEndIndex += w2.length) : _2 === c2 || _2 === i2 || _2 === l && y3.charCodeAt(v2 + 1) !== d3 && (!L || L && L.type === "function" && false) ? H = w2 : m3.push({ type: "space", sourceIndex: A2, sourceEndIndex: v2, value: w2 }), A2 = v2;
        } else if (_2 === o2 || _2 === s2) {
          v2 = A2, x2 = _2 === o2 ? "'" : '"', w2 = { type: "string", sourceIndex: A2, quote: x2 };
          do
            if (b2 = false, v2 = y3.indexOf(x2, v2 + 1), ~v2) for (C = v2; y3.charCodeAt(C - 1) === a; ) C -= 1, b2 = !b2;
            else y3 += x2, v2 = y3.length - 1, w2.unclosed = true;
          while (b2);
          w2.value = y3.slice(A2 + 1, v2), w2.sourceEndIndex = w2.unclosed ? v2 : v2 + 1, m3.push(w2), A2 = v2 + 1, _2 = y3.charCodeAt(A2);
        } else if (_2 === l && y3.charCodeAt(A2 + 1) === d3) v2 = y3.indexOf("*/", A2), w2 = { type: "comment", sourceIndex: A2, sourceEndIndex: v2 + 2 }, v2 === -1 && (w2.unclosed = true, v2 = y3.length, w2.sourceEndIndex = v2), w2.value = y3.slice(A2 + 2, v2), m3.push(w2), A2 = v2 + 2, _2 = y3.charCodeAt(A2);
        else if ((_2 === l || _2 === d3) && L && L.type === "function") w2 = y3[A2], m3.push({ type: "word", sourceIndex: A2 - H.length, sourceEndIndex: A2 + w2.length, value: w2 }), A2 += 1, _2 = y3.charCodeAt(A2);
        else if (_2 === l || _2 === c2 || _2 === i2) w2 = y3[A2], m3.push({ type: "div", sourceIndex: A2 - H.length, sourceEndIndex: A2 + w2.length, value: w2, before: H, after: "" }), H = "", A2 += 1, _2 = y3.charCodeAt(A2);
        else if (r2 === _2) {
          v2 = A2;
          do
            v2 += 1, _2 = y3.charCodeAt(v2);
          while (_2 <= 32);
          if (E = A2, w2 = { type: "function", sourceIndex: A2 - F.length, value: F, before: y3.slice(E + 1, v2) }, A2 = v2, F === "url" && _2 !== o2 && _2 !== s2) {
            v2 -= 1;
            do
              if (b2 = false, v2 = y3.indexOf(")", v2 + 1), ~v2) for (C = v2; y3.charCodeAt(C - 1) === a; ) C -= 1, b2 = !b2;
              else y3 += ")", v2 = y3.length - 1, w2.unclosed = true;
            while (b2);
            S = v2;
            do
              S -= 1, _2 = y3.charCodeAt(S);
            while (_2 <= 32);
            E < S ? (A2 !== S + 1 ? w2.nodes = [{ type: "word", sourceIndex: A2, sourceEndIndex: S + 1, value: y3.slice(A2, S + 1) }] : w2.nodes = [], w2.unclosed && S + 1 !== v2 ? (w2.after = "", w2.nodes.push({ type: "space", sourceIndex: S + 1, sourceEndIndex: v2, value: y3.slice(S + 1, v2) })) : (w2.after = y3.slice(S + 1, v2), w2.sourceEndIndex = v2)) : (w2.after = "", w2.nodes = []), A2 = v2 + 1, w2.sourceEndIndex = w2.unclosed ? v2 : A2, _2 = y3.charCodeAt(A2), m3.push(w2);
          } else j += 1, w2.after = "", w2.sourceEndIndex = A2 + 1, m3.push(w2), D.push(w2), m3 = w2.nodes = [], L = w2;
          F = "";
        } else if (n === _2 && j) A2 += 1, _2 = y3.charCodeAt(A2), L.after = Q, L.sourceEndIndex += Q.length, Q = "", j -= 1, D[D.length - 1].sourceEndIndex = A2, D.pop(), L = D[j], m3 = L.nodes;
        else {
          v2 = A2;
          do
            _2 === a && (v2 += 1), v2 += 1, _2 = y3.charCodeAt(v2);
          while (v2 < U && !(_2 <= 32 || _2 === o2 || _2 === s2 || _2 === c2 || _2 === i2 || _2 === l || _2 === r2 || _2 === d3 && L && L.type === "function" || _2 === l && L.type === "function" || _2 === n && j));
          w2 = y3.slice(A2, v2), r2 === _2 ? F = w2 : (u2 === w2.charCodeAt(0) || p2 === w2.charCodeAt(0)) && f3 === w2.charCodeAt(1) && g3.test(w2.slice(2)) ? m3.push({ type: "unicode-range", sourceIndex: A2, sourceEndIndex: v2, value: w2 }) : m3.push({ type: "word", sourceIndex: A2, sourceEndIndex: v2, value: w2 }), A2 = v2;
        }
        for (A2 = D.length - 1; A2; A2 -= 1) D[A2].unclosed = true, D[A2].sourceEndIndex = y3.length;
        return D[0].nodes;
      };
    }), md = T((e, t) => {
      O2(), t.exports = function r2(n, o2, s2) {
        var a, l, c2, i2;
        for (a = 0, l = n.length; a < l; a += 1) c2 = n[a], s2 || (i2 = o2(c2, a, n)), i2 !== false && c2.type === "function" && Array.isArray(c2.nodes) && r2(c2.nodes, o2, s2), s2 && o2(c2, a, n);
      };
    }), gd = T((e, t) => {
      O2();
      function r2(o2, s2) {
        var a = o2.type, l = o2.value, c2, i2;
        return s2 && (i2 = s2(o2)) !== void 0 ? i2 : a === "word" || a === "space" ? l : a === "string" ? (c2 = o2.quote || "", c2 + l + (o2.unclosed ? "" : c2)) : a === "comment" ? "/*" + l + (o2.unclosed ? "" : "*/") : a === "div" ? (o2.before || "") + l + (o2.after || "") : Array.isArray(o2.nodes) ? (c2 = n(o2.nodes, s2), a !== "function" ? c2 : l + "(" + (o2.before || "") + c2 + (o2.after || "") + (o2.unclosed ? "" : ")")) : l;
      }
      function n(o2, s2) {
        var a, l;
        if (Array.isArray(o2)) {
          for (a = "", l = o2.length - 1; ~l; l -= 1) a = r2(o2[l], s2) + a;
          return a;
        }
        return r2(o2, s2);
      }
      t.exports = n;
    }), vd = T((e, t) => {
      O2();
      var r2 = 45, n = 43, o2 = 46, s2 = 101, a = 69;
      function l(c2) {
        var i2 = c2.charCodeAt(0), d3;
        if (i2 === n || i2 === r2) {
          if (d3 = c2.charCodeAt(1), d3 >= 48 && d3 <= 57) return true;
          var u2 = c2.charCodeAt(2);
          return d3 === o2 && u2 >= 48 && u2 <= 57;
        }
        return i2 === o2 ? (d3 = c2.charCodeAt(1), d3 >= 48 && d3 <= 57) : i2 >= 48 && i2 <= 57;
      }
      t.exports = function(c2) {
        var i2 = 0, d3 = c2.length, u2, p2, f3;
        if (d3 === 0 || !l(c2)) return false;
        for (u2 = c2.charCodeAt(i2), (u2 === n || u2 === r2) && i2++; i2 < d3 && (u2 = c2.charCodeAt(i2), !(u2 < 48 || u2 > 57)); ) i2 += 1;
        if (u2 = c2.charCodeAt(i2), p2 = c2.charCodeAt(i2 + 1), u2 === o2 && p2 >= 48 && p2 <= 57) for (i2 += 2; i2 < d3 && (u2 = c2.charCodeAt(i2), !(u2 < 48 || u2 > 57)); ) i2 += 1;
        if (u2 = c2.charCodeAt(i2), p2 = c2.charCodeAt(i2 + 1), f3 = c2.charCodeAt(i2 + 2), (u2 === s2 || u2 === a) && (p2 >= 48 && p2 <= 57 || (p2 === n || p2 === r2) && f3 >= 48 && f3 <= 57)) for (i2 += p2 === n || p2 === r2 ? 3 : 2; i2 < d3 && (u2 = c2.charCodeAt(i2), !(u2 < 48 || u2 > 57)); ) i2 += 1;
        return { number: c2.slice(0, i2), unit: c2.slice(i2) };
      };
    }), yd = T((e, t) => {
      O2();
      var r2 = hd(), n = md(), o2 = gd();
      function s2(a) {
        return this instanceof s2 ? (this.nodes = r2(a), this) : new s2(a);
      }
      s2.prototype.toString = function() {
        return Array.isArray(this.nodes) ? o2(this.nodes) : "";
      }, s2.prototype.walk = function(a, l) {
        return n(this.nodes, a, l), this;
      }, s2.unit = vd(), s2.walk = n, s2.stringify = o2, t.exports = s2;
    });
    function Yn(e) {
      return typeof e == "object" && e !== null;
    }
    function bd(e, t) {
      let r2 = Pt(t);
      do
        if (r2.pop(), (0, Lt.default)(e, r2) !== void 0) break;
      while (r2.length);
      return r2.length ? r2 : void 0;
    }
    function _t(e) {
      return typeof e == "string" ? e : e.reduce((t, r2, n) => r2.includes(".") ? `${t}[${r2}]` : n === 0 ? r2 : `${t}.${r2}`, "");
    }
    function si(e) {
      return e.map((t) => `'${t}'`).join(", ");
    }
    function ai(e) {
      return si(Object.keys(e));
    }
    function Hn(e, t, r2, n = {}) {
      let o2 = Array.isArray(t) ? _t(t) : t.replace(/^['"]+|['"]+$/g, ""), s2 = Array.isArray(t) ? t : Pt(o2), a = (0, Lt.default)(e.theme, s2, r2);
      if (a === void 0) {
        let c2 = `'${o2}' does not exist in your theme config.`, i2 = s2.slice(0, -1), d3 = (0, Lt.default)(e.theme, i2);
        if (Yn(d3)) {
          let u2 = Object.keys(d3).filter((f3) => Hn(e, [...i2, f3]).isValid), p2 = (0, li.default)(s2[s2.length - 1], u2);
          p2 ? c2 += ` Did you mean '${_t([...i2, p2])}'?` : u2.length > 0 && (c2 += ` '${_t(i2)}' has the following valid keys: ${si(u2)}`);
        } else {
          let u2 = bd(e.theme, o2);
          if (u2) {
            let p2 = (0, Lt.default)(e.theme, u2);
            Yn(p2) ? c2 += ` '${_t(u2)}' has the following keys: ${ai(p2)}` : c2 += ` '${_t(u2)}' is not an object.`;
          } else c2 += ` Your theme has the following top-level keys: ${ai(e.theme)}`;
        }
        return { isValid: false, error: c2 };
      }
      if (!(typeof a == "string" || typeof a == "number" || typeof a == "function" || a instanceof String || a instanceof Number || Array.isArray(a))) {
        let c2 = `'${o2}' was found but does not resolve to a string.`;
        if (Yn(a)) {
          let i2 = Object.keys(a).filter((d3) => Hn(e, [...s2, d3]).isValid);
          i2.length && (c2 += ` Did you mean something like '${_t([...s2, i2[0]])}'?`);
        }
        return { isValid: false, error: c2 };
      }
      let [l] = s2;
      return { isValid: true, value: ir(l)(a, n) };
    }
    function wd(e, t, r2) {
      t = t.map((o2) => ii(e, o2, r2));
      let n = [""];
      for (let o2 of t) o2.type === "div" && o2.value === "," ? n.push("") : n[n.length - 1] += Qn.default.stringify(o2);
      return n;
    }
    function ii(e, t, r2) {
      if (t.type === "function" && r2[t.value] !== void 0) {
        let n = wd(e, t.nodes, r2);
        t.type = "word", t.value = r2[t.value](e, ...n);
      }
      return t;
    }
    function xd(e, t, r2) {
      return Object.keys(r2).some((n) => t.includes(`${n}(`)) ? (0, Qn.default)(t).walk((n) => {
        ii(e, n, r2);
      }).toString() : t;
    }
    function* kd(e) {
      e = e.replace(/^['"]+|['"]+$/g, "");
      let t = e.match(/^([^\s]+)(?![^\[]*\])(?:\s*\/\s*([^\/\s]+))$/), r2;
      yield [e, void 0], t && (e = t[1], r2 = t[2], yield [e, r2]);
    }
    function Sd(e, t, r2) {
      let n = Array.from(kd(t)).map(([o2, s2]) => Object.assign(Hn(e, o2, r2, { opacityValue: s2 }), { resolvedPath: o2, alpha: s2 }));
      return n.find((o2) => o2.isValid) ?? n[0];
    }
    function Cd(e) {
      let t = e.tailwindConfig, r2 = { theme: (n, o2, ...s2) => {
        let { isValid: a, value: l, error: c2, alpha: i2 } = Sd(t, o2, s2.length ? s2 : void 0);
        if (!a) {
          let p2 = n.parent, f3 = p2?.raws.tailwind?.candidate;
          if (p2 && f3 !== void 0) {
            e.markInvalidUtilityNode(p2), p2.remove(), de.warn("invalid-theme-key-in-class", [`The utility \`${f3}\` contains an invalid theme value and was not generated.`]);
            return;
          }
          throw n.error(c2);
        }
        let d3 = Zt(l);
        return (i2 !== void 0 || d3 !== void 0 && typeof d3 == "function") && (i2 === void 0 && (i2 = 1), l = wt(d3, i2, d3)), l;
      }, screen: (n, o2) => {
        o2 = o2.replace(/^['"]+/g, "").replace(/['"]+$/g, "");
        let s2 = zt(t.theme.screens).find(({ name: a }) => a === o2);
        if (!s2) throw n.error(`The '${o2}' screen does not exist in your theme.`);
        return ur(s2);
      } };
      return (n) => {
        n.walk((o2) => {
          let s2 = ci[o2.type];
          s2 !== void 0 && (o2[s2] = xd(o2, o2[s2], r2));
        });
      };
    }
    var Lt, li, Qn, ci, Ad = $(() => {
      O2(), Lt = he(ws()), li = he(fd()), lr(), Qn = he(yd()), xn(), gn(), Mr(), Ht(), Kt(), Ge(), ci = { atrule: "params", decl: "value" };
    });
    function Od({ tailwindConfig: { theme: e } }) {
      return function(t) {
        t.walkAtRules("screen", (r2) => {
          let n = r2.params, o2 = zt(e.screens).find(({ name: s2 }) => s2 === n);
          if (!o2) throw r2.error(`No \`${n}\` screen found.`);
          r2.name = "media", r2.params = ur(o2);
        });
      };
    }
    var _d = $(() => {
      O2(), xn(), gn();
    });
    function Ed(e) {
      let t = e.filter((l) => l.type !== "pseudo" || l.nodes.length > 0 ? true : l.value.startsWith("::") || [":before", ":after", ":first-line", ":first-letter"].includes(l.value)).reverse(), r2 = /* @__PURE__ */ new Set(["tag", "class", "id", "attribute"]), n = t.findIndex((l) => r2.has(l.type));
      if (n === -1) return t.reverse().join("").trim();
      let o2 = t[n], s2 = Jn[o2.type] ? Jn[o2.type](o2) : o2;
      t = t.slice(0, n);
      let a = t.findIndex((l) => l.type === "combinator" && l.value === ">");
      return a !== -1 && (t.splice(0, a), t.unshift(_r.default.universal())), [s2, ...t.reverse()].join("").trim();
    }
    function Td(e) {
      return Er.has(e) || Er.set(e, ui.transformSync(e)), Er.get(e);
    }
    function Id({ tailwindConfig: e }) {
      return (t) => {
        let r2 = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set();
        if (t.walkAtRules("defaults", (o2) => {
          if (o2.nodes && o2.nodes.length > 0) {
            n.add(o2);
            return;
          }
          let s2 = o2.params;
          r2.has(s2) || r2.set(s2, /* @__PURE__ */ new Set()), r2.get(s2).add(o2.parent), o2.remove();
        }), De(e, "optimizeUniversalDefaults")) for (let o2 of n) {
          let s2 = /* @__PURE__ */ new Map(), a = r2.get(o2.params) ?? [];
          for (let l of a) for (let c2 of Td(l.selector)) {
            let i2 = c2.includes(":-") || c2.includes("::-") || c2.includes(":has") ? c2 : "__DEFAULT__", d3 = s2.get(i2) ?? /* @__PURE__ */ new Set();
            s2.set(i2, d3), d3.add(c2);
          }
          if (De(e, "optimizeUniversalDefaults")) {
            if (s2.size === 0) {
              o2.remove();
              continue;
            }
            for (let [, l] of s2) {
              let c2 = fe.rule({ source: o2.source });
              c2.selectors = [...l], c2.append(o2.nodes.map((i2) => i2.clone())), o2.before(c2);
            }
          }
          o2.remove();
        }
        else if (n.size) {
          let o2 = fe.rule({ selectors: ["*", "::before", "::after"] });
          for (let a of n) o2.append(a.nodes), o2.parent || a.before(o2), o2.source || (o2.source = a.source), a.remove();
          let s2 = o2.clone({ selectors: ["::backdrop"] });
          o2.after(s2);
        }
      };
    }
    var _r, Jn, ui, Er, Pd = $(() => {
      O2(), ut(), _r = he(Ke()), nt(), Jn = { id(e) {
        return _r.default.attribute({ attribute: "id", operator: "=", value: e.value, quoteMark: '"' });
      } }, ui = (0, _r.default)((e) => e.map((t) => {
        let r2 = t.split((n) => n.type === "combinator" && n.value === " ").pop();
        return Ed(r2);
      })), Er = /* @__PURE__ */ new Map();
    });
    function jd() {
      function e(t) {
        let r2 = null;
        t.each((n) => {
          if (!di.has(n.type)) {
            r2 = null;
            return;
          }
          if (r2 === null) {
            r2 = n;
            return;
          }
          let o2 = Zn[n.type];
          n.type === "atrule" && n.name === "font-face" ? r2 = n : o2.every((s2) => (n[s2] ?? "").replace(/\s+/g, " ") === (r2[s2] ?? "").replace(/\s+/g, " ")) ? (n.nodes && r2.append(n.nodes), n.remove()) : r2 = n;
        }), t.each((n) => {
          n.type === "atrule" && e(n);
        });
      }
      return (t) => {
        e(t);
      };
    }
    var Zn, di, Bd = $(() => {
      O2(), Zn = { atrule: ["name", "params"], rule: ["selector"] }, di = new Set(Object.keys(Zn));
    });
    function Dd() {
      return (e) => {
        e.walkRules((t) => {
          let r2 = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Set([]), o2 = /* @__PURE__ */ new Map();
          t.walkDecls((s2) => {
            if (s2.parent === t) {
              if (r2.has(s2.prop)) {
                if (r2.get(s2.prop).value === s2.value) {
                  n.add(r2.get(s2.prop)), r2.set(s2.prop, s2);
                  return;
                }
                o2.has(s2.prop) || o2.set(s2.prop, /* @__PURE__ */ new Set()), o2.get(s2.prop).add(r2.get(s2.prop)), o2.get(s2.prop).add(s2);
              }
              r2.set(s2.prop, s2);
            }
          });
          for (let s2 of n) s2.remove();
          for (let s2 of o2.values()) {
            let a = /* @__PURE__ */ new Map();
            for (let l of s2) {
              let c2 = $d(l.value);
              c2 !== null && (a.has(c2) || a.set(c2, /* @__PURE__ */ new Set()), a.get(c2).add(l));
            }
            for (let l of a.values()) {
              let c2 = Array.from(l).slice(0, -1);
              for (let i2 of c2) i2.remove();
            }
          }
        });
      };
    }
    function $d(e) {
      let t = /^-?\d*.?\d+([\w%]+)?$/g.exec(e);
      return t ? t[1] ?? pi : null;
    }
    var pi, Rd = $(() => {
      O2(), pi = Symbol("unitless-number");
    });
    function Md(e) {
      if (!e.walkAtRules) return;
      let t = /* @__PURE__ */ new Set();
      if (e.walkAtRules("apply", (r2) => {
        t.add(r2.parent);
      }), t.size !== 0) for (let r2 of t) {
        let n = [], o2 = [];
        for (let s2 of r2.nodes) s2.type === "atrule" && s2.name === "apply" ? (o2.length > 0 && (n.push(o2), o2 = []), n.push([s2])) : o2.push(s2);
        if (o2.length > 0 && n.push(o2), n.length !== 1) {
          for (let s2 of [...n].reverse()) {
            let a = r2.clone({ nodes: [] });
            a.append(s2), r2.after(a);
          }
          r2.remove();
        }
      }
    }
    function fi() {
      return (e) => {
        Md(e);
      };
    }
    var Ud = $(() => {
      O2();
    });
    function hi(e) {
      return async function(t, r2) {
        let { tailwindDirectives: n, applyDirectives: o2 } = Wu(t);
        fi()(t, r2);
        let s2 = e({ tailwindDirectives: n, applyDirectives: o2, registerDependency(a) {
          r2.messages.push({ plugin: "tailwindcss", parent: r2.opts.from, ...a });
        }, createContext(a, l) {
          return ja(a, l, t);
        } })(t, r2);
        if (s2.tailwindConfig.separator === "-") throw new Error("The '-' character cannot be used as a custom separator in JIT mode due to parsing ambiguity. Please use another character like '_' instead.");
        Vi(s2.tailwindConfig), await nd(s2)(t, r2), fi()(t, r2), dd(s2)(t, r2), Cd(s2)(t, r2), Od(s2)(t, r2), Id(s2)(t, r2), jd(s2)(t, r2), Dd(s2)(t, r2);
      };
    }
    var zd = $(() => {
      O2(), qu(), od(), pd(), Ad(), _d(), Pd(), Bd(), Rd(), Ud(), kr(), nt();
    });
    function Fd(e, t) {
      let r2 = null, n = null;
      return e.walkAtRules("config", (o2) => {
        if (n = o2.source?.input.file ?? t.opts.from ?? null, n === null) throw o2.error("The `@config` directive cannot be used without setting `from` in your PostCSS config.");
        if (r2) throw o2.error("Only one `@config` directive is allowed per file.");
        let s2 = o2.params.match(/(['"])(.*?)\1/);
        if (!s2) throw o2.error("A path is required when using the `@config` directive.");
        let a = s2[2];
        if (xe.isAbsolute(a)) throw o2.error("The `@config` directive cannot be used with an absolute path.");
        if (r2 = xe.resolve(xe.dirname(n), a), !Be.existsSync(r2)) throw o2.error(`The config file at "${a}" does not exist. Make sure the path is correct and the file exists.`);
        o2.remove();
      }), r2 || null;
    }
    var Ld = $(() => {
      O2(), rt(), St();
    }), Nd = T((e, t) => {
      O2(), Vu(), zd(), pt(), Ld(), t.exports = function(r2) {
        return { postcssPlugin: "tailwindcss", plugins: [it.DEBUG && function(n) {
          return console.log(`
`), console.time("JIT TOTAL"), n;
        }, async function(n, o2) {
          r2 = Fd(n, o2) ?? r2;
          let s2 = Nu(r2);
          if (n.type === "document") {
            let a = n.nodes.filter((l) => l.type === "root");
            for (let l of a) l.type === "root" && await hi(s2)(l, o2);
            return;
          }
          await hi(s2)(n, o2);
        }, it.DEBUG && function(n) {
          return console.timeEnd("JIT TOTAL"), console.log(`
`), n;
        }].filter(Boolean) };
      }, t.exports.postcss = true;
    }), Vd = T((e, t) => {
      O2(), t.exports = Nd();
    }), mi = T((e, t) => {
      O2(), t.exports = () => ["and_chr 114", "and_uc 15.5", "chrome 114", "chrome 113", "chrome 109", "edge 114", "firefox 114", "ios_saf 16.5", "ios_saf 16.4", "ios_saf 16.3", "ios_saf 16.1", "opera 99", "safari 16.5", "samsung 21"];
    }), Tr = {};
    Fe(Tr, { agents: () => gi, feature: () => Wd });
    function Wd() {
      return { status: "cr", title: "CSS Feature Queries", stats: { ie: { 6: "n", 7: "n", 8: "n", 9: "n", 10: "n", 11: "n", "5.5": "n" }, edge: { 12: "y", 13: "y", 14: "y", 15: "y", 16: "y", 17: "y", 18: "y", 79: "y", 80: "y", 81: "y", 83: "y", 84: "y", 85: "y", 86: "y", 87: "y", 88: "y", 89: "y", 90: "y", 91: "y", 92: "y", 93: "y", 94: "y", 95: "y", 96: "y", 97: "y", 98: "y", 99: "y", 100: "y", 101: "y", 102: "y", 103: "y", 104: "y", 105: "y", 106: "y", 107: "y", 108: "y", 109: "y", 110: "y", 111: "y", 112: "y", 113: "y", 114: "y" }, firefox: { 2: "n", 3: "n", 4: "n", 5: "n", 6: "n", 7: "n", 8: "n", 9: "n", 10: "n", 11: "n", 12: "n", 13: "n", 14: "n", 15: "n", 16: "n", 17: "n", 18: "n", 19: "n", 20: "n", 21: "n", 22: "y", 23: "y", 24: "y", 25: "y", 26: "y", 27: "y", 28: "y", 29: "y", 30: "y", 31: "y", 32: "y", 33: "y", 34: "y", 35: "y", 36: "y", 37: "y", 38: "y", 39: "y", 40: "y", 41: "y", 42: "y", 43: "y", 44: "y", 45: "y", 46: "y", 47: "y", 48: "y", 49: "y", 50: "y", 51: "y", 52: "y", 53: "y", 54: "y", 55: "y", 56: "y", 57: "y", 58: "y", 59: "y", 60: "y", 61: "y", 62: "y", 63: "y", 64: "y", 65: "y", 66: "y", 67: "y", 68: "y", 69: "y", 70: "y", 71: "y", 72: "y", 73: "y", 74: "y", 75: "y", 76: "y", 77: "y", 78: "y", 79: "y", 80: "y", 81: "y", 82: "y", 83: "y", 84: "y", 85: "y", 86: "y", 87: "y", 88: "y", 89: "y", 90: "y", 91: "y", 92: "y", 93: "y", 94: "y", 95: "y", 96: "y", 97: "y", 98: "y", 99: "y", 100: "y", 101: "y", 102: "y", 103: "y", 104: "y", 105: "y", 106: "y", 107: "y", 108: "y", 109: "y", 110: "y", 111: "y", 112: "y", 113: "y", 114: "y", 115: "y", 116: "y", 117: "y", "3.5": "n", "3.6": "n" }, chrome: { 4: "n", 5: "n", 6: "n", 7: "n", 8: "n", 9: "n", 10: "n", 11: "n", 12: "n", 13: "n", 14: "n", 15: "n", 16: "n", 17: "n", 18: "n", 19: "n", 20: "n", 21: "n", 22: "n", 23: "n", 24: "n", 25: "n", 26: "n", 27: "n", 28: "y", 29: "y", 30: "y", 31: "y", 32: "y", 33: "y", 34: "y", 35: "y", 36: "y", 37: "y", 38: "y", 39: "y", 40: "y", 41: "y", 42: "y", 43: "y", 44: "y", 45: "y", 46: "y", 47: "y", 48: "y", 49: "y", 50: "y", 51: "y", 52: "y", 53: "y", 54: "y", 55: "y", 56: "y", 57: "y", 58: "y", 59: "y", 60: "y", 61: "y", 62: "y", 63: "y", 64: "y", 65: "y", 66: "y", 67: "y", 68: "y", 69: "y", 70: "y", 71: "y", 72: "y", 73: "y", 74: "y", 75: "y", 76: "y", 77: "y", 78: "y", 79: "y", 80: "y", 81: "y", 83: "y", 84: "y", 85: "y", 86: "y", 87: "y", 88: "y", 89: "y", 90: "y", 91: "y", 92: "y", 93: "y", 94: "y", 95: "y", 96: "y", 97: "y", 98: "y", 99: "y", 100: "y", 101: "y", 102: "y", 103: "y", 104: "y", 105: "y", 106: "y", 107: "y", 108: "y", 109: "y", 110: "y", 111: "y", 112: "y", 113: "y", 114: "y", 115: "y", 116: "y", 117: "y" }, safari: { 4: "n", 5: "n", 6: "n", 7: "n", 8: "n", 9: "y", 10: "y", 11: "y", 12: "y", 13: "y", 14: "y", 15: "y", 17: "y", "9.1": "y", "10.1": "y", "11.1": "y", "12.1": "y", "13.1": "y", "14.1": "y", "15.1": "y", "15.2-15.3": "y", "15.4": "y", "15.5": "y", "15.6": "y", "16.0": "y", "16.1": "y", "16.2": "y", "16.3": "y", "16.4": "y", "16.5": "y", "16.6": "y", TP: "y", "3.1": "n", "3.2": "n", "5.1": "n", "6.1": "n", "7.1": "n" }, opera: { 9: "n", 11: "n", 12: "n", 15: "y", 16: "y", 17: "y", 18: "y", 19: "y", 20: "y", 21: "y", 22: "y", 23: "y", 24: "y", 25: "y", 26: "y", 27: "y", 28: "y", 29: "y", 30: "y", 31: "y", 32: "y", 33: "y", 34: "y", 35: "y", 36: "y", 37: "y", 38: "y", 39: "y", 40: "y", 41: "y", 42: "y", 43: "y", 44: "y", 45: "y", 46: "y", 47: "y", 48: "y", 49: "y", 50: "y", 51: "y", 52: "y", 53: "y", 54: "y", 55: "y", 56: "y", 57: "y", 58: "y", 60: "y", 62: "y", 63: "y", 64: "y", 65: "y", 66: "y", 67: "y", 68: "y", 69: "y", 70: "y", 71: "y", 72: "y", 73: "y", 74: "y", 75: "y", 76: "y", 77: "y", 78: "y", 79: "y", 80: "y", 81: "y", 82: "y", 83: "y", 84: "y", 85: "y", 86: "y", 87: "y", 88: "y", 89: "y", 90: "y", 91: "y", 92: "y", 93: "y", 94: "y", 95: "y", 96: "y", 97: "y", 98: "y", 99: "y", 100: "y", "12.1": "y", "9.5-9.6": "n", "10.0-10.1": "n", "10.5": "n", "10.6": "n", "11.1": "n", "11.5": "n", "11.6": "n" }, ios_saf: { 8: "n", 17: "y", "9.0-9.2": "y", "9.3": "y", "10.0-10.2": "y", "10.3": "y", "11.0-11.2": "y", "11.3-11.4": "y", "12.0-12.1": "y", "12.2-12.5": "y", "13.0-13.1": "y", "13.2": "y", "13.3": "y", "13.4-13.7": "y", "14.0-14.4": "y", "14.5-14.8": "y", "15.0-15.1": "y", "15.2-15.3": "y", "15.4": "y", "15.5": "y", "15.6": "y", "16.0": "y", "16.1": "y", "16.2": "y", "16.3": "y", "16.4": "y", "16.5": "y", "16.6": "y", "3.2": "n", "4.0-4.1": "n", "4.2-4.3": "n", "5.0-5.1": "n", "6.0-6.1": "n", "7.0-7.1": "n", "8.1-8.4": "n" }, op_mini: { all: "y" }, android: { 3: "n", 4: "n", 114: "y", "4.4": "y", "4.4.3-4.4.4": "y", "2.1": "n", "2.2": "n", "2.3": "n", "4.1": "n", "4.2-4.3": "n" }, bb: { 7: "n", 10: "n" }, op_mob: { 10: "n", 11: "n", 12: "n", 73: "y", "11.1": "n", "11.5": "n", "12.1": "n" }, and_chr: { 114: "y" }, and_ff: { 115: "y" }, ie_mob: { 10: "n", 11: "n" }, and_uc: { "15.5": "y" }, samsung: { 4: "y", 20: "y", 21: "y", "5.0-5.4": "y", "6.2-6.4": "y", "7.2-7.4": "y", "8.2": "y", "9.2": "y", "10.1": "y", "11.1-11.2": "y", "12.0": "y", "13.0": "y", "14.0": "y", "15.0": "y", "16.0": "y", "17.0": "y", "18.0": "y", "19.0": "y" }, and_qq: { "13.1": "y" }, baidu: { "13.18": "y" }, kaios: { "2.5": "y", "3.0-3.1": "y" } } };
    }
    var gi, Xn = $(() => {
      O2(), gi = { ie: { prefix: "ms" }, edge: { prefix: "webkit", prefix_exceptions: { 12: "ms", 13: "ms", 14: "ms", 15: "ms", 16: "ms", 17: "ms", 18: "ms" } }, firefox: { prefix: "moz" }, chrome: { prefix: "webkit" }, safari: { prefix: "webkit" }, opera: { prefix: "webkit", prefix_exceptions: { 9: "o", 11: "o", 12: "o", "9.5-9.6": "o", "10.0-10.1": "o", "10.5": "o", "10.6": "o", "11.1": "o", "11.5": "o", "11.6": "o", "12.1": "o" } }, ios_saf: { prefix: "webkit" }, op_mini: { prefix: "o" }, android: { prefix: "webkit" }, bb: { prefix: "webkit" }, op_mob: { prefix: "o", prefix_exceptions: { 73: "webkit" } }, and_chr: { prefix: "webkit" }, and_ff: { prefix: "moz" }, ie_mob: { prefix: "ms" }, and_uc: { prefix: "webkit", prefix_exceptions: { "15.5": "webkit" } }, samsung: { prefix: "webkit" }, and_qq: { prefix: "webkit" }, baidu: { prefix: "webkit" }, kaios: { prefix: "moz" } };
    }), qd = T(() => {
      O2();
    }), _e = T((e, t) => {
      O2();
      var { list: r2 } = Re();
      t.exports.error = function(n) {
        let o2 = new Error(n);
        throw o2.autoprefixer = true, o2;
      }, t.exports.uniq = function(n) {
        return [...new Set(n)];
      }, t.exports.removeNote = function(n) {
        return n.includes(" ") ? n.split(" ")[0] : n;
      }, t.exports.escapeRegexp = function(n) {
        return n.replace(/[$()*+-.?[\\\]^{|}]/g, "\\$&");
      }, t.exports.regexp = function(n, o2 = true) {
        return o2 && (n = this.escapeRegexp(n)), new RegExp(`(^|[\\s,(])(${n}($|[\\s(,]))`, "gi");
      }, t.exports.editList = function(n, o2) {
        let s2 = r2.comma(n), a = o2(s2, []);
        if (s2 === a) return n;
        let l = n.match(/,\s*/);
        return l = l ? l[0] : ", ", a.join(l);
      }, t.exports.splitSelector = function(n) {
        return r2.comma(n).map((o2) => r2.space(o2).map((s2) => s2.split(/(?=\.|#)/g)));
      };
    }), gt = T((e, t) => {
      O2();
      var r2 = mi(), n = (Xn(), Tr).agents, o2 = _e(), s2 = class {
        static prefixes() {
          if (this.prefixesCache) return this.prefixesCache;
          this.prefixesCache = [];
          for (let a in n) this.prefixesCache.push(`-${n[a].prefix}-`);
          return this.prefixesCache = o2.uniq(this.prefixesCache).sort((a, l) => l.length - a.length), this.prefixesCache;
        }
        static withPrefix(a) {
          return this.prefixesRegexp || (this.prefixesRegexp = new RegExp(this.prefixes().join("|"))), this.prefixesRegexp.test(a);
        }
        constructor(a, l, c2, i2) {
          this.data = a, this.options = c2 || {}, this.browserslistOpts = i2 || {}, this.selected = this.parse(l);
        }
        parse(a) {
          let l = {};
          for (let c2 in this.browserslistOpts) l[c2] = this.browserslistOpts[c2];
          return l.path = this.options.from, r2(a, l);
        }
        prefix(a) {
          let [l, c2] = a.split(" "), i2 = this.data[l], d3 = i2.prefix_exceptions && i2.prefix_exceptions[c2];
          return d3 || (d3 = i2.prefix), `-${d3}-`;
        }
        isSelected(a) {
          return this.selected.includes(a);
        }
      };
      t.exports = s2;
    }), Ir = T((e, t) => {
      O2(), t.exports = { prefix(r2) {
        let n = r2.match(/^(-\w+-)/);
        return n ? n[0] : "";
      }, unprefixed(r2) {
        return r2.replace(/^-\w+-/, "");
      } };
    }), Nt = T((e, t) => {
      O2();
      var r2 = gt(), n = Ir(), o2 = _e();
      function s2(l, c2) {
        let i2 = new l.constructor();
        for (let d3 of Object.keys(l || {})) {
          let u2 = l[d3];
          d3 === "parent" && typeof u2 == "object" ? c2 && (i2[d3] = c2) : d3 === "source" || d3 === null ? i2[d3] = u2 : Array.isArray(u2) ? i2[d3] = u2.map((p2) => s2(p2, i2)) : d3 !== "_autoprefixerPrefix" && d3 !== "_autoprefixerValues" && d3 !== "proxyCache" && (typeof u2 == "object" && u2 !== null && (u2 = s2(u2, i2)), i2[d3] = u2);
        }
        return i2;
      }
      var a = class {
        static hack(l) {
          return this.hacks || (this.hacks = {}), l.names.map((c2) => (this.hacks[c2] = l, this.hacks[c2]));
        }
        static load(l, c2, i2) {
          let d3 = this.hacks && this.hacks[l];
          return d3 ? new d3(l, c2, i2) : new this(l, c2, i2);
        }
        static clone(l, c2) {
          let i2 = s2(l);
          for (let d3 in c2) i2[d3] = c2[d3];
          return i2;
        }
        constructor(l, c2, i2) {
          this.prefixes = c2, this.name = l, this.all = i2;
        }
        parentPrefix(l) {
          let c2;
          return typeof l._autoprefixerPrefix < "u" ? c2 = l._autoprefixerPrefix : l.type === "decl" && l.prop[0] === "-" ? c2 = n.prefix(l.prop) : l.type === "root" ? c2 = false : l.type === "rule" && l.selector.includes(":-") && /:(-\w+-)/.test(l.selector) ? c2 = l.selector.match(/:(-\w+-)/)[1] : l.type === "atrule" && l.name[0] === "-" ? c2 = n.prefix(l.name) : c2 = this.parentPrefix(l.parent), r2.prefixes().includes(c2) || (c2 = false), l._autoprefixerPrefix = c2, l._autoprefixerPrefix;
        }
        process(l, c2) {
          if (!this.check(l)) return;
          let i2 = this.parentPrefix(l), d3 = this.prefixes.filter((p2) => !i2 || i2 === o2.removeNote(p2)), u2 = [];
          for (let p2 of d3) this.add(l, p2, u2.concat([p2]), c2) && u2.push(p2);
          return u2;
        }
        clone(l, c2) {
          return a.clone(l, c2);
        }
      };
      t.exports = a;
    }), Y = T((e, t) => {
      O2();
      var r2 = Nt(), n = gt(), o2 = _e(), s2 = class extends r2 {
        check() {
          return true;
        }
        prefixed(a, l) {
          return l + a;
        }
        normalize(a) {
          return a;
        }
        otherPrefixes(a, l) {
          for (let c2 of n.prefixes()) if (c2 !== l && a.includes(c2)) return true;
          return false;
        }
        set(a, l) {
          return a.prop = this.prefixed(a.prop, l), a;
        }
        needCascade(a) {
          return a._autoprefixerCascade || (a._autoprefixerCascade = this.all.options.cascade !== false && a.raw("before").includes(`
`)), a._autoprefixerCascade;
        }
        maxPrefixed(a, l) {
          if (l._autoprefixerMax) return l._autoprefixerMax;
          let c2 = 0;
          for (let i2 of a) i2 = o2.removeNote(i2), i2.length > c2 && (c2 = i2.length);
          return l._autoprefixerMax = c2, l._autoprefixerMax;
        }
        calcBefore(a, l, c2 = "") {
          let i2 = this.maxPrefixed(a, l) - o2.removeNote(c2).length, d3 = l.raw("before");
          return i2 > 0 && (d3 += Array(i2).fill(" ").join("")), d3;
        }
        restoreBefore(a) {
          let l = a.raw("before").split(`
`), c2 = l[l.length - 1];
          this.all.group(a).up((i2) => {
            let d3 = i2.raw("before").split(`
`), u2 = d3[d3.length - 1];
            u2.length < c2.length && (c2 = u2);
          }), l[l.length - 1] = c2, a.raws.before = l.join(`
`);
        }
        insert(a, l, c2) {
          let i2 = this.set(this.clone(a), l);
          if (!(!i2 || a.parent.some((d3) => d3.prop === i2.prop && d3.value === i2.value))) return this.needCascade(a) && (i2.raws.before = this.calcBefore(c2, a, l)), a.parent.insertBefore(a, i2);
        }
        isAlready(a, l) {
          let c2 = this.all.group(a).up((i2) => i2.prop === l);
          return c2 || (c2 = this.all.group(a).down((i2) => i2.prop === l)), c2;
        }
        add(a, l, c2, i2) {
          let d3 = this.prefixed(a.prop, l);
          if (!(this.isAlready(a, d3) || this.otherPrefixes(a.value, l))) return this.insert(a, l, c2, i2);
        }
        process(a, l) {
          if (!this.needCascade(a)) {
            super.process(a, l);
            return;
          }
          let c2 = super.process(a, l);
          !c2 || !c2.length || (this.restoreBefore(a), a.raws.before = this.calcBefore(c2, a));
        }
        old(a, l) {
          return [this.prefixed(a, l)];
        }
      };
      t.exports = s2;
    }), Gd = T((e, t) => {
      O2(), t.exports = function r2(n) {
        return { mul: (o2) => new r2(n * o2), div: (o2) => new r2(n / o2), simplify: () => new r2(n), toString: () => n.toString() };
      };
    }), Yd = T((e, t) => {
      O2();
      var r2 = Gd(), n = Nt(), o2 = _e(), s2 = /(min|max)-resolution\s*:\s*\d*\.?\d+(dppx|dpcm|dpi|x)/gi, a = /(min|max)-resolution(\s*:\s*)(\d*\.?\d+)(dppx|dpcm|dpi|x)/i, l = class extends n {
        prefixName(c2, i2) {
          return c2 === "-moz-" ? i2 + "--moz-device-pixel-ratio" : c2 + i2 + "-device-pixel-ratio";
        }
        prefixQuery(c2, i2, d3, u2, p2) {
          return u2 = new r2(u2), p2 === "dpi" ? u2 = u2.div(96) : p2 === "dpcm" && (u2 = u2.mul(2.54).div(96)), u2 = u2.simplify(), c2 === "-o-" && (u2 = u2.n + "/" + u2.d), this.prefixName(c2, i2) + d3 + u2;
        }
        clean(c2) {
          if (!this.bad) {
            this.bad = [];
            for (let i2 of this.prefixes) this.bad.push(this.prefixName(i2, "min")), this.bad.push(this.prefixName(i2, "max"));
          }
          c2.params = o2.editList(c2.params, (i2) => i2.filter((d3) => this.bad.every((u2) => !d3.includes(u2))));
        }
        process(c2) {
          let i2 = this.parentPrefix(c2), d3 = i2 ? [i2] : this.prefixes;
          c2.params = o2.editList(c2.params, (u2, p2) => {
            for (let f3 of u2) {
              if (!f3.includes("min-resolution") && !f3.includes("max-resolution")) {
                p2.push(f3);
                continue;
              }
              for (let g3 of d3) {
                let h2 = f3.replace(s2, (m3) => {
                  let y3 = m3.match(a);
                  return this.prefixQuery(g3, y3[1], y3[2], y3[3], y3[4]);
                });
                p2.push(h2);
              }
              p2.push(f3);
            }
            return o2.uniq(p2);
          });
        }
      };
      t.exports = l;
    }), Hd = T((e, t) => {
      O2();
      var r2 = 40, n = 41, o2 = 39, s2 = 34, a = 92, l = 47, c2 = 44, i2 = 58, d3 = 42, u2 = 117, p2 = 85, f3 = 43, g3 = /^[a-f0-9?-]+$/i;
      t.exports = function(h2) {
        for (var m3 = [], y3 = h2, v2, x2, k, w2, b2, C, S, E, A2 = 0, _2 = y3.charCodeAt(A2), U = y3.length, D = [{ nodes: m3 }], j = 0, L, F = "", H = "", Q = ""; A2 < U; ) if (_2 <= 32) {
          v2 = A2;
          do
            v2 += 1, _2 = y3.charCodeAt(v2);
          while (_2 <= 32);
          w2 = y3.slice(A2, v2), k = m3[m3.length - 1], _2 === n && j ? Q = w2 : k && k.type === "div" ? (k.after = w2, k.sourceEndIndex += w2.length) : _2 === c2 || _2 === i2 || _2 === l && y3.charCodeAt(v2 + 1) !== d3 && (!L || L && L.type === "function" && L.value !== "calc") ? H = w2 : m3.push({ type: "space", sourceIndex: A2, sourceEndIndex: v2, value: w2 }), A2 = v2;
        } else if (_2 === o2 || _2 === s2) {
          v2 = A2, x2 = _2 === o2 ? "'" : '"', w2 = { type: "string", sourceIndex: A2, quote: x2 };
          do
            if (b2 = false, v2 = y3.indexOf(x2, v2 + 1), ~v2) for (C = v2; y3.charCodeAt(C - 1) === a; ) C -= 1, b2 = !b2;
            else y3 += x2, v2 = y3.length - 1, w2.unclosed = true;
          while (b2);
          w2.value = y3.slice(A2 + 1, v2), w2.sourceEndIndex = w2.unclosed ? v2 : v2 + 1, m3.push(w2), A2 = v2 + 1, _2 = y3.charCodeAt(A2);
        } else if (_2 === l && y3.charCodeAt(A2 + 1) === d3) v2 = y3.indexOf("*/", A2), w2 = { type: "comment", sourceIndex: A2, sourceEndIndex: v2 + 2 }, v2 === -1 && (w2.unclosed = true, v2 = y3.length, w2.sourceEndIndex = v2), w2.value = y3.slice(A2 + 2, v2), m3.push(w2), A2 = v2 + 2, _2 = y3.charCodeAt(A2);
        else if ((_2 === l || _2 === d3) && L && L.type === "function" && L.value === "calc") w2 = y3[A2], m3.push({ type: "word", sourceIndex: A2 - H.length, sourceEndIndex: A2 + w2.length, value: w2 }), A2 += 1, _2 = y3.charCodeAt(A2);
        else if (_2 === l || _2 === c2 || _2 === i2) w2 = y3[A2], m3.push({ type: "div", sourceIndex: A2 - H.length, sourceEndIndex: A2 + w2.length, value: w2, before: H, after: "" }), H = "", A2 += 1, _2 = y3.charCodeAt(A2);
        else if (r2 === _2) {
          v2 = A2;
          do
            v2 += 1, _2 = y3.charCodeAt(v2);
          while (_2 <= 32);
          if (E = A2, w2 = { type: "function", sourceIndex: A2 - F.length, value: F, before: y3.slice(E + 1, v2) }, A2 = v2, F === "url" && _2 !== o2 && _2 !== s2) {
            v2 -= 1;
            do
              if (b2 = false, v2 = y3.indexOf(")", v2 + 1), ~v2) for (C = v2; y3.charCodeAt(C - 1) === a; ) C -= 1, b2 = !b2;
              else y3 += ")", v2 = y3.length - 1, w2.unclosed = true;
            while (b2);
            S = v2;
            do
              S -= 1, _2 = y3.charCodeAt(S);
            while (_2 <= 32);
            E < S ? (A2 !== S + 1 ? w2.nodes = [{ type: "word", sourceIndex: A2, sourceEndIndex: S + 1, value: y3.slice(A2, S + 1) }] : w2.nodes = [], w2.unclosed && S + 1 !== v2 ? (w2.after = "", w2.nodes.push({ type: "space", sourceIndex: S + 1, sourceEndIndex: v2, value: y3.slice(S + 1, v2) })) : (w2.after = y3.slice(S + 1, v2), w2.sourceEndIndex = v2)) : (w2.after = "", w2.nodes = []), A2 = v2 + 1, w2.sourceEndIndex = w2.unclosed ? v2 : A2, _2 = y3.charCodeAt(A2), m3.push(w2);
          } else j += 1, w2.after = "", w2.sourceEndIndex = A2 + 1, m3.push(w2), D.push(w2), m3 = w2.nodes = [], L = w2;
          F = "";
        } else if (n === _2 && j) A2 += 1, _2 = y3.charCodeAt(A2), L.after = Q, L.sourceEndIndex += Q.length, Q = "", j -= 1, D[D.length - 1].sourceEndIndex = A2, D.pop(), L = D[j], m3 = L.nodes;
        else {
          v2 = A2;
          do
            _2 === a && (v2 += 1), v2 += 1, _2 = y3.charCodeAt(v2);
          while (v2 < U && !(_2 <= 32 || _2 === o2 || _2 === s2 || _2 === c2 || _2 === i2 || _2 === l || _2 === r2 || _2 === d3 && L && L.type === "function" && L.value === "calc" || _2 === l && L.type === "function" && L.value === "calc" || _2 === n && j));
          w2 = y3.slice(A2, v2), r2 === _2 ? F = w2 : (u2 === w2.charCodeAt(0) || p2 === w2.charCodeAt(0)) && f3 === w2.charCodeAt(1) && g3.test(w2.slice(2)) ? m3.push({ type: "unicode-range", sourceIndex: A2, sourceEndIndex: v2, value: w2 }) : m3.push({ type: "word", sourceIndex: A2, sourceEndIndex: v2, value: w2 }), A2 = v2;
        }
        for (A2 = D.length - 1; A2; A2 -= 1) D[A2].unclosed = true, D[A2].sourceEndIndex = y3.length;
        return D[0].nodes;
      };
    }), Qd = T((e, t) => {
      O2(), t.exports = function r2(n, o2, s2) {
        var a, l, c2, i2;
        for (a = 0, l = n.length; a < l; a += 1) c2 = n[a], s2 || (i2 = o2(c2, a, n)), i2 !== false && c2.type === "function" && Array.isArray(c2.nodes) && r2(c2.nodes, o2, s2), s2 && o2(c2, a, n);
      };
    }), Jd = T((e, t) => {
      O2();
      function r2(o2, s2) {
        var a = o2.type, l = o2.value, c2, i2;
        return s2 && (i2 = s2(o2)) !== void 0 ? i2 : a === "word" || a === "space" ? l : a === "string" ? (c2 = o2.quote || "", c2 + l + (o2.unclosed ? "" : c2)) : a === "comment" ? "/*" + l + (o2.unclosed ? "" : "*/") : a === "div" ? (o2.before || "") + l + (o2.after || "") : Array.isArray(o2.nodes) ? (c2 = n(o2.nodes, s2), a !== "function" ? c2 : l + "(" + (o2.before || "") + c2 + (o2.after || "") + (o2.unclosed ? "" : ")")) : l;
      }
      function n(o2, s2) {
        var a, l;
        if (Array.isArray(o2)) {
          for (a = "", l = o2.length - 1; ~l; l -= 1) a = r2(o2[l], s2) + a;
          return a;
        }
        return r2(o2, s2);
      }
      t.exports = n;
    }), Zd = T((e, t) => {
      O2();
      var r2 = 45, n = 43, o2 = 46, s2 = 101, a = 69;
      function l(c2) {
        var i2 = c2.charCodeAt(0), d3;
        if (i2 === n || i2 === r2) {
          if (d3 = c2.charCodeAt(1), d3 >= 48 && d3 <= 57) return true;
          var u2 = c2.charCodeAt(2);
          return d3 === o2 && u2 >= 48 && u2 <= 57;
        }
        return i2 === o2 ? (d3 = c2.charCodeAt(1), d3 >= 48 && d3 <= 57) : i2 >= 48 && i2 <= 57;
      }
      t.exports = function(c2) {
        var i2 = 0, d3 = c2.length, u2, p2, f3;
        if (d3 === 0 || !l(c2)) return false;
        for (u2 = c2.charCodeAt(i2), (u2 === n || u2 === r2) && i2++; i2 < d3 && (u2 = c2.charCodeAt(i2), !(u2 < 48 || u2 > 57)); ) i2 += 1;
        if (u2 = c2.charCodeAt(i2), p2 = c2.charCodeAt(i2 + 1), u2 === o2 && p2 >= 48 && p2 <= 57) for (i2 += 2; i2 < d3 && (u2 = c2.charCodeAt(i2), !(u2 < 48 || u2 > 57)); ) i2 += 1;
        if (u2 = c2.charCodeAt(i2), p2 = c2.charCodeAt(i2 + 1), f3 = c2.charCodeAt(i2 + 2), (u2 === s2 || u2 === a) && (p2 >= 48 && p2 <= 57 || (p2 === n || p2 === r2) && f3 >= 48 && f3 <= 57)) for (i2 += p2 === n || p2 === r2 ? 3 : 2; i2 < d3 && (u2 = c2.charCodeAt(i2), !(u2 < 48 || u2 > 57)); ) i2 += 1;
        return { number: c2.slice(0, i2), unit: c2.slice(i2) };
      };
    }), Kn = T((e, t) => {
      O2();
      var r2 = Hd(), n = Qd(), o2 = Jd();
      function s2(a) {
        return this instanceof s2 ? (this.nodes = r2(a), this) : new s2(a);
      }
      s2.prototype.toString = function() {
        return Array.isArray(this.nodes) ? o2(this.nodes) : "";
      }, s2.prototype.walk = function(a, l) {
        return n(this.nodes, a, l), this;
      }, s2.unit = Zd(), s2.walk = n, s2.stringify = o2, t.exports = s2;
    }), Xd = T((e, t) => {
      O2();
      var { list: r2 } = Re(), n = Kn(), o2 = gt(), s2 = Ir(), a = class {
        constructor(l) {
          this.props = ["transition", "transition-property"], this.prefixes = l;
        }
        add(l, c2) {
          let i2, d3, u2 = this.prefixes.add[l.prop], p2 = this.ruleVendorPrefixes(l), f3 = p2 || u2 && u2.prefixes || [], g3 = this.parse(l.value), h2 = g3.map((x2) => this.findProp(x2)), m3 = [];
          if (h2.some((x2) => x2[0] === "-")) return;
          for (let x2 of g3) {
            if (d3 = this.findProp(x2), d3[0] === "-") continue;
            let k = this.prefixes.add[d3];
            if (!(!k || !k.prefixes)) for (i2 of k.prefixes) {
              if (p2 && !p2.some((b2) => i2.includes(b2))) continue;
              let w2 = this.prefixes.prefixed(d3, i2);
              w2 !== "-ms-transform" && !h2.includes(w2) && (this.disabled(d3, i2) || m3.push(this.clone(d3, w2, x2)));
            }
          }
          g3 = g3.concat(m3);
          let y3 = this.stringify(g3), v2 = this.stringify(this.cleanFromUnprefixed(g3, "-webkit-"));
          if (f3.includes("-webkit-") && this.cloneBefore(l, `-webkit-${l.prop}`, v2), this.cloneBefore(l, l.prop, v2), f3.includes("-o-")) {
            let x2 = this.stringify(this.cleanFromUnprefixed(g3, "-o-"));
            this.cloneBefore(l, `-o-${l.prop}`, x2);
          }
          for (i2 of f3) if (i2 !== "-webkit-" && i2 !== "-o-") {
            let x2 = this.stringify(this.cleanOtherPrefixes(g3, i2));
            this.cloneBefore(l, i2 + l.prop, x2);
          }
          y3 !== l.value && !this.already(l, l.prop, y3) && (this.checkForWarning(c2, l), l.cloneBefore(), l.value = y3);
        }
        findProp(l) {
          let c2 = l[0].value;
          if (/^\d/.test(c2)) {
            for (let [i2, d3] of l.entries()) if (i2 !== 0 && d3.type === "word") return d3.value;
          }
          return c2;
        }
        already(l, c2, i2) {
          return l.parent.some((d3) => d3.prop === c2 && d3.value === i2);
        }
        cloneBefore(l, c2, i2) {
          this.already(l, c2, i2) || l.cloneBefore({ prop: c2, value: i2 });
        }
        checkForWarning(l, c2) {
          if (c2.prop !== "transition-property") return;
          let i2 = false, d3 = false;
          c2.parent.each((u2) => {
            if (u2.type !== "decl" || u2.prop.indexOf("transition-") !== 0) return;
            let p2 = r2.comma(u2.value);
            if (u2.prop === "transition-property") {
              p2.forEach((f3) => {
                let g3 = this.prefixes.add[f3];
                g3 && g3.prefixes && g3.prefixes.length > 0 && (i2 = true);
              });
              return;
            }
            return d3 = d3 || p2.length > 1, false;
          }), i2 && d3 && c2.warn(l, "Replace transition-property to transition, because Autoprefixer could not support any cases of transition-property and other transition-*");
        }
        remove(l) {
          let c2 = this.parse(l.value);
          c2 = c2.filter((p2) => {
            let f3 = this.prefixes.remove[this.findProp(p2)];
            return !f3 || !f3.remove;
          });
          let i2 = this.stringify(c2);
          if (l.value === i2) return;
          if (c2.length === 0) {
            l.remove();
            return;
          }
          let d3 = l.parent.some((p2) => p2.prop === l.prop && p2.value === i2), u2 = l.parent.some((p2) => p2 !== l && p2.prop === l.prop && p2.value.length > i2.length);
          if (d3 || u2) {
            l.remove();
            return;
          }
          l.value = i2;
        }
        parse(l) {
          let c2 = n(l), i2 = [], d3 = [];
          for (let u2 of c2.nodes) d3.push(u2), u2.type === "div" && u2.value === "," && (i2.push(d3), d3 = []);
          return i2.push(d3), i2.filter((u2) => u2.length > 0);
        }
        stringify(l) {
          if (l.length === 0) return "";
          let c2 = [];
          for (let i2 of l) i2[i2.length - 1].type !== "div" && i2.push(this.div(l)), c2 = c2.concat(i2);
          return c2[0].type === "div" && (c2 = c2.slice(1)), c2[c2.length - 1].type === "div" && (c2 = c2.slice(0, -1)), n.stringify({ nodes: c2 });
        }
        clone(l, c2, i2) {
          let d3 = [], u2 = false;
          for (let p2 of i2) !u2 && p2.type === "word" && p2.value === l ? (d3.push({ type: "word", value: c2 }), u2 = true) : d3.push(p2);
          return d3;
        }
        div(l) {
          for (let c2 of l) for (let i2 of c2) if (i2.type === "div" && i2.value === ",") return i2;
          return { type: "div", value: ",", after: " " };
        }
        cleanOtherPrefixes(l, c2) {
          return l.filter((i2) => {
            let d3 = s2.prefix(this.findProp(i2));
            return d3 === "" || d3 === c2;
          });
        }
        cleanFromUnprefixed(l, c2) {
          let i2 = l.map((u2) => this.findProp(u2)).filter((u2) => u2.slice(0, c2.length) === c2).map((u2) => this.prefixes.unprefixed(u2)), d3 = [];
          for (let u2 of l) {
            let p2 = this.findProp(u2), f3 = s2.prefix(p2);
            !i2.includes(p2) && (f3 === c2 || f3 === "") && d3.push(u2);
          }
          return d3;
        }
        disabled(l, c2) {
          let i2 = ["order", "justify-content", "align-self", "align-content"];
          if (l.includes("flex") || i2.includes(l)) {
            if (this.prefixes.options.flexbox === false) return true;
            if (this.prefixes.options.flexbox === "no-2009") return c2.includes("2009");
          }
        }
        ruleVendorPrefixes(l) {
          let { parent: c2 } = l;
          if (c2.type !== "rule" || !c2.selector.includes(":-")) return false;
          let i2 = o2.prefixes().filter((d3) => c2.selector.includes(":" + d3));
          return i2.length > 0 ? i2 : false;
        }
      };
      t.exports = a;
    }), Vt = T((e, t) => {
      O2();
      var r2 = _e(), n = class {
        constructor(o2, s2, a, l) {
          this.unprefixed = o2, this.prefixed = s2, this.string = a || s2, this.regexp = l || r2.regexp(s2);
        }
        check(o2) {
          return o2.includes(this.string) ? !!o2.match(this.regexp) : false;
        }
      };
      t.exports = n;
    }), Ve = T((e, t) => {
      O2();
      var r2 = Nt(), n = Vt(), o2 = Ir(), s2 = _e(), a = class extends r2 {
        static save(l, c2) {
          let i2 = c2.prop, d3 = [];
          for (let u2 in c2._autoprefixerValues) {
            let p2 = c2._autoprefixerValues[u2];
            if (p2 === c2.value) continue;
            let f3, g3 = o2.prefix(i2);
            if (g3 === "-pie-") continue;
            if (g3 === u2) {
              f3 = c2.value = p2, d3.push(f3);
              continue;
            }
            let h2 = l.prefixed(i2, u2), m3 = c2.parent;
            if (!m3.every((x2) => x2.prop !== h2)) {
              d3.push(f3);
              continue;
            }
            let y3 = p2.replace(/\s+/, " ");
            if (m3.some((x2) => x2.prop === c2.prop && x2.value.replace(/\s+/, " ") === y3)) {
              d3.push(f3);
              continue;
            }
            let v2 = this.clone(c2, { value: p2 });
            f3 = c2.parent.insertBefore(c2, v2), d3.push(f3);
          }
          return d3;
        }
        check(l) {
          let c2 = l.value;
          return c2.includes(this.name) ? !!c2.match(this.regexp()) : false;
        }
        regexp() {
          return this.regexpCache || (this.regexpCache = s2.regexp(this.name));
        }
        replace(l, c2) {
          return l.replace(this.regexp(), `$1${c2}$2`);
        }
        value(l) {
          return l.raws.value && l.raws.value.value === l.value ? l.raws.value.raw : l.value;
        }
        add(l, c2) {
          l._autoprefixerValues || (l._autoprefixerValues = {});
          let i2 = l._autoprefixerValues[c2] || this.value(l), d3;
          do
            if (d3 = i2, i2 = this.replace(i2, c2), i2 === false) return;
          while (i2 !== d3);
          l._autoprefixerValues[c2] = i2;
        }
        old(l) {
          return new n(this.name, l + this.name);
        }
      };
      t.exports = a;
    }), vt = T((e, t) => {
      O2(), t.exports = {};
    }), vi = T((e, t) => {
      O2();
      var r2 = Kn(), n = Ve(), o2 = vt().insertAreas, s2 = /(^|[^-])linear-gradient\(\s*(top|left|right|bottom)/i, a = /(^|[^-])radial-gradient\(\s*\d+(\w*|%)\s+\d+(\w*|%)\s*,/i, l = /(!\s*)?autoprefixer:\s*ignore\s+next/i, c2 = /(!\s*)?autoprefixer\s*grid:\s*(on|off|(no-)?autoplace)/i, i2 = ["width", "height", "min-width", "max-width", "min-height", "max-height", "inline-size", "min-inline-size", "max-inline-size", "block-size", "min-block-size", "max-block-size"];
      function d3(f3) {
        return f3.parent.some((g3) => g3.prop === "grid-template" || g3.prop === "grid-template-areas");
      }
      function u2(f3) {
        let g3 = f3.parent.some((m3) => m3.prop === "grid-template-rows"), h2 = f3.parent.some((m3) => m3.prop === "grid-template-columns");
        return g3 && h2;
      }
      var p2 = class {
        constructor(f3) {
          this.prefixes = f3;
        }
        add(f3, g3) {
          let h2 = this.prefixes.add["@resolution"], m3 = this.prefixes.add["@keyframes"], y3 = this.prefixes.add["@viewport"], v2 = this.prefixes.add["@supports"];
          f3.walkAtRules((b2) => {
            if (b2.name === "keyframes") {
              if (!this.disabled(b2, g3)) return m3 && m3.process(b2);
            } else if (b2.name === "viewport") {
              if (!this.disabled(b2, g3)) return y3 && y3.process(b2);
            } else if (b2.name === "supports") {
              if (this.prefixes.options.supports !== false && !this.disabled(b2, g3)) return v2.process(b2);
            } else if (b2.name === "media" && b2.params.includes("-resolution") && !this.disabled(b2, g3)) return h2 && h2.process(b2);
          }), f3.walkRules((b2) => {
            if (!this.disabled(b2, g3)) return this.prefixes.add.selectors.map((C) => C.process(b2, g3));
          });
          function x2(b2) {
            return b2.parent.nodes.some((C) => {
              if (C.type !== "decl") return false;
              let S = C.prop === "display" && /(inline-)?grid/.test(C.value), E = C.prop.startsWith("grid-template"), A2 = /^grid-([A-z]+-)?gap/.test(C.prop);
              return S || E || A2;
            });
          }
          function k(b2) {
            return b2.parent.some((C) => C.prop === "display" && /(inline-)?flex/.test(C.value));
          }
          let w2 = this.gridStatus(f3, g3) && this.prefixes.add["grid-area"] && this.prefixes.add["grid-area"].prefixes;
          return f3.walkDecls((b2) => {
            if (this.disabledDecl(b2, g3)) return;
            let C = b2.parent, S = b2.prop, E = b2.value;
            if (S === "grid-row-span") {
              g3.warn("grid-row-span is not part of final Grid Layout. Use grid-row.", { node: b2 });
              return;
            } else if (S === "grid-column-span") {
              g3.warn("grid-column-span is not part of final Grid Layout. Use grid-column.", { node: b2 });
              return;
            } else if (S === "display" && E === "box") {
              g3.warn("You should write display: flex by final spec instead of display: box", { node: b2 });
              return;
            } else if (S === "text-emphasis-position") (E === "under" || E === "over") && g3.warn("You should use 2 values for text-emphasis-position For example, `under left` instead of just `under`.", { node: b2 });
            else if (/^(align|justify|place)-(items|content)$/.test(S) && k(b2)) (E === "start" || E === "end") && g3.warn(`${E} value has mixed support, consider using flex-${E} instead`, { node: b2 });
            else if (S === "text-decoration-skip" && E === "ink") g3.warn("Replace text-decoration-skip: ink to text-decoration-skip-ink: auto, because spec had been changed", { node: b2 });
            else {
              if (w2 && this.gridStatus(b2, g3)) if (b2.value === "subgrid" && g3.warn("IE does not support subgrid", { node: b2 }), /^(align|justify|place)-items$/.test(S) && x2(b2)) {
                let _2 = S.replace("-items", "-self");
                g3.warn(`IE does not support ${S} on grid containers. Try using ${_2} on child elements instead: ${b2.parent.selector} > * { ${_2}: ${b2.value} }`, { node: b2 });
              } else if (/^(align|justify|place)-content$/.test(S) && x2(b2)) g3.warn(`IE does not support ${b2.prop} on grid containers`, { node: b2 });
              else if (S === "display" && b2.value === "contents") {
                g3.warn("Please do not use display: contents; if you have grid setting enabled", { node: b2 });
                return;
              } else if (b2.prop === "grid-gap") {
                let _2 = this.gridStatus(b2, g3);
                _2 === "autoplace" && !u2(b2) && !d3(b2) ? g3.warn("grid-gap only works if grid-template(-areas) is being used or both rows and columns have been declared and cells have not been manually placed inside the explicit grid", { node: b2 }) : (_2 === true || _2 === "no-autoplace") && !d3(b2) && g3.warn("grid-gap only works if grid-template(-areas) is being used", { node: b2 });
              } else if (S === "grid-auto-columns") {
                g3.warn("grid-auto-columns is not supported by IE", { node: b2 });
                return;
              } else if (S === "grid-auto-rows") {
                g3.warn("grid-auto-rows is not supported by IE", { node: b2 });
                return;
              } else if (S === "grid-auto-flow") {
                let _2 = C.some((D) => D.prop === "grid-template-rows"), U = C.some((D) => D.prop === "grid-template-columns");
                d3(b2) ? g3.warn("grid-auto-flow is not supported by IE", { node: b2 }) : E.includes("dense") ? g3.warn("grid-auto-flow: dense is not supported by IE", { node: b2 }) : !_2 && !U && g3.warn("grid-auto-flow works only if grid-template-rows and grid-template-columns are present in the same rule", { node: b2 });
                return;
              } else if (E.includes("auto-fit")) {
                g3.warn("auto-fit value is not supported by IE", { node: b2, word: "auto-fit" });
                return;
              } else if (E.includes("auto-fill")) {
                g3.warn("auto-fill value is not supported by IE", { node: b2, word: "auto-fill" });
                return;
              } else S.startsWith("grid-template") && E.includes("[") && g3.warn("Autoprefixer currently does not support line names. Try using grid-template-areas instead.", { node: b2, word: "[" });
              if (E.includes("radial-gradient")) if (a.test(b2.value)) g3.warn("Gradient has outdated direction syntax. New syntax is like `closest-side at 0 0` instead of `0 0, closest-side`.", { node: b2 });
              else {
                let _2 = r2(E);
                for (let U of _2.nodes) if (U.type === "function" && U.value === "radial-gradient") for (let D of U.nodes) D.type === "word" && (D.value === "cover" ? g3.warn("Gradient has outdated direction syntax. Replace `cover` to `farthest-corner`.", { node: b2 }) : D.value === "contain" && g3.warn("Gradient has outdated direction syntax. Replace `contain` to `closest-side`.", { node: b2 }));
              }
              E.includes("linear-gradient") && s2.test(E) && g3.warn("Gradient has outdated direction syntax. New syntax is like `to left` instead of `right`.", { node: b2 });
            }
            i2.includes(b2.prop) && (b2.value.includes("-fill-available") || (b2.value.includes("fill-available") ? g3.warn("Replace fill-available to stretch, because spec had been changed", { node: b2 }) : b2.value.includes("fill") && r2(E).nodes.some((_2) => _2.type === "word" && _2.value === "fill") && g3.warn("Replace fill to stretch, because spec had been changed", { node: b2 })));
            let A2;
            if (b2.prop === "transition" || b2.prop === "transition-property") return this.prefixes.transition.add(b2, g3);
            if (b2.prop === "align-self") {
              if (this.displayType(b2) !== "grid" && this.prefixes.options.flexbox !== false && (A2 = this.prefixes.add["align-self"], A2 && A2.prefixes && A2.process(b2)), this.gridStatus(b2, g3) !== false && (A2 = this.prefixes.add["grid-row-align"], A2 && A2.prefixes)) return A2.process(b2, g3);
            } else if (b2.prop === "justify-self") {
              if (this.gridStatus(b2, g3) !== false && (A2 = this.prefixes.add["grid-column-align"], A2 && A2.prefixes)) return A2.process(b2, g3);
            } else if (b2.prop === "place-self") {
              if (A2 = this.prefixes.add["place-self"], A2 && A2.prefixes && this.gridStatus(b2, g3) !== false) return A2.process(b2, g3);
            } else if (A2 = this.prefixes.add[b2.prop], A2 && A2.prefixes) return A2.process(b2, g3);
          }), this.gridStatus(f3, g3) && o2(f3, this.disabled), f3.walkDecls((b2) => {
            if (this.disabledValue(b2, g3)) return;
            let C = this.prefixes.unprefixed(b2.prop), S = this.prefixes.values("add", C);
            if (Array.isArray(S)) for (let E of S) E.process && E.process(b2, g3);
            n.save(this.prefixes, b2);
          });
        }
        remove(f3, g3) {
          let h2 = this.prefixes.remove["@resolution"];
          f3.walkAtRules((m3, y3) => {
            this.prefixes.remove[`@${m3.name}`] ? this.disabled(m3, g3) || m3.parent.removeChild(y3) : m3.name === "media" && m3.params.includes("-resolution") && h2 && h2.clean(m3);
          });
          for (let m3 of this.prefixes.remove.selectors) f3.walkRules((y3, v2) => {
            m3.check(y3) && (this.disabled(y3, g3) || y3.parent.removeChild(v2));
          });
          return f3.walkDecls((m3, y3) => {
            if (this.disabled(m3, g3)) return;
            let v2 = m3.parent, x2 = this.prefixes.unprefixed(m3.prop);
            if ((m3.prop === "transition" || m3.prop === "transition-property") && this.prefixes.transition.remove(m3), this.prefixes.remove[m3.prop] && this.prefixes.remove[m3.prop].remove) {
              let k = this.prefixes.group(m3).down((w2) => this.prefixes.normalize(w2.prop) === x2);
              if (x2 === "flex-flow" && (k = true), m3.prop === "-webkit-box-orient") {
                let w2 = { "flex-direction": true, "flex-flow": true };
                if (!m3.parent.some((b2) => w2[b2.prop])) return;
              }
              if (k && !this.withHackValue(m3)) {
                m3.raw("before").includes(`
`) && this.reduceSpaces(m3), v2.removeChild(y3);
                return;
              }
            }
            for (let k of this.prefixes.values("remove", x2)) if (!(!k.check || !k.check(m3.value)) && (x2 = k.unprefixed, this.prefixes.group(m3).down((w2) => w2.value.includes(x2)))) {
              v2.removeChild(y3);
              return;
            }
          });
        }
        withHackValue(f3) {
          return f3.prop === "-webkit-background-clip" && f3.value === "text";
        }
        disabledValue(f3, g3) {
          return this.gridStatus(f3, g3) === false && f3.type === "decl" && f3.prop === "display" && f3.value.includes("grid") || this.prefixes.options.flexbox === false && f3.type === "decl" && f3.prop === "display" && f3.value.includes("flex") || f3.type === "decl" && f3.prop === "content" ? true : this.disabled(f3, g3);
        }
        disabledDecl(f3, g3) {
          if (this.gridStatus(f3, g3) === false && f3.type === "decl" && (f3.prop.includes("grid") || f3.prop === "justify-items")) return true;
          if (this.prefixes.options.flexbox === false && f3.type === "decl") {
            let h2 = ["order", "justify-content", "align-items", "align-content"];
            if (f3.prop.includes("flex") || h2.includes(f3.prop)) return true;
          }
          return this.disabled(f3, g3);
        }
        disabled(f3, g3) {
          if (!f3) return false;
          if (f3._autoprefixerDisabled !== void 0) return f3._autoprefixerDisabled;
          if (f3.parent) {
            let m3 = f3.prev();
            if (m3 && m3.type === "comment" && l.test(m3.text)) return f3._autoprefixerDisabled = true, f3._autoprefixerSelfDisabled = true, true;
          }
          let h2 = null;
          if (f3.nodes) {
            let m3;
            f3.each((y3) => {
              y3.type === "comment" && /(!\s*)?autoprefixer:\s*(off|on)/i.test(y3.text) && (typeof m3 < "u" ? g3.warn("Second Autoprefixer control comment was ignored. Autoprefixer applies control comment to whole block, not to next rules.", { node: y3 }) : m3 = /on/i.test(y3.text));
            }), m3 !== void 0 && (h2 = !m3);
          }
          if (!f3.nodes || h2 === null) if (f3.parent) {
            let m3 = this.disabled(f3.parent, g3);
            f3.parent._autoprefixerSelfDisabled === true ? h2 = false : h2 = m3;
          } else h2 = false;
          return f3._autoprefixerDisabled = h2, h2;
        }
        reduceSpaces(f3) {
          let g3 = false;
          if (this.prefixes.group(f3).up(() => (g3 = true, true)), g3) return;
          let h2 = f3.raw("before").split(`
`), m3 = h2[h2.length - 1].length, y3 = false;
          this.prefixes.group(f3).down((v2) => {
            h2 = v2.raw("before").split(`
`);
            let x2 = h2.length - 1;
            h2[x2].length > m3 && (y3 === false && (y3 = h2[x2].length - m3), h2[x2] = h2[x2].slice(0, -y3), v2.raws.before = h2.join(`
`));
          });
        }
        displayType(f3) {
          for (let g3 of f3.parent.nodes) if (g3.prop === "display") {
            if (g3.value.includes("flex")) return "flex";
            if (g3.value.includes("grid")) return "grid";
          }
          return false;
        }
        gridStatus(f3, g3) {
          if (!f3) return false;
          if (f3._autoprefixerGridStatus !== void 0) return f3._autoprefixerGridStatus;
          let h2 = null;
          if (f3.nodes) {
            let m3;
            f3.each((y3) => {
              if (y3.type === "comment" && c2.test(y3.text)) {
                let v2 = /:\s*autoplace/i.test(y3.text), x2 = /no-autoplace/i.test(y3.text);
                typeof m3 < "u" ? g3.warn("Second Autoprefixer grid control comment was ignored. Autoprefixer applies control comments to the whole block, not to the next rules.", { node: y3 }) : v2 ? m3 = "autoplace" : x2 ? m3 = true : m3 = /on/i.test(y3.text);
              }
            }), m3 !== void 0 && (h2 = m3);
          }
          if (f3.type === "atrule" && f3.name === "supports") {
            let m3 = f3.params;
            m3.includes("grid") && m3.includes("auto") && (h2 = false);
          }
          if (!f3.nodes || h2 === null) if (f3.parent) {
            let m3 = this.gridStatus(f3.parent, g3);
            f3.parent._autoprefixerSelfDisabled === true ? h2 = false : h2 = m3;
          } else typeof this.prefixes.options.grid < "u" ? h2 = this.prefixes.options.grid : typeof je.env.AUTOPREFIXER_GRID < "u" ? je.env.AUTOPREFIXER_GRID === "autoplace" ? h2 = "autoplace" : h2 = true : h2 = false;
          return f3._autoprefixerGridStatus = h2, h2;
        }
      };
      t.exports = p2;
    }), Kd = T((e, t) => {
      O2(), t.exports = { A: { A: { 2: "K E F G A B JC" }, B: { 1: "C L M H N D O P Q R S T U V W X Y Z a b c d e f g h i j n o p q r s t u v w x y z I" }, C: { 1: "2 3 4 5 6 7 8 9 AB BB CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB 0B dB 1B eB fB gB hB iB jB kB lB mB nB oB m pB qB rB sB tB P Q R 2B S T U V W X Y Z a b c d e f g h i j n o p q r s t u v w x y z I uB 3B 4B", 2: "0 1 KC zB J K E F G A B C L M H N D O k l LC MC" }, D: { 1: "8 9 AB BB CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB 0B dB 1B eB fB gB hB iB jB kB lB mB nB oB m pB qB rB sB tB P Q R S T U V W X Y Z a b c d e f g h i j n o p q r s t u v w x y z I uB 3B 4B", 2: "0 1 2 3 4 5 6 7 J K E F G A B C L M H N D O k l" }, E: { 1: "G A B C L M H D RC 6B vB wB 7B SC TC 8B 9B xB AC yB BC CC DC EC FC GC UC", 2: "0 J K E F NC 5B OC PC QC" }, F: { 1: "1 2 3 4 5 6 7 8 9 H N D O k l AB BB CB DB EB FB GB HB IB JB KB LB MB NB OB PB QB RB SB TB UB VB WB XB YB ZB aB bB cB dB eB fB gB hB iB jB kB lB mB nB oB m pB qB rB sB tB P Q R 2B S T U V W X Y Z a b c d e f g h i j wB", 2: "G B C VC WC XC YC vB HC ZC" }, G: { 1: "D fC gC hC iC jC kC lC mC nC oC pC qC rC sC tC 8B 9B xB AC yB BC CC DC EC FC GC", 2: "F 5B aC IC bC cC dC eC" }, H: { 1: "uC" }, I: { 1: "I zC 0C", 2: "zB J vC wC xC yC IC" }, J: { 2: "E A" }, K: { 1: "m", 2: "A B C vB HC wB" }, L: { 1: "I" }, M: { 1: "uB" }, N: { 2: "A B" }, O: { 1: "xB" }, P: { 1: "J k l 1C 2C 3C 4C 5C 6B 6C 7C 8C 9C AD yB BD CD DD" }, Q: { 1: "7B" }, R: { 1: "ED" }, S: { 1: "FD GD" } }, B: 4, C: "CSS Feature Queries" };
    }), ep = T((e, t) => {
      O2();
      function r2(o2) {
        return o2[o2.length - 1];
      }
      var n = { parse(o2) {
        let s2 = [""], a = [s2];
        for (let l of o2) {
          if (l === "(") {
            s2 = [""], r2(a).push(s2), a.push(s2);
            continue;
          }
          if (l === ")") {
            a.pop(), s2 = r2(a), s2.push("");
            continue;
          }
          s2[s2.length - 1] += l;
        }
        return a[0];
      }, stringify(o2) {
        let s2 = "";
        for (let a of o2) {
          if (typeof a == "object") {
            s2 += `(${n.stringify(a)})`;
            continue;
          }
          s2 += a;
        }
        return s2;
      } };
      t.exports = n;
    }), tp = T((e, t) => {
      O2();
      var r2 = Kd(), { feature: n } = (Xn(), Tr), { parse: o2 } = Re(), s2 = gt(), a = ep(), l = Ve(), c2 = _e(), i2 = n(r2), d3 = [];
      for (let p2 in i2.stats) {
        let f3 = i2.stats[p2];
        for (let g3 in f3) {
          let h2 = f3[g3];
          /y/.test(h2) && d3.push(p2 + " " + g3);
        }
      }
      var u2 = class {
        constructor(p2, f3) {
          this.Prefixes = p2, this.all = f3;
        }
        prefixer() {
          if (this.prefixerCache) return this.prefixerCache;
          let p2 = this.all.browsers.selected.filter((g3) => d3.includes(g3)), f3 = new s2(this.all.browsers.data, p2, this.all.options);
          return this.prefixerCache = new this.Prefixes(this.all.data, f3, this.all.options), this.prefixerCache;
        }
        parse(p2) {
          let f3 = p2.split(":"), g3 = f3[0], h2 = f3[1];
          return h2 || (h2 = ""), [g3.trim(), h2.trim()];
        }
        virtual(p2) {
          let [f3, g3] = this.parse(p2), h2 = o2("a{}").first;
          return h2.append({ prop: f3, value: g3, raws: { before: "" } }), h2;
        }
        prefixed(p2) {
          let f3 = this.virtual(p2);
          if (this.disabled(f3.first)) return f3.nodes;
          let g3 = { warn: () => null }, h2 = this.prefixer().add[f3.first.prop];
          h2 && h2.process && h2.process(f3.first, g3);
          for (let m3 of f3.nodes) {
            for (let y3 of this.prefixer().values("add", f3.first.prop)) y3.process(m3);
            l.save(this.all, m3);
          }
          return f3.nodes;
        }
        isNot(p2) {
          return typeof p2 == "string" && /not\s*/i.test(p2);
        }
        isOr(p2) {
          return typeof p2 == "string" && /\s*or\s*/i.test(p2);
        }
        isProp(p2) {
          return typeof p2 == "object" && p2.length === 1 && typeof p2[0] == "string";
        }
        isHack(p2, f3) {
          return !new RegExp(`(\\(|\\s)${c2.escapeRegexp(f3)}:`).test(p2);
        }
        toRemove(p2, f3) {
          let [g3, h2] = this.parse(p2), m3 = this.all.unprefixed(g3), y3 = this.all.cleaner();
          if (y3.remove[g3] && y3.remove[g3].remove && !this.isHack(f3, m3)) return true;
          for (let v2 of y3.values("remove", m3)) if (v2.check(h2)) return true;
          return false;
        }
        remove(p2, f3) {
          let g3 = 0;
          for (; g3 < p2.length; ) {
            if (!this.isNot(p2[g3 - 1]) && this.isProp(p2[g3]) && this.isOr(p2[g3 + 1])) {
              if (this.toRemove(p2[g3][0], f3)) {
                p2.splice(g3, 2);
                continue;
              }
              g3 += 2;
              continue;
            }
            typeof p2[g3] == "object" && (p2[g3] = this.remove(p2[g3], f3)), g3 += 1;
          }
          return p2;
        }
        cleanBrackets(p2) {
          return p2.map((f3) => typeof f3 != "object" ? f3 : f3.length === 1 && typeof f3[0] == "object" ? this.cleanBrackets(f3[0]) : this.cleanBrackets(f3));
        }
        convert(p2) {
          let f3 = [""];
          for (let g3 of p2) f3.push([`${g3.prop}: ${g3.value}`]), f3.push(" or ");
          return f3[f3.length - 1] = "", f3;
        }
        normalize(p2) {
          if (typeof p2 != "object") return p2;
          if (p2 = p2.filter((f3) => f3 !== ""), typeof p2[0] == "string") {
            let f3 = p2[0].trim();
            if (f3.includes(":") || f3 === "selector" || f3 === "not selector") return [a.stringify(p2)];
          }
          return p2.map((f3) => this.normalize(f3));
        }
        add(p2, f3) {
          return p2.map((g3) => {
            if (this.isProp(g3)) {
              let h2 = this.prefixed(g3[0]);
              return h2.length > 1 ? this.convert(h2) : g3;
            }
            return typeof g3 == "object" ? this.add(g3, f3) : g3;
          });
        }
        process(p2) {
          let f3 = a.parse(p2.params);
          f3 = this.normalize(f3), f3 = this.remove(f3, p2.params), f3 = this.add(f3, p2.params), f3 = this.cleanBrackets(f3), p2.params = a.stringify(f3);
        }
        disabled(p2) {
          if (!this.all.options.grid && (p2.prop === "display" && p2.value.includes("grid") || p2.prop.includes("grid") || p2.prop === "justify-items")) return true;
          if (this.all.options.flexbox === false) {
            if (p2.prop === "display" && p2.value.includes("flex")) return true;
            let f3 = ["order", "justify-content", "align-items", "align-content"];
            if (p2.prop.includes("flex") || f3.includes(p2.prop)) return true;
          }
          return false;
        }
      };
      t.exports = u2;
    }), rp = T((e, t) => {
      O2();
      var r2 = class {
        constructor(n, o2) {
          this.prefix = o2, this.prefixed = n.prefixed(this.prefix), this.regexp = n.regexp(this.prefix), this.prefixeds = n.possible().map((s2) => [n.prefixed(s2), n.regexp(s2)]), this.unprefixed = n.name, this.nameRegexp = n.regexp();
        }
        isHack(n) {
          let o2 = n.parent.index(n) + 1, s2 = n.parent.nodes;
          for (; o2 < s2.length; ) {
            let a = s2[o2].selector;
            if (!a) return true;
            if (a.includes(this.unprefixed) && a.match(this.nameRegexp)) return false;
            let l = false;
            for (let [c2, i2] of this.prefixeds) if (a.includes(c2) && a.match(i2)) {
              l = true;
              break;
            }
            if (!l) return true;
            o2 += 1;
          }
          return true;
        }
        check(n) {
          return !(!n.selector.includes(this.prefixed) || !n.selector.match(this.regexp) || this.isHack(n));
        }
      };
      t.exports = r2;
    }), Wt = T((e, t) => {
      O2();
      var { list: r2 } = Re(), n = rp(), o2 = Nt(), s2 = gt(), a = _e(), l = class extends o2 {
        constructor(c2, i2, d3) {
          super(c2, i2, d3), this.regexpCache = /* @__PURE__ */ new Map();
        }
        check(c2) {
          return c2.selector.includes(this.name) ? !!c2.selector.match(this.regexp()) : false;
        }
        prefixed(c2) {
          return this.name.replace(/^(\W*)/, `$1${c2}`);
        }
        regexp(c2) {
          if (!this.regexpCache.has(c2)) {
            let i2 = c2 ? this.prefixed(c2) : this.name;
            this.regexpCache.set(c2, new RegExp(`(^|[^:"'=])${a.escapeRegexp(i2)}`, "gi"));
          }
          return this.regexpCache.get(c2);
        }
        possible() {
          return s2.prefixes();
        }
        prefixeds(c2) {
          if (c2._autoprefixerPrefixeds) {
            if (c2._autoprefixerPrefixeds[this.name]) return c2._autoprefixerPrefixeds;
          } else c2._autoprefixerPrefixeds = {};
          let i2 = {};
          if (c2.selector.includes(",")) {
            let d3 = r2.comma(c2.selector).filter((u2) => u2.includes(this.name));
            for (let u2 of this.possible()) i2[u2] = d3.map((p2) => this.replace(p2, u2)).join(", ");
          } else for (let d3 of this.possible()) i2[d3] = this.replace(c2.selector, d3);
          return c2._autoprefixerPrefixeds[this.name] = i2, c2._autoprefixerPrefixeds;
        }
        already(c2, i2, d3) {
          let u2 = c2.parent.index(c2) - 1;
          for (; u2 >= 0; ) {
            let p2 = c2.parent.nodes[u2];
            if (p2.type !== "rule") return false;
            let f3 = false;
            for (let g3 in i2[this.name]) {
              let h2 = i2[this.name][g3];
              if (p2.selector === h2) {
                if (d3 === g3) return true;
                f3 = true;
                break;
              }
            }
            if (!f3) return false;
            u2 -= 1;
          }
          return false;
        }
        replace(c2, i2) {
          return c2.replace(this.regexp(), `$1${this.prefixed(i2)}`);
        }
        add(c2, i2) {
          let d3 = this.prefixeds(c2);
          if (this.already(c2, d3, i2)) return;
          let u2 = this.clone(c2, { selector: d3[this.name][i2] });
          c2.parent.insertBefore(c2, u2);
        }
        old(c2) {
          return new n(this, c2);
        }
      };
      t.exports = l;
    }), np = T((e, t) => {
      O2();
      var r2 = Nt(), n = class extends r2 {
        add(o2, s2) {
          let a = s2 + o2.name;
          if (o2.parent.some((c2) => c2.name === a && c2.params === o2.params)) return;
          let l = this.clone(o2, { name: a });
          return o2.parent.insertBefore(o2, l);
        }
        process(o2) {
          let s2 = this.parentPrefix(o2);
          for (let a of this.prefixes) (!s2 || s2 === a) && this.add(o2, a);
        }
      };
      t.exports = n;
    }), op = T((e, t) => {
      O2();
      var r2 = Wt(), n = class extends r2 {
        prefixed(o2) {
          return o2 === "-webkit-" ? ":-webkit-full-screen" : o2 === "-moz-" ? ":-moz-full-screen" : `:${o2}fullscreen`;
        }
      };
      n.names = [":fullscreen"], t.exports = n;
    }), sp = T((e, t) => {
      O2();
      var r2 = Wt(), n = class extends r2 {
        possible() {
          return super.possible().concat(["-moz- old", "-ms- old"]);
        }
        prefixed(o2) {
          return o2 === "-webkit-" ? "::-webkit-input-placeholder" : o2 === "-ms-" ? "::-ms-input-placeholder" : o2 === "-ms- old" ? ":-ms-input-placeholder" : o2 === "-moz- old" ? ":-moz-placeholder" : `::${o2}placeholder`;
        }
      };
      n.names = ["::placeholder"], t.exports = n;
    }), ap = T((e, t) => {
      O2();
      var r2 = Wt(), n = class extends r2 {
        prefixed(o2) {
          return o2 === "-ms-" ? ":-ms-input-placeholder" : `:${o2}placeholder-shown`;
        }
      };
      n.names = [":placeholder-shown"], t.exports = n;
    }), ip = T((e, t) => {
      O2();
      var r2 = Wt(), n = _e(), o2 = class extends r2 {
        constructor(s2, a, l) {
          super(s2, a, l), this.prefixes && (this.prefixes = n.uniq(this.prefixes.map((c2) => "-webkit-")));
        }
        prefixed(s2) {
          return s2 === "-webkit-" ? "::-webkit-file-upload-button" : `::${s2}file-selector-button`;
        }
      };
      o2.names = ["::file-selector-button"], t.exports = o2;
    }), Te = T((e, t) => {
      O2(), t.exports = function(r2) {
        let n;
        return r2 === "-webkit- 2009" || r2 === "-moz-" ? n = 2009 : r2 === "-ms-" ? n = 2012 : r2 === "-webkit-" && (n = "final"), r2 === "-webkit- 2009" && (r2 = "-webkit-"), [n, r2];
      };
    }), lp = T((e, t) => {
      O2();
      var r2 = Re().list, n = Te(), o2 = Y(), s2 = class extends o2 {
        prefixed(a, l) {
          let c2;
          return [c2, l] = n(l), c2 === 2009 ? l + "box-flex" : super.prefixed(a, l);
        }
        normalize() {
          return "flex";
        }
        set(a, l) {
          let c2 = n(l)[0];
          if (c2 === 2009) return a.value = r2.space(a.value)[0], a.value = s2.oldValues[a.value] || a.value, super.set(a, l);
          if (c2 === 2012) {
            let i2 = r2.space(a.value);
            i2.length === 3 && i2[2] === "0" && (a.value = i2.slice(0, 2).concat("0px").join(" "));
          }
          return super.set(a, l);
        }
      };
      s2.names = ["flex", "box-flex"], s2.oldValues = { auto: "1", none: "0" }, t.exports = s2;
    }), cp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2009 ? a + "box-ordinal-group" : l === 2012 ? a + "flex-order" : super.prefixed(s2, a);
        }
        normalize() {
          return "order";
        }
        set(s2, a) {
          return r2(a)[0] === 2009 && /\d/.test(s2.value) ? (s2.value = (parseInt(s2.value) + 1).toString(), super.set(s2, a)) : super.set(s2, a);
        }
      };
      o2.names = ["order", "flex-order", "box-ordinal-group"], t.exports = o2;
    }), up = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        check(o2) {
          let s2 = o2.value;
          return !s2.toLowerCase().includes("alpha(") && !s2.includes("DXImageTransform.Microsoft") && !s2.includes("data:image/svg+xml");
        }
      };
      n.names = ["filter"], t.exports = n;
    }), dp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        insert(o2, s2, a, l) {
          if (s2 !== "-ms-") return super.insert(o2, s2, a);
          let c2 = this.clone(o2), i2 = o2.prop.replace(/end$/, "start"), d3 = s2 + o2.prop.replace(/end$/, "span");
          if (!o2.parent.some((u2) => u2.prop === d3)) {
            if (c2.prop = d3, o2.value.includes("span")) c2.value = o2.value.replace(/span\s/i, "");
            else {
              let u2;
              if (o2.parent.walkDecls(i2, (p2) => {
                u2 = p2;
              }), u2) {
                let p2 = Number(o2.value) - Number(u2.value) + "";
                c2.value = p2;
              } else o2.warn(l, `Can not prefix ${o2.prop} (${i2} is not found)`);
            }
            o2.cloneBefore(c2);
          }
        }
      };
      n.names = ["grid-row-end", "grid-column-end"], t.exports = n;
    }), pp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        check(o2) {
          return !o2.value.split(/\s+/).some((s2) => {
            let a = s2.toLowerCase();
            return a === "reverse" || a === "alternate-reverse";
          });
        }
      };
      n.names = ["animation", "animation-direction"], t.exports = n;
    }), fp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        insert(s2, a, l) {
          let c2;
          if ([c2, a] = r2(a), c2 !== 2009) return super.insert(s2, a, l);
          let i2 = s2.value.split(/\s+/).filter((g3) => g3 !== "wrap" && g3 !== "nowrap" && "wrap-reverse");
          if (i2.length === 0 || s2.parent.some((g3) => g3.prop === a + "box-orient" || g3.prop === a + "box-direction")) return;
          let d3 = i2[0], u2 = d3.includes("row") ? "horizontal" : "vertical", p2 = d3.includes("reverse") ? "reverse" : "normal", f3 = this.clone(s2);
          return f3.prop = a + "box-orient", f3.value = u2, this.needCascade(s2) && (f3.raws.before = this.calcBefore(l, s2, a)), s2.parent.insertBefore(s2, f3), f3 = this.clone(s2), f3.prop = a + "box-direction", f3.value = p2, this.needCascade(s2) && (f3.raws.before = this.calcBefore(l, s2, a)), s2.parent.insertBefore(s2, f3);
        }
      };
      o2.names = ["flex-flow", "box-direction", "box-orient"], t.exports = o2;
    }), hp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        normalize() {
          return "flex";
        }
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2009 ? a + "box-flex" : l === 2012 ? a + "flex-positive" : super.prefixed(s2, a);
        }
      };
      o2.names = ["flex-grow", "flex-positive"], t.exports = o2;
    }), mp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        set(s2, a) {
          if (r2(a)[0] !== 2009) return super.set(s2, a);
        }
      };
      o2.names = ["flex-wrap"], t.exports = o2;
    }), gp = T((e, t) => {
      O2();
      var r2 = Y(), n = vt(), o2 = class extends r2 {
        insert(s2, a, l, c2) {
          if (a !== "-ms-") return super.insert(s2, a, l);
          let i2 = n.parse(s2), [d3, u2] = n.translate(i2, 0, 2), [p2, f3] = n.translate(i2, 1, 3);
          [["grid-row", d3], ["grid-row-span", u2], ["grid-column", p2], ["grid-column-span", f3]].forEach(([g3, h2]) => {
            n.insertDecl(s2, g3, h2);
          }), n.warnTemplateSelectorNotFound(s2, c2), n.warnIfGridRowColumnExists(s2, c2);
        }
      };
      o2.names = ["grid-area"], t.exports = o2;
    }), vp = T((e, t) => {
      O2();
      var r2 = Y(), n = vt(), o2 = class extends r2 {
        insert(s2, a, l) {
          if (a !== "-ms-") return super.insert(s2, a, l);
          if (s2.parent.some((d3) => d3.prop === "-ms-grid-row-align")) return;
          let [[c2, i2]] = n.parse(s2);
          i2 ? (n.insertDecl(s2, "grid-row-align", c2), n.insertDecl(s2, "grid-column-align", i2)) : (n.insertDecl(s2, "grid-row-align", c2), n.insertDecl(s2, "grid-column-align", c2));
        }
      };
      o2.names = ["place-self"], t.exports = o2;
    }), yp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        check(o2) {
          let s2 = o2.value;
          return !s2.includes("/") || s2.includes("span");
        }
        normalize(o2) {
          return o2.replace("-start", "");
        }
        prefixed(o2, s2) {
          let a = super.prefixed(o2, s2);
          return s2 === "-ms-" && (a = a.replace("-start", "")), a;
        }
      };
      n.names = ["grid-row-start", "grid-column-start"], t.exports = n;
    }), bp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        check(s2) {
          return s2.parent && !s2.parent.some((a) => a.prop && a.prop.startsWith("grid-"));
        }
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2012 ? a + "flex-item-align" : super.prefixed(s2, a);
        }
        normalize() {
          return "align-self";
        }
        set(s2, a) {
          let l = r2(a)[0];
          if (l === 2012) return s2.value = o2.oldValues[s2.value] || s2.value, super.set(s2, a);
          if (l === "final") return super.set(s2, a);
        }
      };
      o2.names = ["align-self", "flex-item-align"], o2.oldValues = { "flex-end": "end", "flex-start": "start" }, t.exports = o2;
    }), wp = T((e, t) => {
      O2();
      var r2 = Y(), n = _e(), o2 = class extends r2 {
        constructor(s2, a, l) {
          super(s2, a, l), this.prefixes && (this.prefixes = n.uniq(this.prefixes.map((c2) => c2 === "-ms-" ? "-webkit-" : c2)));
        }
      };
      o2.names = ["appearance"], t.exports = o2;
    }), xp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        normalize() {
          return "flex-basis";
        }
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2012 ? a + "flex-preferred-size" : super.prefixed(s2, a);
        }
        set(s2, a) {
          let l;
          if ([l, a] = r2(a), l === 2012 || l === "final") return super.set(s2, a);
        }
      };
      o2.names = ["flex-basis", "flex-preferred-size"], t.exports = o2;
    }), kp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        normalize() {
          return this.name.replace("box-image", "border");
        }
        prefixed(o2, s2) {
          let a = super.prefixed(o2, s2);
          return s2 === "-webkit-" && (a = a.replace("border", "box-image")), a;
        }
      };
      n.names = ["mask-border", "mask-border-source", "mask-border-slice", "mask-border-width", "mask-border-outset", "mask-border-repeat", "mask-box-image", "mask-box-image-source", "mask-box-image-slice", "mask-box-image-width", "mask-box-image-outset", "mask-box-image-repeat"], t.exports = n;
    }), Sp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        insert(o2, s2, a) {
          let l = o2.prop === "mask-composite", c2;
          l ? c2 = o2.value.split(",") : c2 = o2.value.match(n.regexp) || [], c2 = c2.map((p2) => p2.trim()).filter((p2) => p2);
          let i2 = c2.length, d3;
          if (i2 && (d3 = this.clone(o2), d3.value = c2.map((p2) => n.oldValues[p2] || p2).join(", "), c2.includes("intersect") && (d3.value += ", xor"), d3.prop = s2 + "mask-composite"), l) return i2 ? (this.needCascade(o2) && (d3.raws.before = this.calcBefore(a, o2, s2)), o2.parent.insertBefore(o2, d3)) : void 0;
          let u2 = this.clone(o2);
          return u2.prop = s2 + u2.prop, i2 && (u2.value = u2.value.replace(n.regexp, "")), this.needCascade(o2) && (u2.raws.before = this.calcBefore(a, o2, s2)), o2.parent.insertBefore(o2, u2), i2 ? (this.needCascade(o2) && (d3.raws.before = this.calcBefore(a, o2, s2)), o2.parent.insertBefore(o2, d3)) : o2;
        }
      };
      n.names = ["mask", "mask-composite"], n.oldValues = { add: "source-over", subtract: "source-out", intersect: "source-in", exclude: "xor" }, n.regexp = new RegExp(`\\s+(${Object.keys(n.oldValues).join("|")})\\b(?!\\))\\s*(?=[,])`, "ig"), t.exports = n;
    }), Cp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2009 ? a + "box-align" : l === 2012 ? a + "flex-align" : super.prefixed(s2, a);
        }
        normalize() {
          return "align-items";
        }
        set(s2, a) {
          let l = r2(a)[0];
          return (l === 2009 || l === 2012) && (s2.value = o2.oldValues[s2.value] || s2.value), super.set(s2, a);
        }
      };
      o2.names = ["align-items", "flex-align", "box-align"], o2.oldValues = { "flex-end": "end", "flex-start": "start" }, t.exports = o2;
    }), Ap = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        set(o2, s2) {
          return s2 === "-ms-" && o2.value === "contain" && (o2.value = "element"), super.set(o2, s2);
        }
        insert(o2, s2, a) {
          if (!(o2.value === "all" && s2 === "-ms-")) return super.insert(o2, s2, a);
        }
      };
      n.names = ["user-select"], t.exports = n;
    }), Op = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        normalize() {
          return "flex-shrink";
        }
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2012 ? a + "flex-negative" : super.prefixed(s2, a);
        }
        set(s2, a) {
          let l;
          if ([l, a] = r2(a), l === 2012 || l === "final") return super.set(s2, a);
        }
      };
      o2.names = ["flex-shrink", "flex-negative"], t.exports = o2;
    }), _p = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        prefixed(o2, s2) {
          return `${s2}column-${o2}`;
        }
        normalize(o2) {
          return o2.includes("inside") ? "break-inside" : o2.includes("before") ? "break-before" : "break-after";
        }
        set(o2, s2) {
          return (o2.prop === "break-inside" && o2.value === "avoid-column" || o2.value === "avoid-page") && (o2.value = "avoid"), super.set(o2, s2);
        }
        insert(o2, s2, a) {
          if (o2.prop !== "break-inside") return super.insert(o2, s2, a);
          if (!(/region/i.test(o2.value) || /page/i.test(o2.value))) return super.insert(o2, s2, a);
        }
      };
      n.names = ["break-inside", "page-break-inside", "column-break-inside", "break-before", "page-break-before", "column-break-before", "break-after", "page-break-after", "column-break-after"], t.exports = n;
    }), Ep = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        prefixed(o2, s2) {
          return s2 + "print-color-adjust";
        }
        normalize() {
          return "color-adjust";
        }
      };
      n.names = ["color-adjust", "print-color-adjust"], t.exports = n;
    }), Tp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        insert(o2, s2, a) {
          if (s2 === "-ms-") {
            let l = this.set(this.clone(o2), s2);
            this.needCascade(o2) && (l.raws.before = this.calcBefore(a, o2, s2));
            let c2 = "ltr";
            return o2.parent.nodes.forEach((i2) => {
              i2.prop === "direction" && (i2.value === "rtl" || i2.value === "ltr") && (c2 = i2.value);
            }), l.value = n.msValues[c2][o2.value] || o2.value, o2.parent.insertBefore(o2, l);
          }
          return super.insert(o2, s2, a);
        }
      };
      n.names = ["writing-mode"], n.msValues = { ltr: { "horizontal-tb": "lr-tb", "vertical-rl": "tb-rl", "vertical-lr": "tb-lr" }, rtl: { "horizontal-tb": "rl-tb", "vertical-rl": "bt-rl", "vertical-lr": "bt-lr" } }, t.exports = n;
    }), Ip = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        set(o2, s2) {
          return o2.value = o2.value.replace(/\s+fill(\s)/, "$1"), super.set(o2, s2);
        }
      };
      n.names = ["border-image"], t.exports = n;
    }), Pp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2012 ? a + "flex-line-pack" : super.prefixed(s2, a);
        }
        normalize() {
          return "align-content";
        }
        set(s2, a) {
          let l = r2(a)[0];
          if (l === 2012) return s2.value = o2.oldValues[s2.value] || s2.value, super.set(s2, a);
          if (l === "final") return super.set(s2, a);
        }
      };
      o2.names = ["align-content", "flex-line-pack"], o2.oldValues = { "flex-end": "end", "flex-start": "start", "space-between": "justify", "space-around": "distribute" }, t.exports = o2;
    }), jp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        prefixed(o2, s2) {
          return s2 === "-moz-" ? s2 + (n.toMozilla[o2] || o2) : super.prefixed(o2, s2);
        }
        normalize(o2) {
          return n.toNormal[o2] || o2;
        }
      };
      n.names = ["border-radius"], n.toMozilla = {}, n.toNormal = {};
      for (let o2 of ["top", "bottom"]) for (let s2 of ["left", "right"]) {
        let a = `border-${o2}-${s2}-radius`, l = `border-radius-${o2}${s2}`;
        n.names.push(a), n.names.push(l), n.toMozilla[a] = l, n.toNormal[l] = a;
      }
      t.exports = n;
    }), Bp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        prefixed(o2, s2) {
          return o2.includes("-start") ? s2 + o2.replace("-block-start", "-before") : s2 + o2.replace("-block-end", "-after");
        }
        normalize(o2) {
          return o2.includes("-before") ? o2.replace("-before", "-block-start") : o2.replace("-after", "-block-end");
        }
      };
      n.names = ["border-block-start", "border-block-end", "margin-block-start", "margin-block-end", "padding-block-start", "padding-block-end", "border-before", "border-after", "margin-before", "margin-after", "padding-before", "padding-after"], t.exports = n;
    }), Dp = T((e, t) => {
      O2();
      var r2 = Y(), { parseTemplate: n, warnMissedAreas: o2, getGridGap: s2, warnGridGap: a, inheritGridGap: l } = vt(), c2 = class extends r2 {
        insert(i2, d3, u2, p2) {
          if (d3 !== "-ms-") return super.insert(i2, d3, u2);
          if (i2.parent.some((w2) => w2.prop === "-ms-grid-rows")) return;
          let f3 = s2(i2), g3 = l(i2, f3), { rows: h2, columns: m3, areas: y3 } = n({ decl: i2, gap: g3 || f3 }), v2 = Object.keys(y3).length > 0, x2 = !!h2, k = !!m3;
          return a({ gap: f3, hasColumns: k, decl: i2, result: p2 }), o2(y3, i2, p2), (x2 && k || v2) && i2.cloneBefore({ prop: "-ms-grid-rows", value: h2, raws: {} }), k && i2.cloneBefore({ prop: "-ms-grid-columns", value: m3, raws: {} }), i2;
        }
      };
      c2.names = ["grid-template"], t.exports = c2;
    }), $p = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        prefixed(o2, s2) {
          return s2 + o2.replace("-inline", "");
        }
        normalize(o2) {
          return o2.replace(/(margin|padding|border)-(start|end)/, "$1-inline-$2");
        }
      };
      n.names = ["border-inline-start", "border-inline-end", "margin-inline-start", "margin-inline-end", "padding-inline-start", "padding-inline-end", "border-start", "border-end", "margin-start", "margin-end", "padding-start", "padding-end"], t.exports = n;
    }), Rp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        check(o2) {
          return !o2.value.includes("flex-") && o2.value !== "baseline";
        }
        prefixed(o2, s2) {
          return s2 + "grid-row-align";
        }
        normalize() {
          return "align-self";
        }
      };
      n.names = ["grid-row-align"], t.exports = n;
    }), Mp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        keyframeParents(o2) {
          let { parent: s2 } = o2;
          for (; s2; ) {
            if (s2.type === "atrule" && s2.name === "keyframes") return true;
            ({ parent: s2 } = s2);
          }
          return false;
        }
        contain3d(o2) {
          if (o2.prop === "transform-origin") return false;
          for (let s2 of n.functions3d) if (o2.value.includes(`${s2}(`)) return true;
          return false;
        }
        set(o2, s2) {
          return o2 = super.set(o2, s2), s2 === "-ms-" && (o2.value = o2.value.replace(/rotatez/gi, "rotate")), o2;
        }
        insert(o2, s2, a) {
          if (s2 === "-ms-") {
            if (!this.contain3d(o2) && !this.keyframeParents(o2)) return super.insert(o2, s2, a);
          } else if (s2 === "-o-") {
            if (!this.contain3d(o2)) return super.insert(o2, s2, a);
          } else return super.insert(o2, s2, a);
        }
      };
      n.names = ["transform", "transform-origin"], n.functions3d = ["matrix3d", "translate3d", "translateZ", "scale3d", "scaleZ", "rotate3d", "rotateX", "rotateY", "perspective"], t.exports = n;
    }), Up = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        normalize() {
          return "flex-direction";
        }
        insert(s2, a, l) {
          let c2;
          if ([c2, a] = r2(a), c2 !== 2009) return super.insert(s2, a, l);
          if (s2.parent.some((f3) => f3.prop === a + "box-orient" || f3.prop === a + "box-direction")) return;
          let i2 = s2.value, d3, u2;
          i2 === "inherit" || i2 === "initial" || i2 === "unset" ? (d3 = i2, u2 = i2) : (d3 = i2.includes("row") ? "horizontal" : "vertical", u2 = i2.includes("reverse") ? "reverse" : "normal");
          let p2 = this.clone(s2);
          return p2.prop = a + "box-orient", p2.value = d3, this.needCascade(s2) && (p2.raws.before = this.calcBefore(l, s2, a)), s2.parent.insertBefore(s2, p2), p2 = this.clone(s2), p2.prop = a + "box-direction", p2.value = u2, this.needCascade(s2) && (p2.raws.before = this.calcBefore(l, s2, a)), s2.parent.insertBefore(s2, p2);
        }
        old(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2009 ? [a + "box-orient", a + "box-direction"] : super.old(s2, a);
        }
      };
      o2.names = ["flex-direction", "box-direction", "box-orient"], t.exports = o2;
    }), zp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        check(o2) {
          return o2.value === "pixelated";
        }
        prefixed(o2, s2) {
          return s2 === "-ms-" ? "-ms-interpolation-mode" : super.prefixed(o2, s2);
        }
        set(o2, s2) {
          return s2 !== "-ms-" ? super.set(o2, s2) : (o2.prop = "-ms-interpolation-mode", o2.value = "nearest-neighbor", o2);
        }
        normalize() {
          return "image-rendering";
        }
        process(o2, s2) {
          return super.process(o2, s2);
        }
      };
      n.names = ["image-rendering", "interpolation-mode"], t.exports = n;
    }), Fp = T((e, t) => {
      O2();
      var r2 = Y(), n = _e(), o2 = class extends r2 {
        constructor(s2, a, l) {
          super(s2, a, l), this.prefixes && (this.prefixes = n.uniq(this.prefixes.map((c2) => c2 === "-ms-" ? "-webkit-" : c2)));
        }
      };
      o2.names = ["backdrop-filter"], t.exports = o2;
    }), Lp = T((e, t) => {
      O2();
      var r2 = Y(), n = _e(), o2 = class extends r2 {
        constructor(s2, a, l) {
          super(s2, a, l), this.prefixes && (this.prefixes = n.uniq(this.prefixes.map((c2) => c2 === "-ms-" ? "-webkit-" : c2)));
        }
        check(s2) {
          return s2.value.toLowerCase() === "text";
        }
      };
      o2.names = ["background-clip"], t.exports = o2;
    }), Np = T((e, t) => {
      O2();
      var r2 = Y(), n = ["none", "underline", "overline", "line-through", "blink", "inherit", "initial", "unset"], o2 = class extends r2 {
        check(s2) {
          return s2.value.split(/\s+/).some((a) => !n.includes(a));
        }
      };
      o2.names = ["text-decoration"], t.exports = o2;
    }), Vp = T((e, t) => {
      O2();
      var r2 = Te(), n = Y(), o2 = class extends n {
        prefixed(s2, a) {
          let l;
          return [l, a] = r2(a), l === 2009 ? a + "box-pack" : l === 2012 ? a + "flex-pack" : super.prefixed(s2, a);
        }
        normalize() {
          return "justify-content";
        }
        set(s2, a) {
          let l = r2(a)[0];
          if (l === 2009 || l === 2012) {
            let c2 = o2.oldValues[s2.value] || s2.value;
            if (s2.value = c2, l !== 2009 || c2 !== "distribute") return super.set(s2, a);
          } else if (l === "final") return super.set(s2, a);
        }
      };
      o2.names = ["justify-content", "flex-pack", "box-pack"], o2.oldValues = { "flex-end": "end", "flex-start": "start", "space-between": "justify", "space-around": "distribute" }, t.exports = o2;
    }), Wp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        set(o2, s2) {
          let a = o2.value.toLowerCase();
          return s2 === "-webkit-" && !a.includes(" ") && a !== "contain" && a !== "cover" && (o2.value = o2.value + " " + o2.value), super.set(o2, s2);
        }
      };
      n.names = ["background-size"], t.exports = n;
    }), qp = T((e, t) => {
      O2();
      var r2 = Y(), n = vt(), o2 = class extends r2 {
        insert(s2, a, l) {
          if (a !== "-ms-") return super.insert(s2, a, l);
          let c2 = n.parse(s2), [i2, d3] = n.translate(c2, 0, 1);
          c2[0] && c2[0].includes("span") && (d3 = c2[0].join("").replace(/\D/g, "")), [[s2.prop, i2], [`${s2.prop}-span`, d3]].forEach(([u2, p2]) => {
            n.insertDecl(s2, u2, p2);
          });
        }
      };
      o2.names = ["grid-row", "grid-column"], t.exports = o2;
    }), Gp = T((e, t) => {
      O2();
      var r2 = Y(), { prefixTrackProp: n, prefixTrackValue: o2, autoplaceGridItems: s2, getGridGap: a, inheritGridGap: l } = vt(), c2 = vi(), i2 = class extends r2 {
        prefixed(d3, u2) {
          return u2 === "-ms-" ? n({ prop: d3, prefix: u2 }) : super.prefixed(d3, u2);
        }
        normalize(d3) {
          return d3.replace(/^grid-(rows|columns)/, "grid-template-$1");
        }
        insert(d3, u2, p2, f3) {
          if (u2 !== "-ms-") return super.insert(d3, u2, p2);
          let { parent: g3, prop: h2, value: m3 } = d3, y3 = h2.includes("rows"), v2 = h2.includes("columns"), x2 = g3.some((_2) => _2.prop === "grid-template" || _2.prop === "grid-template-areas");
          if (x2 && y3) return false;
          let k = new c2({ options: {} }), w2 = k.gridStatus(g3, f3), b2 = a(d3);
          b2 = l(d3, b2) || b2;
          let C = y3 ? b2.row : b2.column;
          (w2 === "no-autoplace" || w2 === true) && !x2 && (C = null);
          let S = o2({ value: m3, gap: C });
          d3.cloneBefore({ prop: n({ prop: h2, prefix: u2 }), value: S });
          let E = g3.nodes.find((_2) => _2.prop === "grid-auto-flow"), A2 = "row";
          if (E && !k.disabled(E, f3) && (A2 = E.value.trim()), w2 === "autoplace") {
            let _2 = g3.nodes.find((U) => U.prop === "grid-template-rows");
            if (!_2 && x2) return;
            if (!_2 && !x2) {
              d3.warn(f3, "Autoplacement does not work without grid-template-rows property");
              return;
            }
            !g3.nodes.find((U) => U.prop === "grid-template-columns") && !x2 && d3.warn(f3, "Autoplacement does not work without grid-template-columns property"), v2 && !x2 && s2(d3, f3, b2, A2);
          }
        }
      };
      i2.names = ["grid-template-rows", "grid-template-columns", "grid-rows", "grid-columns"], t.exports = i2;
    }), Yp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        check(o2) {
          return !o2.value.includes("flex-") && o2.value !== "baseline";
        }
        prefixed(o2, s2) {
          return s2 + "grid-column-align";
        }
        normalize() {
          return "justify-self";
        }
      };
      n.names = ["grid-column-align"], t.exports = n;
    }), Hp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        prefixed(o2, s2) {
          return s2 + "scroll-chaining";
        }
        normalize() {
          return "overscroll-behavior";
        }
        set(o2, s2) {
          return o2.value === "auto" ? o2.value = "chained" : (o2.value === "none" || o2.value === "contain") && (o2.value = "none"), super.set(o2, s2);
        }
      };
      n.names = ["overscroll-behavior", "scroll-chaining"], t.exports = n;
    }), Qp = T((e, t) => {
      O2();
      var r2 = Y(), { parseGridAreas: n, warnMissedAreas: o2, prefixTrackProp: s2, prefixTrackValue: a, getGridGap: l, warnGridGap: c2, inheritGridGap: i2 } = vt();
      function d3(p2) {
        return p2.trim().slice(1, -1).split(/["']\s*["']?/g);
      }
      var u2 = class extends r2 {
        insert(p2, f3, g3, h2) {
          if (f3 !== "-ms-") return super.insert(p2, f3, g3);
          let m3 = false, y3 = false, v2 = p2.parent, x2 = l(p2);
          x2 = i2(p2, x2) || x2, v2.walkDecls(/-ms-grid-rows/, (b2) => b2.remove()), v2.walkDecls(/grid-template-(rows|columns)/, (b2) => {
            if (b2.prop === "grid-template-rows") {
              y3 = true;
              let { prop: C, value: S } = b2;
              b2.cloneBefore({ prop: s2({ prop: C, prefix: f3 }), value: a({ value: S, gap: x2.row }) });
            } else m3 = true;
          });
          let k = d3(p2.value);
          m3 && !y3 && x2.row && k.length > 1 && p2.cloneBefore({ prop: "-ms-grid-rows", value: a({ value: `repeat(${k.length}, auto)`, gap: x2.row }), raws: {} }), c2({ gap: x2, hasColumns: m3, decl: p2, result: h2 });
          let w2 = n({ rows: k, gap: x2 });
          return o2(w2, p2, h2), p2;
        }
      };
      u2.names = ["grid-template-areas"], t.exports = u2;
    }), Jp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        set(o2, s2) {
          return s2 === "-webkit-" && (o2.value = o2.value.replace(/\s*(right|left)\s*/i, "")), super.set(o2, s2);
        }
      };
      n.names = ["text-emphasis-position"], t.exports = n;
    }), Zp = T((e, t) => {
      O2();
      var r2 = Y(), n = class extends r2 {
        set(o2, s2) {
          return o2.prop === "text-decoration-skip-ink" && o2.value === "auto" ? (o2.prop = s2 + "text-decoration-skip", o2.value = "ink", o2) : super.set(o2, s2);
        }
      };
      n.names = ["text-decoration-skip-ink", "text-decoration-skip"], t.exports = n;
    }), Xp = T((e, t) => {
      O2(), t.exports = { wrap: r2, limit: n, validate: o2, test: s2, curry: l, name: a };
      function r2(c2, i2, d3) {
        var u2 = i2 - c2;
        return ((d3 - c2) % u2 + u2) % u2 + c2;
      }
      function n(c2, i2, d3) {
        return Math.max(c2, Math.min(i2, d3));
      }
      function o2(c2, i2, d3, u2, p2) {
        if (!s2(c2, i2, d3, u2, p2)) throw new Error(d3 + " is outside of range [" + c2 + "," + i2 + ")");
        return d3;
      }
      function s2(c2, i2, d3, u2, p2) {
        return !(d3 < c2 || d3 > i2 || p2 && d3 === i2 || u2 && d3 === c2);
      }
      function a(c2, i2, d3, u2) {
        return (d3 ? "(" : "[") + c2 + "," + i2 + (u2 ? ")" : "]");
      }
      function l(c2, i2, d3, u2) {
        var p2 = a.bind(null, c2, i2, d3, u2);
        return { wrap: r2.bind(null, c2, i2), limit: n.bind(null, c2, i2), validate: function(f3) {
          return o2(c2, i2, f3, d3, u2);
        }, test: function(f3) {
          return s2(c2, i2, f3, d3, u2);
        }, toString: p2, name: p2 };
      }
    }), Kp = T((e, t) => {
      O2();
      var r2 = Kn(), n = Xp(), o2 = Vt(), s2 = Ve(), a = _e(), l = /top|left|right|bottom/gi, c2 = class extends s2 {
        replace(i2, d3) {
          let u2 = r2(i2);
          for (let p2 of u2.nodes) if (p2.type === "function" && p2.value === this.name) if (p2.nodes = this.newDirection(p2.nodes), p2.nodes = this.normalize(p2.nodes), d3 === "-webkit- old") {
            if (!this.oldWebkit(p2)) return false;
          } else p2.nodes = this.convertDirection(p2.nodes), p2.value = d3 + p2.value;
          return u2.toString();
        }
        replaceFirst(i2, ...d3) {
          return d3.map((u2) => u2 === " " ? { type: "space", value: u2 } : { type: "word", value: u2 }).concat(i2.slice(1));
        }
        normalizeUnit(i2, d3) {
          return `${parseFloat(i2) / d3 * 360}deg`;
        }
        normalize(i2) {
          if (!i2[0]) return i2;
          if (/-?\d+(.\d+)?grad/.test(i2[0].value)) i2[0].value = this.normalizeUnit(i2[0].value, 400);
          else if (/-?\d+(.\d+)?rad/.test(i2[0].value)) i2[0].value = this.normalizeUnit(i2[0].value, 2 * Math.PI);
          else if (/-?\d+(.\d+)?turn/.test(i2[0].value)) i2[0].value = this.normalizeUnit(i2[0].value, 1);
          else if (i2[0].value.includes("deg")) {
            let d3 = parseFloat(i2[0].value);
            d3 = n.wrap(0, 360, d3), i2[0].value = `${d3}deg`;
          }
          return i2[0].value === "0deg" ? i2 = this.replaceFirst(i2, "to", " ", "top") : i2[0].value === "90deg" ? i2 = this.replaceFirst(i2, "to", " ", "right") : i2[0].value === "180deg" ? i2 = this.replaceFirst(i2, "to", " ", "bottom") : i2[0].value === "270deg" && (i2 = this.replaceFirst(i2, "to", " ", "left")), i2;
        }
        newDirection(i2) {
          if (i2[0].value === "to" || (l.lastIndex = 0, !l.test(i2[0].value))) return i2;
          i2.unshift({ type: "word", value: "to" }, { type: "space", value: " " });
          for (let d3 = 2; d3 < i2.length && i2[d3].type !== "div"; d3++) i2[d3].type === "word" && (i2[d3].value = this.revertDirection(i2[d3].value));
          return i2;
        }
        isRadial(i2) {
          let d3 = "before";
          for (let u2 of i2) if (d3 === "before" && u2.type === "space") d3 = "at";
          else if (d3 === "at" && u2.value === "at") d3 = "after";
          else {
            if (d3 === "after" && u2.type === "space") return true;
            if (u2.type === "div") break;
            d3 = "before";
          }
          return false;
        }
        convertDirection(i2) {
          return i2.length > 0 && (i2[0].value === "to" ? this.fixDirection(i2) : i2[0].value.includes("deg") ? this.fixAngle(i2) : this.isRadial(i2) && this.fixRadial(i2)), i2;
        }
        fixDirection(i2) {
          i2.splice(0, 2);
          for (let d3 of i2) {
            if (d3.type === "div") break;
            d3.type === "word" && (d3.value = this.revertDirection(d3.value));
          }
        }
        fixAngle(i2) {
          let d3 = i2[0].value;
          d3 = parseFloat(d3), d3 = Math.abs(450 - d3) % 360, d3 = this.roundFloat(d3, 3), i2[0].value = `${d3}deg`;
        }
        fixRadial(i2) {
          let d3 = [], u2 = [], p2, f3, g3, h2, m3;
          for (h2 = 0; h2 < i2.length - 2; h2++) if (p2 = i2[h2], f3 = i2[h2 + 1], g3 = i2[h2 + 2], p2.type === "space" && f3.value === "at" && g3.type === "space") {
            m3 = h2 + 3;
            break;
          } else d3.push(p2);
          let y3;
          for (h2 = m3; h2 < i2.length; h2++) if (i2[h2].type === "div") {
            y3 = i2[h2];
            break;
          } else u2.push(i2[h2]);
          i2.splice(0, h2, ...u2, y3, ...d3);
        }
        revertDirection(i2) {
          return c2.directions[i2.toLowerCase()] || i2;
        }
        roundFloat(i2, d3) {
          return parseFloat(i2.toFixed(d3));
        }
        oldWebkit(i2) {
          let { nodes: d3 } = i2, u2 = r2.stringify(i2.nodes);
          if (this.name !== "linear-gradient" || d3[0] && d3[0].value.includes("deg") || u2.includes("px") || u2.includes("-corner") || u2.includes("-side")) return false;
          let p2 = [[]];
          for (let f3 of d3) p2[p2.length - 1].push(f3), f3.type === "div" && f3.value === "," && p2.push([]);
          this.oldDirection(p2), this.colorStops(p2), i2.nodes = [];
          for (let f3 of p2) i2.nodes = i2.nodes.concat(f3);
          return i2.nodes.unshift({ type: "word", value: "linear" }, this.cloneDiv(i2.nodes)), i2.value = "-webkit-gradient", true;
        }
        oldDirection(i2) {
          let d3 = this.cloneDiv(i2[0]);
          if (i2[0][0].value !== "to") return i2.unshift([{ type: "word", value: c2.oldDirections.bottom }, d3]);
          {
            let u2 = [];
            for (let f3 of i2[0].slice(2)) f3.type === "word" && u2.push(f3.value.toLowerCase());
            u2 = u2.join(" ");
            let p2 = c2.oldDirections[u2] || u2;
            return i2[0] = [{ type: "word", value: p2 }, d3], i2[0];
          }
        }
        cloneDiv(i2) {
          for (let d3 of i2) if (d3.type === "div" && d3.value === ",") return d3;
          return { type: "div", value: ",", after: " " };
        }
        colorStops(i2) {
          let d3 = [];
          for (let u2 = 0; u2 < i2.length; u2++) {
            let p2, f3 = i2[u2], g3;
            if (u2 === 0) continue;
            let h2 = r2.stringify(f3[0]);
            f3[1] && f3[1].type === "word" ? p2 = f3[1].value : f3[2] && f3[2].type === "word" && (p2 = f3[2].value);
            let m3;
            u2 === 1 && (!p2 || p2 === "0%") ? m3 = `from(${h2})` : u2 === i2.length - 1 && (!p2 || p2 === "100%") ? m3 = `to(${h2})` : p2 ? m3 = `color-stop(${p2}, ${h2})` : m3 = `color-stop(${h2})`;
            let y3 = f3[f3.length - 1];
            i2[u2] = [{ type: "word", value: m3 }], y3.type === "div" && y3.value === "," && (g3 = i2[u2].push(y3)), d3.push(g3);
          }
          return d3;
        }
        old(i2) {
          if (i2 === "-webkit-") {
            let d3 = this.name === "linear-gradient" ? "linear" : "radial", u2 = "-gradient", p2 = a.regexp(`-webkit-(${d3}-gradient|gradient\\(\\s*${d3})`, false);
            return new o2(this.name, i2 + this.name, u2, p2);
          } else return super.old(i2);
        }
        add(i2, d3) {
          let u2 = i2.prop;
          if (u2.includes("mask")) {
            if (d3 === "-webkit-" || d3 === "-webkit- old") return super.add(i2, d3);
          } else if (u2 === "list-style" || u2 === "list-style-image" || u2 === "content") {
            if (d3 === "-webkit-" || d3 === "-webkit- old") return super.add(i2, d3);
          } else return super.add(i2, d3);
        }
      };
      c2.names = ["linear-gradient", "repeating-linear-gradient", "radial-gradient", "repeating-radial-gradient"], c2.directions = { top: "bottom", left: "right", bottom: "top", right: "left" }, c2.oldDirections = { top: "left bottom, left top", left: "right top, left top", bottom: "left top, left bottom", right: "left top, right top", "top right": "left bottom, right top", "top left": "right bottom, left top", "right top": "left bottom, right top", "right bottom": "left top, right bottom", "bottom right": "left top, right bottom", "bottom left": "right top, left bottom", "left top": "right bottom, left top", "left bottom": "right top, left bottom" }, t.exports = c2;
    }), ef = T((e, t) => {
      O2();
      var r2 = Vt(), n = Ve();
      function o2(a) {
        return new RegExp(`(^|[\\s,(])(${a}($|[\\s),]))`, "gi");
      }
      var s2 = class extends n {
        regexp() {
          return this.regexpCache || (this.regexpCache = o2(this.name)), this.regexpCache;
        }
        isStretch() {
          return this.name === "stretch" || this.name === "fill" || this.name === "fill-available";
        }
        replace(a, l) {
          return l === "-moz-" && this.isStretch() ? a.replace(this.regexp(), "$1-moz-available$3") : l === "-webkit-" && this.isStretch() ? a.replace(this.regexp(), "$1-webkit-fill-available$3") : super.replace(a, l);
        }
        old(a) {
          let l = a + this.name;
          return this.isStretch() && (a === "-moz-" ? l = "-moz-available" : a === "-webkit-" && (l = "-webkit-fill-available")), new r2(this.name, l, l, o2(l));
        }
        add(a, l) {
          if (!(a.prop.includes("grid") && l !== "-webkit-")) return super.add(a, l);
        }
      };
      s2.names = ["max-content", "min-content", "fit-content", "fill", "fill-available", "stretch"], t.exports = s2;
    }), tf = T((e, t) => {
      O2();
      var r2 = Vt(), n = Ve(), o2 = class extends n {
        replace(s2, a) {
          return a === "-webkit-" ? s2.replace(this.regexp(), "$1-webkit-optimize-contrast") : a === "-moz-" ? s2.replace(this.regexp(), "$1-moz-crisp-edges") : super.replace(s2, a);
        }
        old(s2) {
          return s2 === "-webkit-" ? new r2(this.name, "-webkit-optimize-contrast") : s2 === "-moz-" ? new r2(this.name, "-moz-crisp-edges") : super.old(s2);
        }
      };
      o2.names = ["pixelated"], t.exports = o2;
    }), rf = T((e, t) => {
      O2();
      var r2 = Ve(), n = class extends r2 {
        replace(o2, s2) {
          let a = super.replace(o2, s2);
          return s2 === "-webkit-" && (a = a.replace(/("[^"]+"|'[^']+')(\s+\d+\w)/gi, "url($1)$2")), a;
        }
      };
      n.names = ["image-set"], t.exports = n;
    }), nf = T((e, t) => {
      O2();
      var r2 = Re().list, n = Ve(), o2 = class extends n {
        replace(s2, a) {
          return r2.space(s2).map((l) => {
            if (l.slice(0, +this.name.length + 1) !== this.name + "(") return l;
            let c2 = l.lastIndexOf(")"), i2 = l.slice(c2 + 1), d3 = l.slice(this.name.length + 1, c2);
            if (a === "-webkit-") {
              let u2 = d3.match(/\d*.?\d+%?/);
              u2 ? (d3 = d3.slice(u2[0].length).trim(), d3 += `, ${u2[0]}`) : d3 += ", 0.5";
            }
            return a + this.name + "(" + d3 + ")" + i2;
          }).join(" ");
        }
      };
      o2.names = ["cross-fade"], t.exports = o2;
    }), of = T((e, t) => {
      O2();
      var r2 = Te(), n = Vt(), o2 = Ve(), s2 = class extends o2 {
        constructor(a, l) {
          super(a, l), a === "display-flex" && (this.name = "flex");
        }
        check(a) {
          return a.prop === "display" && a.value === this.name;
        }
        prefixed(a) {
          let l, c2;
          return [l, a] = r2(a), l === 2009 ? this.name === "flex" ? c2 = "box" : c2 = "inline-box" : l === 2012 ? this.name === "flex" ? c2 = "flexbox" : c2 = "inline-flexbox" : l === "final" && (c2 = this.name), a + c2;
        }
        replace(a, l) {
          return this.prefixed(l);
        }
        old(a) {
          let l = this.prefixed(a);
          if (l) return new n(this.name, l);
        }
      };
      s2.names = ["display-flex", "inline-flex"], t.exports = s2;
    }), sf = T((e, t) => {
      O2();
      var r2 = Ve(), n = class extends r2 {
        constructor(o2, s2) {
          super(o2, s2), o2 === "display-grid" && (this.name = "grid");
        }
        check(o2) {
          return o2.prop === "display" && o2.value === this.name;
        }
      };
      n.names = ["display-grid", "inline-grid"], t.exports = n;
    }), af = T((e, t) => {
      O2();
      var r2 = Ve(), n = class extends r2 {
        constructor(o2, s2) {
          super(o2, s2), o2 === "filter-function" && (this.name = "filter");
        }
      };
      n.names = ["filter", "filter-function"], t.exports = n;
    }), lf = T((e, t) => {
      O2();
      var r2 = Ir(), n = Y(), o2 = Yd(), s2 = Xd(), a = vi(), l = tp(), c2 = gt(), i2 = Wt(), d3 = np(), u2 = Ve(), p2 = _e(), f3 = op(), g3 = sp(), h2 = ap(), m3 = ip(), y3 = lp(), v2 = cp(), x2 = up(), k = dp(), w2 = pp(), b2 = fp(), C = hp(), S = mp(), E = gp(), A2 = vp(), _2 = yp(), U = bp(), D = wp(), j = xp(), L = kp(), F = Sp(), H = Cp(), Q = Ap(), we = Op(), Ce = _p(), R = Ep(), M2 = Tp(), P2 = Ip(), I = Pp(), G = jp(), B = Bp(), N = Dp(), K = $p(), J = Rp(), V = Mp(), ne = Up(), ie = zp(), q = Fp(), le = Lp(), We = Np(), ze = Vp(), Ae = Wp(), be = qp(), Ie = Gp(), Pe = Yp(), Qe = Hp(), Et = Qp(), Tt = Jp(), bt = Zp(), oo = Kp(), so = ef(), ao = tf(), io = rf(), lo = nf(), co = of(), Cf = sf(), Af = af();
      i2.hack(f3), i2.hack(g3), i2.hack(h2), i2.hack(m3), n.hack(y3), n.hack(v2), n.hack(x2), n.hack(k), n.hack(w2), n.hack(b2), n.hack(C), n.hack(S), n.hack(E), n.hack(A2), n.hack(_2), n.hack(U), n.hack(D), n.hack(j), n.hack(L), n.hack(F), n.hack(H), n.hack(Q), n.hack(we), n.hack(Ce), n.hack(R), n.hack(M2), n.hack(P2), n.hack(I), n.hack(G), n.hack(B), n.hack(N), n.hack(K), n.hack(J), n.hack(V), n.hack(ne), n.hack(ie), n.hack(q), n.hack(le), n.hack(We), n.hack(ze), n.hack(Ae), n.hack(be), n.hack(Ie), n.hack(Pe), n.hack(Qe), n.hack(Et), n.hack(Tt), n.hack(bt), u2.hack(oo), u2.hack(so), u2.hack(ao), u2.hack(io), u2.hack(lo), u2.hack(co), u2.hack(Cf), u2.hack(Af);
      var uo = /* @__PURE__ */ new Map(), po = class {
        constructor(ee, Z, te = {}) {
          this.data = ee, this.browsers = Z, this.options = te, [this.add, this.remove] = this.preprocess(this.select(this.data)), this.transition = new s2(this), this.processor = new a(this);
        }
        cleaner() {
          if (this.cleanerCache) return this.cleanerCache;
          if (this.browsers.selected.length) {
            let ee = new c2(this.browsers.data, []);
            this.cleanerCache = new po(this.data, ee, this.options);
          } else return this;
          return this.cleanerCache;
        }
        select(ee) {
          let Z = { add: {}, remove: {} };
          for (let te in ee) {
            let W = ee[te], X = W.browsers.map((ae) => {
              let pe = ae.split(" ");
              return { browser: `${pe[0]} ${pe[1]}`, note: pe[2] };
            }), Se = X.filter((ae) => ae.note).map((ae) => `${this.browsers.prefix(ae.browser)} ${ae.note}`);
            Se = p2.uniq(Se), X = X.filter((ae) => this.browsers.isSelected(ae.browser)).map((ae) => {
              let pe = this.browsers.prefix(ae.browser);
              return ae.note ? `${pe} ${ae.note}` : pe;
            }), X = this.sort(p2.uniq(X)), this.options.flexbox === "no-2009" && (X = X.filter((ae) => !ae.includes("2009")));
            let re = W.browsers.map((ae) => this.browsers.prefix(ae));
            W.mistakes && (re = re.concat(W.mistakes)), re = re.concat(Se), re = p2.uniq(re), X.length ? (Z.add[te] = X, X.length < re.length && (Z.remove[te] = re.filter((ae) => !X.includes(ae)))) : Z.remove[te] = re;
          }
          return Z;
        }
        sort(ee) {
          return ee.sort((Z, te) => {
            let W = p2.removeNote(Z).length, X = p2.removeNote(te).length;
            return W === X ? te.length - Z.length : X - W;
          });
        }
        preprocess(ee) {
          let Z = { selectors: [], "@supports": new l(po, this) };
          for (let W in ee.add) {
            let X = ee.add[W];
            if (W === "@keyframes" || W === "@viewport") Z[W] = new d3(W, X, this);
            else if (W === "@resolution") Z[W] = new o2(W, X, this);
            else if (this.data[W].selector) Z.selectors.push(i2.load(W, X, this));
            else {
              let Se = this.data[W].props;
              if (Se) {
                let re = u2.load(W, X, this);
                for (let ae of Se) Z[ae] || (Z[ae] = { values: [] }), Z[ae].values.push(re);
              } else {
                let re = Z[W] && Z[W].values || [];
                Z[W] = n.load(W, X, this), Z[W].values = re;
              }
            }
          }
          let te = { selectors: [] };
          for (let W in ee.remove) {
            let X = ee.remove[W];
            if (this.data[W].selector) {
              let Se = i2.load(W, X);
              for (let re of X) te.selectors.push(Se.old(re));
            } else if (W === "@keyframes" || W === "@viewport") for (let Se of X) {
              let re = `@${Se}${W.slice(1)}`;
              te[re] = { remove: true };
            }
            else if (W === "@resolution") te[W] = new o2(W, X, this);
            else {
              let Se = this.data[W].props;
              if (Se) {
                let re = u2.load(W, [], this);
                for (let ae of X) {
                  let pe = re.old(ae);
                  if (pe) for (let qt of Se) te[qt] || (te[qt] = {}), te[qt].values || (te[qt].values = []), te[qt].values.push(pe);
                }
              } else for (let re of X) {
                let ae = this.decl(W).old(W, re);
                if (W === "align-self") {
                  let pe = Z[W] && Z[W].prefixes;
                  if (pe && (re === "-webkit- 2009" && pe.includes("-webkit-") || re === "-webkit-" && pe.includes("-webkit- 2009"))) continue;
                }
                for (let pe of ae) te[pe] || (te[pe] = {}), te[pe].remove = true;
              }
            }
          }
          return [Z, te];
        }
        decl(ee) {
          return uo.has(ee) || uo.set(ee, n.load(ee)), uo.get(ee);
        }
        unprefixed(ee) {
          let Z = this.normalize(r2.unprefixed(ee));
          return Z === "flex-direction" && (Z = "flex-flow"), Z;
        }
        normalize(ee) {
          return this.decl(ee).normalize(ee);
        }
        prefixed(ee, Z) {
          return ee = r2.unprefixed(ee), this.decl(ee).prefixed(ee, Z);
        }
        values(ee, Z) {
          let te = this[ee], W = te["*"] && te["*"].values, X = te[Z] && te[Z].values;
          return W && X ? p2.uniq(W.concat(X)) : W || X || [];
        }
        group(ee) {
          let Z = ee.parent, te = Z.index(ee), { length: W } = Z.nodes, X = this.unprefixed(ee.prop), Se = (re, ae) => {
            for (te += re; te >= 0 && te < W; ) {
              let pe = Z.nodes[te];
              if (pe.type === "decl") {
                if (re === -1 && pe.prop === X && !c2.withPrefix(pe.value) || this.unprefixed(pe.prop) !== X) break;
                if (ae(pe) === true) return true;
                if (re === 1 && pe.prop === X && !c2.withPrefix(pe.value)) break;
              }
              te += re;
            }
            return false;
          };
          return { up(re) {
            return Se(-1, re);
          }, down(re) {
            return Se(1, re);
          } };
        }
      };
      t.exports = po;
    }), cf = T((e, t) => {
      O2(), t.exports = { "backdrop-filter": { feature: "css-backdrop-filter", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5", "safari 16.5"] }, element: { props: ["background", "background-image", "border-image", "mask", "list-style", "list-style-image", "content", "mask-image"], feature: "css-element-function", browsers: ["firefox 114"] }, "user-select": { mistakes: ["-khtml-"], feature: "user-select-none", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5", "safari 16.5"] }, "background-clip": { feature: "background-clip-text", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, hyphens: { feature: "css-hyphens", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5", "safari 16.5"] }, fill: { props: ["width", "min-width", "max-width", "height", "min-height", "max-height", "inline-size", "min-inline-size", "max-inline-size", "block-size", "min-block-size", "max-block-size", "grid", "grid-template", "grid-template-rows", "grid-template-columns", "grid-auto-columns", "grid-auto-rows"], feature: "intrinsic-width", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "fill-available": { props: ["width", "min-width", "max-width", "height", "min-height", "max-height", "inline-size", "min-inline-size", "max-inline-size", "block-size", "min-block-size", "max-block-size", "grid", "grid-template", "grid-template-rows", "grid-template-columns", "grid-auto-columns", "grid-auto-rows"], feature: "intrinsic-width", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, stretch: { props: ["width", "min-width", "max-width", "height", "min-height", "max-height", "inline-size", "min-inline-size", "max-inline-size", "block-size", "min-block-size", "max-block-size", "grid", "grid-template", "grid-template-rows", "grid-template-columns", "grid-auto-columns", "grid-auto-rows"], feature: "intrinsic-width", browsers: ["firefox 114"] }, "fit-content": { props: ["width", "min-width", "max-width", "height", "min-height", "max-height", "inline-size", "min-inline-size", "max-inline-size", "block-size", "min-block-size", "max-block-size", "grid", "grid-template", "grid-template-rows", "grid-template-columns", "grid-auto-columns", "grid-auto-rows"], feature: "intrinsic-width", browsers: ["firefox 114"] }, "text-decoration-style": { feature: "text-decoration", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "text-decoration-color": { feature: "text-decoration", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "text-decoration-line": { feature: "text-decoration", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "text-decoration": { feature: "text-decoration", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "text-decoration-skip": { feature: "text-decoration", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "text-decoration-skip-ink": { feature: "text-decoration", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "text-size-adjust": { feature: "text-size-adjust", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5"] }, "mask-clip": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-composite": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-image": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-origin": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-repeat": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-border-repeat": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-border-source": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, mask: { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-position": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-size": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-border": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-border-outset": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-border-width": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "mask-border-slice": { feature: "css-masks", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, "clip-path": { feature: "css-clip-path", browsers: ["samsung 21"] }, "box-decoration-break": { feature: "css-boxdecorationbreak", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5", "opera 99", "safari 16.5", "samsung 21"] }, appearance: { feature: "css-appearance", browsers: ["samsung 21"] }, "image-set": { props: ["background", "background-image", "border-image", "cursor", "mask", "mask-image", "list-style", "list-style-image", "content"], feature: "css-image-set", browsers: ["and_uc 15.5", "chrome 109", "samsung 21"] }, "cross-fade": { props: ["background", "background-image", "border-image", "mask", "list-style", "list-style-image", "content", "mask-image"], feature: "css-cross-fade", browsers: ["and_chr 114", "and_uc 15.5", "chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99", "samsung 21"] }, isolate: { props: ["unicode-bidi"], feature: "css-unicode-bidi", browsers: ["ios_saf 16.1", "ios_saf 16.3", "ios_saf 16.4", "ios_saf 16.5", "safari 16.5"] }, "color-adjust": { feature: "css-color-adjust", browsers: ["chrome 109", "chrome 113", "chrome 114", "edge 114", "opera 99"] } };
    }), uf = T((e, t) => {
      O2(), t.exports = {};
    }), df = T((e, t) => {
      O2();
      var r2 = mi(), { agents: n } = (Xn(), Tr), o2 = qd(), s2 = gt(), a = lf(), l = cf(), c2 = uf(), i2 = { browsers: n, prefixes: l }, d3 = `
  Replace Autoprefixer \`browsers\` option to Browserslist config.
  Use \`browserslist\` key in \`package.json\` or \`.browserslistrc\` file.

  Using \`browsers\` option can cause errors. Browserslist config can
  be used for Babel, Autoprefixer, postcss-normalize and other tools.

  If you really need to use option, rename it to \`overrideBrowserslist\`.

  Learn more at:
  https://github.com/browserslist/browserslist#readme
  https://twitter.com/browserslist

`;
      function u2(h2) {
        return Object.prototype.toString.apply(h2) === "[object Object]";
      }
      var p2 = /* @__PURE__ */ new Map();
      function f3(h2, m3) {
        m3.browsers.selected.length !== 0 && (m3.add.selectors.length > 0 || Object.keys(m3.add).length > 2 || h2.warn(`Autoprefixer target browsers do not need any prefixes.You do not need Autoprefixer anymore.
Check your Browserslist config to be sure that your targets are set up correctly.

  Learn more at:
  https://github.com/postcss/autoprefixer#readme
  https://github.com/browserslist/browserslist#readme

`));
      }
      t.exports = g3;
      function g3(...h2) {
        let m3;
        if (h2.length === 1 && u2(h2[0]) ? (m3 = h2[0], h2 = void 0) : h2.length === 0 || h2.length === 1 && !h2[0] ? h2 = void 0 : h2.length <= 2 && (Array.isArray(h2[0]) || !h2[0]) ? (m3 = h2[1], h2 = h2[0]) : typeof h2[h2.length - 1] == "object" && (m3 = h2.pop()), m3 || (m3 = {}), m3.browser) throw new Error("Change `browser` option to `overrideBrowserslist` in Autoprefixer");
        if (m3.browserslist) throw new Error("Change `browserslist` option to `overrideBrowserslist` in Autoprefixer");
        m3.overrideBrowserslist ? h2 = m3.overrideBrowserslist : m3.browsers && (typeof console < "u" && console.warn && (o2.red ? console.warn(o2.red(d3.replace(/`[^`]+`/g, (x2) => o2.yellow(x2.slice(1, -1))))) : console.warn(d3)), h2 = m3.browsers);
        let y3 = { ignoreUnknownVersions: m3.ignoreUnknownVersions, stats: m3.stats, env: m3.env };
        function v2(x2) {
          let k = i2, w2 = new s2(k.browsers, h2, x2, y3), b2 = w2.selected.join(", ") + JSON.stringify(m3);
          return p2.has(b2) || p2.set(b2, new a(k.prefixes, w2, m3)), p2.get(b2);
        }
        return { postcssPlugin: "autoprefixer", prepare(x2) {
          let k = v2({ from: x2.opts.from, env: m3.env });
          return { OnceExit(w2) {
            f3(x2, k), m3.remove !== false && k.processor.remove(w2, x2), m3.add !== false && k.processor.add(w2, x2);
          } };
        }, info(x2) {
          return x2 = x2 || {}, x2.from = x2.from || je.cwd(), c2(v2(x2));
        }, options: m3, browsers: h2 };
      }
      g3.postcss = true, g3.data = i2, g3.defaults = r2.defaults, g3.info = () => g3().info();
    }), yi = {};
    Fe(yi, { default: () => bi });
    var bi, pf = $(() => {
      O2(), bi = [];
    }), wi = {};
    Fe(wi, { default: () => ki });
    var xi, ki, ff = $(() => {
      O2(), zr(), xi = he(Jr()), ki = Dt(xi.default.theme);
    }), Si = {};
    Fe(Si, { default: () => Ai });
    var Ci, Ai, hf = $(() => {
      O2(), zr(), Ci = he(Jr()), Ai = Dt(Ci.default);
    });
    O2();
    var mf = tt(Vd()), gf = tt(Re()), vf = tt(df()), yf = tt((pf(), yi)), bf = tt((ff(), wi)), wf = tt((hf(), Si)), xf = tt((Co(), So)), kf = tt((Ma(), zn)), Sf = tt((as(), ss));
    function tt(e) {
      return e && e.__esModule ? e : { default: e };
    }
    console.warn("cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation");
    var Pr = "tailwind", eo = "text/tailwindcss", Oi = "/template.html", yt, _i = true, Ei = 0, to = /* @__PURE__ */ new Set(), ro, Ti = "", Ii = (e = false) => ({ get(t, r2) {
      return (!e || r2 === "config") && typeof t[r2] == "object" && t[r2] !== null ? new Proxy(t[r2], Ii()) : t[r2];
    }, set(t, r2, n) {
      return t[r2] = n, (!e || r2 === "config") && no(true), true;
    } });
    window[Pr] = new Proxy({ config: {}, defaultTheme: bf.default, defaultConfig: wf.default, colors: xf.default, plugin: kf.default, resolveConfig: Sf.default }, Ii(true));
    function Pi(e) {
      ro.observe(e, { attributes: true, attributeFilter: ["type"], characterData: true, subtree: true, childList: true });
    }
    new MutationObserver(async (e) => {
      let t = false;
      if (!ro) {
        ro = new MutationObserver(async () => await no(true));
        for (let r2 of document.querySelectorAll(`style[type="${eo}"]`)) Pi(r2);
      }
      for (let r2 of e) for (let n of r2.addedNodes) n.nodeType === 1 && n.tagName === "STYLE" && n.getAttribute("type") === eo && (Pi(n), t = true);
      await no(t);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
    async function no(e = false) {
      e && (Ei++, to.clear());
      let t = "";
      for (let n of document.querySelectorAll(`style[type="${eo}"]`)) t += n.textContent;
      let r2 = /* @__PURE__ */ new Set();
      for (let n of document.querySelectorAll("[class]")) for (let o2 of n.classList) to.has(o2) || r2.add(o2);
      if (document.body && (_i || r2.size > 0 || t !== Ti || !yt || !yt.isConnected)) {
        for (let o2 of r2) to.add(o2);
        _i = false, Ti = t, self[Oi] = Array.from(r2).join(" ");
        let { css: n } = await (0, gf.default)([(0, mf.default)({ ...window[Pr].config, _hash: Ei, content: { files: [Oi], extract: { html: (o2) => o2.split(" ") } }, plugins: [...yf.default, ...Array.isArray(window[Pr].config.plugins) ? window[Pr].config.plugins : []] }), (0, vf.default)({ remove: false })]).process(`@tailwind base;@tailwind components;@tailwind utilities;${t}`);
        (!yt || !yt.isConnected) && (yt = document.createElement("style"), document.head.append(yt)), yt.textContent = n;
      }
    }
  })();
});
var ho = Bf(Bi());
var bm = ho.default ?? ho;

// shakespeare-tailwind:shakespeare:tailwind.config.ts
tailwind.config = tailwind_config_default;
/*! Bundled license information:

tailwindcss-cdn/tailwindcss.js:
  (*! https://mths.be/cssesc v3.0.0 by @mathias *)
*/
//# sourceMappingURL=shakespeare_tailwind.config-DYCSFKQO.js.map
