/*
  QUICK SETUP
  Replace TELEGRAM_USERNAME with the real username, without the @.
*/
const CONFIG = {
  TELEGRAM_USERNAME: "saler_00899",
  SALE_DURATION_SECONDS: 14 * 60 + 25,
};

const products = [...document.querySelectorAll("[data-product]")];
const modal = document.querySelector("#purchase-modal");
const modalProduct = document.querySelector("#modal-product");
const modalPrice = document.querySelector("#modal-price");
const orderStatus = document.querySelector("#order-status");
let selectedProduct = null;
let saleSecondsLeft = CONFIG.SALE_DURATION_SECONDS;

function telegramUrl(message = "") {
  const username = CONFIG.TELEGRAM_USERNAME.replace(/^@/, "").trim();
  const baseUrl = `https://t.me/${username}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

function setTelegramLinks() {
  document.querySelectorAll("[data-telegram-link]").forEach((link) => {
    link.href = telegramUrl();
  });
}

function formatPrice(value) {
  return `${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}€`;
}

function getProductFromCard(card) {
  return {
    name: card.dataset.name,
    price: card.dataset.price,
    oldPrice: card.dataset.oldPrice,
  };
}

function openModal(card) {
  selectedProduct = getProductFromCard(card);
  modalProduct.textContent = selectedProduct.name;
  modalPrice.textContent = formatPrice(selectedProduct.price);
  orderStatus.textContent = "";
  modal.hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector("[data-close-modal]").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  selectedProduct = null;
}

function continueOnTelegram() {
  if (!selectedProduct) return;

  const message = `Hello! I'm interested in: ${selectedProduct.name} (${formatPrice(selectedProduct.price)}).`;
  window.open(telegramUrl(message), "_blank", "noopener,noreferrer");
  orderStatus.textContent = "Telegram was opened in a new tab.";
}

function renderCountdown() {
  const hours = Math.floor(saleSecondsLeft / 3600);
  const minutes = Math.floor((saleSecondsLeft % 3600) / 60);
  const seconds = saleSecondsLeft % 60;

  document.querySelector("#countdown-hours").textContent = String(hours).padStart(2, "0");
  document.querySelector("#countdown-minutes").textContent = String(minutes).padStart(2, "0");
  document.querySelector("#countdown-seconds").textContent = String(seconds).padStart(2, "0");
  document.querySelector("#sale-copy-time").textContent =
    hours > 0
      ? `${hours}h ${minutes}min and ${seconds}s`
      : `${minutes} minutes and ${seconds} seconds`;
}

function startCountdown() {
  renderCountdown();
  window.setInterval(() => {
    saleSecondsLeft = Math.max(0, saleSecondsLeft - 1);
    renderCountdown();
  }, 1000);
}

function setupSearch() {
  const searchInput = document.querySelector("#product-search");
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");

  searchInput.addEventListener("input", (event) => {
    const term = event.target.value.trim().toLowerCase();
    let visibleCount = 0;

    products.forEach((card) => {
      const searchableText = [
        card.dataset.name,
        card.dataset.category,
        card.textContent,
      ]
        .join(" ")
        .toLowerCase();
      const matches = !term || searchableText.includes(term);
      card.classList.toggle("is-hidden", !matches);
      if (matches) visibleCount += 1;
    });

    resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "offer" : "offers"}`;
    emptyState.hidden = visibleCount !== 0;
  });
}

document.querySelectorAll("[data-buy]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.closest("[data-product]")));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelector("#continue-telegram").addEventListener("click", continueOnTelegram);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeModal();
});

setTelegramLinks();
setupSearch();
startCountdown();

/* ------------------------------------------------------------------
   DEMO NOTIFICATIONS (learning exercise)
   Shows a toast in the bottom-left corner every 10 minutes using a
   list of 100 sample names. Each toast is clearly tagged "Demo".
   For testing, lower DEMO_INTERVAL_MS (for example 5000).
------------------------------------------------------------------- */
const DEMO_NAMES = [
  "Maria", "João", "Ana", "Pedro", "Sofia", "Tiago", "Beatriz", "Rui", "Inês", "Miguel",
  "Carla", "Diogo", "Marta", "Bruno", "Catarina", "Nuno", "Filipa", "André", "Joana", "Ricardo",
  "Helena", "Paulo", "Teresa", "Hugo", "Sara", "Luís", "Rita", "Fábio", "Patrícia", "Gonçalo",
  "Mariana", "Rafael", "Daniela", "Vasco", "Carolina", "Simão", "Leonor", "Duarte", "Matilde", "Tomás",
  "Lara", "Francisco", "Bianca", "Rodrigo", "Alice", "Samuel", "Clara", "Gabriel", "Sandra", "Márcio",
  "Vera", "Hélder", "Cláudia", "Jorge", "Susana", "Sérgio", "Núria", "Eduardo", "Lúcia", "Artur",
  "Elisa", "Nelson", "Raquel", "Alberto", "Isabel", "Mário", "Cristina", "Fernando", "Manuela", "Renato",
  "Paula", "Vítor", "Luana", "Álvaro", "Diana", "Cristiano", "Yara", "Leandro", "Olívia", "Emanuel",
  "Débora", "Xavier", "Mafalda", "Ivo", "Lídia", "Cesar", "Nádia", "Ismael", "Sílvia", "Kevin",
  "Tânia", "Wilson", "Alexandra", "Denis", "Fátima", "Otávio", "Zara", "Marco", "Odete", "Jaime",
];

const DEMO_INTERVAL_MS = 10 *900; // 10 secands
const DEMO_FIRST_DELAY_MS = 10 * 1000;   // first toast after 10 seconds
const DEMO_VISIBLE_MS = 6000;            // how long each toast stays visible

function setupDemoNotifications() {
  const style = document.createElement("style");
  style.textContent = `
    .demo-toast-area {
      position: fixed;
      left: 16px;
      bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      z-index: 50;
      max-width: min(340px, calc(100vw - 32px));
      pointer-events: none;
    }
    .demo-toast {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 12px 16px;
      border-radius: 14px;
      background: rgba(20, 15, 30, 0.95);
      color: #fff;
      font: 500 14px/1.4 "DM Sans", system-ui, sans-serif;
      border: 1px solid rgba(145, 59, 255, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.35s ease, transform 0.35s ease;
    }
    .demo-toast.is-visible { opacity: 1; transform: translateY(0); }
    .demo-toast small { opacity: 0.6; font-size: 11px; letter-spacing: 0.04em; }
  `;
  document.head.appendChild(style);

  const area = document.createElement("div");
  area.className = "demo-toast-area";
  area.setAttribute("aria-live", "polite");
  document.body.appendChild(area);

  // Shuffle so names don't repeat until all 100 were used
  let queue = [];
  function nextName() {
    if (queue.length === 0) {
      queue = [...DEMO_NAMES].sort(() => Math.random() - 0.5);
    }
    return queue.pop();
  }

  function showToast() {
    const names = products.map((card) => card.dataset.name);
    const product = names[Math.floor(Math.random() * names.length)];

    const toast = document.createElement("div");
    toast.className = "demo-toast";
    const line = document.createElement("span");
    line.textContent = `${nextName()} just bought ${product}`;
    const tag = document.createElement("small");
    tag.textContent = "";
    toast.append(line, tag);
    area.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 400);
    }, DEMO_VISIBLE_MS);
  }

  setTimeout(() => {
    showToast();
    setInterval(showToast, DEMO_INTERVAL_MS);
  }, DEMO_FIRST_DELAY_MS);
}

setupDemoNotifications();
