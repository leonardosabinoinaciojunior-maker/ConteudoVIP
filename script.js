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
