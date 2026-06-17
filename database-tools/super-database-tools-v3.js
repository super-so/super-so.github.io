(() => {
  const DB_SELECTOR = ".notion-collection-table";
  const READY_KEY = "superDbToolsReady";
  const HIDDEN_ROW_CLASS = "super-db-row-hidden";

  const SKIPPED_CONTROL_COLUMN_TYPES = new Set([
    "relation",
    "rollup",
    "filesmedia"
  ]);

  const SKIPPED_CONTROL_COLUMN_LABELS = new Set([
    "relation",
    "relations",
    "rollup",
    "roll up",
    "roll-up",
    "files & media",
    "files and media",
    "files media",
    "file & media",
    "file and media",
    "file media"
  ].map(normalizeControlColumnLabel));

  const SELECTORS = {
    rows: [
      "tbody tr",
      ".notion-collection-table__body .notion-collection-table__row",
      ".notion-collection-table__row",
      "[role='row']"
    ],
    headers: [
      "thead th",
      ".notion-collection-table__head-cell",
      ".notion-collection-table__header-cell",
      "[role='columnheader']"
    ],
    cells: "td, .notion-collection-table__cell, [role='cell'], [class*='collection-table__cell']",
    checkboxState: "input[type='checkbox'], [role='checkbox'], [aria-checked], [data-checked], [data-state]",
    checkboxSvgShapes: "svg rect, svg path",
    checkmarkSvgShapes: "svg polyline, svg path"
  };

  const ICONS = {
    filter: `
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,
    sort: `
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M8 5v14m0 0-3-3m3 3 3-3M16 19V5m0 0-3 3m3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    search: `
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="m20 20-4.2-4.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `
  };

  const tableState = new WeakMap();

  function initAllTables() {
    injectBaseStyles();
    document.querySelectorAll(DB_SELECTOR).forEach(initTable);
  }

  function initTable(table) {
    if (table.dataset[READY_KEY] === "true") return;

    const rows = getRows(table);
    if (!rows.length) return;

    table.dataset[READY_KEY] = "true";

    setOriginalIndexes(rows);

    const headers = getHeaders(table, rows[0]);
    const toolbar = createToolbar(headers);

    table.parentNode.insertBefore(toolbar, table);

    const state = {
      search: "",
      filterColumn: "all",
      filterText: "",
      filterMode: "text",
      sortColumn: "none",
      sortDirection: "asc",
      headers,
      toolbar
    };

    tableState.set(table, state);

    toolbar.addEventListener("input", event => {
      const target = event.target;

      if (target.matches("[data-super-db-search]")) {
        state.search = target.value.trim().toLowerCase();
        updateTable(table);
        return;
      }

      if (target.matches("[data-super-db-filter-text]")) {
        state.filterText = target.value.trim().toLowerCase();
        updateTable(table);
      }
    });

    toolbar.addEventListener("change", event => {
      const target = event.target;

      if (target.matches("[data-super-db-filter-column]")) {
        state.filterColumn = target.value;
        state.filterText = "";

        clearFilterInputs(toolbar);
        revealRows(table);
        syncFilterControl(table);
        updateTable(table);

        return;
      }

      if (target.matches("[data-super-db-filter-boolean]")) {
        state.filterText = target.value;

        revealRows(table);
        updateTable(table);

        return;
      }

      if (target.matches("[data-super-db-sort-column]")) {
        state.sortColumn = target.value;
        revealRows(table);
        updateTable(table);
      }
    });

    toolbar.addEventListener("click", event => {
      const panelButton = event.target.closest("[data-super-db-panel]");
      const directionButton = event.target.closest("[data-super-db-sort-direction]");
      const clearButton = event.target.closest("[data-super-db-clear]");

      if (panelButton) {
        togglePanel(toolbar, panelButton.dataset.superDbPanel);
        return;
      }

      if (directionButton) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
        directionButton.textContent = state.sortDirection === "asc" ? "Ascending" : "Descending";

        revealRows(table);
        updateTable(table);

        return;
      }

      if (clearButton) {
        resetToolbar(table);
      }
    });

    syncFilterControl(table);
    updateTable(table);
  }

  function createToolbar(headers) {
    const controlHeaders = getControlHeaders(headers);

    const filterOptions = `
      <option value="all">All columns</option>
      ${controlHeaders.map(header => `<option value="${header.index}">${escapeHTML(header.label)}</option>`).join("")}
    `;

    const sortOptions = `
      <option value="none">Original order</option>
      ${controlHeaders.map(header => `<option value="${header.index}">${escapeHTML(header.label)}</option>`).join("")}
    `;

    const toolbar = document.createElement("div");
    toolbar.className = "super-db-tools";

    toolbar.innerHTML = `
      <div class="super-db-tools__bar">
        <span class="super-db-tools__count" data-super-db-count></span>

        <button type="button" class="super-db-tools__icon" data-super-db-panel="filter" aria-label="Filter">
          ${ICONS.filter}
        </button>

        <button type="button" class="super-db-tools__icon" data-super-db-panel="sort" aria-label="Sort">
          ${ICONS.sort}
        </button>

        <button type="button" class="super-db-tools__icon" data-super-db-panel="search" aria-label="Search">
          ${ICONS.search}
        </button>

        <button type="button" class="super-db-tools__clear" data-super-db-clear>
          Clear
        </button>
      </div>

      <div class="super-db-tools__panel" data-super-db-panel-content="filter" hidden>
        <label>
          Filter column
          <select data-super-db-filter-column>
            ${filterOptions}
          </select>
        </label>

        <label data-super-db-filter-text-wrap>
          Contains
          <input type="text" data-super-db-filter-text placeholder="Type filter text or empty">
        </label>

        <label data-super-db-filter-boolean-wrap hidden>
          Value
          <select data-super-db-filter-boolean disabled>
            <option value="">Any</option>
            <option value="checked">Checked</option>
            <option value="unchecked">Unchecked</option>
          </select>
        </label>
      </div>

      <div class="super-db-tools__panel" data-super-db-panel-content="sort" hidden>
        <label>
          Sort by
          <select data-super-db-sort-column>
            ${sortOptions}
          </select>
        </label>

        <button type="button" class="super-db-tools__direction" data-super-db-sort-direction>
          Ascending
        </button>
      </div>

      <div class="super-db-tools__panel" data-super-db-panel-content="search" hidden>
        <label>
          Search table
          <input type="search" data-super-db-search placeholder="Search rows or type empty">
        </label>
      </div>
    `;

    return toolbar;
  }

  function getControlHeaders(headers) {
    return headers.filter(header => !shouldSkipControlColumn(header));
  }

  function shouldSkipControlColumn(header) {
    const label = normalizeControlColumnLabel(header.label);
    const type = normalizeControlColumnLabel(header.type);

    return (
      SKIPPED_CONTROL_COLUMN_LABELS.has(label) ||
      SKIPPED_CONTROL_COLUMN_TYPES.has(type)
    );
  }

  function getColumnType(table, columnIndex, headerCell) {
    const rows = getRows(table);
    const cells = rows
      .map(row => getCell(row, columnIndex))
      .filter(Boolean)
      .slice(0, 25);

    const signature = [
      getPropertyTypeSignature(headerCell),
      ...cells.map(getPropertyTypeSignature)
    ].join(" ");

    return getSkippedColumnTypeFromSignature(signature) || "";
  }

  function getSkippedColumnTypeFromSignature(signature) {
    const text = normalizeControlColumnLabel(signature);

    if (/\brelations?\b/.test(text)) {
      return "relation";
    }

    if (/\brollup\b|\broll up\b/.test(text)) {
      return "rollup";
    }

    if (
      /\bfiles media\b/.test(text) ||
      /\bfile media\b/.test(text) ||
      /\bfiles and media\b/.test(text) ||
      /\bfile and media\b/.test(text) ||
      /\battachments?\b/.test(text) ||
      /\bproperty files?\b/.test(text) ||
      /\bnotion files?\b/.test(text) ||
      /\bnotion asset\b/.test(text)
    ) {
      return "filesmedia";
    }

    return "";
  }

  function getPropertyTypeSignature(root) {
    if (!root || !(root instanceof Element)) return "";

    const elements = [root, ...root.querySelectorAll("*")];

    return cleanText(
      elements.map(getElementSignature).join(" ")
    ).toLowerCase();
  }

  function updateTable(table) {
    const state = tableState.get(table);
    if (!state) return;

    const rows = getRows(table);
    if (!rows.length) return;

    rows.forEach(clearSearchHighlights);
    rows.forEach(row => row.classList.remove(HIDDEN_ROW_CLASS));

    setOriginalIndexes(rows);
    sortRows(table, rows, state);

    let visibleCount = 0;

    rows.forEach(row => {
      const matchesSearch = matchesSmartSearch(row, state.search);
      let matchesFilter = true;

      if (state.filterText) {
        if (state.filterColumn === "all") {
          matchesFilter = rowMatchesSmartFilter(row, state.filterText);
        } else {
          const columnIndex = Number(state.filterColumn);
          const cell = getCell(row, columnIndex);

          matchesFilter = isCheckboxColumn(table, columnIndex)
            ? matchesCheckboxFilter(cell, state.filterText)
            : matchesSmartFilter(cell, state.filterText);
        }
      }

      const shouldShow = matchesSearch && matchesFilter;

      row.classList.toggle(HIDDEN_ROW_CLASS, !shouldShow);

      if (shouldShow) {
        visibleCount += 1;
        highlightSearchMatches(row, state.search);
      }
    });

    const countEl = state.toolbar.querySelector("[data-super-db-count]");

    if (countEl) {
      countEl.textContent = `${visibleCount} shown`;
    }
  }

  function syncFilterControl(table) {
    const state = tableState.get(table);
    if (!state) return;

    const textWrap = state.toolbar.querySelector("[data-super-db-filter-text-wrap]");
    const booleanWrap = state.toolbar.querySelector("[data-super-db-filter-boolean-wrap]");
    const textInput = state.toolbar.querySelector("[data-super-db-filter-text]");
    const booleanSelect = state.toolbar.querySelector("[data-super-db-filter-boolean]");

    if (!textWrap || !booleanWrap || !textInput || !booleanSelect) return;

    const columnIndex = Number(state.filterColumn);
    const isBooleanColumn =
      state.filterColumn !== "all" && isCheckboxColumn(table, columnIndex);

    if (isBooleanColumn) {
      state.filterMode = "checkbox";

      textWrap.hidden = true;
      textWrap.style.display = "none";
      textInput.disabled = true;
      textInput.value = "";

      booleanWrap.hidden = false;
      booleanWrap.style.display = "";
      booleanSelect.disabled = false;
      booleanSelect.value = normalizeCheckboxFilterValue(state.filterText);

      return;
    }

    state.filterMode = "text";

    textWrap.hidden = false;
    textWrap.style.display = "";
    textInput.disabled = false;

    booleanWrap.hidden = true;
    booleanWrap.style.display = "none";
    booleanSelect.disabled = true;
    booleanSelect.value = "";
  }

  function sortRows(table, rows, state) {
    const parent = rows[0]?.parentElement;
    if (!parent) return;

    const sortedRows = [...rows].sort((a, b) => {
      const originalOrder =
        Number(a.dataset.superOriginalIndex) - Number(b.dataset.superOriginalIndex);

      if (state.sortColumn === "none") {
        return originalOrder;
      }

      const columnIndex = Number(state.sortColumn);

      if (isCheckboxColumn(table, columnIndex)) {
        const aState = readCheckboxState(getCell(a, columnIndex));
        const bState = readCheckboxState(getCell(b, columnIndex));

        const checkboxResult = compareCheckboxValues(aState, bState);

        if (checkboxResult !== 0) {
          return state.sortDirection === "asc" ? checkboxResult : -checkboxResult;
        }

        return originalOrder;
      }

      const aValue = getSortableText(getCell(a, columnIndex));
      const bValue = getSortableText(getCell(b, columnIndex));
      const result = compareValues(aValue, bValue);

      if (result !== 0) {
        return state.sortDirection === "asc" ? result : -result;
      }

      return originalOrder;
    });

    const insertBeforeNode = getInsertBeforeNode(parent, rows);

    sortedRows.forEach(row => {
      parent.insertBefore(row, insertBeforeNode || null);
    });
  }

  function resetToolbar(table) {
    const state = tableState.get(table);
    if (!state) return;

    state.search = "";
    state.filterColumn = "all";
    state.filterText = "";
    state.filterMode = "text";
    state.sortColumn = "none";
    state.sortDirection = "asc";

    state.toolbar.querySelectorAll("input").forEach(input => {
      input.value = "";
    });

    const filterColumn = state.toolbar.querySelector("[data-super-db-filter-column]");
    const sortColumn = state.toolbar.querySelector("[data-super-db-sort-column]");
    const sortDirection = state.toolbar.querySelector("[data-super-db-sort-direction]");

    if (filterColumn) filterColumn.value = "all";
    if (sortColumn) sortColumn.value = "none";
    if (sortDirection) sortDirection.textContent = "Ascending";

    clearFilterInputs(state.toolbar);
    revealRows(table);
    syncFilterControl(table);

    state.toolbar.querySelectorAll("[data-super-db-panel-content]").forEach(panel => {
      panel.hidden = true;
    });

    state.toolbar.querySelectorAll("[data-super-db-panel]").forEach(button => {
      button.classList.remove("is-active");
    });

    updateTable(table);
  }

  function clearFilterInputs(toolbar) {
    const textInput = toolbar.querySelector("[data-super-db-filter-text]");
    const booleanSelect = toolbar.querySelector("[data-super-db-filter-boolean]");

    if (textInput) textInput.value = "";
    if (booleanSelect) booleanSelect.value = "";
  }

  function revealRows(table) {
    getRows(table).forEach(row => {
      row.classList.remove(HIDDEN_ROW_CLASS);
    });
  }

  function togglePanel(toolbar, panelName) {
    const selectedPanel = toolbar.querySelector(`[data-super-db-panel-content="${panelName}"]`);
    const selectedButton = toolbar.querySelector(`[data-super-db-panel="${panelName}"]`);

    if (!selectedPanel || !selectedButton) return;

    const alreadyOpen = !selectedPanel.hidden;

    toolbar.querySelectorAll("[data-super-db-panel-content]").forEach(panel => {
      panel.hidden = true;
    });

    toolbar.querySelectorAll("[data-super-db-panel]").forEach(button => {
      button.classList.remove("is-active");
    });

    if (!alreadyOpen) {
      selectedPanel.hidden = false;
      selectedButton.classList.add("is-active");

      const firstInput = selectedPanel.querySelector("input:not(:disabled), select:not(:disabled)");
      if (firstInput) firstInput.focus();
    }
  }

  function getRows(table) {
    for (const selector of SELECTORS.rows) {
      const rows = unique(
        [...table.querySelectorAll(selector)].filter(row => isUsableRow(row))
      );

      if (rows.length) return rows;
    }

    return [];
  }

  function isUsableRow(row) {
    if (!row || row.closest(".super-db-tools")) return false;

    if (
      row.matches("thead tr") ||
      row.matches(".notion-collection-table__head") ||
      row.matches(".notion-collection-table__header") ||
      row.matches(".notion-collection-table__row--header") ||
      row.matches(".notion-collection-table__row--add")
    ) {
      return false;
    }

    if (row.querySelector("th, [role='columnheader']")) return false;

    const text = getReadableText(row).toLowerCase();

    if (
      text === "new" ||
      text === "+ new" ||
      text === "new page" ||
      text === "+ new page"
    ) {
      return false;
    }

    return getCells(row).length > 0;
  }

  function getHeaders(table, firstRow) {
    const headerCells = getHeaderCells(table);

    if (headerCells.length) {
      return headerCells.map((node, index) => ({
        index,
        label: cleanHeader(getReadableText(node)) || `Column ${index + 1}`,
        type: getColumnType(table, index, node)
      }));
    }

    return getCells(firstRow).map((cell, index) => ({
      index,
      label: `Column ${index + 1}`,
      type: getColumnType(table, index, cell)
    }));
  }

  function getHeaderCells(table) {
    for (const selector of SELECTORS.headers) {
      const headers = [...table.querySelectorAll(selector)];

      if (headers.length) return unique(headers);
    }

    return [];
  }

  function getCells(row) {
    const cells = [...row.querySelectorAll(SELECTORS.cells)];

    if (cells.length) return unique(cells);

    return [...row.children];
  }

  function getCell(row, index) {
    const cells = getCells(row);

    return cells[index] || row;
  }

  function rowMatchesSmartFilter(row, filterValue) {
    if (isEmptyKeyword(filterValue)) {
      return rowHasEmptyCell(row);
    }

    return getCells(row).some(cell => matchesSmartFilter(cell, filterValue));
  }

  function matchesSmartFilter(cellOrValue, filterValue) {
    const filterText = cleanText(filterValue).toLowerCase();

    if (!filterText) return true;

    const cellText = getFilterableText(cellOrValue);

    if (isEmptyKeyword(filterText)) {
      return cellText === "" || cellText.includes("empty") || cellText.includes("blank");
    }

    const cellNumber = parseNumber(cellText);
    const filterNumber = parseNumber(filterText);

    if (cellNumber !== null && filterNumber !== null) {
      return cellNumber === filterNumber;
    }

    const numericComparison = filterText.match(/^(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)$/);

    if (cellNumber !== null && numericComparison) {
      const operator = numericComparison[1];
      const targetNumber = Number(numericComparison[2]);

      if (operator === ">") return cellNumber > targetNumber;
      if (operator === "<") return cellNumber < targetNumber;
      if (operator === ">=") return cellNumber >= targetNumber;
      if (operator === "<=") return cellNumber <= targetNumber;
      if (operator === "=") return cellNumber === targetNumber;
    }

    return cellText.includes(filterText);
  }

  function matchesCheckboxFilter(cell, filterValue) {
    const normalizedValue = normalizeCheckboxFilterValue(filterValue);

    if (!normalizedValue) return true;

    const checkboxState = readCheckboxState(cell);

    if (normalizedValue === "checked") {
      return checkboxState === true;
    }

    if (normalizedValue === "unchecked") {
      return checkboxState === false;
    }

    return true;
  }

  function getFilterableText(cellOrValue) {
    const checkboxState = readCheckboxState(cellOrValue);

    if (checkboxState === true) {
      return "checked true yes 1 on";
    }

    if (checkboxState === false) {
      return "unchecked false no 0 off empty blank";
    }

    return getReadableText(cellOrValue).toLowerCase();
  }

  function normalizeCheckboxFilterValue(value) {
    const text = cleanText(value).toLowerCase();

    if (
      text === "checked" ||
      text === "check" ||
      text === "true" ||
      text === "yes" ||
      text === "1" ||
      text === "on"
    ) {
      return "checked";
    }

    if (
      text === "unchecked" ||
      text === "uncheck" ||
      text === "false" ||
      text === "no" ||
      text === "0" ||
      text === "off" ||
      text === "empty" ||
      text === "blank" ||
      text === "not checked" ||
      text === "not-checked"
    ) {
      return "unchecked";
    }

    return "";
  }

  function compareCheckboxValues(aState, bState) {
    return getCheckboxSortRank(aState) - getCheckboxSortRank(bState);
  }

  function getCheckboxSortRank(value) {
    if (value === false) return 0;
    if (value === true) return 1;

    return 2;
  }

  function isCheckboxColumn(table, columnIndex) {
    const rows = getRows(table);
    const cells = rows.map(row => getCell(row, columnIndex)).filter(Boolean);

    if (!cells.length) return false;

    const sampleCells = cells.slice(0, 25);

    const hasRealTextContent = sampleCells.some(cell => {
      const text = cleanText(cell.innerText || cell.textContent || "")
        .replace(/[✓✔☑]/g, "")
        .trim();

      return text.length > 0;
    });

    if (hasRealTextContent) return false;

    const checkboxLikeCount = sampleCells.filter(cell => (
      getExplicitCheckboxState(cell) !== null ||
      hasCheckboxBox(cell) ||
      hasCheckmarkSignal(cell)
    )).length;

    return checkboxLikeCount > 0;
  }

  function readCheckboxState(cell) {
    if (!cell || typeof cell === "string" || !(cell instanceof Element)) {
      return null;
    }

    const visibleText = cleanText(cell.innerText || cell.textContent || "")
      .replace(/[✓✔☑]/g, "")
      .trim();

    if (visibleText.length > 0) return null;

    const explicitState = getExplicitCheckboxState(cell);

    if (explicitState !== null) return explicitState;

    if (!hasCheckboxBox(cell) && !hasCheckmarkSignal(cell)) {
      return null;
    }

    if (hasCheckmarkSignal(cell)) return true;
    if (hasStrongCheckedFill(cell)) return true;

    return false;
  }

  function getExplicitCheckboxState(root) {
    if (!root || !(root instanceof Element)) return null;

    const elements = [
      root,
      ...root.querySelectorAll(SELECTORS.checkboxState)
    ];

    for (const element of elements) {
      if (element.matches("input[type='checkbox']")) {
        return element.checked;
      }

      const ariaChecked = getAttributeValue(element, "aria-checked");

      if (ariaChecked === "true") return true;
      if (ariaChecked === "false") return false;

      const dataChecked = getAttributeValue(element, "data-checked");

      if (dataChecked === "true") return true;
      if (dataChecked === "false") return false;

      const dataState = getAttributeValue(element, "data-state");

      if (dataState === "checked" || dataState === "on") return true;
      if (dataState === "unchecked" || dataState === "off") return false;
    }

    return null;
  }

  function hasCheckboxBox(root) {
    if (!root || !(root instanceof Element)) return false;

    return Boolean(getCheckboxBoxElement(root) || hasCheckboxSvgBox(root));
  }

  function getCheckboxBoxElement(root) {
    if (!root || !(root instanceof Element)) return null;

    const elements = [root, ...root.querySelectorAll("*")];

    const candidates = elements
      .filter(element => isCheckboxBoxElement(element))
      .sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();

        return aRect.width * aRect.height - bRect.width * bRect.height;
      });

    return candidates[0] || null;
  }

  function isCheckboxBoxElement(element) {
    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) return false;
    if (rect.width < 8 || rect.height < 8) return false;
    if (rect.width > 32 || rect.height > 32) return false;
    if (Math.abs(rect.width - rect.height) > 8) return false;

    const text = cleanText(element.innerText || element.textContent || "")
      .replace(/[✓✔☑]/g, "")
      .trim();

    if (text.length > 0) return false;

    const style = window.getComputedStyle(element);

    const hasBorder =
      parseFloat(style.borderTopWidth || 0) > 0 ||
      parseFloat(style.borderRightWidth || 0) > 0 ||
      parseFloat(style.borderBottomWidth || 0) > 0 ||
      parseFloat(style.borderLeftWidth || 0) > 0;

    const hasBackground = isVisibleColor(style.backgroundColor);
    const hasCheckboxSignature = /\bcheckbox\b/i.test(getElementSignature(element));

    return hasCheckboxSignature || hasBorder || hasBackground;
  }

  function hasCheckboxSvgBox(root) {
    if (!root || !(root instanceof Element)) return false;

    const svgBoxes = [...root.querySelectorAll(SELECTORS.checkboxSvgShapes)];

    return svgBoxes.some(shape => {
      const tagName = shape.tagName.toLowerCase();

      if (tagName === "rect") {
        return isSmallSvgShape(shape);
      }

      const d = shape.getAttribute("d") || "";

      if (!d) return false;

      return /z\s*$/i.test(d) && isSmallSvgShape(shape);
    });
  }

  function isSmallSvgShape(shape) {
    const svg = shape.closest("svg");

    if (!svg) return false;

    const rect = svg.getBoundingClientRect();

    if (!rect.width || !rect.height) return false;
    if (rect.width < 8 || rect.height < 8) return false;
    if (rect.width > 32 || rect.height > 32) return false;

    return Math.abs(rect.width - rect.height) <= 8;
  }

  function hasStrongCheckedFill(root) {
    if (!root || !(root instanceof Element)) return false;

    const elements = [root, ...root.querySelectorAll("*")];

    return elements.some(element => {
      const rect = element.getBoundingClientRect();

      if (!rect.width || !rect.height) return false;
      if (rect.width < 8 || rect.height < 8) return false;
      if (rect.width > 32 || rect.height > 32) return false;
      if (Math.abs(rect.width - rect.height) > 8) return false;

      return isVisibleColor(window.getComputedStyle(element).backgroundColor);
    });
  }

  function hasCheckmarkSignal(root) {
    if (!root || !(root instanceof Element)) return false;

    if (/✓|✔|☑/.test(root.textContent || "")) {
      return true;
    }

    const shapes = [...root.querySelectorAll(SELECTORS.checkmarkSvgShapes)];

    return shapes.some(shape => {
      const tagName = shape.tagName.toLowerCase();

      if (tagName === "polyline") {
        const points = shape.getAttribute("points") || "";

        return points.trim().split(/\s+/).length >= 3;
      }

      const d = shape.getAttribute("d") || "";

      if (!d) return false;
      if (/z\s*$/i.test(d)) return false;

      const commandCount = (d.match(/[mlhvcsqtaz]/gi) || []).length;

      return commandCount <= 4 && /l/i.test(d);
    });
  }

  function rowHasEmptyCell(row) {
    return getCells(row).some(cell => {
      const checkboxState = readCheckboxState(cell);

      if (checkboxState !== null) {
        return checkboxState === false;
      }

      return getReadableText(cell) === "";
    });
  }

  function highlightSearchMatches(row, searchValue) {
    const searchText = cleanText(searchValue);

    if (!searchText || isEmptyKeyword(searchText)) return;

    const exactNumberOnly = isNumberSearch(searchText);

    getCells(row).forEach(cell => {
      highlightTextInsideElement(cell, searchText, exactNumberOnly);
    });
  }

  function clearSearchHighlights(row) {
    row.querySelectorAll("mark.super-db-tools__highlight").forEach(mark => {
      const parent = mark.parentNode;

      if (!parent) return;

      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    });
  }

  function highlightTextInsideElement(element, searchText, exactNumberOnly) {
    if (!element) return;

    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;

          if (!parent) return NodeFilter.FILTER_REJECT;

          if (
            parent.closest("mark.super-db-tools__highlight") ||
            parent.closest("script, style, textarea, input, select, svg")
          ) {
            return NodeFilter.FILTER_REJECT;
          }

          return cleanText(node.nodeValue)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node;

    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      highlightTextNode(textNode, searchText, exactNumberOnly);
    });
  }

  function highlightTextNode(textNode, searchText, exactNumberOnly) {
    const text = textNode.nodeValue;
    const ranges = getHighlightRanges(text, searchText, exactNumberOnly);

    if (!ranges.length) return;

    const fragment = document.createDocumentFragment();
    let currentIndex = 0;

    ranges.forEach(range => {
      if (range.start > currentIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(currentIndex, range.start))
        );
      }

      const mark = document.createElement("mark");
      mark.className = "super-db-tools__highlight";
      mark.textContent = text.slice(range.start, range.end);

      fragment.appendChild(mark);

      currentIndex = range.end;
    });

    if (currentIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(currentIndex)));
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  function getHighlightRanges(text, searchText, exactNumberOnly) {
    const ranges = [];
    const escapedSearchText = escapeRegExp(searchText);

    const pattern = exactNumberOnly
      ? new RegExp(`(^|[^0-9])(${escapedSearchText})(?=[^0-9]|$)`, "gi")
      : new RegExp(escapedSearchText, "gi");

    let match;

    while ((match = pattern.exec(text)) !== null) {
      const prefixLength = exactNumberOnly ? match[1].length : 0;
      const matchedValue = exactNumberOnly ? match[2] : match[0];

      const start = match.index + prefixLength;
      const end = start + matchedValue.length;

      ranges.push({ start, end });

      if (match.index === pattern.lastIndex) {
        pattern.lastIndex += 1;
      }
    }

    return ranges;
  }

  function matchesSmartSearch(row, searchValue) {
    const searchText = cleanText(searchValue).toLowerCase();

    if (!searchText) return true;

    if (isEmptyKeyword(searchText)) {
      return rowHasEmptyCell(row);
    }

    if (isNumberSearch(searchText)) {
      return getCells(row).some(cell =>
        matchesExactNumber(getReadableText(cell), searchText)
      );
    }

    return getReadableText(row).toLowerCase().includes(searchText);
  }

  function getSortableText(cellOrValue) {
    const checkboxState = readCheckboxState(cellOrValue);

    if (checkboxState === true) return "checked";
    if (checkboxState === false) return "unchecked";

    return getReadableText(cellOrValue);
  }

  function getReadableText(elementOrValue) {
    if (!elementOrValue) return "";

    if (typeof elementOrValue === "string") {
      return cleanText(elementOrValue);
    }

    if (!(elementOrValue instanceof Element)) {
      return cleanText(String(elementOrValue));
    }

    const parts = [
      elementOrValue.innerText || "",
      elementOrValue.textContent || ""
    ];

    const readableAttributes = [
      "aria-label",
      "title",
      "alt",
      "value",
      "data-value",
      "data-label",
      "data-name",
      "data-title",
      "data-content",
      "data-text",
      "data-tag",
      "data-tags",
      "data-option",
      "data-select",
      "data-multi-select",
      "data-property-value"
    ];

    const nodes = [elementOrValue, ...elementOrValue.querySelectorAll("*")];

    nodes.forEach(node => {
      readableAttributes.forEach(attribute => {
        const value = node.getAttribute?.(attribute);

        if (value) {
          parts.push(value);
        }
      });

      if (node.matches?.("select")) {
        const selectedOption = node.options?.[node.selectedIndex];

        if (selectedOption) {
          parts.push(selectedOption.textContent || selectedOption.value || "");
        }
      }

      if (node.matches?.("input, textarea")) {
        parts.push(node.value || node.getAttribute("value") || "");
      }

      parts.push(getGeneratedContentText(node));
    });

    return cleanText(
      [...new Set(parts.map(part => cleanText(part)).filter(Boolean))]
        .join(" ")
    );
  }

  function getGeneratedContentText(element) {
    if (!element || !(element instanceof Element)) return "";

    try {
      return cleanText(
        ["::before", "::after"]
          .map(pseudo => {
            const content = window
              .getComputedStyle(element, pseudo)
              .getPropertyValue("content");

            if (!content || content === "none" || content === "normal") {
              return "";
            }

            return content
              .replace(/^["']|["']$/g, "")
              .replace(/\\A/g, " ");
          })
          .join(" ")
      );
    } catch (error) {
      return "";
    }
  }

  function matchesExactNumber(cellValue, searchValue) {
    const cellText = cleanText(cellValue);
    const searchNumber = parseNumber(searchValue);
    const cellNumber = parseNumber(cellText);

    if (searchNumber === null) return false;

    if (cellNumber !== null) {
      return cellNumber === searchNumber;
    }

    const normalizedCellText = cellText.replace(/,/g, "");
    const normalizedSearchValue = searchValue.replace(/,/g, "");
    const escapedSearchValue = escapeRegExp(normalizedSearchValue);

    const exactNumberPattern = new RegExp(`(^|[^0-9])${escapedSearchValue}([^0-9]|$)`);

    return exactNumberPattern.test(normalizedCellText);
  }

  function compareValues(a, b) {
    const aClean = cleanText(a);
    const bClean = cleanText(b);

    const aNumber = parseNumber(aClean);
    const bNumber = parseNumber(bClean);

    if (aNumber !== null && bNumber !== null) {
      return aNumber - bNumber;
    }

    const aDate = Date.parse(aClean);
    const bDate = Date.parse(bClean);

    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return aDate - bDate;
    }

    return aClean.localeCompare(bClean, undefined, {
      numeric: true,
      sensitivity: "base"
    });
  }

  function parseNumber(value) {
    const cleaned = cleanText(value)
      .replace(/[$,%]/g, "")
      .replace(/,/g, "");

    if (!/^-?\d+(\.\d)?\d*$/.test(cleaned)) {
      return null;
    }

    return Number(cleaned);
  }

  function isNumberSearch(value) {
    return parseNumber(value) !== null;
  }

  function isEmptyKeyword(value) {
    const text = cleanText(value).toLowerCase();

    return (
      text === "empty" ||
      text === "blank" ||
      text === "is:empty" ||
      text === "is:blank"
    );
  }

  function isVisibleColor(color) {
    if (!color || color === "transparent") return false;

    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);

    if (!match) return false;

    const red = Number(match[1]);
    const green = Number(match[2]);
    const blue = Number(match[3]);
    const alpha = match[4] === undefined ? 1 : Number(match[4]);

    if (alpha <= 0.05) return false;

    const isAlmostWhite = red > 245 && green > 245 && blue > 245;
    const isVeryLightGray = red > 225 && green > 225 && blue > 225;

    return !isAlmostWhite && !isVeryLightGray;
  }

  function getAttributeValue(element, attribute) {
    if (!element || !element.getAttribute) return "";

    return cleanText(element.getAttribute(attribute) || "").toLowerCase();
  }

  function getElementSignature(element) {
    if (!element) return "";

    const className =
      typeof element.className === "string"
        ? element.className
        : element.getAttribute?.("class") || "";

    return cleanText(`
      ${className}
      ${element.getAttribute?.("aria-label") || ""}
      ${element.getAttribute?.("title") || ""}
      ${element.getAttribute?.("alt") || ""}
      ${element.getAttribute?.("role") || ""}
      ${element.getAttribute?.("data-type") || ""}
      ${element.getAttribute?.("data-property-type") || ""}
      ${element.getAttribute?.("data-property") || ""}
      ${element.getAttribute?.("data-state") || ""}
      ${element.getAttribute?.("data-checked") || ""}
    `).toLowerCase();
  }

  function getInsertBeforeNode(parent, rows) {
    const rowSet = new Set(rows);

    return [...parent.children].find(child => {
      if (rowSet.has(child)) return false;

      const text = getReadableText(child).toLowerCase();

      return (
        child.matches(".notion-collection-table__row--add") ||
        text === "new page" ||
        text === "+ new page"
      );
    });
  }

  function setOriginalIndexes(rows) {
    rows.forEach((row, index) => {
      if (!row.dataset.superOriginalIndex) {
        row.dataset.superOriginalIndex = String(index);
      }
    });
  }

  function cleanText(text) {
    return String(text).replace(/\s+/g, " ").trim();
  }

  function cleanHeader(text) {
    return cleanText(text)
      .replace(/^Aa\s+/i, "")
      .replace(/^#\s*/, "")
      .replace(/^@\s*/, "");
  }

  function normalizeControlColumnLabel(value) {
    return cleanText(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/-/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function unique(items) {
    return [...new Set(items)];
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function injectBaseStyles() {
    if (document.getElementById("super-db-tools-base-style")) return;

    const style = document.createElement("style");
    style.id = "super-db-tools-base-style";
    style.textContent = `
      .${HIDDEN_ROW_CLASS} {
        display: none !important;
      }

      .super-db-tools__highlight {
        border-radius: 3px;
        padding: 0 2px;
        background: color-mix(in srgb, currentColor 18%, transparent);
        color: inherit;
      }
    `;

    document.head.appendChild(style);
  }

  if (!window.superDbToolsOutsideClickReady) {
    window.superDbToolsOutsideClickReady = true;

    document.addEventListener("click", event => {
      if (event.target.closest(".super-db-tools")) return;

      document.querySelectorAll(".super-db-tools").forEach(toolbar => {
        toolbar.querySelectorAll("[data-super-db-panel-content]").forEach(panel => {
          panel.hidden = true;
        });

        toolbar.querySelectorAll("[data-super-db-panel]").forEach(button => {
          button.classList.remove("is-active");
        });
      });
    });
  }

  initAllTables();

  const observer = new MutationObserver(() => {
    window.requestAnimationFrame(initAllTables);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
