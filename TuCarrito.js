let compraActual = null;
let infoEnvioActual = null; 



function iniciarProcesoPago(numTarjeta) {
  const loaderEnvio = document.getElementById("loader-envio");
  const mensajeEnvio = document.getElementById("mensaje-envio");
  const barraCont = document.getElementById("barra-container");
  const barra = document.getElementById("barra");
  const mensaje = document.getElementById("mensaje-final");

  const formPago = document.getElementById("form-pago");
  if(formPago) formPago.style.display = "none";
  
  loaderEnvio.style.display = "flex";
  barraCont.style.display = "block";
  barra.style.width = "0%";
  mensaje.textContent = "Procesando tu pago y preparando el envío...";

  let progreso = 0;
  const intervalo = setInterval(() => {
    progreso += 12;
    if (progreso > 100) progreso = 100;
    barra.style.width = progreso + "%";

    if (progreso === 36) mensaje.textContent = "Autenticando tarjeta...";
    if (progreso === 64) mensaje.textContent = "Confirmando items y dirección... ";

    if (progreso >= 100) {
      clearInterval(intervalo);
      loaderEnvio.style.display = "none";
      mensaje.textContent = " ¡Gracias por tu compra en NIXARION! ";

      mostrarRecibo(numTarjeta);

      if (window.carrito) { 
        window.carrito = [];
        window.localStorage.removeItem("carrito");
      }
    }
  }, 400);
}

function mostrarRecibo(numTarjeta) {
  const reciboCont = document.getElementById("recibo-container");
  if (!reciboCont || !compraActual || !infoEnvioActual) return;

  const digits = numTarjeta.replace(/\D/g, "");
  const ultimos4 = digits.slice(-4) || "----";
  const tarjetaMask = `**** **** **** ${ultimos4}`;

  let total = 0;

  compraActual.forEach(p => total += p.precio); 

  reciboCont.innerHTML = `
    <h3>Recibo de compra</h3>
    <p><strong>Cliente:</strong> ${infoEnvioActual.nombreEnvio}</p>
    <p><strong>Dirección:</strong> ${infoEnvioActual.direccion}, ${infoEnvioActual.ciudad} - ${infoEnvioActual.departamento}</p>
    <p><strong>Teléfono:</strong> ${infoEnvioActual.telefono}</p>
    <hr>
    <div>
      ${compraActual.map(p => `
        <div class="recibo-item">
          <div style="display:flex; gap:10px; align-items:center;">
            <img src="${p.imagen}" alt="${p.nombre}" width="40" style="border-radius:6px;"/>
            <div>${p.nombre}</div>
          </div>
          <div>$${p.precio.toLocaleString("es-CO")} COP</div>
        </div>
      `).join("")}
    </div>
    <hr>
    <div style="display:flex;justify-content:space-between; font-weight:700;">
      <div>Total</div>
      <div>$${total.toLocaleString("es-CO")} COP</div>
    </div>
    <p style="margin-top:12px;"><strong>Método de pago:</strong> Tarjeta ${tarjetaMask}</p>
  `;

  reciboCont.style.display = "block";

  compraActual = null;
  infoEnvioActual = null;
}

function animarProductoAlCarrito(imgSrc) {
  const carritoIcon = document.querySelector(".carrito-logo");
  if (!carritoIcon) return;

  const imgAnim = document.createElement("img");
  imgAnim.src = imgSrc;
  imgAnim.style.position = "fixed";
  imgAnim.style.width = "50px";
  imgAnim.style.height = "50px";
  imgAnim.style.borderRadius = "8px";
  imgAnim.style.top = window.event ? window.event.clientY + "px" : "50%";
  imgAnim.style.left = window.event ? window.event.clientX + "px" : "50%";
  imgAnim.style.transition = "all 0.8s ease-in-out";
  imgAnim.style.zIndex = 9999;

  document.body.appendChild(imgAnim);

  const carritoRect = carritoIcon.getBoundingClientRect();

  requestAnimationFrame(() => {
    imgAnim.style.top = carritoRect.top + "px";
    imgAnim.style.left = carritoRect.left + "px";
    imgAnim.style.width = "30px";
    imgAnim.style.height = "30px";
    imgAnim.style.opacity = "0.6";
  });

  setTimeout(() => imgAnim.remove(), 900);
}

