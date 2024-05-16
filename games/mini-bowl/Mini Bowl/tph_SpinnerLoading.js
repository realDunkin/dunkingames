var g_SpinnerTarget = null,
  g_pSpinnerObject = null;

function CustomLoadingSpinner(t, e, i, o, n, r) {
  r ? t.drawImage(r, 0, 0, e, i) : (t.fillStyle = "rgba(36, 36, 36, 255)", t.fillRect(0, 0, e, i)); // 38, 22, 114
  e = {
    lines: 10,
    length: 16,
    width: 4.5,
    radius: 11,
    corners: 1,
    rotate: 0,
    direction: 1,
    color: "#959595",
    speed: 1,
    trail: 60,
    shadow: !1,
    hwaccel: !1,
    className: "spinner",
    zIndex: 2e9,
    top: i / 2 + "px",
    left: e / 2 + "px"
  };
  g_SpinnerTarget || (g_SpinnerTarget = document.getElementById("gm4html5_div_id"), g_pSpinnerObject = new Spinner(e).spin(g_SpinnerTarget)), o == n && g_pSpinnerObject.stop()
}! function(t, e) {
  "object" == typeof exports ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.Spinner = e()
}(this, function() {
  "use strict";

  function u(t, e) {
    var i, o = document.createElement(t || "div");
    for (i in e) o[i] = e[i];
    return o
  }

  function c(t) {
    for (var e = 1, i = arguments.length; e < i; e++) t.appendChild(arguments[e]);
    return t
  }

  function o(t, e) {
    var i, o, n = t.style;
    for (e = e.charAt(0).toUpperCase() + e.slice(1), o = 0; o < r.length; o++)
      if (void 0 !== n[i = r[o] + e]) return i;
    return void 0 !== n[e] ? e : void 0
  }

  function f(t, e) {
    for (var i in e) t.style[o(t, i) || i] = e[i];
    return t
  }

  function e(t) {
    for (var e = 1; e < arguments.length; e++) {
      var i, o = arguments[e];
      for (i in o) void 0 === t[i] && (t[i] = o[i])
    }
    return t
  }

  function h(t, e) {
    return "string" == typeof t ? t : t[e % t.length]
  }

  function i(t) {
    this.opts = e(t || {}, i.defaults, n)
  }
  var g, r = ["webkit", "Moz", "ms", "O"],
    m = {},
    y = (t = u("style", {
      type: "text/css"
    }), c(document.getElementsByTagName("head")[0], t), t.sheet || t.styleSheet),
    n = {
      lines: 12,
      length: 7,
      width: 5,
      radius: 10,
      rotate: 0,
      corners: 1,
      color: "#000",
      direction: 1,
      speed: 1,
      trail: 100,
      opacity: .25,
      fps: 20,
      zIndex: 2e9,
      className: "spinner",
      top: "50%",
      left: "50%",
      position: "absolute"
    };
  i.defaults = {}, e(i.prototype, {
    spin: function(t) {
      this.stop();
      var i, o, n, r, s, a, l, p = this,
        d = p.opts,
        c = p.el = f(u(0, {
          className: d.className
        }), {
          position: d.position,
          width: 0,
          zIndex: d.zIndex
        });
      return d.radius, d.length, d.width, f(c, {
        left: d.left,
        top: d.top
      }), t && t.insertBefore(c, t.firstChild || null), c.setAttribute("role", "progressbar"), p.lines(c, p.opts), g || (o = 0, n = (d.lines - 1) * (1 - d.direction) / 2, r = d.fps, s = r / d.speed, a = (1 - d.opacity) / (s * d.trail / 100), l = s / d.lines, function t() {
        o++;
        for (var e = 0; e < d.lines; e++) i = Math.max(1 - (o + (d.lines - e) * l) % s * a, d.opacity), p.opacity(c, e * d.direction + n, i, d);
        p.timeout = p.el && setTimeout(t, ~~(1e3 / r))
      }()), p
    },
    stop: function() {
      var t = this.el;
      return t && (clearTimeout(this.timeout), t.parentNode && t.parentNode.removeChild(t), this.el = void 0), this
    },
    lines: function(t, i) {
      function e(t, e) {
        return f(u(), {
          position: "absolute",
          width: i.length + i.width + "px",
          height: i.width + "px",
          background: t,
          boxShadow: e,
          transformOrigin: "left",
          transform: "rotate(" + ~~(360 / i.lines * p + i.rotate) + "deg) translate(" + i.radius + "px,0)",
          borderRadius: (i.corners * i.width >> 1) + "px"
        })
      }
      for (var o, n, r, s, a, l, p = 0, d = (i.lines - 1) * (1 - i.direction) / 2; p < i.lines; p++) a = f(u(), {
        position: "absolute",
        top: 1 + ~(i.width / 2) + "px",
        transform: i.hwaccel ? "translate3d(0,0,0)" : "",
        opacity: i.opacity,
        animation: g && (o = i.opacity, n = i.trail, r = d + p * i.direction, s = i.lines, l = a = void 0, a = ["opacity", n, ~~(100 * o), r, s].join("-"), l = .01 + r / s * 100, r = Math.max(1 - (1 - o) / n * (100 - l), o), s = (s = g.substring(0, g.indexOf("Animation")).toLowerCase()) && "-" + s + "-" || "", m[a] || (y.insertRule("@" + s + "keyframes " + a + "{0%{opacity:" + r + "}" + l + "%{opacity:" + o + "}" + (.01 + l) + "%{opacity:1}" + (l + n) % 100 + "%{opacity:" + o + "}100%{opacity:" + r + "}}", y.cssRules.length), m[a] = 1), a + " " + 1 / i.speed + "s linear infinite")
      }), i.shadow && c(a, f(e("#000", "0 0 4px #000"), {
        top: "2px"
      })), c(t, c(a, e(h(i.color, p), "0 0 1px rgba(0,0,0,.1)")));
      return t
    },
    opacity: function(t, e, i) {
      e < t.childNodes.length && (t.childNodes[e].style.opacity = i)
    }
  });
  var t = f(u("group"), {
    behavior: "url(#default#VML)"
  });
  return !o(t, "transform") && t.adj ? (y.addRule(".spin-vml", "behavior:url(#default#VML)"), i.prototype.lines = function(t, o) {
    function n() {
      return f(p("group", {
        coordsize: s + " " + s,
        coordorigin: -r + " " + -r
      }), {
        width: s,
        height: s
      })
    }

    function e(t, e, i) {
      c(l, c(f(n(), {
        rotation: 360 / o.lines * t + "deg",
        left: ~~e
      }), c(f(p("roundrect", {
        arcsize: o.corners
      }), {
        width: r,
        height: o.width,
        left: o.radius,
        top: -o.width >> 1,
        filter: i
      }), p("fill", {
        color: h(o.color, t),
        opacity: o.opacity
      }), p("stroke", {
        opacity: 0
      }))))
    }
    var i, r = o.length + o.width,
      s = 2 * r,
      a = 2 * -(o.width + o.length) + "px",
      l = f(n(), {
        position: "absolute",
        top: a,
        left: a
      });
    if (o.shadow)
      for (i = 1; i <= o.lines; i++) e(i, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
    for (i = 1; i <= o.lines; i++) e(i);
    return c(t, l)
  }, i.prototype.opacity = function(t, e, i, o) {
    t = t.firstChild;
    o = o.shadow && o.lines || 0, t && e + o < t.childNodes.length && ((t = (t = (t = t.childNodes[e + o]) && t.firstChild) && t.firstChild) && (t.opacity = i))
  }) : g = o(t, "animation"), i;

  function p(t, e) {
    return u("<" + t + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', e)
  }
});