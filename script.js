const API = "https://script.google.com/macros/s/AKfycbxE75ofD7QkdWE3ONjNmIyd1u_-U1wqQy3ck4JH8l4UPlBSmAMkB2TUx-woqL0kFS25OQ/exec";

let DATA = {};
let CART = JSON.parse(localStorage.getItem("cart")) || [];
const INVOICE = "INV-" + Date.now();

// DOM elements
const CATEGORY = document.getElementById("CATEGORY");
const PRODUCT = document.getElementById("PRODUCT");
const QTY = document.getElementById("QTY");
const PREVIEWPRICE = document.getElementById("PREVIEWPRICE");

const NAME = document.getElementById("NAME");
const PHONE = document.getElementById("PHONE");
const EMAIL = document.getElementById("EMAIL");

const CARTITEMS = document.getElementById("CARTITEMS");
const SUBTOTAL = document.getElementById("SUBTOTAL");
const VAT = document.getElementById("VAT");
const TOTAL = document.getElementById("TOTAL");
const ADD_BTN = document.getElementById("ADD_BTN");

// Initialize
async function init() {
  const res = await fetch(API + "?t=" + Date.now());
  DATA = await res.json();
  CATEGORY.innerHTML = "";
  for (let c in DATA) CATEGORY.innerHTML += `<option>${c}</option>`;
  loadProducts();
  render();
}

function loadProducts() {
  PRODUCT.innerHTML = "";
  DATA[CATEGORY.value].products
    .filter(p => p.qty > 0)
    .forEach(p => PRODUCT.innerHTML += `<option>${p.name}</option>`);
  updatePreview();
}

function updatePreview() {
  PREVIEWPRICE.innerText = (DATA[CATEGORY.value].price * QTY.value).toFixed(2);
}

// Event listeners
CATEGORY.onchange = () => { loadProducts(); }
QTY.oninput = updatePreview;

// Add to cart
ADD_BTN.onclick = () => {
  if (!NAME.value || !PHONE.value) {
    alert("Please fill in your personal details above before adding to cart.");
    return;
  }

  const selectedCategory = CATEGORY.value;
  const selectedProduct = PRODUCT.value;
  const qty = parseInt(QTY.value);
  const stock = DATA[selectedCategory].products.find(p => p.name === selectedProduct).qty;

  if (qty > stock) {
    alert(`Please enter a quantity less than or equal to available stock (${stock})`);
    return;
  }

  // Add to cart
  CART.push({
    cat: selectedCategory,
    prod: selectedProduct,
    qty: qty,
    price: DATA[selectedCategory].price
  });

  localStorage.setItem("cart", JSON.stringify(CART));
  render();
}

// Render cart
function render() {
  CARTITEMS.innerHTML = "";
  let subtotal = 0;

  CART.forEach((item, index) => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <b>${item.cat}</b><br>${item.prod} <br>
      £${item.price.toFixed(2)} × ${item.qty} = £${lineTotal.toFixed(2)}
      <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
    `;
    CARTITEMS.appendChild(div);
  });

  SUBTOTAL.innerText = subtotal.toFixed(2);
  const vat = subtotal * 0.2;
  VAT.innerText = vat.toFixed(2);
  TOTAL.innerText = (subtotal + vat).toFixed(2);
}

// Remove from cart
function removeFromCart(index) {
  CART.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(CART));
  render();
}

// Build full invoice message for PDF / WhatsApp / Email
function buildInvoiceText() {
  let text = `ZIA DISTRIBUTOR LTD ORDER\nINVOICE: ${INVOICE}\n\nCUSTOMER DETAILS:\n`;
  text += `Name: ${NAME.value}\nPhone: ${PHONE.value}\nEmail: ${EMAIL.value}\n\n`;
  text += "ITEMS:\n";
  CART.forEach(i => {
    text += `${i.cat} - ${i.prod} (${i.qty}) £${(i.price * i.qty).toFixed(2)}\n`;
  });
  text += `\nSUBTOTAL: £${SUBTOTAL.innerText}\nVAT: £${VAT.innerText}\nFINAL TOTAL: £${TOTAL.innerText}`;
  return text;
}

// PDF download
function GENERATEPDF() {
  if (!CART.length) { alert("Cart is empty!"); return; }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text("ZIA DISTRIBUTOR LTD ORDER", 14, 15);
  pdf.text(`INVOICE: ${INVOICE}`, 14, 22);
  pdf.text(`NAME: ${NAME.value}`, 14, 29);
  pdf.text(`PHONE: ${PHONE.value}`, 14, 36);
  pdf.text(`EMAIL: ${EMAIL.value}`, 14, 43);

  const rows = CART.map(i => [
    i.cat, i.prod, i.qty, "£" + i.price.toFixed(2), "£" + (i.qty * i.price).toFixed(2)
  ]);

  pdf.autoTable({
    startY: 50,
    head: [["Category", "Product", "Qty", "Price", "Total"]],
    body: rows
  });

  let y = pdf.lastAutoTable.finalY + 10;
  pdf.text(`SUBTOTAL: £${SUBTOTAL.innerText}`, 14, y);
  pdf.text(`VAT (20%): £${VAT.innerText}`, 14, y + 7);
  pdf.text(`FINAL TOTAL: £${TOTAL.innerText}`, 14, y + 14);

  pdf.save(`${INVOICE}.pdf`);
}

// WhatsApp
function SENDWHATSAPP() {
  if (!CART.length) { alert("Cart is empty!"); return; }
  const msg = encodeURIComponent(buildInvoiceText());
  window.open(`https://wa.me/447404156629?text=${msg}`);
}

// Email
function SENDEMAIL() {
  if (!CART.length) { alert("Cart is empty!"); return; }
  const body = buildInvoiceText();
  window.location.href = `mailto:ziap.distributor@gmail.com?subject=INVOICE ${INVOICE}&body=${encodeURIComponent(body)}`;
}

// Print
function PRINT() {
  if (!CART.length) { alert("Cart is empty!"); return; }
  const printWindow = window.open('', '', 'height=600,width=800');
  let html = `<h1>ZIA DISTRIBUTOR LTD ORDER</h1>`;
  html += `<p>Invoice: ${INVOICE}</p>`;
  html += `<p>Name: ${NAME.value}</p><p>Phone: ${PHONE.value}</p><p>Email: ${EMAIL.value}</p>`;
  html += `<table border="1" cellpadding="5" cellspacing="0">
    <tr><th>Category</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>`;
  CART.forEach(i => {
    html += `<tr>
      <td>${i.cat}</td>
      <td>${i.prod}</td>
      <td>${i.qty}</td>
      <td>£${i.price.toFixed(2)}</td>
      <td>£${(i.qty*i.price).toFixed(2)}</td>
    </tr>`;
  });
  html += `</table>`;
  html += `<p>Subtotal: £${SUBTOTAL.innerText}</p>`;
  html += `<p>VAT: £${VAT.innerText}</p>`;
  html += `<h3>Total: £${TOTAL.innerText}</h3>`;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

init();
