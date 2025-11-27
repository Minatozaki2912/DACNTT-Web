console.log("App.js loaded!");

// ================================
// CẤU HÌNH API (DÙNG PORT 3000 TRỰC TIẾP)
// ================================
const API = "http://localhost:3000/api";

// ================================
// HÀM TIỆN ÍCH
// ================================
function qs(id) {
  return document.getElementById(id);
}

function showError(inputId, errorId, message) {
  const input = qs(inputId);
  const error = qs(errorId);
  if (!input || !error) return;

  input.classList.add("input-error");
  error.textContent = message;
  error.style.display = "block";
}

function clearError(inputId, errorId) {
  const input = qs(inputId);
  const error = qs(errorId);
  if (!input || !error) return;

  input.classList.remove("input-error");
  error.textContent = "";
  error.style.display = "none";
}

// ================================
// VALIDATION RULES
// ================================
const validators = {
  username(v) {
    if (!v) return "Tên đăng nhập không được để trống";
    if (!/^[A-Za-z_][A-Za-z0-9_]{3,19}$/.test(v)) {
      return "Bắt đầu bằng chữ, dài 4–20 ký tự, chỉ gồm chữ, số, _";
    }
    return "";
  },

  email(v) {
    if (!v) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return "Email không hợp lệ";
    }
    return "";
  },

  password(v) {
    if (!v) return "Mật khẩu không được để trống";
    if (v.length < 8) return "Mật khẩu phải ≥ 8 ký tự";
    if (!/[a-z]/.test(v)) return "Phải có ít nhất 1 chữ thường";
    if (!/[A-Z]/.test(v)) return "Phải có ít nhất 1 chữ in hoa";
    if (!/[0-9]/.test(v)) return "Phải có ít nhất 1 số";
    if (!/[!@#$%^&*()_+\-=]/.test(v)) return "Phải có ít nhất 1 ký tự đặc biệt";
    if (/\s/.test(v)) return "Không được chứa khoảng trắng";
    return "";
  },

  confirm(p, c) {
    if (!c) return "Vui lòng nhập lại mật khẩu";
    if (p !== c) return "Mật khẩu xác nhận không trùng khớp";
    return "";
  }
};

// ================================
// PASSWORD STRENGTH METER
// ================================
function updateStrengthMeter(password) {
  const bar = qs("strengthBar");
  if (!bar) return;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=]/.test(password)) score++;

  const percent = (score / 5) * 100;
  bar.style.width = percent + "%";

  if (percent < 40) bar.style.background = "#ef4444";
  else if (percent < 70) bar.style.background = "#f59e0b";
  else bar.style.background = "#22c55e";
}

// ================================
// SHOW/HIDE PASSWORD
// ================================
function initPasswordToggle(inputId, iconId) {
  const input = qs(inputId);
  const icon = qs(iconId);
  if (!input || !icon) return;

  icon.addEventListener("click", () => {
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    icon.classList.toggle("ri-eye-off-line");
    icon.classList.toggle("ri-eye-line");
  });
}

// ================================
// CHECK EMAIL EXISTS
// ================================
async function checkEmailExists(email) {
  try {
    const res = await fetch(`${API}/auth/check-email?email=${email}`);
    const data = await res.json();
    return data.exists;
  } catch {
    return false;
  }
}

