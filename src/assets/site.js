(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const header = $(".site-header");
  const menuButton = $(".menu-toggle");
  const navigation = $(".site-nav");
  window.addEventListener("scroll", () => header?.classList.toggle("scrolled", scrollY > 16), { passive: true });
  menuButton?.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  navigation?.addEventListener("click", event => {
    if (event.target.closest("a")) {
      navigation.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    }
  });

  const savedTheme = localStorage.getItem("tz-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  $(".theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("tz-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });

  const languageButton = $(".lang-toggle");
  const languageStorageKey = "tz-language-v2";
  const translations = window.SITE_TRANSLATIONS || {};
  const originalText = new WeakMap();
  $$("[data-i18n], [data-translate]").forEach(node => {
    originalText.set(node, node.textContent);
  });
  const applyLanguage = language => {
    const chinese = language === "zh";
    document.documentElement.lang = chinese ? "zh-CN" : "en";
    $$("[data-i18n]").forEach(node => {
      const source = node.dataset.i18n;
      node.textContent = chinese ? (translations[source] || source) : originalText.get(node);
    });
    $$("[data-translate]").forEach(node => {
      const source = originalText.get(node);
      node.textContent = chinese ? (translations[source] || source) : source;
    });
    if (languageButton) {
      languageButton.textContent = chinese ? "EN" : "中文";
      languageButton.setAttribute("aria-label", chinese ? "Switch to English" : "切换为中文");
    }
    localStorage.setItem(languageStorageKey, language);
  };
  languageButton?.addEventListener("click", () => applyLanguage(localStorage.getItem(languageStorageKey) === "zh" ? "en" : "zh"));
  applyLanguage(localStorage.getItem(languageStorageKey) === "zh" ? "zh" : "en");

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.06 });
    $$(".reveal").forEach(node => observer.observe(node));
  } else {
    $$(".reveal").forEach(node => node.classList.add("visible"));
  }

  const filterRoot = $("#publication-filters");
  const searchInput = $("#publication-search");
  if (filterRoot && searchInput) {
    let filter = "All";
    const applyFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      $$(".publication-item", $("#publication-list")).forEach(item => {
        const typeMatch = filter === "All" || item.dataset.type === filter;
        const searchMatch = !query || item.dataset.search.toLowerCase().includes(query);
        item.hidden = !(typeMatch && searchMatch);
      });
    };
    filterRoot.addEventListener("click", event => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      filter = button.dataset.filter;
      $$("button", filterRoot).forEach(item => item.classList.toggle("active", item === button));
      applyFilters();
    });
    searchInput.addEventListener("input", applyFilters);
  }

  const restoreOwnershipMark = () => {
    if ($("#site-copyright")) return;
    const footer = $(".site-footer") || document.body;
    const mark = document.createElement("div");
    mark.id = "site-copyright";
    mark.className = "ownership-lock ownership-fallback";
    mark.dataset.ownerSeal = "dHl6LTIwMjY";
    mark.innerHTML = `<span class="ownership-label">Copyright / Attribution</span><span>© ${new Date().getFullYear()}</span><b>${atob("VGlhbnl1ZSBaaGVuZw==")}</b><span>${atob("U2l0ZSBkZXNpZ24gYW5kIG9yaWdpbmFsIGNvbnRlbnQgwrcgUGxlYXNlIHJldGFpbiBhdHRyaWJ1dGlvbi4=")}</span>`;
    footer.append(mark);
  };
  restoreOwnershipMark();
  new MutationObserver(restoreOwnershipMark).observe(document.body, { childList: true, subtree: true });

})();
