
// ==========================================
// CONFIGURAÇÕES DA LOJA
// ==========================================

const STORE = {
  name: "Minha Loja",
  whatsapp: "5594999999999"
};

const CART_STORAGE_KEY = "catalogCart_v1";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});


// ==========================================
// PRODUTOS
// Edite esta lista para cadastrar seus produtos
// ==========================================

const products = [
  {
    id: 1,
    name: "Camiseta Básica",
    category: "Roupas",
    price: 49.90,
    image: "https://placehold.co/600x600?text=Camiseta",
    description: "Camiseta confortável para o dia a dia."
  },
  {
    id: 2,
    name: "Tênis Casual",
    category: "Calçados",
    price: 129.90,
    image: "https://placehold.co/600x600?text=Tenis",
    description: "Tênis casual para diversas ocasiões."
  },
  {
    id: 3,
    name: "Relógio Masculino",
    category: "Acessórios",
    price: 89.90,
    image: "https://placehold.co/600x600?text=Relogio",
    description: "Relógio moderno e elegante."
  },
  {
    id: 4,
    name: "Bolsa Feminina",
    category: "Acessórios",
    price: 99.90,
    image: "https://placehold.co/600x600?text=Bolsa",
    description: "Bolsa prática para o dia a dia."
  },
  {
    id: 5,
    name: "Calça Jeans",
    category: "Roupas",
    price: 119.90,
    image: "https://placehold.co/600x600?text=Calca",
    description: "Calça jeans com ótimo caimento."
  },
  {
    id: 6,
    name: "Sandália",
    category: "Calçados",
    price: 69.90,
    image: "https://placehold.co/600x600?text=Sandalia",
    description: "Sandália confortável e versátil."
  }
];


// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const storeName = document.getElementById("storeName");
const footerStoreName = document.getElementById("footerStoreName");
const currentYear = document.getElementById("currentYear");

const headerWhatsapp = document.getElementById("headerWhatsapp");
const bottomWhatsapp = document.getElementById("bottomWhatsapp");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const categoriesContainer = document.getElementById("categories");
const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const emptyState = document.getElementById("emptyState");

const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartCount = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartTotal = document.getElementById("cartTotal");
const checkoutButton = document.getElementById("checkoutButton");
const continueShoppingButton = document.getElementById("continueShopping");


// ==========================================
// ESTADO DA LOJA
// ==========================================

let selectedCategory = "Todos";
let searchTerm = "";
let sortOrder = "default";


// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatPrice(value) {
  return currency.format(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

function getProduct(id) {
  return products.find(product => product.id === Number(id));
}

function getWhatsappLink() {
  const phone = STORE.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}`;
}


// ==========================================
// CONFIGURAÇÃO VISUAL DA LOJA
// ==========================================

function setupStore() {
  if (storeName) {
    storeName.textContent = STORE.name;
  }

  if (footerStoreName) {
    footerStoreName.textContent = STORE.name;
  }

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  const whatsappLink = getWhatsappLink();

  [headerWhatsapp, bottomWhatsapp].forEach(link => {
    if (link) {
      link.href = whatsappLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
}


// ==========================================
// CARRINHO E ARMAZENAMENTO
// ==========================================

function loadCart() {
  try {
    const savedCart = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY)
    );

    if (!Array.isArray(savedCart)) {
      return [];
    }

    return savedCart
      .map(item => ({
        productId: Number(item.productId),
        quantity: Math.floor(Number(item.quantity))
      }))
      .filter(item =>
        getProduct(item.productId) &&
        Number.isFinite(item.quantity) &&
        item.quantity >= 1
      );

  } catch (error) {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cart)
    );
  } catch (error) {
    console.warn("Não foi possível salvar o carrinho.");
  }
}

function addToCart(id) {
  const product = getProduct(id);

  if (!product) return;

  const existingItem = cart.find(
    item => item.productId === product.id
  );

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({
      productId: product.id,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  openCart();
}

function updateQuantity(id, change) {
  const item = cart.find(
    item => item.productId === Number(id)
  );

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(
      cartItem => cartItem.productId !== Number(id)
    );
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(
    item => item.productId !== Number(id)
  );

  saveCart();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((total, item) => {
    const product = getProduct(item.productId);

    return total + (product.price * item.quantity);
  }, 0);
}

function getCartQuantity() {
  return cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}


// ==========================================
// EXIBIÇÃO DOS PRODUTOS
// ==========================================

function renderProducts() {
  let filteredProducts = [...products];

  if (selectedCategory !== "Todos") {
    filteredProducts = filteredProducts.filter(
      product => product.category === selectedCategory
    );
  }

  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => {
      const text = (
        product.name + " " +
        product.category + " " +
        product.description
      ).toLowerCase();

      return text.includes(searchTerm);
    });
  }

  if (sortOrder === "lowest") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortOrder === "highest") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortOrder === "name") {
    filteredProducts.sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR")
    );
  }

  productGrid.innerHTML = "";

  if (productCount) {
    productCount.textContent =
      `${filteredProducts.length} produto(s)`;
  }

  if (filteredProducts.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filteredProducts.forEach(product => {
    const card = document.createElement("article");

    card.className = "product-card";

    card.innerHTML = `
      <div class="product-image">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
        >
      </div>

      <div class="product-info">
        <span class="product-category">
          ${escapeHTML(product.category)}
        </span>

        <h3>${escapeHTML(product.name)}</h3>

        <p>${escapeHTML(product.description)}</p>

        <div class="product-bottom">
          <strong>${formatPrice(product.price)}</strong>

          <button
            class="buy-button"
            type="button"
            data-product-id="${product.id}"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });

  productGrid.querySelectorAll("[data-product-id]").forEach(button => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.productId);
    });
  });
}


