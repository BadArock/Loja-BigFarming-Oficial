const fs = require('fs');
const path = require('path');

// Ajusta o caminho para a raiz do projeto (voltando de /organizacao)
const base = path.resolve(__dirname, '..');
const kitDir = path.join(base, 'imagens', 'Kit');
const dadosDir = path.join(base, 'dados');

console.log('⏳ Iniciando a arrumação manual dos arquivos...');

if (!fs.existsSync(kitDir)) {
    console.error('❌ Erro: A pasta imagens/Kit não foi encontrada em: ' + kitDir);
    process.exit(1);
}

// Ler as fotos disponíveis
const fotosKit = fs.readdirSync(kitDir).filter(x => /\.(jpg|jpeg|png)$/i.test(x)).sort();
const categorias = ['audio', 'energia', 'celulares', 'smartwatch', 'gamer', 'informatica', 'casa', 'automotivo'];

// 1. Criar as pastas das categorias
categorias.forEach(c => {
    const pasta = path.join(base, 'imagens', c);
    if (!fs.existsSync(pasta)) {
        fs.mkdirSync(pasta, { recursive: true });
    }
});

// 2. Distribuir fotos lendo os arquivos .js
let idx = 0;
categorias.forEach(c => {
    const caminhoJs = path.join(dadosDir, `${c}.js`);
    if (!fs.existsSync(caminhoJs)) return;

    const conteudo = fs.readFileSync(caminhoJs, 'utf8');
    const regex = /image:\s*\"([^\"]+)\"/g;
    let m;

    while ((m = regex.exec(conteudo)) !== null) {
        const destinoFinal = path.join(base, ...m[1].split('/'));
        
        if (idx < fotosKit.length) {
            fs.copyFileSync(path.join(kitDir, fotosKit[idx]), destinoFinal);
            idx++;
        } else if (fotosKit.length > 0) {
            // Se acabarem as fotos, usa a primeira como padrão (placeholder dos 23 itens)
            fs.copyFileSync(path.join(kitDir, fotosKit[0]), destinoFinal);
        }
    }
});

// 3. Configurar o Banner Hero
const bannerDestino = path.join(base, 'imagens', 'setup.jpg');
if (fs.existsSync(path.join(kitDir, 'img.jpg'))) {
    fs.copyFileSync(path.join(kitDir, 'img.jpg'), bannerDestino);
}

console.log('✅ PROCESSO CONCLUÍDO! Todas as pastas foram criadas e as fotos organizadas.');
