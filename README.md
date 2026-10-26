# Taller: Formularios con validaciones

**Estudiantes:** Mariana Rivas Clavijo - Alejandro Giraldo Pareja 
**Curso:** Programación Frontend — Universidad Autónoma de Manizales

## Estructura del proyecto

```
taller-formularios/
├── README.md
├── nativo/
│   └── index.html
└── registro/
    ├── index.html
    ├── estilos.css
    ├── app.js
    └── validaciones.js
```

## Nivel 1 · HTML puro con validación nativa
### ¿Qué pasa si borras el atributo `name` de un campo y envías? ¿Por qué?
Hicimos la prueba borrando el `name="edad"`. El formulario vimos que se envió normal, pero al abrir F12 y network el edad ya no aparecía, o sea, solo llegaron 6 datos en vez de 7.
Esto vemos que pasa porque el navegador usa el `name` como el nombre de cada dato que se envía, por ejemplo `edad: 25`. Si un campo no tiene `name`, el navegador no lo mandara, así que no lo incluye en el envío.
El `id` no sirve para esto porque se usa para conectar el campo con su `<label>` y para buscarlo desde JavaScript, pero lo que se envía al servidor depende del `name`.

Si escribimos una contraseña y una confirmación distintas vimos que el formulario se envía igual. Vemos tambien que esto pasa porque los atributos de HTML revisan cada campo por separado y no pueden comparar dos campos entre sí.

---

## Nivel 2 · Estilos de error y mensajes propios
### Diferencia entre `:user-invalid` y `:invalid`. ¿Cuál es mejor para el usuario y por qué?
Cambiamos `:user-invalid` por `:invalid` en `estilos.css` y recargamos la página. Con `:invalid` todos los campos obligatorios aparecieron en rojo desde el principio, aunque todavía no se habia escrito nada. También vimos que al empezar a escribir el correo el campo se ponía rojo desde la primera letra.

Con `:user-invalid` la página carga sin ningún campo en rojo. El borde rojo solo aparece después de que la persona escribe en el campo y sale de él, o cuando intenta enviar el formulario.

Creemos que para el usuario es mejor `:user-invalid`, porque no lo regaña antes de tiempo. Pensamos que ver todo en rojo apenas se abre la página puede confundirlo o hacerle pensar que ya hizo algo mal, cuando apenas está empezando. 
Con `:user-invalid` el error aparece en el momento en que tiene sentido, o sea, cuando la persona ya interactuó con el campo y hay algo que corregir.

---

## Nivel 3 · Envío con fetch + FormData

### ¿Por qué se escucha `submit` en el formulario y no `click` en el botón?
Para probarlo llenamos el formulario, nos quedamos en un campo y presionamos Enter. El formulario se envió aunque nunca hicimos clic en el boton.

Entonces aqui vemos que un formulario no solo se envía con el clic, también se puede enviar con Enter, o llegando al botón con Tab y presionando Espacio. Si hubieramos puesto el código en el `click` del botón, cuando alguien enviara con Enter no se revisarían los errores y la página se recargaría.
En cambio, el `submit` del formulario se activa siempre que se envía, en este caso que probamos con enter. Por eso creemos que  es mejor usar `submit`, porque así va a funcionar en todos los casos y también sirve para las personas que solo usan el teclado o digamos que necesitan acabar rapido con el formulario.
Para este punto vemos que al cambiar la URL por:  https://jsonplaceholder.typicode.com/no-existe, al recargar el formulario, llenar todos los campos y darle a enviar, abajo aparece el sigueinte mensaje "No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.". 

---

## Nivel 4 · Validación avanzada en JavaScript

### ¿Qué ventaja tiene que las reglas sean funciones puras?

Entendemos que una función pura es una función que solo recibe un dato y devuelve una respuesta, sin tocar nada más. No cambia la página, no lee campos del HTML ni modifica variables de afuera. Y si le damos el mismo dato, siempre nos devuelve lo mismo.

