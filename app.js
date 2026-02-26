(function(){
  const input = document.getElementById("heroSearch");
  const panel = document.getElementById("suggestPanel");
  const form = document.getElementById("heroSearchForm");
  if (!input || !panel) return;

  const items = [
    { label: "Buy & Sell", meta: "vehicles, parts, wanted", url: "buy-sell.html" },
    { label: "Repair Shops", meta: "service directory", url: "repair-shops.html" },
    { label: "Junk/Salvage Yards", meta: "yards, pull-a-part", url: "junk-salvage.html" },
    { label: "Guides", meta: "DIY and troubleshooting", url: "guides.html" },
    { label: "Community", meta: "groups and events", url: "community.html" },
    { label: "Submit a Listing", meta: "add a listing", url: "submit-listing.html" }
  ];

  function render(filterText){
    const q = (filterText || "").trim().toLowerCase();
    const filtered = q ? items.filter(x => (x.label + " " + x.meta).toLowerCase().includes(q)) : items;
    panel.innerHTML = filtered.map(x => (
      `<div class="suggest-item" role="option" tabindex="0" data-url="${x.url}">
         <span class="dot" aria-hidden="true"></span>
         <span class="label">${x.label}</span>
         <span class="meta">${x.meta}</span>
       </div>`
    )).join("");
    panel.classList.toggle("open", filtered.length > 0);
  }

  function close(){ panel.classList.remove("open"); }

  input.addEventListener("focus", () => render(input.value));
  input.addEventListener("input", () => render(input.value));

  panel.addEventListener("click", (e) => {
    const row = e.target.closest(".suggest-item");
    if (!row) return;
    const url = row.getAttribute("data-url");
    if (url) window.location.href = url;
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const row = e.target.closest(".suggest-item");
    if (!row) return;
    const url = row.getAttribute("data-url");
    if (url) window.location.href = url;
  });

  document.addEventListener("click", (e) => {
    const within = e.target.closest(".hero-search-wrap");
    if (!within) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  if (form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = "buy-sell.html";
    });
  }
})();