async function loadProducts() {
  const res = await fetch("http://localhost:3000/api/products");
  const data = await res.json();

  const container = document.getElementById("product-list");
  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <button onclick="showRecs(${p.id})">Gợi ý tương tự</button>
    `;
    container.appendChild(card);
  });
}

async function showRecs(id) {
  const res = await fetch(`http://localhost:3000/api/recommend/${id}`);
  const recs = await res.json();
  alert("Sản phẩm tương tự: " + recs.map(r => r.name).join(", "));
}

loadProducts();
