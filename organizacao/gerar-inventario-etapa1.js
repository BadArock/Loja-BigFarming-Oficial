const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const dadosDir = path.join(base, 'dados');
const kitDir = path.join(base, 'imagens', 'Kit');
const outDir = path.join(base, 'organizacao');

const files = fs.readdirSync(dadosDir).filter((f) => f.endsWith('.js')).sort();
const kitImages = fs.existsSync(kitDir)
  ? fs.readdirSync(kitDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort()
  : [];

const products = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(dadosDir, file), 'utf8');
  const variable = file.replace('.js', '');
  const re = /\{[\s\S]*?id:"([^"]+)"[\s\S]*?name:"([^"]+)"[\s\S]*?category:"([^"]+)"[\s\S]*?price:"([^"]+)"[\s\S]*?tag:"([^"]+)"[\s\S]*?image:"([^"]+)"[\s\S]*?\}/g;
  let match;

  while ((match = re.exec(src)) !== null) {
    const image = match[6];
    products.push({
      sourceFile: file,
      variable,
      id: match[1],
      name: match[2],
      category: match[3],
      price: match[4],
      tag: match[5],
      image,
      imageExists: fs.existsSync(path.join(base, ...image.split('/')))
    });
  }
}

const ids = products.map((product) => product.id);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
const cssRefs = ['imagens/setup.jpg'];
const missingImages = [...new Set([...products.map((product) => product.image), ...cssRefs])].filter(
  (image) => !fs.existsSync(path.join(base, ...image.split('/')))
);
const categories = [...new Set(products.map((product) => product.category))];
const uniqueProducts = products.filter((product, index) => ids.indexOf(product.id) === index);

const mapping = [];
let kitIndex = 0;

for (const product of uniqueProducts) {
  const kit = kitImages[kitIndex] || null;
  mapping.push({
    productId: product.id,
    productName: product.name,
    category: product.category,
    sourceFile: product.sourceFile,
    targetPath: product.image,
    proposedKitSource: kit ? `imagens/Kit/${kit}` : null,
    status: kit ? 'provisional' : 'needs_photo'
  });
  if (kit) kitIndex += 1;
}

const inventory = {
  etapa: 1,
  generatedAt: new Date().toISOString(),
  branch: 'organizacao',
  summary: {
    totalProductsListed: products.length,
    uniqueProducts: uniqueProducts.length,
    duplicateProducts: products.length - uniqueProducts.length,
    categories: categories.length,
    categoryNames: categories,
    kitImagesAvailable: kitImages.length,
    referencedImagesMissing: missingImages.length,
    cssOnlyImagesMissing: cssRefs.filter((image) => missingImages.includes(image))
  },
  issues: duplicateIds.length
    ? [{ type: 'duplicate_ids', ids: duplicateIds, note: 'criadores.js e automotivo.js sao identicos' }]
    : [],
  missingImages,
  kitImages: kitImages.map((file) => `imagens/Kit/${file}`),
  products,
  duplicatesDetail: duplicateIds.map((id) =>
    products
      .filter((product) => product.id === id)
      .map((product) => ({ id: product.id, sourceFile: product.sourceFile, category: product.category }))
  )
};

const imageMapping = {
  etapa: 1,
  note: 'Mapeamento provisorio: 1 foto Kit por produto unico, na ordem dos arquivos dados/*.js. Produtos sem foto recebem status needs_photo.',
  hero: {
    targetPath: 'imagens/setup.jpg',
    proposedKitSource: kitImages[kitIndex] ? `imagens/Kit/${kitImages[kitIndex]}` : kitImages[0] ? `imagens/Kit/${kitImages[0]}` : null,
    status: 'provisional'
  },
  mapped: mapping.length,
  withKitPhoto: mapping.filter((item) => item.proposedKitSource).length,
  withoutKitPhoto: mapping.filter((item) => !item.proposedKitSource).length,
  unusedKitImages: kitImages.slice(kitIndex + 1).map((file) => `imagens/Kit/${file}`),
  mapping
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'inventario-etapa1.json'), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(outDir, 'mapeamento-imagens-etapa1.json'), JSON.stringify(imageMapping, null, 2));
console.log(JSON.stringify(inventory.summary, null, 2));
