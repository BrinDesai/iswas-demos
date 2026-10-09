const PIECES = [
  {
    slug: 'hoodie',
    name: 'Denim Hoodie',
    price: '₹9,800',
    desc: 'Washed indigo denim hoodie with drawstring hood, patchwork panels and dark ribbed cuffs. Cut relaxed, garment-dyed for a lived-in wash.',
  },
  {
    slug: 'boro-dress',
    name: 'Blues Boro Dress',
    price: '₹14,000',
    desc: 'Knee-length dress pieced from boro-style panels of washed indigo and chambray. Short sleeves, relaxed fit, every seam visible.',
  },
  {
    slug: 'indigo-tee',
    name: 'Indigo Tee',
    price: '₹6,800',
    desc: 'Boxy short-sleeve tee in deep indigo dyed cotton. Garment-dyed, pre-shrunk, cut with a dropped shoulder.',
  },
  {
    slug: 'u-dress',
    name: 'Denim U-Dress',
    price: '₹14,000',
    desc: 'Washed grey-blue denim midi with a deep U back neckline and three-quarter sleeves. Relaxed A-line, softens with wear.',
  },
  {
    slug: 'boat-neck-dress',
    name: 'Navy Boat-Neck Dress',
    price: '₹14,000',
    desc: 'Deep navy boat-neck midi in soft washed cotton. Three-quarter sleeves, easy A-line silhouette.',
  },
  {
    slug: 'quilted-jacket',
    name: 'Beige Quilted Jacket',
    price: '₹11,000',
    desc: 'Natural beige quilted jacket with diamond stitching, shawl collar and side slits. Relaxed fit, lightly padded.',
  },
  {
    slug: 'greys-boro',
    name: 'Greys Boro Dress',
    price: '₹14,000',
    desc: 'Knee-length dress pieced from boro-style panels in grey, charcoal and off-white. Three-quarter sleeves, round neckline.',
  },
  {
    slug: 'marbled-smock',
    name: 'Marbled Smock Dress',
    price: '₹14,000',
    desc: 'Loose smock dress in dark indigo with a marbled wash texture, band collar and brown underlayer at the hem.',
  },
  {
    slug: 'striped-pant',
    name: 'Striped Pant',
    price: '₹8,500',
    desc: 'Wide-leg trousers in grey with thin vertical pinstripes. Elastic drawstring waist, relaxed through the leg.',
  },
  {
    slug: 'gold-tote',
    name: 'Gold Tote',
    price: '₹6,500',
    desc: 'Mustard-gold tote with navy dashed-stripe woven handles and navy lining. Fits the daily carry.',
  },
];

const FRAMES = ['side', 'mid', 'front']; // resting -> facing

// hook-tip offset per frame, as a fraction of image height (measured from cutouts)
const TIE = {"hoodie-side":0.0773,"hoodie-mid":0.0839,"hoodie-front":0.0998,"boro-dress-side":0.0219,"boro-dress-mid":0.0247,"boro-dress-front":0.0148,"indigo-tee-side":0.0718,"indigo-tee-mid":0.0779,"indigo-tee-front":0.0806,"u-dress-side":0.034,"u-dress-mid":0.0345,"u-dress-front":0.0345,"boat-neck-dress-side":0.0373,"boat-neck-dress-mid":0.0417,"boat-neck-dress-front":0.0395,"quilted-jacket-side":0.1125,"quilted-jacket-mid":0.1125,"quilted-jacket-front":0.112,"greys-boro-side":0.0138,"greys-boro-mid":0.0137,"greys-boro-front":0.0142,"marbled-smock-side":0.062,"marbled-smock-mid":0.0554,"marbled-smock-front":0.062,"striped-pant-side":0.0307,"striped-pant-mid":0.0285,"striped-pant-front":0.0307,"gold-tote-side":0.0367,"gold-tote-mid":0.0345,"gold-tote-front":0.04};
const RAIL_Y = 26; // px from rack top to rail center-line

