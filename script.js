const DATA = {
"CRYSTAL 600 KIT": {PRICE:17.99, PRODUCTS:[
"LEMON LIME","CHERRY ICE","BLUE FUSION","PINK LEMONADE","STRAWBERRY BLAST","MENTHOL","BULL ICE","COLA ICE"
]},
"CRYSTAL 600 POD": {PRICE:11.99, PRODUCTS:[
"BULL ICE","MENTHOL","PEACH","TOBACCO","BLUEBERRY RASPBERRY","STRAWBERRY RASPBERRY"
]},
"ELF BAR 600 KIT": {PRICE:17.99, PRODUCTS:[
"GRAPE","PEACH","BLUEBERRY","BANANA ICE","WATERMELON"
]},
"ELF BAR 600 POD": {PRICE:20.25, PRODUCTS:[
"MAD BLUE","GRAPE","CHERRY ICE","STRAWBERRY KIWI","COLA"
]},
"LOSTMARY 30K KIT": {PRICE:29.25, PRODUCTS:[
"BERRY","FIZZY","BLUEBERRY","TRIPLE MANGO","DUBAI CHOCOLATE","COLA"
]},
"PIXEL 8K DUO XL KIT": {PRICE:21.99, PRODUCTS:[
"JUICY PEACH","BLUE RAZZ","WATERMELON ICE","DOUBLE APPLE","STRAWBERRY WATERMELON"
]}
};

const CATEGORY = document.getElementById("CATEGORY");
const PRODUCT = document.getElementById("PRODUCT");
const QTY = document.getElementById("QTY");
const PREVIEW = document.getElementById("PREVIEWPRICE");
const CARTDIV = document.getElementById("CARTITEMS");

const SUB = document.getElementById("SUBTOTAL");
const VAT = document.getElementById("VAT");
const TOTAL = document.getElementById("TOTAL");

const NAME = document.getElementById("NAME");
const PHONE = document.getElementById("PHONE");
const EMAIL = document.getElementById("EMAIL");

let CART = [];

const INVOICE = "VAT-" + Date.now();

for (let c in DATA) {
    CATEGORY.innerHTML += `<OPTION>${c}</OPTION>`;
}
LOADPRODUCTS();
UPDATEPREVIEW();

CATEGORY.onchange = () => {LOADPRODUCTS(); UPDATEPREVIEW();}
QTY.oninput = UPDATEPREVIEW;

document.getElementById("ADD_BTN").onclick = ADD;

function LOADPRODUCTS(){
    PRODUCT.innerHTML="";
    DATA[CATEGORY.value].PRODUCTS.forEach(p=>{
        PRODUCT.innerHTML+=`<OPTION>${p}</OPTION>`;
    });
}

function UPDATEPREVIEW(){
    PREVIEW.innerText = (DATA[CATEGORY.value].PRICE * QTY.value).toFixed(2);
}

function ADD(){
    if(!NAME.value || !PHONE.value){
        alert("ENTER CUSTOMER DETAILS FIRST");
        return;
    }

    CART.push({
        category:CATEGORY.value,
        product:PRODUCT.value,
        qty:parseInt(QTY.value),
        price:DATA[CATEGORY.value].PRICE
    });
    RENDER();
}

function RENDER(){
    CARTDIV.innerHTML="";
    let subtotal=0;

    CART.forEach((i,index)=>{
        let line=i.qty*i.price;
        subtotal+=line;

        CARTDIV.innerHTML+=`
        <DIV CLASS="CART-ITEM">
        <B>${i.category}</B><BR>${i.product}<BR>
        £${i.price} × 
        <INPUT TYPE="NUMBER" VALUE="${i.qty}" MIN="1" 
        ONINPUT="UPDATEQTY(${index},this.value)">
        = £${line.toFixed(2)}
        <BUTTON CLASS="REMOVE" ONCLICK="REMOVE(${index})">REMOVE</BUTTON>
        </DIV>`;
    });

    let vat=subtotal*0.20;
    SUB.innerText=subtotal.toFixed(2);
    VAT.innerText=vat.toFixed(2);
    TOTAL.innerText=(subtotal+vat).toFixed(2);
}

function UPDATEQTY(i,val){
    CART[i].qty=parseInt(val);
    RENDER();
}

function REMOVE(i){
    CART.splice(i,1);
    RENDER();
}

function GENERATEPDF(){
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF();
    let y=15;

    pdf.text("VAPEATALL INVOICE",20,y); y+=8;
    pdf.text(`INVOICE: ${INVOICE}`,20,y); y+=6;
    pdf.text(`NAME: ${NAME.value}`,20,y); y+=6;
    pdf.text(`PHONE: ${PHONE.value}`,20,y); y+=10;

    CART.forEach(i=>{
        pdf.text(`${i.category} ${i.product} (${i.qty}) £${(i.qty*i.price).toFixed(2)}`,20,y);
        y+=6;
    });

    y+=6;
    pdf.text(`TOTAL £${TOTAL.innerText}`,20,y);
    pdf.save(`${INVOICE}.PDF`);
    RESET();
}

function SENDWHATSAPP(){
    window.open(`https://wa.me/447404156629?text=INVOICE ${INVOICE} TOTAL £${TOTAL.innerText}`);
}

function SENDEMAIL(){
    window.location=`mailto:ziap.distributor@gmail.com?subject=INVOICE ${INVOICE}&body=TOTAL £${TOTAL.innerText}`;
}

function RESET(){
    CART=[];
    RENDER();
    NAME.value=PHONE.value=EMAIL.value="";
}