document.addEventListener("DOMContentLoaded", () => {

  function obtenerCarrito() {
    let datos = localStorage.getItem("carrito");
    try {
      return datos ? JSON.parse(datos) : [];
    } catch (e) {
      console.error("Carrito corrupto, reiniciando...");
      localStorage.removeItem("carrito");
      return [];
    }
  }

  function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }
  
  let carrito = obtenerCarrito();
  window.carrito = carrito; 

  const contador = document.getElementById("contador-carrito");
  if (contador) {
    contador.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  document.querySelectorAll(".btn-agregar").forEach(boton => {
    boton.addEventListener("click", () => {
      const nombre = boton.dataset.nombre;
      const precio = parseInt(boton.dataset.precio);
      const imagen = boton.dataset.imagen;

      const existe = carrito.find(p => p.nombre === nombre);

      if (existe) {
        existe.cantidad++;
      } else {
        carrito.push({
          nombre,
          precio,
          imagen,
          cantidad: 1
        });
      }

      guardarCarrito(carrito);

      if (contador) {
        contador.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
      }

      animarProductoAlCarrito(imagen); 
    });
  });


  const listaCarrito = document.getElementById("lista-carrito");
  const totalPrecio = document.getElementById("total-precio");

  if (listaCarrito) {
    listaCarrito.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
      listaCarrito.innerHTML = "<p>Tu carrito está vacío</p>";
    } else {
      carrito.forEach((producto, index) => {
        const div = document.createElement("div");
        div.classList.add("item-carrito");

        div.innerHTML = `
          <img src="${producto.imagen}" width="70">
          <div>
            <h4>${producto.nombre}</h4>
            <p>$${producto.precio.toLocaleString()} COP</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <button class="eliminar" data-index="${index}">❌</button>
          </div>
        `;

        listaCarrito.appendChild(div);
        total += producto.precio * producto.cantidad;
      });

      totalPrecio.textContent = `$${total.toLocaleString()} COP`;
    }
  }

  document.addEventListener("click", e => {
    if (e.target.classList.contains("eliminar")) {
      const index = e.target.dataset.index;
      carrito.splice(index, 1);
      guardarCarrito(carrito);
      location.reload();
    }
  });

  const btnVaciar = document.getElementById("vaciar-carrito");
  if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
      if (confirm("¿Vaciar todo el carrito?")) {
        localStorage.removeItem("carrito");
        location.reload();
      }
    });
  }

  const formPago = document.getElementById("form-pago");
  if (formPago) {
    formPago.addEventListener("submit", (e) => {
      e.preventDefault();

      if (carrito.length === 0) {
        alert("Tu carrito está vacío 🛒");
        return;
      }

      const nombreEnvio = document.getElementById("nombre-envio").value.trim();
      const direccion = document.getElementById("direccion").value.trim();
      const ciudad = document.getElementById("ciudad").value.trim();
      const departamento = document.getElementById("departamento").value.trim();
      const telefono = document.getElementById("telefono").value.trim();


      const numTarjeta = document.getElementById("num-tarjeta").value.trim();
      const nombreTitular = document.getElementById("nombre-titular").value.trim();
      const fechaExp = document.getElementById("fecha-exp").value.trim();
      const cvc = document.getElementById("cvc").value.trim();

      if (!nombreEnvio || !direccion || !ciudad || !departamento || !telefono) {
        alert("Por favor completa todos los datos de envío.");
        return;
      }
      if (!numTarjeta || !nombreTitular || !fechaExp || !cvc) {
        alert("Por favor completa todos los datos de la tarjeta.");
        return;
      }

      compraActual = carrito.slice(); 
      infoEnvioActual = { nombreEnvio, direccion, ciudad, departamento, telefono };
      
      document.getElementById("btn-pagar").disabled = true;

      iniciarProcesoPago(numTarjeta);
    });
  }

});

document.querySelectorAll(".btn-agregar").forEach(boton => {
  boton.addEventListener("click", (e) => {
    const imagenProducto = boton.dataset.imagen;
    const carritoIcon = document.querySelector(".carrito-logo");

    if (!carritoIcon) return;

    const img = document.createElement("img");
    img.src = imagenProducto;
    img.style.position = "fixed";
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.borderRadius = "8px";
    img.style.zIndex = "1000";

    const rect = boton.getBoundingClientRect();
    img.style.left = rect.left + "px";
    img.style.top = rect.top + "px";

    document.body.appendChild(img);

    const carritoRect = carritoIcon.getBoundingClientRect();
    const destinoX = carritoRect.left + carritoRect.width / 2 - 30; 
    const destinoY = carritoRect.top + carritoRect.height / 2 - 30; 
   
    img.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    requestAnimationFrame(() => {
      img.style.left = destinoX + "px";
      img.style.top = destinoY + "px";
      img.style.width = "20px";
      img.style.height = "20px";
      img.style.opacity = "0.5";
    });

    setTimeout(() => {
      img.remove();
    }, 900);
  });
});