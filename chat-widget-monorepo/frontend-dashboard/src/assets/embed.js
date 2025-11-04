(function(){
  // Minimal embebido: crea un iframe que apunta a /widget del frontend
  var s = document.currentScript;
  var backend = s && s.getAttribute('data-backend');
  var frontend = s && s.getAttribute('data-frontend');
  var theme = s && s.getAttribute('data-theme') || 'light';

  var origin = frontend || (window.location.origin);
  var apiParam = backend ? ('?api=' + encodeURIComponent(backend)) : '';

  var iframe = document.createElement('iframe');
  iframe.src = origin.replace(/\/$/, '') + '/widget' + apiParam;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '24px';
  iframe.style.right = '24px';
  iframe.style.width = '360px';
  iframe.style.height = '520px';
  iframe.style.border = 'none';
  iframe.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
  iframe.style.borderRadius = '12px';
  iframe.style.zIndex = '2147483647';

  // Botón flotante simple para abrir/cerrar
  var button = document.createElement('button');
  button.innerText = 'Chat';
  button.style.position = 'fixed';
  button.style.bottom = '24px';
  button.style.right = '24px';
  button.style.zIndex = '2147483647';
  button.style.padding = '12px 16px';
  button.style.borderRadius = '24px';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.background = theme === 'dark' ? '#1f1f1f' : '#4f46e5';
  button.style.color = '#fff';
  button.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';

  var open = false;
  iframe.style.display = 'none';

  button.addEventListener('click', function(){
    open = !open;
    iframe.style.display = open ? 'block' : 'none';
    button.innerText = open ? 'Cerrar' : 'Chat';
  });

  document.addEventListener('DOMContentLoaded', function(){
    document.body.appendChild(iframe);
    document.body.appendChild(button);
  });
})();