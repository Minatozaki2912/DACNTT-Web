console.log("App.js loaded!");

// ========================
// NAVBAR LOGIN STATE
// ========================
function initNavbarState() {
  const token = localStorage.getItem("token");
  const loginLink = document.getElementById("loginLink");
  const registerLink = document.getElementById("registerLink");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!loginLink || !registerLink || !logoutBtn) return;

  if (token) {
    loginLink.style.display = "none";
    registerLink.style.display = "none";
    logoutBtn.style.display = "inline";
  }

  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn đăng xuất?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy"
    }).then((r) => {
      if (r.isConfirmed) {
        localStorage.clear();
        Swal.fire("Đã đăng xuất!", "", "success");
        setTimeout(() => (window.location.href = "/src/pages/login.html"), 800);
      }
    });
  });
}


// ========================
// INDEX PAGE – LOAD PRODUCTS
// ========================
async function loadFeaturedProducts() {
  if (!document.getElementById("productGrid")) return;

  try {
    const res = await fetch("http://localhost:3000/api/products");
    const products = await res.json();

    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    products.forEach((p, i) => {
      const card = document.createElement("div");
      card.className = "product-card fade";
      card.style.animationDelay = `${i * 0.1}s`;

      card.innerHTML = `
        <img src="${p.image || 'https://via.placeholder.com/250'}" alt="">
        <h3>${p.name}</h3>
        <p>${p.category}</p>
        <p><b>${p.price.toLocaleString('vi-VN')}₫</b></p>
        <button onclick="alert('Tính năng AI đang phát triển!')">Gợi ý tương tự</button>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Lỗi tải sản phẩm:", e);
  }
}


// ========================
// SEARCH PAGE
// ========================
async function initSearchPage() {
  if (!window.location.pathname.includes("search.html")) return;

  const els = {
    input: document.getElementById("searchInput"),
    btn: document.getElementById("searchBtn"),
    grid: document.getElementById("grid"),
    meta: document.getElementById("meta"),
    cat: document.getElementById("categorySelect"),
    min: document.getElementById("minPrice"),
    max: document.getElementById("maxPrice"),
    sort: document.getElementById("sortSelect"),
    upload: document.getElementById("imageUpload")
  };

  const showLoading = (v) => {
    if (v) {
      const L = document.createElement("div");
      L.className = "loading";
      L.id = "loading";
      L.innerHTML = `<div class="spinner"></div>`;
      document.body.appendChild(L);
    } else {
      document.getElementById("loading")?.remove();
    }
  };

  async function loadCategories() {
    const res = await fetch("http://localhost:3000/api/products/categories");
    const data = await res.json();
    els.cat.innerHTML = `<option value="">Tất cả danh mục</option>` +
      data.map((c) => `<option>${c}</option>`).join("");
  }

  async function doSearch() {
    showLoading(true);

    const params = new URLSearchParams({
      q: els.input.value,
      category: els.cat.value,
      min: els.min.value,
      max: els.max.value,
      sort: els.sort.value
    });

    const res = await fetch("http://localhost:3000/api/products/search?" + params.toString());
    const data = await res.json();

    showLoading(false);

    els.meta.innerHTML = data.total
      ? `Tìm thấy <b>${data.total}</b> kết quả`
      : "Không tìm thấy sản phẩm";

    els.grid.innerHTML = "";

    data.items.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.category}</p>
        <p><b>${p.price.toLocaleString('vi-VN')}₫</b></p>
      `;
      els.grid.appendChild(card);
    });
  }

  // Search events
  els.btn.onclick = doSearch;
  els.input.addEventListener("keypress", (e) => e.key === "Enter" && doSearch());
  els.cat.onchange = els.min.onchange = els.max.onchange = els.sort.onchange = doSearch;

  // IMAGE SEARCH
  els.upload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showLoading(true);

    const fd = new FormData();
    fd.append("image", file);

    const res = await fetch("http://localhost:3000/api/products/search-image", {
      method: "POST",
      body: fd
    });

    const data = await res.json();
    showLoading(false);

    els.meta.innerHTML = `Kết quả tương tự hình ảnh: <b>${data.total}</b>`;

    els.grid.innerHTML = data.items.map((p) => `
      <div class="card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.category}</p>
        <p><b>${p.price.toLocaleString('vi-VN')}₫</b></p>
      </div>
    `).join("");
  });

  await loadCategories();
}


// ========================
// AUTO INIT PAGE
// ========================
initNavbarState();
loadFeaturedProducts();
initSearchPage();

