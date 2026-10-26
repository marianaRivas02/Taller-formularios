// app.js
// trae las funciones de validacion que estan en el otro archivo
import { reglas, validarCampo, validarFormulario, validarTelefono } from './validaciones.js';

// aqui se agarran las partes de la pagina que se van a usar: el formulario, el boton, el mensaje y la lista de telefonos
const form = document.querySelector('#registro');
const boton = form.querySelector('button[type="submit"]');
const mensaje = document.querySelector('#mensaje');
const lista = document.querySelector('#telefonos');

// esta funcion recoge todo lo que la persona escribio en el formulario
// los telefonos se sacan aparte con getAll porque pueden ser varios con el mismo nombre
function leerDatos() {
  const fd = new FormData(form);
  const datos = Object.fromEntries(fd);
  datos.telefono = fd.getAll('telefono');
  return datos;
}

// pone o quita el error de un campo, si hay texto lo marca como malo y muestra el mensaje debajo
function marcarCampo(campo, texto) {
  campo.setAttribute('aria-invalid', texto ? 'true' : 'false');
  const error = document.getElementById(`${campo.id}-error`);
  if (error) error.textContent = texto ?? '';
}

// lo mismo de arriba pero buscando el campo por su nombre
function mostrarError(nombre, texto) {
  marcarCampo(form.elements[nombre], texto);
}

// parte B, aqui se revisa si el correo ya esta registrado
const MSG_OCUPADO = 'Este correo ya tiene una cuenta. ¿Quieres iniciar sesión?';
let correoOcupado = false;

// como no hay servidor de verdad, se hace como si estos correos ya existieran
// la funcion espera un ratico para parecer que esta preguntandole a un servidor
const registrados = ['ana@mail.com', 'admin@mail.com'];
const correoDisponible = (email) =>
  new Promise((ok) => setTimeout(() => ok(!registrados.includes(email.toLowerCase())), 600));

// esto sirve para esperar a que la persona termine de escribir antes de hacer algo
// cada vez que escribe se reinicia el tiempo, asi no se ejecuta con cada letra
function debounce(fn, ms) {
  let espera;
  return (...args) => {
    clearTimeout(espera);
    espera = setTimeout(() => fn(...args), ms);
  };
}

// revisa el correo medio segundo despues de que la persona deja de escribir
const revisarCorreo = debounce(async (email) => {
  correoOcupado = false;
  // si el correo esta mal escrito ni se pregunta si existe
  if (validarCampo('email', { email })) return;
  console.log('Comprobando correo:', email); // esto es para ver en la consola que solo se ejecuta una vez

  // mientras revisa muestra un mensajito, pero sin marcar el campo en rojo
  form.elements.email.setAttribute('aria-invalid', 'false');
  document.getElementById('email-error').textContent = 'Comprobando disponibilidad…';

  const libre = await correoDisponible(email);
  // si la persona cambio el correo mientras esperaba, esta respuesta ya no sirve
  if (form.elements.email.value !== email) return;
  correoOcupado = !libre;
  mostrarError('email', libre ? null : MSG_OCUPADO);
}, 500);

// cada vez que se escribe en el correo se llama a la revision
form.elements.email.addEventListener('input', (e) => revisarCorreo(e.target.value));

// aqui se valida cada campo cuando la persona se sale de el
form.addEventListener('focusout', (e) => {
  const campo = e.target;
  if (!campo.name) return;

  // los telefonos tienen su propia validacion
  if (campo.name === 'telefono') {
    marcarCampo(campo, validarTelefono(campo.value));
    return;
  }

  // para los demas campos se usa la validacion normal
  const datos = leerDatos();
  let error = validarCampo(campo.name, datos);
  // si el correo esta bien escrito pero ya existe, igual se muestra el error
  if (campo.name === 'email' && !error && correoOcupado) error = MSG_OCUPADO;
  mostrarError(campo.name, error);

  // si cambian la contraseña se vuelve a revisar que la confirmacion siga siendo igual
  if (campo.name === 'password' && datos.confirmar) {
    mostrarError('confirmar', validarCampo('confirmar', datos));
  }
});

// parte C, aqui se pueden agregar y quitar telefonos
let contadorTel = 0;

// cuando se le da al boton de agregar telefono
document.querySelector('#agregar-telefono').addEventListener('click', () => {
  // maximo deja tener 3 telefonos
  if (lista.children.length >= 3) return;
  contadorTel++;
  const n = contadorTel; // este numero lo pone el codigo solito, no la persona
  // se arma una fila nueva con su texto, su cajita, el boton de quitar y el espacio para el error
  const fila = document.createElement('div');
  fila.innerHTML = `
    <label for="tel-${n}">Teléfono</label>
    <input id="tel-${n}" name="telefono" type="tel" inputmode="tel"
           autocomplete="tel" aria-describedby="tel-${n}-error">
    <button type="button" class="quitar secundario">Quitar</button>
    <p id="tel-${n}-error" class="error" aria-live="polite"></p>`;
  // se mete la fila en la lista y se pone el cursor de una vez en el telefono nuevo
  lista.append(fila);
  fila.querySelector('input').focus();
});

// en vez de ponerle un evento a cada boton de quitar, se pone uno solo en la lista
// si lo que se toco fue un boton de quitar, se borra la fila completa
lista.addEventListener('click', (e) => {
  if (e.target.matches('.quitar')) e.target.parentElement.remove();
});

// aqui pasa todo cuando se le da al boton de crear cuenta
form.addEventListener('submit', async (e) => {
  // esto evita que la pagina se recargue al enviar
  e.preventDefault();

  // se revisan todos los campos de una vez
  const datos = leerDatos();
  const errores = validarFormulario(datos);
  if (correoOcupado && !errores.email) errores.email = MSG_OCUPADO;

  // se muestran o se quitan los errores de cada campo
  for (const nombre of Object.keys(reglas)) {
    mostrarError(nombre, errores[nombre] ?? null);
  }

  // se revisa cada telefono y se guarda el primero que este malo
  let primerTelMalo = null;
  for (const input of lista.querySelectorAll('input')) {
    const error = validarTelefono(input.value);
    marcarCampo(input, error);
    if (error && !primerTelMalo) primerTelMalo = input;
  }

  // si hay algun error se lleva el cursor al primer campo malo y no se envia nada
  const primero = Object.keys(errores)[0];
  if (primero) { form.elements[primero].focus(); return; }
  if (primerTelMalo) { primerTelMalo.focus(); return; }

  // si todo esta bien se bloquea el boton para que no lo presionen dos veces
  boton.disabled = true;
  boton.textContent = 'Enviando…';

  try {
    // la confirmacion no hace falta mandarla
    delete datos.confirmar;
    // se mandan los datos a la pagina de prueba
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    // si la respuesta no fue buena se va directo al error
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // si salio bien se muestra el mensaje y se saluda a la persona
    const creado = await res.json();
    mensaje.textContent = `¡Cuenta creada! Id: ${creado.id}`;
    document.querySelector('#saludo').textContent = `Hola, ${datos.nombre}`;
    // se limpia todo el formulario y los telefonos para dejarlo como nuevo
    form.reset();
    lista.innerHTML = '';
    correoOcupado = false;
  } catch (err) {
    // si algo fallo se le avisa a la persona
    mensaje.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.';
    console.error('Error al enviar:', err);
  } finally {
    // pase lo que pase, el boton vuelve a la normalidad
    boton.disabled = false;
    boton.textContent = 'Crear cuenta';
  }
});