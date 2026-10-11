/* 代码手记 — 交互脚本：主题切换 + 代码复制 + 阅读进度 */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORE_KEY = "blog-theme";

  /* ---------- 主题：默认跟随系统，用户手动切换后记住选择 ---------- */
  function preferredTheme() {
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) { /* 隐私模式下 localStorage 可能不可用 */ }
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "◐" : "◑";
      btn.title = theme === "dark" ? "切换到浅色" : "切换到深色";
    }
  }

  /* 注意：首屏主题已在 <head> 的内联脚本里设定（避免闪白），
     这里只负责按钮状态和切换。 */
  applyTheme(root.getAttribute("data-theme") || preferredTheme());

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(root.getAttribute("data-theme") || preferredTheme());

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
        try { localStorage.setItem(STORE_KEY, next); } catch (e) { /* 忽略 */ }
      });
    }

    /* ---------- 代码块：加复制按钮 ---------- */
    var blocks = document.querySelectorAll(".post-body pre, .highlight");
    Array.prototype.forEach.call(blocks, function (block) {
      var btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "复制";
      btn.addEventListener("click", function () {
        var code = block.querySelector("code") || block;
        var text = code.innerText;
        var done = function () {
          btn.textContent = "已复制 ✓";
          setTimeout(function () { btn.textContent = "复制"; }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
        } else {
          fallback(text, done);
        }
      });
      block.appendChild(btn);
    });

    function fallback(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* 忽略 */ }
      document.body.removeChild(ta);
    }

    /* ---------- 长文：顶部显示阅读进度 ---------- */
    var post = document.querySelector(".post-body");
    if (post && post.innerText.length > 1200) {
      var bar = document.createElement("div");
      bar.style.cssText =
        "position:fixed;top:0;left:0;height:2px;width:0;z-index:50;" +
        "background:var(--accent);transition:width .1s linear";
      document.body.appendChild(bar);
      var onScroll = function () {
        var rect = post.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        var seen = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
        bar.style.width = (total > 0 ? (seen / total) * 100 : 100) + "%";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      onScroll();
    }
  });
})();
