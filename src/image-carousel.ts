// <image-carousel> — a reusable, framework-agnostic carousel web component.
//
// Usage:
//   <script type="module" src="image-carousel.js"></script>
//   <image-carousel></image-carousel>
//
// Attributes (all optional):
//   interval   Auto-play interval in ms.                     Default: 2000
//   autoplay   Boolean attr. Start auto-playing on load.     Default: off
//   sort       Boolean attr. Sort images by caption (A→Z).   Default: off
//   manifest   URL of a JSON array of filenames.             Default: /images/manifest.json
//   base       Path prepended to each filename.              Default: /images/
//   images     Comma-separated filenames (overrides manifest fetch).
//
// All attributes are reactive — changing them re-renders the carousel.

interface CarouselImage {
  src: string
  alt: string
  caption: string
}

// "linux-commands.jpg" -> "Linux Commands"
function filenameToCaption(filename: string): string {
  return filename
    .replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const STYLES = /* css */ `
  :host {
    display: block;
    --ic-accent: #43a047;
    --ic-accent-dark: #1b5e20;
    --ic-bar-bg: #1a1a1a;
    box-sizing: border-box;
  }
  *, *::before, *::after { box-sizing: border-box; }

  .card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  }
  .stage {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 10;
    background: #111;
    cursor: pointer;
  }
  .stage img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.3s ease;
  }
  .caption {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
    color: #fff;
    padding: 2rem 1.5rem 1rem;
    font-size: 1.1rem;
    font-weight: 500;
  }
  .counter {
    position: absolute;
    top: 0.75rem; right: 0.75rem;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.25rem 0.7rem;
    border-radius: 20px;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--ic-bar-bg);
    padding: 0.8rem 1.25rem;
  }
  .nav {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    font-size: 2.5rem;
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s ease;
    line-height: 1; padding: 0; flex-shrink: 0;
  }
  .nav:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }

  .dots {
    display: flex; gap: 0.5rem; flex: 1;
    justify-content: center; flex-wrap: wrap;
  }
  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.35);
    background: transparent;
    cursor: pointer; padding: 0;
    transition: all 0.2s ease;
  }
  .dot:hover { border-color: rgba(255, 255, 255, 0.7); }
  .dot.active {
    background: var(--ic-accent);
    border-color: var(--ic-accent);
    transform: scale(1.4);
  }

  .play {
    background: linear-gradient(135deg, var(--ic-accent-dark) 0%, var(--ic-accent) 100%);
    color: #fff; border: none;
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    font-size: 0.95rem; font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(67, 160, 71, 0.35);
  }
  .play:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .play:active { transform: translateY(0); }

  .empty {
    padding: 2rem;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 12px;
    color: #555; line-height: 1.7;
  }
  .empty h2 { color: #2c3e50; margin: 0 0 0.5rem; }
  .empty code { background: rgba(0,0,0,0.08); padding: 0 0.3em; border-radius: 4px; }

  /* Lightbox */
  .lightbox {
    position: fixed; inset: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .lb-content {
    position: relative;
    max-width: 95vw; max-height: 90vh;
    display: flex; flex-direction: column; align-items: center;
    animation: zoomIn 0.3s ease;
  }
  .lb-content img {
    max-width: 100%; max-height: 85vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  }
  .lb-caption {
    color: #fff; font-size: 1.5rem; font-weight: 500;
    margin-top: 1.5rem; text-align: center;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  .lb-btn {
    position: fixed;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.3s ease;
    line-height: 1; padding: 0;
    z-index: 10001;
  }
  .lb-close { top: 1.5rem; right: 1.5rem; width: 60px; height: 60px; font-size: 3rem; }
  .lb-close:hover { background: rgba(255, 255, 255, 0.25); transform: rotate(90deg) scale(1.1); }
  .lb-nav { top: 50%; transform: translateY(-50%); width: 70px; height: 70px; font-size: 4rem; }
  .lb-nav:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-50%) scale(1.15); }
  .lb-prev { left: 2rem; }
  .lb-next { right: 2rem; }

  @media (max-width: 768px) {
    .caption { font-size: 0.95rem; padding: 1.5rem 1rem 0.75rem; }
    .nav { width: 36px; height: 36px; font-size: 2rem; }
    .lb-close { top: 1rem; right: 1rem; width: 50px; height: 50px; font-size: 2.5rem; }
    .lb-nav { width: 50px; height: 50px; font-size: 2.5rem; }
    .lb-prev { left: 0.5rem; }
    .lb-next { right: 0.5rem; }
    .lb-caption { font-size: 1.1rem; margin-top: 1rem; }
  }
`

export class ImageCarousel extends HTMLElement {
  static get observedAttributes() {
    return ['interval', 'autoplay', 'sort', 'manifest', 'base', 'images']
  }

  private images: CarouselImage[] = []
  private index = 0
  private autoPlaying = false
  private lightboxOpen = false
  private timer: number | undefined
  private root: ShadowRoot

  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'open' })
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  // ----- attribute helpers -----
  private get interval(): number {
    return Number(this.getAttribute('interval')) || 2000
  }
  private get base(): string {
    const b = this.getAttribute('base') ?? '/images/'
    return b.endsWith('/') ? b : b + '/'
  }
  private get manifestUrl(): string {
    return this.getAttribute('manifest') ?? '/images/manifest.json'
  }
  private get sort(): boolean {
    return this.hasAttribute('sort')
  }

  // ----- lifecycle -----
  connectedCallback() {
    this.autoPlaying = this.hasAttribute('autoplay')
    document.addEventListener('keydown', this.onKeyDown)
    this.loadImages()
  }

  disconnectedCallback() {
    this.stopTimer()
    document.removeEventListener('keydown', this.onKeyDown)
    document.body.style.overflow = ''
  }

  attributeChangedCallback() {
    if (!this.isConnected) return
    this.loadImages()
  }

  // ----- data -----
  private async loadImages() {
    const inline = this.getAttribute('images')
    let files: string[] = []
    if (inline) {
      files = inline.split(',').map(s => s.trim()).filter(Boolean)
    } else {
      try {
        const res = await fetch(this.manifestUrl)
        files = await res.json()
      } catch {
        files = []
      }
    }

    let imgs = files.map(file => ({
      src: `${this.base}${file}`,
      alt: filenameToCaption(file),
      caption: filenameToCaption(file),
    }))
    if (this.sort) imgs = imgs.sort((a, b) => a.caption.localeCompare(b.caption))

    this.images = imgs
    if (this.index >= imgs.length) this.index = 0
    if (this.autoPlaying) this.startTimer()
    this.render()
  }

  // ----- auto-play -----
  private startTimer() {
    this.stopTimer()
    if (this.images.length === 0) return
    this.timer = window.setInterval(() => {
      this.index = (this.index + 1) % this.images.length
      this.render()
    }, this.interval)
  }
  private stopTimer() {
    if (this.timer !== undefined) {
      clearInterval(this.timer)
      this.timer = undefined
    }
  }
  private setAutoPlaying(on: boolean) {
    this.autoPlaying = on
    if (on) this.startTimer()
    else this.stopTimer()
    this.render()
  }

  // ----- navigation -----
  private goTo(i: number) {
    this.index = i
    this.setAutoPlaying(false)
    this.dispatchEvent(new CustomEvent('change', { detail: { index: i }, bubbles: true }))
  }
  private prev() {
    this.goTo(this.index === 0 ? this.images.length - 1 : this.index - 1)
  }
  private next() {
    this.goTo((this.index + 1) % this.images.length)
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.lightboxOpen && e.key === 'Escape') this.closeLightbox()
  }

  private openLightbox() {
    this.lightboxOpen = true
    this.setAutoPlaying(false)
    document.body.style.overflow = 'hidden'
    this.render()
  }
  private closeLightbox() {
    this.lightboxOpen = false
    document.body.style.overflow = ''
    this.render()
  }

  // ----- rendering -----
  private render() {
    if (this.images.length === 0) {
      this.root.innerHTML = `<style>${STYLES}</style>
        <div class="empty">
          <h2>No Images Found</h2>
          <p>Add image files (.jpg, .jpeg, .png, .gif, .webp) and point this
          component at a manifest or set the <code>images</code> attribute.</p>
        </div>`
      return
    }

    const img = this.images[this.index]
    const dots = this.images
      .map((_, i) => `<button class="dot ${i === this.index ? 'active' : ''}" data-go="${i}" aria-label="Go to image ${i + 1}"></button>`)
      .join('')

    this.root.innerHTML = `<style>${STYLES}</style>
      <div class="card">
        <div class="stage" data-action="open">
          <span class="counter">${this.index + 1} / ${this.images.length}</span>
          <img src="${img.src}" alt="${img.alt}">
          <div class="caption">${img.caption}</div>
        </div>
        <div class="bar">
          <button class="nav" data-action="prev" aria-label="Previous image">‹</button>
          <div class="dots">${dots}</div>
          <button class="play" data-action="toggle">${this.autoPlaying ? 'Pause' : 'Play'}</button>
          <button class="nav" data-action="next" aria-label="Next image">›</button>
        </div>
      </div>
      ${this.lightboxOpen ? `
      <div class="lightbox" data-action="close-lb">
        <button class="lb-btn lb-close" data-action="close-lb" aria-label="Close">×</button>
        <div class="lb-content" data-stop>
          <img src="${img.src}" alt="${img.alt}">
          <div class="lb-caption">${img.caption}</div>
        </div>
        <button class="lb-btn lb-nav lb-prev" data-action="prev" aria-label="Previous image">‹</button>
        <button class="lb-btn lb-nav lb-next" data-action="next" aria-label="Next image">›</button>
      </div>` : ''}`

    this.bindEvents()
  }

  private bindEvents() {
    this.root.querySelectorAll<HTMLElement>('[data-go]').forEach(el => {
      el.onclick = () => this.goTo(Number(el.dataset.go))
    })
    this.root.querySelectorAll<HTMLElement>('[data-action]').forEach(el => {
      el.onclick = (e) => {
        const action = el.dataset.action
        if (action === 'close-lb' && (e.target as HTMLElement).closest('[data-stop]')) return
        switch (action) {
          case 'open': this.openLightbox(); break
          case 'close-lb': this.closeLightbox(); break
          case 'prev': e.stopPropagation(); this.prev(); break
          case 'next': e.stopPropagation(); this.next(); break
          case 'toggle': this.setAutoPlaying(!this.autoPlaying); break
        }
      }
    })
  }
}

if (!customElements.get('image-carousel')) {
  customElements.define('image-carousel', ImageCarousel)
}
