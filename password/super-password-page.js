(function () {
  document.documentElement.classList.add("custom-password-message-loading");
  var config = window.SuperPasswordPageConfig || {};

  var defaultMessage = config.defaultMessage || "This page is password protected.";
  var pageMessages = config.pageMessages || {};

  document.documentElement.classList.add("custom-password-message-loading");

  let updateTimer;

  const antiFlashFallback = setTimeout(function () {
    document.documentElement.classList.remove("custom-password-message-loading");
  }, 2000);

  function normalizePath(path) {
    const cleanPath = String(path || "/")
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();

    if (cleanPath.length > 1) {
      return cleanPath.replace(/\/+$/, "");
    }

    return cleanPath;
  }

  function getPasswordMessage() {
    const path = normalizePath(window.location.pathname);

    const matchedPath = Object.keys(pageMessages).find(function (pagePath) {
      return normalizePath(pagePath) === path;
    });

    return matchedPath ? pageMessages[matchedPath] : defaultMessage;
  }

  function getMainPasswordHeading() {
    const headings = Array.prototype.slice.call(
      document.querySelectorAll("h1, h2, h3")
    );

    return (
      headings.find(function (heading) {
        return heading.dataset.customPasswordMessage === "true";
      }) ||
      headings.find(function (heading) {
        return heading.textContent.trim().toLowerCase().includes("password protected");
      }) ||
      headings[0]
    );
  }

  function getCommonAncestor(firstElement, secondElement) {
    if (!firstElement || !secondElement) return null;

    const firstParents = [];
    let current = firstElement;

    while (current) {
      firstParents.push(current);
      current = current.parentElement;
    }

    current = secondElement;

    while (current) {
      if (firstParents.indexOf(current) !== -1) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  function getPasswordControl(passwordInput) {
    let current = passwordInput.parentElement;

    for (let i = 0; current && i < 6; i++) {
      const hasPasswordInput = current.querySelector('input[type="password"]');
      const hasSubmitControl = current.querySelector(
        'button, input[type="submit"], [role="button"]'
      );

      if (hasPasswordInput && hasSubmitControl) {
        return current;
      }

      current = current.parentElement;
    }

    return passwordInput.closest("form") || passwordInput.parentElement;
  }

  function getPasswordShell(heading, passwordControl) {
    const commonAncestor = getCommonAncestor(heading, passwordControl);

    if (
      commonAncestor &&
      commonAncestor !== document.body &&
      commonAncestor !== document.documentElement &&
      !commonAncestor.classList.contains("super-root") &&
      !commonAncestor.classList.contains("super-content-wrapper")
    ) {
      return commonAncestor;
    }

    return (
      passwordControl.closest("main") ||
      passwordControl.closest(".notion-page") ||
      commonAncestor ||
      passwordControl.parentElement
    );
  }

  function updatePasswordPageText() {
    const passwordInput = document.querySelector('input[type="password"]');

    if (!passwordInput) {
      document.documentElement.classList.remove("custom-password-message-loading");
      return;
    }

    const heading = getMainPasswordHeading();
    const passwordControl = getPasswordControl(passwordInput);
    const message = getPasswordMessage();

    document.documentElement.classList.add("custom-password-page");

    if (heading) {
      heading.textContent = message;
      heading.dataset.customPasswordMessage = "true";
      heading.classList.add("custom-password-heading");
    }

    if (passwordControl) {
      passwordControl.classList.add("custom-password-control");
    }

    const shell = getPasswordShell(heading, passwordControl);

    if (shell) {
      shell.classList.add("custom-password-shell");
    }

    clearTimeout(antiFlashFallback);
    document.documentElement.classList.add("custom-password-message-ready");
    document.documentElement.classList.remove("custom-password-message-loading");
  }

  function schedulePasswordPageTextUpdate() {
    clearTimeout(updateTimer);

    updateTimer = setTimeout(function () {
      updatePasswordPageText();
    }, 50);
  }

  updatePasswordPageText();

  const observer = new MutationObserver(schedulePasswordPageTextUpdate);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