En nuestro taller todas las reglas de `validaciones.js` son así. Por ejemplo, `rangoEntero(18, 120)` recibe la edad y devuelve un mensaje como "El valor mínimo es 18." o `null` si está bien. Pero no sabe nada del formulario, no pinta el borde rojo ni escribe el mensaje en la página. Eso lo hace `app.js` aparte.

### ventajas que encontramos: 

La misma regla del correo (`formatoCorreo`) la usamos en varias partes, cuando la persona sale del campo, cuando envía el formulario y antes de revisar si el correo ya existe. No tuvimos que escribirla tres veces.

Si despues nos piden que la contraseña tenga mínimo 10 caracteres en vez de 8, solo nos tocaria cambiar  `longitud(8, 64)` en `validaciones.js` y listo. 

Como no dependen de la página, las podemos probar solas. Por ejemplo si escribimos `formatoCorreo()('ana.mail.com')` sabemos que nos tiene que dar el mensaje de error, y si le pasamos `ana@mail.com` nos tiene que dar `null`. No necesitamos abrir el formulario ni llenar nada.

`validaciones.js` decide si algo está bien o mal y `app.js` se encarga de mostrarlo en la pantalla. Cada archivo tiene como su trabajo y es más fácil para nosotros entender qué hace cada uno.

Como no dependen del HTML, estas mismas reglas se podrían usar en otro formulario o hasta en el servidor para validar los datos como con el mismo esquema.


### ¿Por qué la validación «correo ya existe» no se puede hacer solo con atributos HTML?

Porque los atributos de HTML solo pueden revisar lo que está escrito en el campo en ese momento. Por ejemplo `type="email"` revisa que tenga @, `minlength` revisa que no sea muy corto y `pattern` revisa que cumpla un formato. Vemos que todo eso se puede saber mirando solo el texto.

Pero tambien vemos que saber si un correo ya está registrado es diferente porque esa información no está en el formulario sino en el servidor que es el que tiene guardada la lista de usuarios. O sea que el navegador no tiene forma de saber eso por sí solo, y HTML no puede hacerlo porque no hay nada que le diga como que no revise. 

Para hacerlo entonces se necesita:

Mandar una consulta al servidor con el correo.
Esperar la respuesta..
Y ya, Segun lo que responda va a mostrar o no el mensaje "Este correo ya tiene una cuenta".

Además, con JavaScript pudimos usar  `debounce` para no preguntarle al servidor por cada letra que se escribe, sino solo cuando la persona deja de escribir. Esto lo comprobamos en la consola tambien como parte de las validaciones porque aunque escribimos el correo rápido la revisión se hizo una sola vez.

---

## Nivel 5 · Seguridad y usabilidad

### Parte A: la validación del frontend no es seguridad

Para esta parte hicimos dos pruebas:

Abrimos la versión `nativo` y nos metimos a inspeccionar el campo Edad con DevTools y borramos los atributos `min` y `max`. Después enviamos el formulario con edad 5 y sí se envió. En la respuesta del servidor aparecía `"edad": "5"`, o sea que el dato inválido llegó sin problema.

En la consola del navegador mandamos una petición con `fetch` directamente, sin usar el formulario, con un correo que no era correo y edad -3. Vimos que el servidor la aceptó y hasta le dio un id.

Con esto nos dimos cuenta de que la validación del navegador se puede saltar muy fácil. Cualquier persona puede cambiar el HTML desde DevTools o mandar datos directo al servidor sin pasar por el formulario. Entonces la validación del frontend sirve para ayudarle al usuario a llenar bien el formulario, pero no sirve como seguridad.

Por eso el backend siempre tiene que volver a validar todo, o sea, usando el mismo esquema del front. Además se deben usar consultas parametrizadas para guardar los datos, como explicamos.


#### ¿Qué es una consulta parametrizada y por qué evita SQL injection?

Una consulta parametrizada es una consulta SQL que usa espacios reservados en lugar de pegar los datos del usuario, y esos datos se mandan aparte, para que la base de datos nunca los confunda con código.

