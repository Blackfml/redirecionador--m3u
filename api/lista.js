import fetch from 'node-fetch';

const urls = [
  'https://raw.githubusercontent.com/Blackfml/minha-lista-m3u/main/lista_parte1.m3u',
  'https://raw.githubusercontent.com/Blackfml/minha-lista-m3u/main/lista_parte2.m3u'
];

async function mesclarListas() {
  const conteudos = await Promise.all(urls.map(url => fetch(url).then(r => r.text())));

  let linhas = [];
  let urlsVistas = new Set();

  for (const conteudo of conteudos) {
    const linhasConteudo = conteudo.split('\n');
    for (let i = 0; i < linhasConteudo.length; i++) {
      const linha = linhasConteudo[i].trim();

      if (linha === '#EXTM3U') {
        if (linhas.length === 0) linhas.push(linha);
        continue;
      }

      if (linha.startsWith('#EXTINF')) {
        const linhaExtinf = linha;
        const urlStream = linhasConteudo[i + 1]?.trim();

        if (urlStream && !urlsVistas.has(urlStream)) {
          linhas.push(linhaExtinf);
          linhas.push(urlStream);
          urlsVistas.add(urlStream);
        }
        i++;
      }
    }
  }

  return linhas.join('\n') + '\n';
}

export default async function handler(req, res) {
  try {
    const listaMesclada = await mesclarListas();
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(listaMesclada);
  } catch (error) {
    res.status(500).send('Erro ao gerar lista M3U');
  }
}
