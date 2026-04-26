/* Reveal-on-scroll for RentLedger marketing pages.
 *
 *   <any data-reveal-group>       — children auto-tagged [data-reveal] with
 *                                    staggered transition-delay.
 *   <any data-reveal>             — becomes visible when it enters the viewport.
 *   .flow-scene / .flow-before /  — home page's receipts → arrow → Schedule E
 *   .flow-after / .flow-step        scene, gated on .in-view.
 *
 * Honors prefers-reduced-motion. Falls back to immediate reveal when
 * IntersectionObserver isn't available.
 */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Tag [data-reveal-group] children with [data-reveal] + stagger delay.
  document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.setAttribute('data-reveal', '');
      child.style.transitionDelay = (i * 70) + 'ms';
    });
  });

  var revealTargets = document.querySelectorAll('[data-reveal]');
  var flowTargets = document.querySelectorAll('.flow-scene, .flow-before, .flow-after, .flow-step');

  function showAll() {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    flowTargets.forEach(function (el) { el.classList.add('in-view'); });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  // Reveal-in observer: fires once per element.
  function onEnter(entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      // Commit a style frame first so the browser has a stable "from" state
      // before the transition/animation kicks off.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          entry.target.classList.add('in-view');
        });
      });
    });
  }

  var revealIO = new IntersectionObserver(onEnter, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  revealTargets.forEach(function (el) { revealIO.observe(el); });

  // Home page flow-scene observer: slightly wider threshold so the SVG arrow
  // animation starts while the scene is still partly below the fold.
  var flowIO = new IntersectionObserver(onEnter, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  flowTargets.forEach(function (el) { flowIO.observe(el); });
})();
