/* script.js — vanilla JS for interactivity (search, filters, cart, newsletter) */
document.addEventListener('DOMContentLoaded', () => {
    // sample product data
    const products = [
      { id: 'p1', title: 'Silk Evening Gown', cat:'women', price:250, img:'assets/img2.jpg' },
      { id: 'p2', title: 'Tailored Blazer', cat:'men', price:180, img:'assets/img3.jpg' },
      { id: 'p3', title: 'Kids Party Dress', cat:'kids', price:75, img:'assets/img4.jpg' },
      { id: 'p4', title: 'Bridal Embroidered Lehenga', cat:'bridal', price:1200, img:'assets/img5.jpg' },
      { id: 'p5', title: 'Luxury Shirt', cat:'men', price:120, img:'assets/img6.jpg' },
      { id: 'p6', title: 'Cocktail Dress', cat:'women', price:320, img:'assets/img7.jpg' },
      { id: 'p7', title: 'Kids Formal Set', cat:'kids', price:65, img:'assets/img8.jpg' },
      { id: 'p8', title: 'Classic Sherwani', cat:'bridal', price:850, img:'assets/img9.jpg'},
    ];
  
    // DOM refs
    const productsGrid = document.getElementById('productsGrid');
    const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const newsletterForm = document.getElementById('newsletterForm');
    const yearEl = document.getElementById('year');
  
    yearEl.textContent = new Date().getFullYear();
  
    // Cart state (simple local front-end)
    let cart = JSON.parse(localStorage.getItem('alawan_cart') || '[]');
  
    function saveCart(){
      localStorage.setItem('alawan_cart', JSON.stringify(cart));
      renderCartCount();
      renderCart();
    }
  
    function renderProducts(list){
      productsGrid.innerHTML = '';
      list.forEach(p => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.cat = p.cat;
        card.dataset.price = p.price;
        card.innerHTML = `
          <img src="${p.img}" alt="${escapeHtml(p.title)}">
          <div class="card-body">
            <h3 class="product-title">${escapeHtml(p.title)}</h3>
            <p class="product-cat">${capitalize(p.cat)} — Collection</p>
            <div class="product-meta">
              <span class="price">£${Number(p.price).toFixed(2)}</span>
              <button class="btn btn-outline add-to-cart" data-id="${p.id}">Add to cart</button>
            </div>
          </div>
        `;
        productsGrid.appendChild(card);
      });
    }
  
    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1) }
  
    // initial render
    renderProducts(products);
    renderCartCount();
    renderCart();
  
    // Filter logic
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });
    });
  
    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);
  
    function applyFilters(){
      const cat = document.querySelector('.filter-btn.active').dataset.cat;
      const q = searchInput.value.trim().toLowerCase();
      let list = products.filter(p => (cat === 'all' ? true : p.cat === cat));
      if(q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
      const sort = sortSelect.value;
      if(sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
      if(sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
      renderProducts(list);
    }
  
    // Delegate add-to-cart clicks
    productsGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.add-to-cart');
      if(!btn) return;
      const id = btn.dataset.id;
      addToCart(id);
    });
  
    function addToCart(id){
      const product = products.find(p=>p.id===id);
      if(!product) return;
      const item = cart.find(c=>c.id===id);
      if(item) item.qty += 1;
      else cart.push({ id: product.id, title: product.title, price: product.price, img: product.img, qty: 1 });
      saveCart();
      flashMessage('Added to cart');
    }
  
    function renderCart(){
      cartItemsEl.innerHTML = '';
      if(cart.length === 0){
        cartItemsEl.innerHTML = '<p class="empty">Your cart is empty.</p>';
      } else {
        cart.forEach(item => {
          const el = document.createElement('div');
          el.className = 'cart-item';
          el.innerHTML = `
            <img src="${item.img}" alt="${escapeHtml(item.title)}">
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <strong>${escapeHtml(item.title)}</strong>
                <span>£${(item.price * item.qty).toFixed(2)}</span>
              </div>
              <div style="display:flex;gap:.5rem;align-items:center;margin-top:.35rem">
                <label style="font-size:.85rem;color:var(--muted)">Qty</label>
                <input type="number" min="1" value="${item.qty}" data-id="${item.id}" class="cart-qty" style="width:72px;padding:.3rem;border-radius:6px;border:1px solid rgba(0,0,0,0.06)">
                <button class="btn btn-outline remove-item" data-id="${item.id}" style="margin-left:auto">Remove</button>
              </div>
            </div>
          `;
          cartItemsEl.appendChild(el);
        });
      }
      updateTotal();
    }
  
    // Update cart count
    function renderCartCount(){
      const count = cart.reduce((s,i)=>s+i.qty,0);
      cartCountEl.textContent = count;
    }
  
    function updateTotal(){
      const total = cart.reduce((s,i)=>s + i.price * i.qty, 0);
      cartTotalEl.textContent = `£${total.toFixed(2)}`;
    }
  
    // Cart open/close
    cartBtn.addEventListener('click', () => {
      openCart();
    });
    closeCart.addEventListener('click', closeCartModal);
    function openCart(){ cartModal.setAttribute('aria-hidden','false'); }
    function closeCartModal(){ cartModal.setAttribute('aria-hidden','true'); }
  
    // delegate cart item actions
    cartItemsEl.addEventListener('click', (e) => {
      const rem = e.target.closest('.remove-item');
      if(rem){ removeFromCart(rem.dataset.id); }
    });
  
    cartItemsEl.addEventListener('change', (e) => {
      if(e.target.matches('.cart-qty')){
        const id = e.target.dataset.id;
        let val = parseInt(e.target.value) || 1;
        if(val < 1) val = 1;
        const item = cart.find(c=>c.id===id);
        if(item){ item.qty = val; saveCart(); }
      }
    });
  
    function removeFromCart(id){
      cart = cart.filter(c=>c.id!==id);
      saveCart();
      flashMessage('Removed from cart');
    }
  
    clearCartBtn.addEventListener('click', () => {
      if(!confirm('Clear cart?')) return;
      cart = []; saveCart();
    });
  
    checkoutBtn.addEventListener('click', () => {
      if(cart.length===0){ alert('Your cart is empty'); return; }
      // Front-end only: simulate checkout
      alert('Checkout simulated — this demo does not process payments.'); 
      cart = []; saveCart(); closeCartModal();
    });
  
    // newsletter
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail').value.trim();
      if(!validateEmail(email)){ flashMessage('Please provide a valid email'); return; }
      // simulate subscribe
      flashMessage('Thanks! You are subscribed.');
      newsletterForm.reset();
    });
  
    function validateEmail(email){
      return /\S+@\S+\.\S+/.test(email);
    }
  
    // small utilities
    function flashMessage(txt){
      const el = document.createElement('div');
      el.textContent = txt;
      el.style.position = 'fixed';
      el.style.right = '1rem';
      el.style.bottom = '1rem';
      el.style.background = '#111';
      el.style.color = '#fff';
      el.style.padding = '.6rem .9rem';
      el.style.borderRadius = '10px';
      el.style.zIndex = 9999;
      document.body.appendChild(el);
      setTimeout(()=> el.style.opacity = '0', 1600);
      setTimeout(()=> el.remove(), 2200);
    }
  
    // menu toggle for small screens
    const menuBtn = document.getElementById('menuBtn');
    menuBtn.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if(nav.style.display === 'block'){ nav.style.display = ''; }
      else { nav.style.display = 'block'; }
    });
  
    // delegate add-to-cart produced after re-rendering products
    // watch for dynamic changes (mutation) — simpler: rebind on focus/interaction by using event delegation (we already use delegation on productsGrid)
  
    // save cart when qty input changed (we already do in change handler)
    // ensure localStorage cart loads on start
    saveCart();
  });
  