// ================================
// LOGIN FORM
// ================================
function initLoginForm() {
  const form = qs("loginForm");
  if (!form) return;

  const user = qs("loginUsername");
  const pass = qs("loginPassword");

  initPasswordToggle("loginPassword", "toggleLoginPass");

  user.addEventListener("input", () => clearError("loginUsername", "loginUserError"));
  pass.addEventListener("input", () => clearError("loginPassword", "loginPassError"));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = user.value.trim();
    const password = pass.value;

    let hasError = false;
    if (!username) {
      showError("loginUsername", "loginUserError", "Vui lòng nhập tên đăng nhập");
      hasError = true;
    }
    if (!password) {
      showError("loginPassword", "loginPassError", "Vui lòng nhập mật khẩu");
      hasError = true;
    }
    if (hasError) return;

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("role", data.user.role);
        
        // [QUAN TRỌNG] Lưu avatar nếu backend có trả về, nếu không dùng ảnh mặc định
        // Giả sử backend trả về data.user.avatar
        const userAvatar = data.user.avatar || "https://i.imgur.com/6VBx3io.png";
        localStorage.setItem("userAvatar", userAvatar);

        Swal.fire({
          icon: "success",
          title: `Chào mừng ${data.user.username}!`,
          showConfirmButton: false,
          timer: 1200
        });

        setTimeout(() => {
          if (data.user.role === "admin") {
            window.location.href = "/src/pages/admin/dashboard.html"; 
          } else {
            window.location.href = "/";
          }
        }, 1200);

      } else {
        Swal.fire("Lỗi", data.message || "Sai tài khoản hoặc mật khẩu", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không thể kết nối đến server", "error");
    }
  });
}

// ================================
// REGISTER FORM
// ================================
function initRegisterForm() {
  const form = qs("registerForm");
  if (!form) return;

  const u = qs("regUsername");
  const e = qs("regEmail");
  const p = qs("regPassword");
  const c = qs("regConfirmPassword");

  initPasswordToggle("regPassword", "toggleRegPass");
  initPasswordToggle("regConfirmPassword", "toggleRegConfirm");

  u.addEventListener("input", () => clearError("regUsername", "regUserError"));
  e.addEventListener("input", () => clearError("regEmail", "regEmailError"));
  p.addEventListener("input", () => {
    clearError("regPassword", "regPassError");
    updateStrengthMeter(p.value);
  });
  c.addEventListener("input", () => clearError("regConfirmPassword", "regConfirmError"));

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const username = u.value.trim();
    const email = e.value.trim();
    const password = p.value.trim();
    const confirm = c.value.trim();

    let userErr = validators.username(username);
    let emailErr = validators.email(email);
    let passErr = validators.password(password);
    let confirmErr = validators.confirm(password, confirm);

    if (userErr) return showError("regUsername", "regUserError", userErr);
    if (emailErr) return showError("regEmail", "regEmailError", emailErr);
    if (passErr) return showError("regPassword", "regPassError", passErr);
    if (confirmErr) return showError("regConfirmPassword", "regConfirmError", confirmErr);

    const exists = await checkEmailExists(email);
    if (exists) {
      showError("regEmail", "regEmailError", "Email đã được đăng ký");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, confirmPassword: confirm })
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Tạo tài khoản thành công!",
          text: "Hãy đăng nhập để tiếp tục.",
          confirmButtonText: "Đăng nhập ngay"
        }).then(() => {
          window.location.href = "/src/pages/login.html";
        });
      } else {
        Swal.fire("Lỗi", data.message || "Đăng ký thất bại", "error");
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể kết nối đến server", "error");
    }
  });
}

// ================================
// NAVBAR + AUTH + AVATAR (QUAN TRỌNG)
// ================================
function initNavbarAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userAvatar = localStorage.getItem("userAvatar"); // Lấy avatar
  
  const loginLink = qs("loginLink");
  const registerLink = qs("registerLink");
  const logoutBtn = qs("logoutBtn");
  const adminLink = qs("adminLink");
  
  // Các phần tử Avatar mới thêm
  const profileNavItem = qs("profileNavItem");
  const navAvatar = qs("navAvatar");

  if (token) {
    // ĐÃ ĐĂNG NHẬP
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block"; // Đổi sang block cho dễ nhìn

    if (role === "admin" && adminLink) {
      adminLink.style.display = "inline-block"; 
    }
    
    // Hiển thị Avatar
    if (profileNavItem) {
      profileNavItem.style.display = "block";
      if (userAvatar && navAvatar) {
        navAvatar.src = userAvatar;
      }
    }

  } else {
    // CHƯA ĐĂNG NHẬP
    if (loginLink) loginLink.style.display = "inline-block";
    if (registerLink) registerLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
    
    // Ẩn Avatar
    if (profileNavItem) profileNavItem.style.display = "none";
  }

  // Xử lý nút Đăng xuất
  if (logoutBtn) {
    // Xóa sự kiện cũ (để tránh bị double click nếu có - cơ chế đơn giản là gán lại)
    // Nhưng với addEventListener ta cần cẩn thận. Ở đây app reload lại trang nên không sao.
    logoutBtn.addEventListener("click", () => {
      localStorage.clear(); // Xóa sạch token, role, avatar...
      window.location.href = "/";
    });
  }
}

