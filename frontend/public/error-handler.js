window.addEventListener('error', function(e) {
  const err = document.createElement('div');
  err.style.color = 'red';
  err.style.background = 'white';
  err.style.padding = '20px';
  err.style.position = 'fixed';
  err.style.zIndex = '9999';
  err.style.top = '0';
  err.style.left = '0';
  err.textContent = 'ERROR: ' + e.message + ' at ' + e.filename + ':' + e.lineno;
  document.body.appendChild(err);
});