Cuando el backend necesita guardar o buscar algo en la base de datos usa las consultas SQL. Pero el problema que aparece es cuando lo que escribió el usuario se pega directamente dentro de la consulta porque así la base de datos no puede diferenciar qué parte es el código y qué parte es el dato.

Por ejemplo, si en un inicio de sesión alguien escribe en la contraseña ' OR '1'='1', ese texto se mete en la consulta y cambia lo que hace. Como '1'='1' siempre es verdadero, la base de datos podría dejar entrar a la persona aunque no sepa la contraseña. Eso es lo que se llama SQL injection, que el texto del usuario termine funcionando como parte del código.

Una consulta parametrizada evitaria esto porque la consulta se escribe con espacios reservados, en vez de pegar el dato, y los datos del usuario se mandan aparte. Así la base de datos ya sabe desde el principio cuál es el código y cuáles son los datos. Entonces, aunque alguien escriba ' OR '1'='1, la base de datos lo toma como un texto cualquiera, como si esa fuera la contraseña, y no lo ejecuta.

Entonces con esto nos damos cuenta que con las consultas parametrizadas lo que escribe el usuario nunca puede cambiar lo que hace la consulta, y por eso se evita el SQL injection.

### Parte B: innerHTML vs textContent

Agregamos un saludo después del registro y escribimos `<b>Mariana</b>` en el nombre.

Con `innerHTML` salió "Hola, **Mariana**" con Mariana en negrita. Eso pasa porque `innerHTML` interpreta el texto como código HTML. Esto puede ser peligroso porque alguien podría escribir código malo en vez de un `<b>`, y el navegador lo ejecutaría. Eso se llama XSS.

Con`textContent` salió "Hola, `<b>Mariana</b>`" tal cual como texto normal. El navegador no interpreta nada , o sea, solo lo muestra.

Por eso dejamos el saludo con `textContent`.

También revisamos todo el código buscando `innerHTML`. Lo usabamos en dos partes, que eran, en la fila de los teléfonos y para borrar la lista de teléfonos con `''`. Los dos son seguros, porque no muestran nada que haya escrito el usuario asi como nos mostraban en el enunciado. En los teléfonos el único dato que se mete es `${n}`, que es un número que genera nuestro código.

### Parte C: prueba de usabilidad

Para la prueba, un amigo llamado Santiago lleno la tabla con los datos de Santiago Henao, santi@gmail.com, contraseña santi20 y edad 16, mientras observababamos sin ayudar. Se demoró un minuto y 36 segundos en completarlo. Después lo repetimos usando solo el teclado (Tab, Mayús + Tab, Espacio y Enter) y si se pudo llegar a cada uno de los campos y enviar lo correspondiente.

| Observación | Campo | Problema | Corrección aplicada |
|---|---|---|---|
| 1 | Contraseña | Cuando uno va a escribir la contraseña no sabe qué requisitos tiene desde el principio, entonces es difícil que funcione a la primera. Uno solo se entera cuando se equivoca y sale el error. Ahi si se sabe que debe tener la contraseña. | Agregamos una pista debajo del campo que dice "Mínimo 8 caracteres, con al menos una letra y un número", para que quien este llenando el formulario sepa desde antes qué tiene que escribir. También la conectamos con `aria-describedby` para que el lector de pantalla la lea. |
| 2 | Edad | Al escribir una edad menor a 18, como 16 que es lo que nos sugieren en el enunciado, sale el mensaje "El valor mínimo es 18.". O sea, la persona puede no entender que el problema es que no tiene la edad para registrarse. | Cambiamos el mensaje en `validaciones.js` por "Debes tener al menos 18 años para registrarte.", para que sea mas especifico el porque no puede crear la cuenta. |
| 3 | Nombre, Correo, Contraseña, Confirmar y Edad | Si uno envía el formulario con estos campos vacíos, todos dicen lo mismo: "Este campo es obligatorio.". El mensaje no dice qué hay que hacer, solo que está mal. | Cambiamos los mensajes en `validaciones.js` para que cada campo diga qué escribir. |