// ================================
// HIỂN THỊ SẢN PHẨM THEO DANH MỤC (MỚI)
// ================================
async function loadFeaturedProducts() {
  const container = document.getElementById("homeProductContainer");
  if (!container) return; // Nếu không phải trang chủ thì dừng

  try {
    // 1. Gọi API lấy danh sách sản phẩm
    // Lưu ý: Backend hiện tại đang limit 20 sản phẩm mới nhất.
    // Nếu bạn muốn lấy nhiều hơn để chia danh mục, hãy chỉnh limit ở backend hoặc gọi API search.
    const res = await fetch(`${API}/products`);
    const products = await res.json();

    if (!res.ok) throw new Error("Lỗi tải sản phẩm");

    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = `<p style="text-align:center;">Chưa có sản phẩm nào.</p>`;
      return;
    }

    // 2. Nhóm sản phẩm theo Category
    const grouped = {};
    products.forEach(p => {
      const cat = p.category || "Khác";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(p);
    });

    // 3. Render từng nhóm ra màn hình
    // Duyệt qua từng key (tên danh mục) trong object grouped
    Object.keys(grouped).sort().forEach(categoryName => {
      const items = grouped[categoryName];

      // Tạo phần bao (Section) cho danh mục này
      const section = document.createElement("div");
      section.className = "category-section";
      section.style.marginBottom = "60px"; // Khoảng cách giữa các danh mục

      // Tạo tiêu đề danh mục
      const title = document.createElement("h3");
      title.className = "category-title";
      title.textContent = categoryName;
      // Style trực tiếp hoặc ném vào css
      title.style.fontSize = "24px";
      title.style.fontWeight = "700";
      title.style.color = "#1e293b";
      title.style.marginBottom = "20px";
      title.style.borderLeft = "5px solid #ec4899"; // Điểm nhấn màu hồng
      title.style.paddingLeft = "15px";
      
      // Tạo lưới Grid cho danh mục này
      const grid = document.createElement("div");
      grid.className = "grid"; // Tái sử dụng class .grid trong style.css

      // Render các thẻ sản phẩm (Card) đưa vào Grid
      items.forEach(p => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
        const image = p.image || "https://via.placeholder.com/300x400?text=No+Image";

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <div class="product-img-box">
            <img src="${image}" alt="${p.name}" loading="lazy" />
            <div class="product-overlay">
              <button class="btn-view" onclick="alert('Xem chi tiết: ${p.name}')">Xem ngay</button>
            </div>
          </div>
          <div class="product-info">
            <div class="product-cat">${p.category}</div>
            <h3 class="product-name">${p.name}</h3>
            <div class="product-price">${price}</div>
          </div>
        `;
        grid.appendChild(card);
      });

      // Gắn Tiêu đề và Grid vào Section
      section.appendChild(title);
      section.appendChild(grid);

      // Gắn Section vào Container chính
      container.appendChild(section);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red; text-align:center;">Lỗi kết nối server.</p>`;
  }
}
// ================================
// INIT APP
// ================================
document.addEventListener("DOMContentLoaded", () => {
  initNavbarAuth();
  initLoginForm();
  initRegisterForm();
  loadFeaturedProducts();
});