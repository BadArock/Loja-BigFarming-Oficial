/* Troque estes dois dados pelos contatos reais da sua loja antes de publicar. */
const STORE = {
  whatsapp: '27981325317', // Código do país + DDD + número, somente dígitos.
  telegram: 'https://t.me/+Zxmh8Ij-nuY5NTIx', // Sem @. Ex.: minha_loja
  products: [
    { name: 'Power Bank com Cabos', price: 'R$ 79,90', tag: 'Mais vendido', image: 'produto-1' },
    { name: 'Power Bank Compacto', price: 'R$ 69,90', tag: 'Oferta', image: 'produto-2' },
    { name: 'Mini Power Bank', price: 'R$ 59,90', tag: 'Novo', image: 'produto-3' }
  ]
};

const productList = document.querySelector('#product-list');
productList.innerHTML = STORE.products.map((product) => `
  <article class="product-card">
    <div class="product-image ${product.image}"><span>${product.tag}</span><div class="product-shape"></div></div>
    <div class="product-info"><div><h3>${product.name}</h3><p>${product.price}</p></div>
    <button class="add-button" data-product="${product.name}" aria-label="Pedir ${product.name}">+</button></div>
  </article>
`).join('');

function openContact(channel, message = 'Olá! Vim pelo site e quero saber mais.') {
  const text = encodeURIComponent(message);
  const url = channel === 'whatsapp'
    ? `https://wa.me/${STORE.whatsapp}?text=${text}`
    : `https://t.me/${STORE.telegram}`;
  window.open(url, '_blank', 'noopener');
}

document.addEventListener('click', (event) => {
  const contact = event.target.closest('[data-contact]');
  const product = event.target.closest('[data-product]');
  if (contact) {
    event.preventDefault();
    openContact(contact.dataset.contact, contact.dataset.message);
  }
  if (product) openContact('whatsapp', `Olá! Quero pedir: ${product.dataset.product}.`);
});

document.querySelector('#year').textContent = new Date().getFullYear();
