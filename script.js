/* ============================================================
   BIG FARMING — CATÁLOGO, BUSCA E PEDIDOS PELO WHATSAPP
   Para adicionar um produto, copie um objeto dentro de products.
   ============================================================ */
const STORE = {
  whatsapp: '5527981325317', // 55 + DDD + número. Somente números.
  telegram: 'https://t.me/+Zxmh8Ij-nuY5NTIx',
  products: [

...audio,

...energia,

...celulares,

...smartwatch,

...gamer,

...informatica,

...casa,

...automotivo,

...criadores

]}

const productList = document.querySelector('#product-list');
const productSearch = document.querySelector('#product-search');
const categoryFilters = document.querySelector('#category-filters');
const productCounter = document.querySelector('#product-counter');
const emptyProducts = document.querySelector('#empty-products');
const orderProduct = document.querySelector('#order-product');
const orderForm = document.querySelector('#order-form');
let activeCategory = 'Todos';

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const normalizeText = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function getFilteredProducts() {
  const search = normalizeText(productSearch.value.trim());
  return STORE.products.filter((product) => {
    const searchableText = normalizeText(`${product.name} ${product.category}`);
    const matchesSearch = !search || searchableText.includes(search);
    const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
}

function renderFilters() {
  const categories = ['Todos', ...new Set(STORE.products.map((product) => product.category))];
  categoryFilters.innerHTML = categories.map((category) => `
    <button class="category-button ${category === activeCategory ? 'is-active' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join('');
}

function renderProducts() {
  const products = getFilteredProducts();
  productCounter.textContent = `${products.length} produto${products.length === 1 ? '' : 's'} encontrado${products.length === 1 ? '' : 's'}`;
  emptyProducts.hidden = products.length > 0;
  productList.innerHTML = products.map((product) => `
    <article class="product-card">
      <div class="product-image ${escapeHtml(product.image)}"><span>${escapeHtml(product.tag)}</span></div>
      <div class="product-info">
        <div><small>${escapeHtml(product.category)}</small><h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.price)}</p></div>
        <button class="add-button" type="button" data-select-product="${escapeHtml(product.id)}" aria-label="Pedir ${escapeHtml(product.name)}">+</button>
      </div>
      <button class="product-order-button" type="button" data-select-product="${escapeHtml(product.id)}">Pedir este produto</button>
    </article>
  `).join('');
}

function fillProductSelect() {
  orderProduct.innerHTML = '<option value="">Escolha um produto</option>' + STORE.products.map((product) => `
    <option value="${escapeHtml(product.id)}">${escapeHtml(product.name)} — ${escapeHtml(product.price)}</option>
  `).join('');
}

function selectProduct(productId) {
  orderProduct.value = productId;
  document.querySelector('#pedido').scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => orderProduct.focus(), 450);
}

function openContact(channel, message = 'Olá! Vim pelo site e quero saber mais.') {
  const url = channel === 'whatsapp'
    ? `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`
    : STORE.telegram;
  window.open(url, '_blank', 'noopener');
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

productSearch.addEventListener('input', renderProducts);
categoryFilters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

document.addEventListener('click', (event) => {
  const contact = event.target.closest('[data-contact]');
  const productButton = event.target.closest('[data-select-product]');
  if (contact) {
    event.preventDefault();
    openContact(contact.dataset.contact, contact.dataset.message);
  }
  if (productButton) selectProduct(productButton.dataset.selectProduct);
});

document.querySelector('#customer-phone').addEventListener('input', (event) => { event.target.value = formatPhone(event.target.value); });
document.querySelector('#customer-cep').addEventListener('input', (event) => { event.target.value = formatCep(event.target.value); });

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;
  const data = Object.fromEntries(new FormData(orderForm));
  const product = STORE.products.find((item) => item.id === data.produto);
  const message = [
    'Olá! Quero fazer este pedido pela BIG FARMING:',
    '',
    '*PRODUTO*',
    `• Produto: ${product.name}`,
    `• Categoria: ${product.category}`,
    `• Preço anunciado: ${product.price}`,
    `• Quantidade: ${data.quantidade}`,
    `• Pagamento: ${data.pagamento}`,
    '',
    '*DADOS DO CLIENTE*',
    `• Nome: ${data.nome}`,
    `• WhatsApp: ${data.telefone}`,
    '',
    '*ENTREGA*',
    `• CEP: ${data.cep}`,
    `• Endereço: ${data.endereco}, ${data.numero}${data.complemento ? ` — ${data.complemento}` : ''}`,
    `• Bairro: ${data.bairro}`,
    `• Cidade/UF: ${data.cidade}`,
    data.observacao ? `• Observação: ${data.observacao}` : ''
  ].filter(Boolean).join('\n');
  openContact('whatsapp', message);
});

fillProductSelect();
renderFilters();
renderProducts();
document.querySelector('#year').textContent = new Date().getFullYear();
