// The header is see-through over the hero and turns solid the moment the page leaves the top.
const nav = document.querySelector('.nav')
const marker = Object.assign(document.createElement('div'), { className: 'nav-marker' })
marker.setAttribute('aria-hidden', 'true')
document.body.prepend(marker)
new IntersectionObserver(([e]) => nav.classList.toggle('solid', !e.isIntersecting)).observe(marker)
