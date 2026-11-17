
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initIndex() {
    var root = document.querySelector(".ix");
    if (!root) return;
    var lis = Array.prototype.slice.call(root.querySelectorAll("li"));
    var panel = root.querySelector(".panel");
    if (!panel || !lis.length) return;
    var stage = panel.querySelector(".stage");
    var imgA = stage && stage.querySelector("img.frame-a");
    var imgB = stage && stage.querySelector("img.frame-b");
    var line = panel.querySelector(".line");
    var credit = panel.querySelector(".credit");
    if (!imgA || !imgB || !line) return;

    var front = imgA;
    var back = imgB;
    var currentSrc = imgA.getAttribute("src") || "";
    var defaultLi = root.querySelector("li.on") || lis[1] || lis[0];

    function show(li, instant) {
      lis.forEach(function (item) {
        item.classList.toggle("on", item === li);
      });
      var src = li.getAttribute("data-src") || "";
      var pos = li.getAttribute("data-pos") || "50% 50%";
      var alt = li.getAttribute("data-alt") || "";
      var text = li.getAttribute("data-line") || "";
      var cred = li.getAttribute("data-credit") || "";
      line.textContent = text;
      if (credit) {
        credit.textContent = cred;
        credit.style.visibility = cred ? "visible" : "hidden";
      }
      if (src === currentSrc) return;

      function swap() {
        back.style.opacity = "1";
        front.style.opacity = "0";
        back.classList.remove("is-back");
        front.classList.add("is-back");
        var tmp = front;
        front = back;
        back = tmp;
        currentSrc = src;
      }

      if (!src) {
        back.removeAttribute("src");
        back.alt = "";
        back.style.objectPosition = "50% 50%";
        back.style.background = "#1C1C1C";
        if (instant || reduce) {
          front.style.transition = "none";
          back.style.transition = "none";
          swap();
          front.style.transition = "";
          back.style.transition = "";
        } else {
          swap();
        }
        currentSrc = "";
        return;
      }

      back.style.background = "";
      back.style.objectPosition = pos;
      back.alt = alt;
      function go() {
        back.onload = null;
        if (instant || reduce) {
          front.style.transition = "none";
          back.style.transition = "none";
          swap();
          front.style.transition = "";
          back.style.transition = "";
        } else {
          swap();
        }
      }
      if (back.getAttribute("src") === src && back.complete) {
        go();
        return;
      }
      back.onload = go;
      back.src = src;
    }

    lis.forEach(function (li) {
      li.addEventListener("mouseenter", function () { show(li, false); });
      li.addEventListener("focusin", function () { show(li, false); });
    });
    var list = root.querySelector("ul");
    if (list) {
      list.addEventListener("mouseleave", function () { show(defaultLi, false); });
    }
  }

  function initRail() {
    var rail = document.querySelector(".rail");
    var bar = document.querySelector(".railbar");
    if (!rail || !bar) return;
    var fill = bar.querySelector(".track i");
    var buttons = bar.querySelectorAll("button");
    var prev = buttons[0];
    var next = buttons[1];

    function cardStep() {
      var card = rail.querySelector("a, .soon");
      if (!card) return 384;
      var styles = window.getComputedStyle(rail);
      var gap = parseFloat(styles.columnGap || styles.gap || "24") || 24;
      return card.getBoundingClientRect().width + gap;
    }

    function update() {
      var max = rail.scrollWidth - rail.clientWidth;
      var ratio = max <= 0 ? 0.34 : Math.min(1, rail.scrollLeft / max);
      if (fill) fill.style.width = Math.max(18, ratio * 100) + "%";
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max - 2;
    }

    function move(dir) {
      rail.scrollBy({
        left: cardStep() * dir,
        behavior: reduce ? "auto" : "smooth"
      });
    }

    if (prev) prev.addEventListener("click", function () { move(-1); });
    if (next) next.addEventListener("click", function () { move(1); });
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initLine() {
    var line = document.querySelector("p.ln");
    var subs = document.querySelector(".ln-sub");
    if (!line || !subs) return;
    var links = Array.prototype.slice.call(line.querySelectorAll("a"));
    var cols = Array.prototype.slice.call(subs.querySelectorAll("p"));
    var defaultLink = line.querySelector("a.on") || links[1] || links[0];

    function show(link) {
      links.forEach(function (a) { a.classList.toggle("on", a === link); });
      var idx = links.indexOf(link);
      cols.forEach(function (col, i) { col.classList.toggle("is-on", i === idx); });
    }

    links.forEach(function (a) {
      a.addEventListener("mouseenter", function () { show(a); });
      a.addEventListener("focus", function () { show(a); });
    });
    line.addEventListener("mouseleave", function () { show(defaultLink); });
    show(defaultLink);
  }

  initIndex();
  initRail();
  initLine();
})();
