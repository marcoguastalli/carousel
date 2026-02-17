// Shared header component
export function createHeader() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <meta charset="UTF-8" />
    <meta name="robots" content="noindex">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="/styles.css">
    <nav class="nav-container">
      <div class="nav-brand">
        <a href="/">carousel</a>
      </div>
      <ul class="nav-menu">
        <li><a href="/" class="nav-link">Home</a></li>
      </ul>
    </nav>
  `;
  return header;
}

// Auto-insert header if this script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', insertHeader);
} else {
  insertHeader();
}

function insertHeader() {
  const body = document.body;
  const header = createHeader();
  body.insertBefore(header, body.firstChild);

  // Highlight active page
  highlightActivePage();
}

function highlightActivePage() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-link');

  links.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/index.html')) {
      link.classList.add('active');
    }
  });
}
