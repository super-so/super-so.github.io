
/* =========================================================
          language switching.
   ========================================================= */

(() => {
  "use strict";

  const SCRIPT_VERSION = "4.10.0";
  const DEFAULT_LANGUAGE = "English";
  const triggerSelector = ".super-navbar__language-dropdown";
  const FLAG_ICONS_VERSION = "1.5.21";

  /*
   * Super's supported languages and the same country associations used in
   * Super's Add New Language menu. `country` controls the flag image.
   * Locale-specific values such as en-GB or es-MX still use their own country.
   */
   
   const TRIGGER_LABELS = {
  "Bengali (Bangla)": "Bengali",
  "Chichewa, Chewa, Nyanja": "Chichewa",
  "Chinese (Simplified)": "Chinese",
  "Chinese (Traditional)": "Chinese (Trad.)",
  "Divehi, Dhivehi, Maldivian": "Divehi",
  "Fula, Fulah, Pulaar, Pular": "Fula",
  "Gaelic (Scottish)": "Scottish Gaelic",
  "Gaelic (Manx)": "Manx",
  "Kalaallisut, Greenlandic": "Greenlandic",
  "Latvian (Lettish)": "Latvian",
  "Luganda, Ganda": "Luganda",
  "Northern Ndebele": "N. Ndebele",
  "Norwegian bokmål": "Bokmål",
  "Norwegian nynorsk": "Nynorsk",
  "Old Church Slavonic, Old Bulgarian": "Church Slavonic",
  "Oromo (Afaan Oromo)": "Oromo",
  "Pashto, Pushto": "Pashto",
  "Persian (Farsi)": "Persian",
  "Portuguese (Brazil)": "Portuguese",
  "Portuguese (Portugal)": "Portuguese",
  "Punjabi (Eastern)": "Punjabi",
  "Southern Ndebele": "S. Ndebele",
  "Swahili (Kiswahili)": "Swahili",
  "Western Frisian": "Frisian",
  "Zhuang, Chuang": "Zhuang"
};
   
  const LANGUAGES = [
    {
      label: "English",
      country: "gb",
      codes: ["en-gb"],
      names: ["british english", "english uk", "english gb", "english united kingdom", "uk english"]
    },
    ...[
      ["Chinese (Traditional)", "tw", ["zh-tw", "zh-hk", "zh-hant"], ["traditional chinese", "繁體中文", "繁体中文", "繁體"]],
      ["Chinese (Simplified)", "cn", ["zh-hans", "zh-cn"], ["simplified chinese", "简体中文", "中文", "简体"]],
      ["Portuguese (Brazil)", "br", "pt-br", ["brazilian portuguese", "portuguese brazil", "portugues brasil", "português brasil"]],
      ["Portuguese (Portugal)", "pt", "pt-pt", ["portuguese portugal", "portugues portugal", "português portugal"]],
      ["Norwegian bokmål", "no", "nb"],
      ["Norwegian nynorsk", "no", "nn"],
      ["Abkhazian", "ge", "ab"],
      ["Afar", "et", "aa"],
      ["Afrikaans", "za", "af"],
      ["Akan", "gh", "ak"],
      ["Albanian", "al", "sq"],
      ["Amharic", "et", "am"],
      ["Arabic", "sa", "ar", ["العربية"]],
      ["Aragonese", "es", "an"],
      ["Armenian", "am", "hy"],
      ["Assamese", "in", "as"],
      ["Avaric", "ru", "av"],
      ["Avestan", "ir", "ae"],
      ["Aymara", "bo", "ay"],
      ["Azerbaijani", "az", "az"],
      ["Bambara", "ml", "bm"],
      ["Bashkir", "ru", "ba"],
      ["Basque", "es", "eu"],
      ["Belarusian", "by", "be"],
      ["Bengali (Bangla)", "bd", "bn", ["bengali", "bangla", "বাংলা"]],
      ["Bihari", "in", "bh"],
      ["Bislama", "vu", "bi"],
      ["Bosnian", "ba", "bs"],
      ["Breton", "fr", "br"],
      ["Bulgarian", "bg", "bg", ["български"]],
      ["Burmese", "mm", "my"],
      ["Catalan", "es", "ca", ["catala", "català"]],
      ["Chamorro", "gu", "ch"],
      ["Chechen", "ru", "ce"],
      ["Chichewa, Chewa, Nyanja", "mw", "ny", ["chichewa", "chewa", "nyanja"]],
      ["Chinese", "cn", ["zh-cn", "zh-hans", "zh"]],
      ["Chuvash", "ru", "cv"],
      ["Cornish", "gb", "kw"],
      ["Corsican", "fr", "co"],
      ["Cree", "ca", "cr"],
      ["Croatian", "hr", "hr", ["hrvatski"]],
      ["Czech", "cz", "cs", ["cestina", "čeština", "cesky", "český", "cesky jazyk", "český jazyk"]],
      ["Danish", "dk", "da", ["dansk"]],
      ["Divehi, Dhivehi, Maldivian", "mv", "dv", ["divehi", "dhivehi", "maldivian"]],
      ["Dutch", "nl", "nl", ["nederlands"]],
      ["Dzongkha", "bt", "dz"],
      ["English", "us", ["en", "en-us"], ["american english", "english us", "english usa", "english united states"]],
      ["Estonian", "ee", "et", ["eesti"]],
      ["Ewe", "gh", "ee"],
      ["Faroese", "fo", "fo"],
      ["Fijian", "fj", "fj"],
      ["Filipino", "ph", "fil"],
      ["Finnish", "fi", "fi", ["suomi"]],
      ["French", "fr", "fr", ["francais", "français"]],
      ["Fula, Fulah, Pulaar, Pular", "sn", "ff", ["fula", "fulah", "pulaar", "pular"]],
      ["Gaelic (Scottish)", "gb", "gd", ["scottish gaelic"]],
      ["Gaelic (Manx)", "gb", "gv", ["manx gaelic"]],
      ["Galician", "gl", "gl"],
      ["Georgian", "ge", "ka"],
      ["German", "de", "de", ["deutsch"]],
      ["Greek", "gr", "el", ["ελληνικά"]],
      ["Guarani", "py", "gn"],
      ["Gujarati", "in", "gu"],
      ["Haitian Creole", "ht", "ht"],
      ["Hausa", "ng", "ha"],
      ["Hebrew", "il", "he", ["iw", "עברית"]],
      ["Herero", "na", "hz"],
      ["Hindi", "in", "hi", ["हिन्दी", "हिंदी"]],
      ["Hiri Motu", "pf", "ho"],
      ["Hungarian", "hu", "hu", ["magyar"]],
      ["Icelandic", "is", "is", ["islenska", "íslenska"]],
      ["Ido", "io", "io"],
      ["Igbo", "ng", "ig"],
      ["Indonesian", "id", "id", ["bahasa indonesia"]],
      ["Interlingue", "ie", "ie"],
      ["Inuktitut", "ca", "iu"],
      ["Italian", "it", "it", ["italiano"]],
      ["Japanese", "jp", "ja", ["日本語"]],
      ["Javanese", "id", "jv"],
      ["Kalaallisut, Greenlandic", "gl", "kl", ["kalaallisut", "greenlandic"]],
      ["Kannada", "in", "kn"],
      ["Kanuri", "ne", "kr"],
      ["Kashmiri", "in", "ks"],
      ["Khmer", "kh", "km"],
      ["Kikuyu", "ke", "ki"],
      ["Kirundi", "bi", "rn"],
      ["Korean", "kr", "ko", ["한국어"]],
      ["Kurdish", "iq", "ku"],
      ["Kwanyama", "na", "kj"],
      ["Lao", "la", "lo"],
      ["Latin", "la", "la"],
      ["Latvian (Lettish)", "lv", "lv", ["latvian", "lettish", "latviesu", "latviešu"]],
      ["Lingala", "cd", "ln"],
      ["Lithuanian", "lt", "lt", ["lietuviu", "lietuvių"]],
      ["Luganda, Ganda", "ug", "lg", ["luganda", "ganda"]],
      ["Luxembourgish", "lu", "lb"],
      ["Macedonian", "mk", "mk"],
      ["Malagasy", "mg", "mg"],
      ["Malay", "my", "ms", ["bahasa melayu"]],
      ["Malayalam", "in", "ml"],
      ["Maltese", "mt", "mt"],
      ["Maori", "nz", "mi"],
      ["Marathi", "in", "mr"],
      ["Marshallese", "mh", "mh"],
      ["Moldavian", "md", ["ro-md", "mo"], ["moldovan"]],
      ["Mongolian", "mn", "mn"],
      ["Nauru", "nr", "na"],
      ["Navajo", "us", "nv"],
      ["Ndonga", "ng", "ng"],
      ["Northern Ndebele", "za", "nd"],
      ["Nepali", "np", "ne"],
      ["Norwegian", "no", "no", ["norsk"]],
      ["Nuosu", "cn", "ii"],
      ["Occitan", "fr", "oc"],
      ["Ojibwe", "us", "oj"],
      ["Old Church Slavonic, Old Bulgarian", "bg", "cu", ["old church slavonic", "old bulgarian"]],
      ["Oriya", "in", "or"],
      ["Oromo (Afaan Oromo)", "et", "om", ["oromo", "afaan oromo"]],
      ["Ossetian", "ru", "os"],
      ["Pāli", "in", "pi", ["pali"]],
      ["Pashto, Pushto", "af", "ps", ["pashto", "pushto"]],
      ["Persian (Farsi)", "ir", "fa", ["persian", "farsi", "فارسی"]],
      ["Polish", "pl", "pl", ["polski"]],
      ["Portuguese", "pt", "pt", ["portugues", "português"]],
      ["Punjabi (Eastern)", "in", "pa", ["punjabi", "eastern punjabi"]],
      ["Quechua", "pe", "qu"],
      ["Romansh", "ch", "rm"],
      ["Romanian", "ro", "ro", ["romana", "română"]],
      ["Russian", "ru", "ru", ["русский"]],
      ["Sami", "se", "se"],
      ["Samoan", "ws", "sm"],
      ["Sango", "cf", "sg"],
      ["Sanskrit", "in", "sa"],
      ["Serbian", "rs", "sr", ["srpski", "српски"]],
      ["Serbo-Croatian", "hr", "sh"],
      ["Sesotho", "za", "st"],
      ["Setswana", "za", "tn"],
      ["Shona", "zw", "sn"],
      ["Sindhi", "pk", "sd"],
      ["Sinhalese", "lk", "si"],
      ["Siswati", "sz", "ss"],
      ["Slovak", "sk", "sk", ["slovencina", "slovenčina", "slovensky", "slovenský"]],
      ["Slovenian", "si", "sl", ["slovenscina", "slovenščina", "slovenski"]],
      ["Somali", "so", "so"],
      ["Southern Ndebele", "za", "nr"],
      ["Spanish", "es", "es", ["espanol", "español"]],
      ["Sundanese", "id", "su"],
      ["Swahili (Kiswahili)", "ke", "sw", ["swahili", "kiswahili"]],
      ["Swedish", "se", "sv", ["svenska"]],
      ["Tagalog", "ph", "tl"],
      ["Tahitian", "pf", "ty"],
      ["Tajik", "tj", "tg"],
      ["Tamil", "in", "ta"],
      ["Tatar", "ru", "tt"],
      ["Telugu", "in", "te"],
      ["Thai", "th", "th", ["ไทย"]],
      ["Tibetan", "cn", "bo"],
      ["Tigrinya", "et", "ti"],
      ["Tonga", "to", "to"],
      ["Tsonga", "za", "ts"],
      ["Turkish", "tr", "tr", ["turkce", "türkçe"]],
      ["Turkmen", "tm", "tk"],
      ["Twi", "gh", "tw"],
      ["Uyghur", "cn", "ug"],
      ["Ukrainian", "ua", "uk", ["українська"]],
      ["Urdu", "pk", "ur", ["اردو"]],
      ["Venda", "za", "ve"],
      ["Vietnamese", "vn", "vi", ["tieng viet", "tiếng việt"]],
      ["Volapük", "vu", "vo", ["volapuk"]],
      ["Wallon", "be", "wa"],
      ["Welsh", "gb", "cy"],
      ["Wolof", "sn", "wo"],
      ["Western Frisian", "nl", "fy"],
      ["Xhosa", "za", "xh"],
      ["Yiddish", "de", "yi"],
      ["Yoruba", "ng", "yo"],
      ["Zhuang, Chuang", "cn", "za", ["zhuang", "chuang"]],
      ["Zulu", "za", "zu"]
    ].map(([label, country, codes, aliases = []]) => ({
      label,
      country,
      codes: Array.isArray(codes) ? codes : [codes],
      names: [label, ...aliases]
    }))
  ];

  let scanQueued = false;
  let viewportUpdateQueued = false;

  const normalize = (value = "") =>
    String(value)
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/_/g, "-")
      .replace(/[()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  function exactLanguage(token) {
    const normalized = normalize(token);
    if (!normalized) return null;

    const exact = LANGUAGES.find(({ codes }) =>
      codes.some((code) => normalize(code) === normalized)
    );
    if (exact) return exact;

    /* A regional locale such as es-MX uses the base language + MX flag. */
    const regional = normalized.match(/^([a-z]{2,3})-([a-z]{2})$/);
    if (regional) {
      const base = LANGUAGES.find(({ codes }) =>
        codes.some((code) => normalize(code) === regional[1])
      );

      if (base) {
        return {
          ...base,
          country: regional[2],
          codes: [normalized, ...base.codes]
        };
      }
    }

    return null;
  }

  function getLanguage(value) {
    const normalized = normalize(value);
    if (!normalized) return null;

    const exact = exactLanguage(normalized);
    if (exact) return exact;

    const exactName = LANGUAGES.find(({ names }) =>
      names.some((name) => normalized === normalize(name))
    );
    if (exactName) return exactName;

    const pieces = normalized.split(/[\s/?.#=&:]+/).filter(Boolean);
    for (const piece of pieces) {
      const match = exactLanguage(piece);
      if (match) return match;
    }

    return LANGUAGES.find(({ names }) =>
      names.some((name) => normalized.includes(normalize(name)))
    ) || null;
  }

  function pageLanguage() {
    let route = "";

    try {
      route = decodeURIComponent(
        `${window.location.pathname} ${window.location.search} ${window.location.hash}`
      );
    } catch (_) {
      route = `${window.location.pathname} ${window.location.search}`;
    }

    return (
      getLanguage(document.documentElement.getAttribute("data-language")) ||
      getLanguage(route) ||
      getLanguage(document.documentElement.lang) ||
      getLanguage(DEFAULT_LANGUAGE) ||
      LANGUAGES[0]
    );
  }

  function flagImageUrl(country) {
    return `https://cdn.jsdelivr.net/npm/country-flag-icons@${FLAG_ICONS_VERSION}/3x2/${country.toUpperCase()}.svg`;
  }

  function activateControl(control) {
    if (!control) return;
    control.classList.remove("super-language-preparing");
    control.classList.add("super-language-control");
  }

  function setFlag(flag, language) {
    if (!flag || !language) return;

    let image = flag.querySelector("img");
    let fallback = flag.querySelector(".super-language-flag-code");

    if (!image) {
      image = document.createElement("img");
      image.alt = "";
      image.decoding = "async";
      image.loading = "eager";
      image.referrerPolicy = "no-referrer";
      flag.append(image);
    }

    if (!fallback) {
      fallback = document.createElement("span");
      fallback.className = "super-language-flag-code";
      fallback.setAttribute("aria-hidden", "true");
      flag.append(fallback);
    }

    fallback.textContent = language.country.toUpperCase();
    fallback.hidden = true;
    image.hidden = false;

    image.onload = () => {
      image.hidden = false;
      fallback.hidden = true;
      activateControl(flag.closest(".super-navbar__language-dropdown"));
    };

    image.onerror = () => {
      image.hidden = true;
      fallback.hidden = false;
      activateControl(flag.closest(".super-navbar__language-dropdown"));
    };

    const nextSource = flagImageUrl(language.country);
    if (image.src !== nextSource) image.src = nextSource;

    if (image.complete && image.naturalWidth) image.onload();
  }

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  /*
   * Returns the compact standards-based code shown inside the dropdown.
   * Base languages use their existing ISO 639 code. Regional/script variants
   * use the matching BCP 47 form so they remain distinguishable.
   */
  function menuLanguageCode(language) {
    if (!language) return "";

    const codes = (language.codes || []).map(normalize);
    const primaryCode = codes[0] || "";
    const country = String(language.country || "").toUpperCase();
    const label = normalize(language.label);

    if (
      country === "TW" ||
      codes.some((code) => ["zh-tw", "zh-hant", "zh-hk"].includes(code))
    ) {
      return "ZH-TW";
    }

    if (
      country === "CN" &&
      codes.some((code) => ["zh", "zh-cn", "zh-hans"].includes(code))
    ) {
      return "ZH-CN";
    }

    if (
      label === "moldavian" ||
      codes.some((code) => ["ro-md", "mo"].includes(code))
    ) {
      return "RO-MD";
    }

    if (primaryCode === "en-gb" || codes.includes("country-gb")) {
      return "EN-GB";
    }

    if (
      primaryCode === "en" ||
      primaryCode === "en-us" ||
      codes.includes("country-us")
    ) {
      return country === "GB" ? "EN-GB" : "EN-US";
    }

    if (primaryCode === "pt-br") return "PT-BR";
    if (primaryCode === "pt-pt") return "PT-PT";

    return primaryCode.toUpperCase();
  }

  function setMenuLanguageCode(option, language) {
    if (!option || !language) return;

    const label = option.querySelector(":scope > p");
    if (!label) return;

    const fullName =
      option.dataset.superLanguageNativeLabel ||
      language.label ||
      "Language";
    const compactCode = menuLanguageCode(language);

    if (!compactCode) return;

    setText(label, compactCode);
    label.title = fullName;
    option.setAttribute("aria-label", `${fullName} (${compactCode})`);
  }

  function setTriggerLanguage(button, language) {
    if (!button || !language) return;

    setFlag(button.querySelector(".super-language-flag"), language);
    setText(
  button.querySelector(".super-language-code"),
  menuLanguageCode(language)
);
    setText(
  button.querySelector(".super-language-label"),
  TRIGGER_LABELS[language.label] || language.label
);
    button.dataset.currentLanguage = language.codes[0];
    button.setAttribute("aria-label", `Current language: ${language.label}. Choose another language`);
  }

  function setAllTriggersLanguage(language) {
    document.querySelectorAll(".super-language-trigger").forEach((button) =>
      setTriggerLanguage(button, language)
    );
  }

  function enhanceTrigger(control) {
    const button = control.closest('button[aria-haspopup="menu"], button');
    if (!button) return;

    if (
      button.dataset.superLanguageEnhanced === "true" &&
      button.dataset.superLanguageVersion === SCRIPT_VERSION
    ) {
      return;
    }

    control
      .querySelectorAll(
        ":scope > .super-language-code, :scope > .super-language-flag, :scope > .super-language-label, :scope > .super-language-chevron"
      )
      .forEach((element) => element.remove());
    control.classList.remove("super-language-control", "super-language-preparing");

    const code = document.createElement("span");
    const flag = document.createElement("span");
    const label = document.createElement("span");
    const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    code.className = "super-language-code";
    code.setAttribute("aria-hidden", "true");
    flag.className = "super-language-flag";
    flag.setAttribute("aria-hidden", "true");
    label.className = "super-language-label";

    chevron.classList.add("super-language-chevron");
    chevron.setAttribute("viewBox", "0 0 20 20");
    chevron.setAttribute("fill", "none");
    chevron.setAttribute("aria-hidden", "true");
    chevron.setAttribute("focusable", "false");

    path.setAttribute("d", "m4.75 7.25 5.25 5.5 5.25-5.5");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    chevron.append(path);
    control.append(code, flag, label, chevron);
    control.classList.add("super-language-preparing");
    button.classList.add("super-language-trigger");
    button.dataset.superLanguageEnhanced = "true";
    button.dataset.superLanguageVersion = SCRIPT_VERSION;
    setTriggerLanguage(button, pageLanguage());
  }

  function optionLanguage(option) {
    const visibleLabel = normalize(
      option.dataset.superLanguageNativeLabel || option.textContent
    );
    const countryAliases = [
      {
        label: "United States",
        country: "us",
        codes: ["country-us"],
        aliases: ["us", "usa", "united states", "united states of america"]
      },
      {
        label: "United Kingdom",
        country: "gb",
        codes: ["country-gb"],
        aliases: ["uk", "gb", "united kingdom", "great britain", "britain"]
      }
    ];
    const countryMatch = countryAliases.find(({ aliases }) =>
      aliases.includes(visibleLabel)
    );

    if (countryMatch) {
      return {
        label: option.dataset.superLanguageNativeLabel || option.textContent.trim(),
        country: countryMatch.country,
        codes: countryMatch.codes,
        names: countryMatch.aliases
      };
    }

    const values = [
      option.getAttribute("lang"),
      option.getAttribute("hreflang"),
      option.getAttribute("data-lang"),
      option.getAttribute("data-locale"),
      option.getAttribute("data-language"),
      option.getAttribute("aria-label"),
      option.dataset.superLanguageNativeLabel
    ];

    const link = option.matches("a[href]") ? option : option.querySelector("a[href]");
    if (link) {
      values.push(
        link.getAttribute("lang"),
        link.getAttribute("hreflang"),
        link.getAttribute("data-locale"),
        link.getAttribute("aria-label")
      );

      try {
        const url = new URL(link.href, window.location.href);
        values.push(url.pathname, url.search, url.hostname);
      } catch (_) {
        /* The visible language label can still be used. */
      }

      values.push(link.textContent);
    }

    values.push(option.textContent);

    for (const value of values) {
      const language = getLanguage(value);
      if (language) return language;
    }

    return null;
  }

  function nativeOptionLabel(option) {
    if (option.dataset.superLanguageNativeLabel) {
      return option.dataset.superLanguageNativeLabel;
    }

    const copy = option.cloneNode(true);
    copy.querySelectorAll(".super-language-flag, .super-language-check").forEach((item) => item.remove());
    const label = copy.textContent.trim();
    option.dataset.superLanguageNativeLabel = label;
    return label;
  }

  function menuOptions(menu) {
    const roles = menu.querySelectorAll(
      '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"]'
    );
    return roles.length ? [...roles] : [...menu.querySelectorAll("a, button")];
  }

  function normalizedUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      const path = url.pathname.replace(/\/+$/, "") || "/";
      return `${url.hostname.toLowerCase()}${path}${url.search}`;
    } catch (_) {
      return "";
    }
  }

  function optionIsSelectedBySuper(option) {
    const nativeSelected = option.matches(
      '[aria-current="page"], [aria-checked="true"], [aria-selected="true"], [data-state="checked"]'
    ) || option.querySelector(
      '[aria-current="page"], [aria-checked="true"], [aria-selected="true"], [data-state="checked"]'
    );

    if (nativeSelected) return true;

    const link = option.matches("a[href]") ? option : option.querySelector("a[href]");
    return Boolean(link && normalizedUrl(link.href) === normalizedUrl(window.location.href));
  }

  function markCurrentOption(option, isCurrent) {
    option.dataset.languageCurrent = String(isCurrent);
    let check = option.querySelector(":scope > .super-language-check");

    if (isCurrent && !check) {
      check = document.createElement("span");
      check.className = "super-language-check";
      check.setAttribute("aria-hidden", "true");
      check.textContent = "✓";
      option.append(check);
    } else if (!isCurrent && check) {
      check.remove();
    }
  }

function updateMenuViewport(menu) {
  if (!menu?.isConnected) return;

  const navbar =
    window.innerWidth >= 767
      ? document.querySelector(".super-navbar:not(.hidden)")
      : null;

  const previousOffset =
    Number.parseFloat(
      menu.style.getPropertyValue("--super-language-menu-offset-y")
    ) || 0;

  const naturalTop =
    menu.getBoundingClientRect().top - previousOffset;

  const offsetY =
    navbar && menu.dataset.side === "bottom"
      ? Math.round(
          navbar.getBoundingClientRect().bottom + 6 -
            naturalTop
        )
      : 0;

  menu.style.setProperty(
    "--super-language-menu-offset-y",
    `${offsetY}px`
  );

  const viewport = window.visualViewport;
  const viewportTop = viewport?.offsetTop || 0;
  const viewportHeight =
    viewport?.height ||
    window.innerHeight ||
    document.documentElement.clientHeight;

  const viewportBottom = viewportTop + viewportHeight;
  const rect = menu.getBoundingClientRect();
  const edgeGap = 12;

  const available =
    menu.dataset.side === "top"
      ? rect.bottom - viewportTop - edgeGap
      : viewportBottom - rect.top - edgeGap;

  const safeHeight = Math.max(
    72,
    Math.min(
      viewportHeight - edgeGap * 2,
      Math.floor(available)
    )
  );

  menu.style.setProperty(
    "--super-language-menu-max-height",
    `${safeHeight}px`
  );
}

  function scheduleMenuViewportUpdate() {
    if (viewportUpdateQueued) return;
    viewportUpdateQueued = true;

    requestAnimationFrame(() => {
      viewportUpdateQueued = false;
      document.querySelectorAll(".super-language-menu").forEach(updateMenuViewport);
    });
  }

  function decorateMenu(menu, button) {
    const options = menuOptions(menu);
    options.forEach(nativeOptionLabel);

    const recognized = options
      .map((option) => ({ option, language: optionLanguage(option) }))
      .filter(({ language }) => language);

    /* Do not accidentally style a normal Super navbar dropdown. */
    if (!recognized.length) return false;

    const resolved = options.map((option, index) => {
      const nativeLabel = nativeOptionLabel(option);
      const detected = optionLanguage(option);

      return {
        option,
        language: detected
          ? { ...detected, label: nativeLabel || detected.label }
          : {
              label: nativeLabel || "Language",
              country: "un",
              codes: [`other-${index}`]
            }
      };
    });

    const selected = resolved.find(({ option }) => optionIsSelectedBySuper(option));
    const detectedPageLanguage = pageLanguage();
    const selectedBase = selected?.language.codes[0].split("-")[0];
    const pageBase = detectedPageLanguage.codes[0].split("-")[0];
    const pageHasRegionalFlag = detectedPageLanguage.codes[0].includes("-");
    const selectedIsGenericEnglish = selected?.language.codes[0] === "en";
    const activeLanguage = selected
      ? !selectedIsGenericEnglish && selectedBase === pageBase && pageHasRegionalFlag
        ? { ...detectedPageLanguage, label: selected.language.label }
        : selected.language
      : detectedPageLanguage;

    const currentOption =
      selected ||
      resolved.find(({ language }) => language.codes[0] === activeLanguage.codes[0]) ||
      resolved.find(
        ({ language }) => language.codes[0].split("-")[0] === activeLanguage.codes[0].split("-")[0]
      );

    setAllTriggersLanguage(activeLanguage);
    menu.classList.add("super-language-menu");
    menu.parentElement?.classList.add("super-language-menu-wrapper");

    resolved.forEach(({ option, language }, index) => {
      if (!option.querySelector(":scope > .super-language-flag")) {
        const flag = document.createElement("span");
        flag.className = "super-language-flag";
        flag.setAttribute("aria-hidden", "true");
        option.prepend(flag);
      }

      setFlag(option.querySelector(":scope > .super-language-flag"), language);
      setMenuLanguageCode(option, language);
      option.classList.add("super-language-option");
      option.style.setProperty("--language-index", index);
      markCurrentOption(option, option === currentOption?.option);

      if (option.dataset.superLanguageBound !== "true") {
        option.dataset.superLanguageBound = "true";
        option.addEventListener("click", () => setAllTriggersLanguage(language));
      }
    });

    scheduleMenuViewportUpdate();

    return true;
  }

  function controlledMenu(button) {
    const id = button.getAttribute("aria-controls");
    return id ? document.getElementById(id) : null;
  }

  function openLanguageButtons() {
    return [...document.querySelectorAll(".super-language-trigger")].filter(
      (button) => button.getAttribute("aria-expanded") === "true" || button.dataset.state === "open"
    );
  }

  function scan() {
    document.querySelectorAll(triggerSelector).forEach(enhanceTrigger);

    document
      .querySelectorAll(`.super-language-trigger[data-super-language-version="${SCRIPT_VERSION}"]`)
      .forEach((button) =>
        setTriggerLanguage(button, getLanguage(button.dataset.currentLanguage) || pageLanguage())
      );

    openLanguageButtons().forEach((button) => {
      const controlled = controlledMenu(button);
      if (controlled) decorateMenu(controlled, button);
    });
  }

  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;

    requestAnimationFrame(() => {
      scanQueued = false;
      scan();
    });
  }

  const observer = new MutationObserver(scheduleScan);

  function start() {
    scan();
    window.addEventListener("resize", scheduleMenuViewportUpdate, { passive: true });
    window.addEventListener("orientationchange", scheduleMenuViewportUpdate, { passive: true });
    window.visualViewport?.addEventListener("resize", scheduleMenuViewportUpdate, { passive: true });
    window.visualViewport?.addEventListener("scroll", scheduleMenuViewportUpdate, { passive: true });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-controls", "aria-expanded", "aria-selected", "aria-checked", "data-state", "data-side"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
