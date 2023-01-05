// This file injects milo scripts into head because AEM doesn't support modules

const MILO_SCRIPT = '/etc.clientlibs/dexter/clientlibs/clientlib-milo.min.js';

(async function loader() {
  const comps = document.querySelector('.milo');
  if (comps.length === 0) return;

  let script = document.head.querySelector(`script[src="${MILO_SCRIPT}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'module';
    script.src = MILO_SCRIPT;
    document.head.append(script);
  }
}());