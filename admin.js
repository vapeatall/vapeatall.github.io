fetch(API).then(r=>r.json()).then(d=>{
  const div=document.getElementById("admin");
  for(let c in d){
    d[c].products.forEach(p=>{
      div.innerHTML+=`
      ${c} - ${p.name}
      <input value="${d[c].price}">
      <input value="${p.qty}">
      <br>`;
    });
  }
});