// ==========================================
// CATEGORIAS
// ==========================================

function renderCategories() {
  const categories = [
    "Todos",
    ...new Set(products.map(product => product.category))
  ];

  categoriesContainer.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");

    button.type = "button";
    button.className =
      category === selectedCategory ? "category active" : "category";

    button.textContent = category;

    button.addEventListener("click", () => {
      selectedCategory = category;
      renderCategories();
      renderProducts();
    });

    categoriesContainer.appendChild(button);
  });
}


// ==========================================
// EXIBIÇÃO DO CARRINHO
// ==========================================

function renderCart() {
  const totalQuantity = getCartQuantity();
  const total = getCartTotal();

  cartCount.textContent = totalQuantity;
  cartCount.hidden = totalQuantity === 0;

  cartTotal.textContent = formatPrice(total);

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p>Seu carrinho está vazio.</p>
        <span>Adicione produtos para continuar.</span>
      </div>
    `;

    cartFooter.hidden = true;
    checkoutButton.disabled = true;

    return;
  }

  cartFooter.hidden = false;
  checkoutButton.disabled = false;

  cartItemsContainer.innerHTML = cart.map(item => {
    const product = getProduct(item.productId);

    if (!product) return "";

    const subtotal = product.price * item.quantity;

    return `
      <div class="cart-item">

        <div class="cart-item-image">
          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
          >
        </div>

        <div class="cart-item-info">

          <h3>${escapeHTML(product.name)}</h3>

          <p class="cart-item-price">
            ${formatPrice(product.price)}
          </p>

          <strong>
            Subtotal: ${formatPrice(subtotal)}
          </strong>

          <div class="cart-item-controls">

            <div class="quantity-control">
              <button
                type="button"
                data-action="decrease"
                data-id="${product.id}"
                aria-label="Diminuir quantidade"
              >−</button>

              <span>${item.quantity}</span>

              <button
                type="button"
                data-action="increase"
                data-id="${product.id}"
                aria-label="Aumentar quantidade"
              >+</button>
            </div>

            <button
              type="button"
              class="remove-item"
              data-action="remove"
              data-id="${product.id}"
            >
              Remover
            </button>

          </div>
        </div>
      </div>
    `;
  }).join("");
}


// ==========================================
// EVENTOS DOS CONTROLES DO CARRINHO
// ==========================================

cartItemsContainer.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") {
    updateQuantity(id, 1);
  }

  if (action === "decrease") {
    updateQuantity(id, -1);
  }

  if (action === "remove") {
    removeFromCart(id);
  }
});


// ==========================================
// ABRIR E FECHAR CARRINHO
// ==========================================

function openCart() {
  cartOverlay.classList.add("active");
  cartDrawer.classList.add("active");

  cartDrawer.removeAttribute("inert");
  cartDrawer.setAttribute("aria-hidden", "false");

  document.body.classList.add("cart-open");

  closeCartButton.focus();
}

function closeCart() {
  cartOverlay.classList.remove("active");
  cartDrawer.classList.remove("active");

  cartDrawer.setAttribute("inert", "");
  cartDrawer.setAttribute("aria-hidden", "true");

  document.body.classList.remove("cart-open");

  openCartButton.focus();
}

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
continueShoppingButton.addEventListener("click", closeCart);

cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" &&
      cartDrawer.classList.contains("active")) {
    closeCart();
  }
});


// ==========================================
// FINALIZAR PEDIDO PELO WHATSAPP
// ==========================================

function checkoutWhatsApp() {
  if (cart.length === 0) return;

  const phone = STORE.whatsapp.replace(/\D/g, "");

  if (!phone || phone === "5594999999999") {
    alert(
      "Configure o número de WhatsApp da loja no arquivo main.js antes de receber pedidos."
    );

    return;
  }

  let message = `Olá! Gostaria de fazer um pedido na ${STORE.name}.\n\n`;

  cart.forEach(item => {
    const product = getProduct(item.productId);

    const subtotal = product.price * item.quantity;

    message +=
      `*${product.name}*\n` +
      `Quantidade: ${item.quantity}\n` +
      `Preço unitário: ${formatPrice(product.price)}\n` +
      `Subtotal: ${formatPrice(subtotal)}\n\n`;
  });

  message +=
    `*Total dos produtos: ${formatPrice(getCartTotal())}*\n\n` +
    `Gostaria de confirmar a disponibilidade e combinar a entrega ou retirada.`;

  const whatsappURL =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappURL, "_blank", "noopener,noreferrer");
}

checkoutButton.addEventListener("click", checkoutWhatsApp);


// ==========================================
// BUSCA E ORDENAÇÃO
// ==========================================

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

sortSelect.addEventListener("change", event => {
  sortOrder = event.target.value;
  renderProducts();
});


// ==========================================
// INICIALIZAÇÃO
// ==========================================

function initializeStore() {
  setupStore();
  renderCategories();
  renderProducts();
  renderCart();
}

initializeStore();