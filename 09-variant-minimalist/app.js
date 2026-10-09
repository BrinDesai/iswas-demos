/* artscience-v1 — shared interactions. Front-end demo state only. */
(function(){
"use strict";
const $=(s,c)=>(c||document).querySelector(s), $$=(s,c)=>Array.from((c||document).querySelectorAll(s));

/* ---------- cart state ---------- */
const KEY='iswas_cart_v1';
const getCart=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return[]}};
const setCart=c=>{localStorage.setItem(KEY,JSON.stringify(c));renderCart()};
const cartCount=()=>getCart().reduce((n,l)=>n+l.qty,0);
const money=n=>'₹'+n.toLocaleString('en-IN');

function addToCart(item){
  const cart=getCart();
  const found=cart.find(l=>l.id===item.id&&l.size===item.size&&l.colour===item.colour);
  if(found)found.qty+=item.qty;else cart.push(item);
  setCart(cart);openDrawer();
  const note=$('#cart-note');if(note){note.textContent='Item added to your cart';note.style.display='block';setTimeout(()=>note.style.display='none',2200);}
}
function renderCart(){
  const cart=getCart(),body=$('#cart-lines'),foot=$('#cart-foot');
  $$('.cart-count').forEach(el=>el.textContent=cartCount());
  if(!body)return;
  if(!cart.length){
    body.innerHTML='<div class="cart-empty">Your cart is empty</div>';foot.style.display='none';return;
  }
  foot.style.display='block';
  body.innerHTML=cart.map((l,i)=>`
    <div class="cart-line" data-i="${i}">
      <img src="${l.img}" alt="${l.name}">
      <div><div class="nm">${l.name}</div>
      <div class="meta">${l.colour}${l.size?' / Size '+l.size:''}</div>
      <div class="pr">${money(l.price)}</div>
      <div class="stepper"><button data-a="dec" aria-label="decrease">−</button><span>${l.qty}</span><button data-a="inc" aria-label="increase">+</button></div>
      <a class="rm" data-a="rm">Remove</a></div>
    </div>`).join('');
  const total=cart.reduce((s,l)=>s+l.price*l.qty,0);
  $('#cart-total').textContent=money(total);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b)return;
  const line=e.target.closest('.cart-line');if(!line)return;
  const i=+line.dataset.i,cart=getCart();
  if(b.dataset.a==='inc')cart[i].qty++;
  if(b.dataset.a==='dec')cart[i].qty=Math.max(1,cart[i].qty-1);
  if(b.dataset.a==='rm')cart.splice(i,1);
  setCart(cart);
});

/* ---------- drawer / overlays ---------- */
function lock(v){document.body.style.overflow=v?'hidden':''}
function openDrawer(){renderCart();$('#scrim').classList.add('show');$('#drawer').classList.add('show');lock(true)}
function closeDrawer(){$('#scrim').classList.remove('show');$('#drawer').classList.remove('show');lock(false)}
function openModal(id){$('#ov-'+id).classList.add('show');lock(true)}
function closeModals(){$$('.overlay').forEach(o=>o.classList.remove('show'));lock(false)}

document.addEventListener('click',e=>{
  const t=e.target;
  if(t.closest('#cart-open')){e.preventDefault();openDrawer()}
  if(t.closest('#drawer-x')||t.id==='scrim')closeDrawer();
  if(t.closest('[data-modal]')){e.preventDefault();closeModals();openModal(t.closest('[data-modal]').dataset.modal)}
  if(t.closest('.overlay .x')||t.classList.contains('overlay'))closeModals();
  if(t.closest('#search-open')){$('#searchbar').classList.toggle('open')}
  if(t.closest('#search-x')){$('#searchbar').classList.remove('open')}
  if(t.closest('#nl-x')){$('#nl-popup').classList.remove('show');try{localStorage.setItem('iswas_nl','1')}catch(_){}}
  if(t.closest('.cookie-bar [data-c]')){$('#cookiebar').classList.remove('show');try{localStorage.setItem('iswas_ck','1')}catch(_){}}
  if(t.closest('#chat-open')){e.preventDefault();closeModals();openModal('contact')}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeDrawer();closeModals();const lb=$('#lightbox');if(lb)lb.classList.remove('show');const mn=$('#mnav');if(mn)mn.classList.remove('show');lock(false)}
});

/* ---------- mobile nav ---------- */
const mnav=$('#mnav');
document.addEventListener('click',e=>{
  if(!mnav)return;
  if(e.target.closest('#burger')){mnav.classList.add('show');lock(true);return}
  if(e.target.closest('#mnav-x')){mnav.classList.remove('show');lock(false);return}
  const head=e.target.closest('.mnav-acc-head');
  if(head){head.parentElement.classList.toggle('open');return}
  if(e.target.closest('.mnav a')){mnav.classList.remove('show');if(!e.target.closest('[data-modal]'))lock(false)}
});
document.addEventListener('submit',e=>{
  if(e.target.matches('form[data-demo]')){e.preventDefault();
    const btn=e.target.querySelector('button[type=submit],.btn-solid,.btn-line');
    if(btn){const o=btn.textContent;btn.textContent='Done';setTimeout(()=>btn.textContent=o,1600)}
    if(e.target.id==='nl-form-inline'||e.target.id==='nl-form-pop'){$('#nl-popup').classList.remove('show');try{localStorage.setItem('iswas_nl','1')}catch(_){}}
  }
});

