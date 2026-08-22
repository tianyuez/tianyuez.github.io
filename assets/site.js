(() => {
  const content = window.SITE_CONTENT;
  if (!content) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const el = (tag, className, html = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.innerHTML = html;
    return node;
  };
  const escape = (value = "") => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

  function renderProfile() {
    const p = content.profile;
    $("#profile-name").textContent = p.name;
    $("#profile-cn").textContent = p.chineseName;
    $("#profile-role").textContent = p.role;
    $("#profile-bio").textContent = p.bio;
    $("#profile-photo").src = p.portrait;
    $("#profile-institution").textContent = p.institution;
    $("#profile-office").textContent = p.office;
    $("#profile-email").textContent = p.email;
    $("#profile-email").href = `mailto:${p.email}`;
    $("#profile-links").innerHTML = p.links.map(link => `<a href="${escape(link.url)}"${link.url.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${escape(link.label)} ↗</a>`).join("");
    $("#recruitment-text").textContent = p.recruitment;
    $("#contact-email").href = `mailto:${p.email}`;
  }

  function renderResearch() {
    $("#research-grid").innerHTML = content.research.map(item => `
      <article class="research-item reveal"><span class="symbol">${escape(item.symbol)} / 04</span><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p></article>
    `).join("");
    const ticker = content.research.map(item => `<span><b>●</b>${escape(item.title)}</span>`).join("");
    $("#topic-ticker").innerHTML = ticker + ticker;
    $("#math-statement").textContent = content.math.statement;
    $("#math-equation").textContent = `\\[${content.math.equation}\\]`;
    // MathJax is progressive enhancement: the content remains readable if a CDN is unavailable.
    const typeset = () => window.MathJax?.typesetPromise?.([$("#math-equation")]);
    if (window.MathJax?.startup?.promise) window.MathJax.startup.promise.then(typeset);
    else window.addEventListener("load", typeset, { once: true });
  }

  let currentFilter = "All";
  let showAll = false;
  function renderPublications() {
    const query = $("#publication-search").value.trim().toLowerCase();
    const matches = [...content.publications].sort((a, b) => b.year - a.year).filter(pub => {
      const filterMatch = currentFilter === "All" || pub.type === currentFilter || (currentFilter === "Featured" && pub.featured);
      const queryMatch = !query || [pub.title, pub.authors, pub.venue, pub.tag, pub.year].join(" ").toLowerCase().includes(query);
      return filterMatch && queryMatch;
    });
    const visible = showAll || query || currentFilter !== "All" ? matches : matches.slice(0, 9);
    $("#publication-list").innerHTML = visible.length ? visible.map(pub => `
      <a class="publication-item" href="${escape(pub.pdf)}" aria-label="Open ${escape(pub.title)}">
        <span class="pub-year">${pub.year}</span>
        <span class="pub-main"><h3>${escape(pub.title)}</h3><p>${escape(pub.authors)}</p><strong>${escape(pub.venue)}</strong></span>
        <span class="pub-tag">${escape(pub.tag)}</span><span class="pub-arrow">↗</span>
      </a>
    `).join("") : '<p class="empty-state">No publications match this filter.</p>';
    const more = $("#publication-more");
    more.hidden = query || currentFilter !== "All" || matches.length <= 9;
    more.innerHTML = showAll ? "Show selected publications <span>↑</span>" : `Show all ${matches.length} publications <span>↓</span>`;
  }

  function setupPublications() {
    const filters = ["All", "Featured", "Journal", "Conference"];
    $("#publication-filters").innerHTML = filters.map(name => `<button type="button" class="${name === "All" ? "active" : ""}" data-filter="${name}">${name}</button>`).join("");
    $("#publication-filters").addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button) return;
      currentFilter = button.dataset.filter;
      $("#publication-filters .active")?.classList.remove("active");
      button.classList.add("active");
      renderPublications();
    });
    $("#publication-search").addEventListener("input", renderPublications);
    $("#publication-more").addEventListener("click", () => { showAll = !showAll; renderPublications(); });
    renderPublications();
  }

  const timeline = (items, education = false) => items.map(item => `
    <article class="timeline-item"><time>${escape(item.period)}</time><div><h3>${escape(education ? item.degree : item.role)}</h3><p>${escape(item.place)}${item.location ? ` · ${escape(item.location)}` : ""}${item.detail ? ` · ${escape(item.detail)}` : ""}</p></div></article>
  `).join("");
  const list = items => `<ul class="simple-list">${items.map(item => `<li>${escape(item)}</li>`).join("")}</ul>`;

  function renderProfilePanels() {
    $("#experience-panel").innerHTML = timeline(content.experience);
    $("#education-panel").innerHTML = timeline(content.education, true);
    $("#grants-panel").innerHTML = `<h3 class="group-title">Research grants</h3>${list(content.grants)}<h3 class="group-title">Invited talks</h3>${list(content.talks)}`;
    $("#service-panel").innerHTML = content.service.map(item => `<article class="timeline-item"><time>${escape(item.label)}</time><div><p>${escape(item.text)}</p></div></article>`).join("");
    document.querySelectorAll(".profile-tab").forEach(tab => tab.addEventListener("click", () => {
      document.querySelectorAll(".profile-tab").forEach(item => { item.classList.remove("active"); item.setAttribute("aria-selected", "false"); });
      document.querySelectorAll(".profile-panel").forEach(item => item.classList.remove("active"));
      tab.classList.add("active"); tab.setAttribute("aria-selected", "true");
      $(`#${tab.dataset.panel}`).classList.add("active");
    }));
  }

  function renderLists() {
    $("#news-list").innerHTML = content.news.map(item => `<a class="news-item reveal" href="${escape(item.url)}" target="_blank" rel="noopener"><time>${escape(item.date)}</time><p>${escape(item.text)} ↗</p></a>`).join("");
    $("#award-list").innerHTML = content.awards.map(item => `<article class="award-item reveal"><time>${escape(item.year)}</time><p><strong>${escape(item.title)}</strong><span>${escape(item.detail)}</span></p></article>`).join("");
    $("#teaching-list").innerHTML = content.teaching.map(item => `<article class="person-item reveal"><h4>${escape(item.course)} <small>${escape(item.code)}</small></h4><p>${escape(item.period)}</p><p>${escape(item.role)}</p></article>`).join("");
    $("#alumni-list").innerHTML = content.alumni.map(item => `<article class="person-item reveal"><h4>${escape(item.name)}</h4><p>${escape(item.period)} → ${escape(item.next)}</p><p>${escape(item.work)}</p></article>`).join("");
  }

  function setupNavigation() {
    const header = $(".site-header");
    const menu = $(".menu-toggle");
    const nav = $(".site-nav");
    window.addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 20), { passive: true });
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    nav.addEventListener("click", event => { if (event.target.closest("a")) { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); } });
    const savedTheme = localStorage.getItem("tz-theme");
    if (savedTheme === "dark" || (!savedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) document.body.classList.add("dark");
    $(".theme-toggle").addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("tz-theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
  }

  function setupReveal() {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    document.querySelectorAll(".reveal").forEach(node => observer.observe(node));
  }

  function signalCanvas(canvas, color) {
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    let width, height, frame = 0;
    const resize = () => { width = canvas.width = canvas.clientWidth * devicePixelRatio; height = canvas.height = canvas.clientHeight * devicePixelRatio; };
    const draw = () => {
      frame += .009;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = color; ctx.lineWidth = devicePixelRatio;
      const gap = Math.max(34, width / 28);
      for (let x = -gap; x < width + gap; x += gap) {
        ctx.beginPath();
        for (let y = 0; y <= height; y += 12 * devicePixelRatio) {
          const wave = Math.sin(y * .009 / devicePixelRatio + frame * 7 + x * .002) * 13 * devicePixelRatio;
          y === 0 ? ctx.moveTo(x + wave, y) : ctx.lineTo(x + wave, y);
        }
        ctx.stroke();
      }
      requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize, { passive: true }); draw();
  }

  renderProfile();
  renderResearch();
  setupPublications();
  renderProfilePanels();
  renderLists();
  setupNavigation();
  setupReveal();
  signalCanvas($("#signal-canvas"), "rgba(96,101,92,.15)");
  signalCanvas($("#contact-canvas"), "rgba(255,255,255,.16)");
})();
