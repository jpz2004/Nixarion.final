const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");

let etapa = 0;
let datosUsuario = {};

sendBtn.addEventListener("click", manejarEntrada);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") manejarEntrada();
});

function manejarEntrada() {
  const mensaje = userInput.value.trim();
  if (!mensaje) return;

  agregarMensaje(mensaje, "user");
  userInput.value = "";

  mostrarEscribiendo();

  setTimeout(() => {
    eliminarEscribiendo();

    switch (etapa) {
      case 0:
        agregarMensaje(
          "¡Hola Bienvenid@! Soy <b>nixbot</b>, tu asesor de estilo exclusivo para la marca Nixarion.<br> vamos a empezar <br><br> 🕯️ ¿ Cuántos años tienes ? ",
          "bot"
        );
        etapa++;
        break;

      case 1:
        datosUsuario.edad = mensaje;
        agregarMensaje("Eso esta genial ademas no importa la edad cuando quieres verte mejor cada dia, me gustaria saber un poco mas de ti <br><br> ¿Cuentame eres hombre 🧍🏻‍♂️ o mujer 🧍🏻‍♀️?", "bot");
        etapa++;
        break;

      case 2:
        datosUsuario.genero = mensaje.toLowerCase();
        agregarMensaje(
          "Es un un placer!! 🤝🏻🤝🏻<br> Bueno me gustaria saber ¿Cuál es tu estilo? para darte la mejor recomendacion dime una de estas opciones <br><br> - Casual <br><br> - Elegante <br><br> - Deportivo",
          "bot"
        );
        etapa++;
        break;

      case 3:
        datosUsuario.estilo = mensaje.toLowerCase();
        agregarMensaje(
          "De acuerdo a tus respuestas vamos a prepar una recomendación...⏳⏳ <br><br> Si quieres una nueva recomendacion escribe...<br> Reiniciar",
          "bot"
        );
        etapa++;
        setTimeout(recomendarPrenda, 3000);
        break;

      default:
        if (mensaje.toLowerCase() === "reiniciar") {
          etapa = 0;
          datosUsuario = {};
          agregarMensaje(
            "Reiniciemos tu perfil. <br> Iniciemos con un ¡Hola!",
            "bot"
          );
        } else {
          agregarMensaje(
            "Escribe <b>reiniciar</b> si deseas otra recomendación.",
            "bot"
          );
        }
        break;
    }
  }, 900);
}

function mostrarEscribiendo() {
  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.textContent = "nixbot está escribiendo...";
  typing.id = "typing-msg";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function eliminarEscribiendo() {
  const t = document.getElementById("typing-msg");
  if (t) t.remove();
}

function agregarMensaje(texto, tipo) {
  const msg = document.createElement("div");
  msg.classList.add(tipo === "bot" ? "mensaje-bot" : "mensaje-user");
  msg.innerHTML = texto;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function recomendarPrenda() {
  const { genero, estilo } = datosUsuario;

  const productos = [
    { nombre: "Camiseta Futurista", genero: "hombre", estilo: "casual", precio: 80000, imagen: "camiseta1.png" },
    { nombre: "Camiseta Premium", genero: "hombre", estilo: "deportivo", precio: 100000, imagen: "camiseta2.png" },
    { nombre: "Camiseta Edición Polo", genero: "hombre", estilo: "elegante", precio: 150000, imagen: "camisa_nix.png" },
    { nombre: "Camiseta Futurista Mujer", genero: "mujer", estilo: "casual", precio: 90000, imagen: "camiseta5.png" },
    { nombre: "Camiseta Premium Mujer", genero: "mujer", estilo: "deportivo", precio: 110000, imagen: "camiseta6.png" },
    { nombre: "Camiseta Polo Mujer", genero: "mujer", estilo: "elegante", precio: 160000, imagen: "camiseta8.png" },
  ];

  const prenda =
    productos.find(
      (p) => p.genero === genero && estilo.includes(p.estilo)
    ) || productos[Math.floor(Math.random() * productos.length)];

  const card = document.createElement("div");
  card.classList.add("nixbot-card");

  card.innerHTML = `
    <p><strong>Recomendación personalizada:</strong></p>
    <img src="${prenda.imagen}" alt="${prenda.nombre}" class="nixbot-img">
    <p>
      <b>${prenda.nombre}</b><br>
      💲${prenda.precio.toLocaleString("es-CO")} COP
    </p>
    <button class="add-btn">👀 Ver en colección 👀</button>
  `;

  chatMessages.appendChild(card);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const addBtn = card.querySelector(".add-btn");

  addBtn.addEventListener("click", () => {
    const productoURL = encodeURIComponent(prenda.nombre);
    window.location.href = `Coleccion.html?producto=${productoURL}`;
  });
}
