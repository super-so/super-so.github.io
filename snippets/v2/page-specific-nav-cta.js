 (function () {
  // === CONFIGURATION ===
  const targetUrl = 'https://super.so/'; // BUTTON WILL CHANGE ON THIS PAGE
  const buttonText = 'HELLO WORLD';
  const buttonLink = 'https://app.super.so';
  // ======================

  let originalText = null;
  let originalHref = null;

  const updateCTA = () => {
    const cta = document.querySelector('.super-navbar__cta');
    if (!cta) return;

    const link = cta.closest('a');

    if (window.location.href === targetUrl) {
      if (originalText === null) {
        originalText = cta.textContent;
        originalHref = link ? link.href : null;
      }

      if (cta.textContent !== buttonText) {
        cta.textContent = buttonText;
        if (link) link.href = buttonLink;
      }
    } else {
      if (originalText !== null && cta.textContent !== originalText) {
        cta.textContent = originalText;
        if (link && originalHref) link.href = originalHref;
      }
    }
  };

  const observer = new MutationObserver(() => {
    updateCTA();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  const hookHistory = () => {
    const _pushState = history.pushState;
    const _replaceState = history.replaceState;

    const trigger = () => {
      setTimeout(() => updateCTA(), 100);
    };

    history.pushState = function () {
      _pushState.apply(this, arguments);
      trigger();
    };
    history.replaceState = function () {
      _replaceState.apply(this, arguments);
      trigger();
    };

    window.addEventListener('popstate', trigger);
  };

  hookHistory();
  updateCTA();
})();