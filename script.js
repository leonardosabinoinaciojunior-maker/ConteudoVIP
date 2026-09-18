/*
  CONFIGURAÇÃO RÁPIDA
  1. Troque TELEGRAM_USERNAME pelo username real, sem @.
  2. Troque WHATSAPP_NUMBER pelo número completo, com código do país,
     apenas números. Exemplo: 351912345678.
  3. NOTIFY_WHATSAPP_ON_PURCHASE define se a opção vem marcada no checkout.

  Um site estático não consegue enviar WhatsApp sozinho. O código abaixo
  abre o WhatsApp com a notificação pronta para você confirmar o envio.
*/
const CONFIG = {
  TELEGRAM_USERNAME: "SEU_CONTACTO_TELEGRAM",
  WHATSAPP_NUMBER: "351900000000",
  NOTIFY_WHATSAPP_ON_PURCHASE: true,
  SALE_DURATION_SECONDS: 14 * 60 + 25,
};

const products = [...document.querySelectorAll("[data-product]")];
const modal = document.querySelector("#purchase-modal");
const modalProduct = document.querySelector("#modal-product");
const modalPrice = document.querySelector("#modal-price");
const notifyCheckbox = document.querySelector("#notify-whatsapp");
const orderStatus = document.querySelector("#order-status");
let selectedProduct = null;
let saleSecondsLeft = CONFIG.SALE_DURATION_SECONDS;

function telegramUrl(message = "") {
  const username = CONFIG.TELEGRAM_USERNAME.replace(/^@/, "").trim();
  const baseUrl = `https://t.me/${username}`;
  return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

function whatsappUrl(message) {
  const number = CONFIG.WHATSAPP_NUMBER.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function setTelegramLinks() {
  document.querySelectorAll("[data-telegram-link]").forEach((link) => {
    link.href = telegramUrl();
  });
}

function formatPrice(value) {
  return `${Number(value).toLocaleString("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}€`;
}

function createOrderId() {
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `VIP-${Date.now().toString(36).toUpperCase()}-${randomPart}`;
}

function purchaseMessage(product) {
  const orderId = createOrderId();
  const date = new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  return [
    "🔔 NOVO INTERESSE DE COMPRA",
    "",
    `Produto: ${product.name}`,
    `Valor: ${formatPrice(product.price)}`,
    `Referência: ${orderId}`,
    `Data: ${date}`,
    "",
    "O cliente quer continuar a compra pelo Telegram.",
  ].join("\n");
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
  notifyCheckbox.checked = CONFIG.NOTIFY_WHATSAPP_ON_PURCHASE;
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

function openWhatsAppNotification() {
  if (!selectedProduct) return;

  const message = purchaseMessage(selectedProduct);
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  orderStatus.textContent = "Aviso preparado no WhatsApp. Toque em Enviar para concluir.";
}

function continueOnTelegram() {
  if (!selectedProduct) return;

  if (notifyCheckbox.checked) {
    openWhatsAppNotification();
  }

  const message = `Olá! Tenho interesse em: ${selectedProduct.name} (${formatPrice(selectedProduct.price)}).`;
  window.open(telegramUrl(message), "_blank", "noopener,noreferrer");
  orderStatus.textContent = notifyCheckbox.checked
    ? "WhatsApp e Telegram foram preparados em novas abas."
    : "Telegram foi aberto numa nova aba.";
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
      ? `${hours}h ${minutes}min e ${seconds}s`
      : `${minutes} minutos e ${seconds} segundos`;
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

    resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "oferta" : "ofertas"}`;
    emptyState.hidden = visibleCount !== 0;
  });
}

document.querySelectorAll("[data-buy]").forEach((button) => {
  button.addEventListener("click", () => openModal(button.closest("[data-product]")));
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.querySelector("#notify-now").addEventListener("click", openWhatsAppNotification);
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