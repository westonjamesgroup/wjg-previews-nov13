(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var body = document.body;
  if (reduce) body.classList.add("reduce");

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function onReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* Menu */
  function setupMenu() {
    var toggle = qs(".nav-toggle");
    var menu = qs("#site-menu");
    if (!toggle || !menu) return;
    function close() {
      body.classList.remove("menu-open");
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
    function open() {
      body.classList.add("menu-open");
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }
    toggle.addEventListener("click", function () {
      if (menu.hidden) open(); else close();
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        close();
        toggle.focus();
      }
    });
  }

  /* Audience */
  function setAudience(next, opts) {
    var audience = next === "buyers" ? "buyers" : "sellers";
    body.setAttribute("data-audience", audience);
    qsa("[data-audience-btn]").forEach(function (btn) {
      var on = btn.getAttribute("data-audience-btn") === audience;
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    qsa(".swap-item").forEach(function (item) {
      var on = item.getAttribute("data-for") === audience;
      item.classList.toggle("is-on", on);
    });
    if (!opts || !opts.silent) {
      if (audience === "buyers") history.replaceState(null, "", "#buyers");
      else if (location.hash === "#buyers") history.replaceState(null, "", location.pathname + location.search);
    }
    document.dispatchEvent(new CustomEvent("audiencechange", { detail: { audience: audience } }));
  }

  function setupAudience() {
    qsa("[data-audience-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setAudience(btn.getAttribute("data-audience-btn"));
      });
    });
    if (location.hash === "#buyers") setAudience("buyers", { silent: true });
    else setAudience("sellers", { silent: true });
    window.addEventListener("hashchange", function () {
      setAudience(location.hash === "#buyers" ? "buyers" : "sellers", { silent: true });
    });
  }

  /* Solid nav once the photo hero is no longer under it */
  function setupNavSolid() {
    var nav = qs(".nav");
    if (!nav) return;
    function update() {
      nav.classList.toggle("is-solid", window.scrollY > 16 || body.classList.contains("menu-open"));
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* Scroll progress */
  function setupProgress() {
    var bar = qs(".scroll-progress span");
    if (!bar) return;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var t = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, t)) + ")";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* Custom cursor */
  function setupCursor() {
    var el = qs(".cursor");
    if (!el || !finePointer || reduce) return;
    body.classList.add("has-cursor");
    el.hidden = false;
    var x = 0, y = 0, shown = false;
    window.addEventListener("pointermove", function (e) {
      x = e.clientX;
      y = e.clientY;
      el.style.setProperty("--x", x + "px");
      el.style.setProperty("--y", y + "px");
      if (!shown) {
        el.classList.add("is-on");
        shown = true;
      }
      var over = e.target.closest("a, button, input, label, [data-chapter-btn], .consult-choice");
      el.classList.toggle("is-over", !!over);
    });
    window.addEventListener("pointerleave", function () {
      el.classList.remove("is-on");
      shown = false;
    });
  }

  /* Inline SVG helper */
  function inlineSvg(img, className) {
    if (!img || !img.getAttribute("src")) return Promise.resolve(null);
    return fetch(img.getAttribute("src")).then(function (res) { return res.text(); }).then(function (text) {
      var wrap = document.createElement("div");
      wrap.innerHTML = text.trim();
      var svg = wrap.querySelector("svg");
      if (!svg) return null;
      if (className) svg.classList.add(className);
      Array.prototype.forEach.call(img.attributes, function (attr) {
        if (attr.name === "src" || attr.name === "width" || attr.name === "height" || attr.name === "alt") return;
        if (!svg.hasAttribute(attr.name)) svg.setAttribute(attr.name, attr.value);
      });
      var alt = img.getAttribute("alt");
      if (alt) {
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", alt);
      }
      img.replaceWith(svg);
      return svg;
    }).catch(function () { return null; });
  }

  function prepareDraw(svg) {
    if (!svg) return;
    qsa("path, rect, line", svg).forEach(function (node) {
      node.setAttribute("pathLength", "1");
    });
  }

  /* Intro */
  function setupIntro() {
    var intro = qs(".intro");
    if (!intro) return;
    var img = qs(".intro-elev img, .intro-elev svg.elevation");
    var p = img && img.tagName === "IMG" ? inlineSvg(img, "elevation") : Promise.resolve(qs(".elevation"));
    p.then(function (svg) {
      prepareDraw(svg);
      function reveal() {
        intro.classList.add("is-in");
        window.setTimeout(function () { intro.classList.add("is-drawn"); }, reduce ? 0 : 200);
      }
      if (reduce) reveal();
      else window.requestAnimationFrame(reveal);
    });
  }

  /* Chapters */
  function setupChapters() {
    var section = qs(".difference");
    var stage = qs("[data-chapters]");
    if (!section || !stage) return;
    var count = qsa("[data-chapter]").length;
    var current = 0;
    var locked = false;

    function show(index) {
      current = (index + count) % count;
      qsa("[data-chapter]").forEach(function (el) {
        el.classList.toggle("is-on", Number(el.getAttribute("data-chapter")) === current);
      });
      qsa("[data-chapter-visual]").forEach(function (el) {
        el.classList.toggle("is-on", Number(el.getAttribute("data-chapter-visual")) === current);
      });
      qsa("[data-chapter-btn]").forEach(function (btn) {
        var on = Number(btn.getAttribute("data-chapter-btn")) === current;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      var label = qs("[data-chapter-count] span");
      if (label) label.textContent = String(current + 1).padStart(2, "0");
    }

    qsa("[data-chapter-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        show(Number(btn.getAttribute("data-chapter-btn")));
      });
    });

    function pinEnabled() {
      return !reduce && window.innerWidth >= 1100;
    }

    function applyPin() {
      section.classList.toggle("is-pinned", pinEnabled());
    }

    function fromScroll() {
      if (!pinEnabled()) return;
      var rect = section.getBoundingClientRect();
      var start = window.scrollY + rect.top;
      var end = start + section.offsetHeight - window.innerHeight;
      var t = end <= start ? 0 : (window.scrollY - start) / (end - start);
      t = Math.min(0.999, Math.max(0, t));
      show(Math.floor(t * count));
    }

    applyPin();
    fromScroll();
    window.addEventListener("scroll", fromScroll, { passive: true });
    window.addEventListener("resize", function () {
      applyPin();
      fromScroll();
    });

    var startX = 0, startY = 0;
    stage.addEventListener("touchstart", function (e) {
      if (!e.changedTouches[0]) return;
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (pinEnabled() || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      show(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) section.classList.add("is-in");
      });
    }, { threshold: 0.2 });
    io.observe(section);
    show(0);
  }

  /* Charts and count-up */
  function setupIntel() {
    qsa("[data-chart]").forEach(function (svg) {
      var card = svg.closest(".chart-card") || svg;
      if (reduce) {
        card.classList.add("is-drawn");
        return;
      }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          card.classList.add("is-drawn");
          io.disconnect();
        });
      }, { threshold: 0.35 });
      io.observe(card);
    });

    var sales = qs(".intel-sales[data-count]");
    if (!sales) return;
    var span = qs("span", sales);
    var target = Number(sales.getAttribute("data-count")) || 550;
    function setFinal() { if (span) span.textContent = String(target); }
    if (reduce) { setFinal(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.disconnect();
        var start = performance.now();
        var dur = 1200;
        function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          if (span) span.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
          else setFinal();
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    io.observe(sales);
  }

  /* Floor plan */
  var ROOM_COPY = {
    gallery: "Gallery. Sample plan.",
    living: "Living. Sample plan.",
    kitchen: "Kitchen. Sample plan.",
    terrace: "Terrace. Sample plan."
  };

  function setupPlan() {
    var host = qs("[data-plan]");
    if (!host) return;
    var img = qs("img", host);
    var label = qs("[data-plan-label]");
    var rooms = [];
    var index = -1;

    function select(name) {
      rooms.forEach(function (room) {
        room.classList.toggle("is-on", room.getAttribute("data-room") === name);
      });
      if (label && ROOM_COPY[name]) label.textContent = ROOM_COPY[name];
      index = rooms.findIndex(function (room) { return room.getAttribute("data-room") === name; });
    }

    function bind(svg) {
      rooms = qsa("[data-room]", svg || host);
      rooms.forEach(function (room) {
        room.setAttribute("tabindex", "0");
        room.setAttribute("role", "button");
        var name = room.getAttribute("data-room");
        room.setAttribute("aria-label", ROOM_COPY[name] || name);
        room.addEventListener("click", function () { select(name); });
        room.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(name);
          }
        });
      });
    }

    var ready = img ? inlineSvg(img) : Promise.resolve(qs("svg", host));
    ready.then(function (svg) {
      bind(svg);
    });

    host.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (!rooms.length) return;
      e.preventDefault();
      if (index < 0) index = 0;
      else index = e.key === "ArrowRight" ? (index + 1) % rooms.length : (index - 1 + rooms.length) % rooms.length;
      select(rooms[index].getAttribute("data-room"));
    });
  }

  /* Before / after */
  function setupCompare() {
    qsa("[data-compare]").forEach(function (root) {
      var range = qs(".compare-range", root);
      var clip = qs(".compare-before-clip", root);
      var handle = qs(".compare-handle", root);
      if (!range || !clip) return;
      function size() {
        root.style.setProperty("--compare-w", root.offsetWidth + "px");
      }
      function apply() {
        var v = range.value + "%";
        clip.style.width = v;
        if (handle) handle.style.left = v;
      }
      size();
      apply();
      range.addEventListener("input", apply);
      window.addEventListener("resize", function () { size(); apply(); });
    });
  }

  /* WSTN+ 12s play-once on the front phone */
  function setupWstn() {
    var demo = qs("[data-wstn-demo]");
    if (!demo) return;
    var phone = qs(".wstn-phone-front", demo);
    var slides = qsa(".wstn-slide", phone);
    var content = slides.filter(function (s) { return s.getAttribute("data-slide") !== "end"; });
    var endSlide = slides.filter(function (s) { return s.getAttribute("data-slide") === "end"; })[0];
    var dots = qsa("[data-dot]", demo);
    var timers = [];
    var played = false;
    var duration = 12000;
    var step = content.length ? duration / content.length : duration;

    function clearTimers() {
      timers.forEach(function (id) { window.clearTimeout(id); });
      timers = [];
    }

    function activate(el) {
      slides.forEach(function (s) { s.classList.remove("is-active"); });
      if (el) el.classList.add("is-active");
    }

    function setDots(i) {
      dots.forEach(function (d) {
        d.classList.toggle("is-on", Number(d.getAttribute("data-dot")) === i);
      });
    }

    function end() {
      clearTimers();
      activate(endSlide);
      if (phone) phone.classList.add("is-ended");
      setDots(-1);
    }

    function play() {
      clearTimers();
      played = true;
      if (phone) phone.classList.remove("is-ended");
      if (reduce) {
        activate(endSlide || content[0]);
        if (endSlide) phone && phone.classList.add("is-ended");
        return;
      }
      content.forEach(function (slide, i) {
        timers.push(window.setTimeout(function () {
          activate(slide);
          setDots(i);
        }, i === 0 ? 0 : i * step));
      });
      timers.push(window.setTimeout(end, duration));
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !played) {
          play();
          io.disconnect();
        }
      });
    }, { threshold: 0.45 });
    io.observe(demo);

    var replay = qs("[data-wstn-replay]", demo);
    if (replay) replay.addEventListener("click", function () {
      played = false;
      play();
    });

    var form = qs("[data-wstn-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = qs(".wstn-caption", form.parentElement) || form;
        var existing = qs("[data-wstn-ack]", form.parentElement);
        if (!existing) {
          existing = document.createElement("p");
          existing.className = "wstn-caption";
          existing.setAttribute("data-wstn-ack", "");
          form.insertAdjacentElement("afterend", existing);
        }
        existing.textContent = "This prototype does not collect addresses yet.";
      });
    }
  }

  /* Adaptive consultation. Responses use official marketing copy. */
  var CONSULT = {
    sellers: {
      question: "What would you like to talk about first?",
      choices: [
        {
          label: "Pricing",
          reply: "Price is the first thing a buyer hears about a house, and it shapes everything that follows. I set it from evidence, test it from more than one angle, and time it to the market we're actually in."
        },
        {
          label: "Finding the right buyer",
          reply: "The right buyer for a significant home is rarely found by chance. I find the people already looking for a house like yours, whether that means its architecture, its setting or the way it lives, and I bring it to them directly."
        },
        {
          label: "Marketing and presentation",
          reply: "Every house gets its own concept, never a template: the story, the photography, the film and the launch, all designed together. The aim is a home people remember after they've seen it."
        },
        {
          label: "How I work",
          reply: "None of this replaces showing up. I roll up my sleeves on every listing. I walk the property with the photographer, rewrite the copy until it's right, take the calls myself and follow every lead through to the end. That work is why sellers have trusted me with more than $550 million in sales."
        }
      ],
      close: "If you would like to go further, I share the full strategy privately with the homeowners I meet.",
      action: { label: "Request Your Private Briefing", briefing: true }
    },
    buyers: {
      question: "What would help most right now?",
      choices: [
        {
          label: "Understanding the market",
          reply: "Before you make a decision, I help you understand what a home is worth today, how it compares with what has sold nearby, and where the market is moving."
        },
        {
          label: "Making an offer",
          reply: "A strong offer is built from evidence, not instinct. I help you decide what to offer, when to offer it, and how to structure it so it is taken seriously."
        },
        {
          label: "Finding the right home",
          reply: "I look past what is easy to find. I know many of the architecturally significant homes in Los Angeles and keep track of them, and I bring you the ones that fit how you want to live."
        },
        {
          label: "Representation through closing",
          reply: "I negotiate for you personally, from the first conversation through closing, and keep the process discreet and on schedule."
        }
      ],
      close: "Every search is different. Tell me what you are looking for, and I will share how I would approach it, privately.",
      action: { label: "Begin Your Private Search", briefing: true }
    }
  };

  function setupConsult() {
    var form = qs("[data-consult]");
    if (!form) return;

    function render() {
      var audience = body.getAttribute("data-audience") === "buyers" ? "buyers" : "sellers";
      var data = CONSULT[audience];
      form.innerHTML = "";
      var step = document.createElement("div");
      step.className = "consult-step is-on";
      var q = document.createElement("p");
      q.className = "consult-q";
      q.textContent = data.question;
      var list = document.createElement("div");
      list.className = "consult-choices";
      data.choices.forEach(function (choice) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "consult-choice";
        btn.textContent = choice.label;
        btn.addEventListener("click", function () { showReply(data, choice); });
        list.appendChild(btn);
      });
      step.appendChild(q);
      step.appendChild(list);
      form.appendChild(step);
    }

    function showReply(data, choice) {
      form.innerHTML = "";
      var step = document.createElement("div");
      step.className = "consult-step is-on";
      var reply = document.createElement("p");
      reply.className = "consult-reply";
      reply.textContent = choice.reply;
      var close = document.createElement("p");
      close.className = "consult-reply";
      close.style.marginTop = "20px";
      close.textContent = data.close;
      var actions = document.createElement("div");
      actions.className = "consult-actions";
      var cta = document.createElement("button");
      cta.type = "button";
      cta.className = "btn";
      cta.textContent = data.action.label;
      cta.setAttribute("data-open-briefing", "");
      var back = document.createElement("button");
      back.type = "button";
      back.className = "consult-back";
      back.textContent = "Ask a different question";
      back.addEventListener("click", render);
      actions.appendChild(cta);
      step.appendChild(reply);
      step.appendChild(close);
      step.appendChild(actions);
      step.appendChild(back);
      form.appendChild(step);
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); });
    document.addEventListener("audiencechange", render);
    render();
  }

  /* Briefing overlay */
  function setupBriefing() {
    var panel = qs("#briefing-panel");
    if (!panel) return;
    var dialog = qs(".briefing-panel", panel);
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      panel.hidden = false;
      body.style.overflow = "hidden";
      if (dialog) dialog.focus();
    }
    function close() {
      panel.hidden = true;
      body.style.overflow = "";
      var note = qs("[data-briefing-note]", panel);
      if (note) note.hidden = true;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-open-briefing]");
      if (opener) {
        e.preventDefault();
        open();
        return;
      }
      if (e.target.closest("[data-close-briefing]")) {
        e.preventDefault();
        close();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) close();
    });
    var form = qs("[data-briefing-form]", panel);
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = qs("[data-briefing-note]", panel);
        if (note) note.hidden = false;
      });
    }
  }

  function setupInertCta() {
    qsa("[data-inert-cta]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var note = qs("[data-inert-note]");
        if (note) note.hidden = false;
      });
    });
  }

  onReady(function () {
    setupMenu();
    setupNavSolid();
    setupAudience();
    setupProgress();
    setupCursor();
    setupIntro();
    setupChapters();
    setupIntel();
    setupPlan();
    setupCompare();
    setupWstn();
    setupConsult();
    setupBriefing();
    setupInertCta();
  });
})();
