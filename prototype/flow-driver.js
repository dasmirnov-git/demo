/* Flow map driver. ?state=<id> replays that state's recipe from flow-map.mjs without the demo's
   pauses and reports to the flow page (postMessage) and to the build (window.hopinnFlowStatus). */
(function () {
  const map = window.HopinnFlowMap;
  const params = new URLSearchParams(location.search);
  const id = params.get("state");
  if (!map || !id) return;

  const STEP_TIMEOUT = 5000;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
  // The phone and desktop layouts keep twin controls: take the one on screen, else the first.
  const pick = (sel) => {
    const all = [...document.querySelectorAll(sel)];
    return all.find(visible) || all[0] || null;
  };
  // Bounded by poll count, not Date.now(): open-state.mjs freezes the page's clock for the demo
  // dates, which would otherwise make a wall-clock deadline never arrive and a broken step/arrival
  // poll forever instead of failing.
  async function waitFor(test, ms) {
    for (let i = 0; i * 50 <= ms; i += 1) {
      const v = test();
      if (v) return v;
      await sleep(50);
    }
    return null;
  }
  function stepError(index, step, reason) {
    const e = new Error(`шаг ${index + 1} ${JSON.stringify(step)}: ${reason}`);
    e.step = index + 1;
    return e;
  }

  async function run(steps) {
    for (let i = 0; i < steps.length; i += 1) {
      const s = steps[i];
      if (s.viewport && (s.viewport === 'phone') !== matchMedia('(max-width: 720px)').matches) continue;
      if (s.scenario) {
        const btn = document.querySelector(`[data-pay-scenario="${s.scenario}"]`);
        if (!btn) throw stepError(i, s, "нет демо-сценария");
        btn.click();
      } else {
        const sel = s.click || s.fill || s.press || s.hover || s.scroll || s.waitFor;
        const el = await waitFor(() => (s.waitFor ? visible(pick(sel)) && pick(sel) : pick(sel)), STEP_TIMEOUT);
        if (!el) throw stepError(i, s, `не найден ${sel}`);
        if (s.scroll) el.scrollIntoView({ block: 'start', behavior: 'instant' });
        if (s.click) {
          // Reka counters react to pointerdown (including press-and-hold), not click.
          if (el.matches('[data-slot="increment"], [data-slot="decrement"]')) {
            el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
            window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0 }));
          }
          el.click();
        }
        if (s.hover) el.dispatchEvent(new MouseEvent("mouseenter"));
        if (s.fill) {
          el.value = s.value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (s.press) el.dispatchEvent(new KeyboardEvent("keydown", { key: s.key, bubbles: true }));
      }
      // A zero delay keeps a selection + pause in one frame for reproducible scene previews.
      if (s.delay !== 0) await sleep(s.delay ?? 30);
    }
  }
  const arrived = (sel) => waitFor(() => visible(pick(sel)) && pick(sel), STEP_TIMEOUT);

  // Instant mode (`payLater` in pay.js resolves at 0 ms instead of its real delay) is only for a
  // replay: on while a recipe's steps run AND while we wait for the arrival they set in motion
  // (the SBP ticks, the reveal dock, the confetti), off the moment either settles — so a viewer
  // who lands on a shared `?state=` link and then clicks through the prototype themselves sees the
  // normal demo pauses, not 0 ms ones. go() and the build's edge check (flow_run.mjs) both replay
  // a step list and then wait on an arrival, so both share this one entry point rather than each
  // hand-rolling the on/off around `run` + `arrived`.
  async function runToArrival(steps, arrival) {
    window.hopinnFlowInstant = true;
    try {
      await run(steps);
      return await arrived(arrival);
    } finally {
      window.hopinnFlowInstant = false;
    }
  }

  function toast(text) {
    const el = document.createElement("p");
    el.className = "flow-toast";
    el.setAttribute("role", "status");
    el.textContent = text;
    document.body.appendChild(el);
  }
  function report(status) {
    window.hopinnFlowStatus = status;
    if (window.parent !== window) {
      window.parent.postMessage({ type: status.ok ? "hopinn:flow-ready" : "hopinn:flow-error", ...status }, location.origin);
    } else if (!status.ok) {
      toast(`Состояние «${id}» не открылось: ${status.reason}`);
    }
  }

  window.hopinnFlow = { run, arrived, runToArrival };

  async function go() {
    let recipe;
    try {
      recipe = map.recipeFor(id);
    } catch (e) {
      report({ ok: false, id, step: 0, reason: "такого состояния нет на карте" });
      return;
    }
    const here = location.pathname.split("/").pop().replace(/\.html$/, "") || "index";
    if (here !== recipe.page) {
      // One-shot: if a previous redirect already landed here and the page is still wrong (a bad
      // recipe's `page` pointing nowhere useful, or a redirect loop), report instead of bouncing
      // forever between pages.
      if (params.get("flowRedirect") === "1") {
        report({ ok: false, id, step: 0, reason: "не та страница" });
        return;
      }
      params.set("flowRedirect", "1");
      location.replace(`${recipe.page}.html?${params.toString()}`);
      return;
    }
    let el;
    try {
      el = await runToArrival(recipe.steps, recipe.arrival);
    } catch (e) {
      report({ ok: false, id, step: e.step || 0, reason: e.message });
      return;
    }
    report(el ? { ok: true, id } : { ok: false, id, step: recipe.steps.length, reason: `не дошли до состояния (${recipe.arrival})` });
  }
  setTimeout(go, 50);
})();