/* ---------- newsletter popup + cookie bar (first load) ---------- */
window.addEventListener('load',()=>{
  let nl=1,ck=1;try{nl=localStorage.getItem('iswas_nl');ck=localStorage.getItem('iswas_ck')}catch(_){}
  if(!nl&&$('#nl-popup'))setTimeout(()=>$('#nl-popup').classList.add('show'),1200);
  if(!ck&&$('#cookiebar'))setTimeout(()=>$('#cookiebar').classList.add('show'),600);
});

/* ---------- generic carousel ---------- */
$$('[data-car]').forEach(w=>{
  const track=$(w.dataset.car);if(!track)return;
  const step=()=>{const card=track.querySelector(':scope > *');return card?card.getBoundingClientRect().width+24:300};
  $('.chev.prev',w)?.addEventListener('click',()=>track.scrollBy({left:-step()*(+w.dataset.by||1),behavior:'smooth'}));
  $('.chev.next',w)?.addEventListener('click',()=>{track.scrollBy({left:step()*(+w.dataset.by||1),behavior:'smooth'});syncDots()});
  const dots=$('.dots',w);
  function syncDots(){if(!dots)return;const pages=Math.ceil(track.scrollWidth/track.clientWidth);const p=Math.min(pages-1,Math.round(track.scrollLeft/track.clientWidth));$$('button',dots).forEach((d,i)=>d.classList.toggle('on',i===p))}
  if(dots){const pages=Math.max(1,Math.ceil(track.scrollWidth/track.clientWidth));dots.innerHTML=Array.from({length:pages},(_,i)=>`<button class="${i===0?'on':''}" aria-label="page ${i+1}"></button>`).join('');
    $$('button',dots).forEach((d,i)=>d.addEventListener('click',()=>{track.scrollTo({left:i*track.clientWidth,behavior:'smooth'});syncDots()}));
    track.addEventListener('scroll',()=>requestAnimationFrame(syncDots),{passive:true});
  }
});

/* ---------- fabric stepper (meta + image stay in sync) ---------- */
const fMeta=$$('.fabric > div:first-child .fabric-slide'), fView=$$('.fabric-view .fabric-slide');
const fN=Math.max(fMeta.length,fView.length);let fi=0;
function showFabric(n){
  if(!fN)return;
  fi=(n+fN)%fN;
  fMeta.forEach((f,i)=>f.style.display=i===fi?'':'none');
  fView.forEach((f,i)=>f.style.display=i===fi?'':'none');
}
$$('#fabric-prev').forEach(b=>b.addEventListener('click',()=>showFabric(fi-1)));
$$('#fabric-next').forEach(b=>b.addEventListener('click',()=>showFabric(fi+1)));
showFabric(0);

/* ---------- product page ---------- */
$$('.swatch').forEach(s=>s.addEventListener('click',()=>{
  $$('.swatch').forEach(x=>x.classList.remove('on'));s.classList.add('on');
  const l=$('#colour-name');if(l)l.innerHTML='Colour : <span>'+s.dataset.name+'</span>';
}));
$$('.size-btn').forEach(s=>s.addEventListener('click',()=>{
  $$('.size-btn').forEach(x=>x.classList.remove('on'));s.classList.add('on');
}));
$('#wish-btn')?.addEventListener('click',function(){this.classList.toggle('on')});
$$('.tabs button').forEach(b=>b.addEventListener('click',()=>{
  $$('.tabs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
  $$('.tabpane').forEach(p=>p.classList.toggle('on',p.id==='tab-'+b.dataset.tab));
}));
/* gallery */
const mainImg=$('#pd-main-img'),thumbs=$$('.thumbs button');let gi=0;
function setImg(i){if(!thumbs.length)return;gi=(i+thumbs.length)%thumbs.length;
  thumbs.forEach((t,k)=>t.classList.toggle('on',k===gi));
  mainImg.src=thumbs[gi].dataset.full||thumbs[gi].querySelector('img').src;
  const lb=$('#lightbox img');if(lb)lb.src=mainImg.src;
}
thumbs.forEach((t,i)=>t.addEventListener('click',()=>setImg(i)));
$('#pd-prev')?.addEventListener('click',e=>{e.stopPropagation();setImg(gi-1)});
$('#pd-next')?.addEventListener('click',e=>{e.stopPropagation();setImg(gi+1)});
$('#pd-main')?.addEventListener('click',()=>{const lb=$('#lightbox');if(lb){lb.classList.add('show');lock(true)}});
$('#lb-x')?.addEventListener('click',()=>{$('#lightbox').classList.remove('show');lock(false)});
$('#lb-prev')?.addEventListener('click',e=>{e.stopPropagation();setImg(gi-1)});
$('#lb-next')?.addEventListener('click',e=>{e.stopPropagation();setImg(gi+1)});
$('#lightbox')?.addEventListener('click',e=>{if(e.target.id==='lightbox'){$('#lightbox').classList.remove('show');lock(false)}});
/* add to cart (product page) */
$('#add-cart')?.addEventListener('click',()=>{
  const size=($('.size-btn.on')||{}).textContent||'M';
  const colour=($('.swatch.on')||{}).dataset?.name||'Beige';
  addToCart({id:'beige-quilted-jacket',name:'BEIGE QUILTED JACKET',price:11000,qty:1,size,colour,img:'../shared-assets/beige-quilted-jacket-1.jpg'});
});

renderCart();
window.iswas={addToCart,renderCart,openDrawer};
})();
