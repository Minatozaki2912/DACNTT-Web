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
// VALIDATION RULES (DÙNG CHO ĐĂNG KÝ)
// ================================
const validators = {
  username(v) {
    if (!v) return "Tên đăng nhập không được để trống";
    // Bắt đầu bằng chữ hoặc _, dài 4–20, không ký tự đặc biệt khác
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
// PASSWORD STRENGTH METER (CHO ĐĂNG KÝ)
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
// CHECK EMAIL TRÙNG (CALL API) – OPTIONAL
// ================================
async function checkEmailExists(email) {
  try {
    const res = await fetch(`${API}/auth/check-email?email=${email}`);
    const data = await res.json();
    return data.exists; // backend trả { exists: true/false }
  } catch {
    return false;
  }
}

// ================================
// LOGIN FORM  (CHỈ CHECK RỖNG, CÒN LẠI BACKEND XỬ LÝ)
// ================================
function initLoginForm() {
  const form = qs("loginForm");
  if (!form) return;

  const user = qs("loginUsername");
  const pass = qs("loginPassword");

  initPasswordToggle("loginPassword", "toggleLoginPass");

  user.addEventListener("input", () =>
    clearError("loginUsername", "loginUserError")
  );
  pass.addEventListener("input", () =>
    clearError("loginPassword", "loginPassError")
  );

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

    // ❗ Không kiểm tra pattern / độ mạnh nữa – để backend quyết định đúng sai
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
        // [THÊM MỚI] Lưu role vào localStorage để dùng sau này
        localStorage.setItem("role", data.user.role); 

        Swal.fire({
          icon: "success",
          title: `Chào mừng ${data.user.username}!`,
          showConfirmButton: false,
          timer: 1200
        });

        // [SỬA LẠI] Logic chuyển hướng dựa trên quyền
        setTimeout(() => {
          if (data.user.role === "admin") {
            // Nếu là admin -> Chuyển sang trang quản trị (bạn cần tạo file này sau)
            window.location.href = "/src/pages/admin/dashboard.html"; 
          } else {
            // Nếu là user thường -> Về trang chủ
            window.location.href = "/";
          }
        }, 1200);

      } else {
        // Backend trả message kiểu: "Sai mật khẩu" / "Tài khoản không tồn tại"
        Swal.fire("Lỗi", data.message || "Sai tài khoản hoặc mật khẩu", "error");
      }
    } catch (err) {
      Swal.fire("Lỗi", "Không thể kết nối đến server", "error");
    }
  });
}

// ================================
// REGISTER FORM (GIỮ VALIDATION MẠNH)
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

  u.addEventListener("input", () =>
    clearError("regUsername", "regUserError")
  );

  e.addEventListener("input", () =>
    clearError("regEmail", "regEmailError")
  );

  p.addEventListener("input", () => {
    clearError("regPassword", "regPassError");
    updateStrengthMeter(p.value);
  });

  c.addEventListener("input", () =>
    clearError("regConfirmPassword", "regConfirmError")
  );

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    const username = u.value.trim();
    const email = e.value.trim();
    const password = p.value.trim();
    const confirm = c.value.trim();

    // 1. Validate client-side
    let userErr = validators.username(username);
    let emailErr = validators.email(email);
    let passErr = validators.password(password);
    let confirmErr = validators.confirm(password, confirm);

    let firstErrorEl = null;

    if (userErr) {
      showError("regUsername", "regUserError", userErr);
      firstErrorEl = firstErrorEl || u;
    }
    if (emailErr) {
      showError("regEmail", "regEmailError", emailErr);
      firstErrorEl = firstErrorEl || e;
    }
    if (passErr) {
      showError("regPassword", "regPassError", passErr);
      firstErrorEl = firstErrorEl || p;
    }
    if (confirmErr) {
      showError("regConfirmPassword", "regConfirmError", confirmErr);
      firstErrorEl = firstErrorEl || c;
    }

    if (firstErrorEl) {
      firstErrorEl.focus();
      return;
    }

    // 2. Check email trùng (nếu backend có API)
    const exists = await checkEmailExists(email);
    if (exists) {
      showError("regEmail", "regEmailError", "Email đã được đăng ký");
      e.focus();
      return;
    }

    // 3. Gửi request đăng ký
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword: confirm
        })
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Tạo tài khoản thành công!",
          text: "Hãy đăng nhập để tiếp tục.",
          confirmButtonText: "Đăng nhập ngay",
          confirmButtonColor: "#6366f1"
        }).then(() => {
          window.location.href = "/pages/login.html";
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
// NAVBAR + LOGOUT
// ================================
// ================================
// TRONG HÀM: initNavbarAuth
// ================================
function initNavbarAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // [THÊM] Lấy role ra
  
  const loginLink = qs("loginLink");
  const registerLink = qs("registerLink");
  const logoutBtn = qs("logoutBtn");
  const adminLink = qs("adminLink"); // [THÊM] Nút link đến trang admin

  if (token) {
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    // [THÊM] Nếu là admin thì hiện nút Admin Dashboard
    if (role === "admin" && adminLink) {
      adminLink.style.display = "inline-block"; 
    }
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (registerLink) registerLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    
    // [THÊM] Ẩn nút admin nếu chưa đăng nhập
    if (adminLink) adminLink.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear(); // Xóa sạch token, username, role
      window.location.href = "/";
    });
  }
}

// ================================
// INIT APP
// ================================
document.addEventListener("DOMContentLoaded", () => {
  initNavbarAuth();
  initLoginForm();
  initRegisterForm();
});
