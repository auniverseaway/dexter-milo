// Use '/libs' if your live site maps '/libs' to milo's origin.
const LIBS = 'https://milo.adobe.com/libs';

// Add any config options.
const CONFIG = {
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
  },
};

const [setLibs, getLibs] = (() => {
  let libs;
  return [
      (prodLibs) => {
      const { hostname } = window.location;
      if (!hostname.includes('hlx.page')
          && !hostname.includes('hlx.live')
          && !hostname.includes('localhost')) {
          libs = prodLibs;
          return libs;
      }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') return 'http://localhost:6456/libs';
      if (branch.indexOf('--') > -1) return `https://${branch}.hlx.page/libs`;
      return `https://${branch}--milo--adobecom.hlx.page/libs`;
      }, () => libs,
  ];
})();

const miloLibs = setLibs(LIBS);

(async function loadMilo() {
  const comps = document.querySelectorAll('.milo .milo-details');
  if (comps.length === 0) return;

  // Load Styles
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', `${miloLibs}/styles/styles.css`);
  document.head.appendChild(link);

  // Import from Milo
  const { loadArea, setConfig, createTag } = await import(`${miloLibs}/utils/utils.js`);
  setConfig({ ...CONFIG, miloLibs });

  // Iterate through all components
  comps.forEach(async (comp) => {
    const { path, selector } = comp.dataset;

    const url = new URL(path);

    const resp = await fetch(`${path}.plain.html`);
    if (!resp.ok) return;
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const sections = doc.querySelectorAll('body > div');

    const media = doc.querySelectorAll('[srcset^="./"], [src^="./"], [href^="/"]');
    media.forEach((tag) => {
      const srcset = tag.getAttribute('srcset');
      const src = tag.getAttribute('src');
      const { href } = tag;
      if(srcset) {
        tag.setAttribute('srcset', srcset.replace('./', `${url.origin}/`));
      }
      if(src) {
        tag.setAttribute('src', src.replace('./', `${url.origin}/`));
      }
    });

    const fragment = createTag('div', { class: 'fragment' });
    fragment.append(...sections);
    await loadArea(fragment);

    comp.parentElement.append(fragment);
  });
}());