const rack = document.getElementById('rack');
const rail = rack.querySelector('.rail');
const mobileMQ = window.matchMedia('(max-width:760px)');
const TOUCH = window.matchMedia('(pointer:coarse)').matches;

// on mobile the rail must span the full scrollable width, not just the viewport
function fitRail() {
  rail.style.width = mobileMQ.matches ? rack.scrollWidth + 'px' : '';
}
window.addEventListener('load', fitRail);

// pull each garment up so its hanger hook tip sits exactly on the rail
function align(el, p) {
  const img = el._img;
  if (!img.clientHeight) return;
  const frac = TIE[`${p.slug}-${FRAMES[el._frame]}`] || 0;
  img.style.marginTop = (RAIL_Y - img.clientHeight * frac) + 'px';
}
window.addEventListener('resize', () => {
  fitRail();
  document.querySelectorAll('.garment').forEach((el, i) => align(el, PIECES[i]));
});

// preload everything
PIECES.forEach(p => {
  p.imgs = FRAMES.map(f => {
    const im = new Image();
    im.src = `assets/${p.slug}-${f}.png`;
    return im;
  });
});

PIECES.forEach(p => {
  const el = document.createElement('div');
  el.className = 'garment';
  el.innerHTML = `
    <img alt="${p.name} — AI concept render" draggable="false">
    <div class="cap"><div class="n">${p.name}</div><div class="p">${p.price}</div></div>
    <div class="hint">${TOUCH ? 'tap to turn' : 'hover to turn'}</div>`;
  const img = el.querySelector('img');
  img.addEventListener('load', () => align(el, p));
  img.src = p.imgs[0].src; // rest in side profile
  el._img = img;
  el._frame = 0;
  el._token = 0;

  const step = ms => new Promise(r => setTimeout(r, ms));

  async function turn(toFront) {
    const my = ++el._token;
    el._busy = true;
    try {
      const seq = toFront ? [1, 2] : [1, 0];
      for (const f of seq) {
        if (my !== el._token) return;
        el.classList.add('squeeze');
        await step(130);
        if (my !== el._token) return;
        el._frame = f;
        el.classList.toggle('turned', f !== 0);
        img.src = p.imgs[f].src;
        el.classList.remove('squeeze');
        align(el, p);
        await step(60);
      }
    } finally {
      if (my === el._token) el._busy = false;
    }
  }

  if (!TOUCH) {
    el.addEventListener('mouseenter', () => turn(true));
    el.addEventListener('mouseleave', () => turn(false));
  }
  // touch: tap toggles the turn; second tap (even a fast double-tap) opens detail.
  // a swipe across the rack never counts as a tap.
  let tx = 0, ty = 0;
  el.addEventListener('touchstart', e => {
    const t = e.touches[0]; tx = t.clientX; ty = t.clientY;
  }, {passive: true});
  el.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    if (Math.hypot(t.clientX - tx, t.clientY - ty) > 12) el._swiped = true;
  }, {passive: true});
  el.addEventListener('click', () => {
    if (el._swiped) { el._swiped = false; return; }
    if (el._frame === 2 && !el._busy) { openDrawer(p); return; }
    if (el._busy) {
      el._token++; // cancel the in-flight turn
      el._busy = false;
      el._frame = 2;
      el.classList.add('turned');
      el.classList.remove('squeeze');
      img.src = p.imgs[2].src;
      align(el, p);
      openDrawer(p);
      return;
    }
    turn(true);
  });

  rack.appendChild(el);
});

// ---------- detail drawer ----------
const drawer = document.getElementById('drawer');
function openDrawer(p) {
  document.getElementById('drawerImg').src = `assets/${p.slug}-front.png`;
  document.getElementById('drawerImg').alt = p.name;
  document.getElementById('drawerName').textContent = p.name;
  document.getElementById('drawerPrice').textContent = p.price;
  document.getElementById('drawerDesc').textContent = p.desc;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
}
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawer.addEventListener('click', e => { if (e.target === drawer) closeDrawer(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
