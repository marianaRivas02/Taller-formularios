// validaciones.js
// en este archivo estan todas las reglas para revisar si lo que escriben en el formulario esta bien
// cada regla devuelve el mensaje de error si algo esta mal, o null si todo esta bien

// esta regla revisa que el campo no se quede vacio, si no le pasan mensaje usa uno por defecto
export const requerido = (msg = 'Este campo es obligatorio.') =>
  (v) => (v === undefined || v === null || String(v).trim() === '' ? msg : null);

// revisa que el texto no sea ni muy corto ni muy largo
export const longitud = (min, max) =>
  (v) => (v.length < min ? `Usa al menos ${min} caracteres.`
    : v.length > max ? `Usa como máximo ${max} caracteres.` : null);

// revisa que el correo tenga forma de correo, algo arroba algo punto algo
export const formatoCorreo = () =>
  (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'Escribe un correo válido, por ejemplo ana@mail.com.');

// para la edad, revisa que sea un numero entero y que este entre el minimo y el maximo
export const rangoEntero = (min, max) => (v) => {
  const n = Number(v);
  if (!Number.isInteger(n)) return 'Escribe un número entero.';
  if (n < min) return `Debes tener al menos ${min} años para registrarte.`;
  if (n > max) return `El valor máximo es ${max}.`;
  return null;
};

// revisa que un campo sea igual a otro, se usa para confirmar la contraseña
export const igualA = (otroCampo, msg) =>
  (v, datos) => (v === datos[otroCampo] ? null : msg);

// la contraseña tiene que tener por lo menos una letra y un numero
export const letraYNumero = () =>
  (v) => (/[A-Za-z]/.test(v) && /\d/.test(v) ? null : 'La contraseña debe tener al menos una letra y un número.');

// para la casilla de terminos, cuando esta marcada llega como on
export const marcado = (msg) =>
  (v) => (v === 'on' ? null : msg);

// para los telefonos, acepta de 7 a 15 numeros y puede empezar con un mas
export const formatoTelefono = () =>
  (v) => (/^\+?\d{7,15}$/.test(String(v).trim()) ? null : 'Escribe de 7 a 15 dígitos (puede empezar con +).');

// aqui se juntan las reglas de cada campo del registro, todas en un solo lugar
// cada campo tiene su lista de reglas y se revisan en ese orden
export const reglas = {
  nombre: [requerido('Escribe tu nombre completo.'), longitud(3, 60)],
  email: [requerido('Escribe tu correo, por ejemplo ana@mail.com.'), formatoCorreo()],
  password: [requerido('Crea una contraseña.'), longitud(8, 64), letraYNumero()],
  confirmar: [requerido('Escribe otra vez tu contraseña.'), igualA('password', 'Las contraseñas no coinciden.')],
  edad: [requerido('Escribe tu edad.'), rangoEntero(18, 120)],
  pais: [requerido('Elige un país.')],
  terminos: [marcado('Debes aceptar los términos.')],
};
// los telefonos tienen sus reglas aparte porque pueden ser varios
const reglasTelefono = [requerido('Escribe el número o quita este campo.'), formatoTelefono()];

// revisa un solo campo y devuelve el primer error que encuentre, si no hay ninguno devuelve null
export function validarCampo(nombre, datos) {
  for (const regla of reglas[nombre] ?? []) {
    const error = regla(datos[nombre] ?? '', datos);
    if (error) return error;
  }
  return null;
}

// revisa todo el formulario y devuelve solo los campos que tienen error con su mensaje
export function validarFormulario(datos) {
  const errores = {};
  for (const nombre of Object.keys(reglas)) {
    const error = validarCampo(nombre, datos);
    if (error) errores[nombre] = error;
  }
  return errores;
}

// revisa un telefono con sus reglas y devuelve el primer error, o null si esta bien
export function validarTelefono(valor) {
  for (const regla of reglasTelefono) {
    const error = regla(valor);
    if (error) return error;
  }
  return null;
}