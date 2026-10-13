# Invitación Mili & Pablo — instalación

Hay dos partes:

- **El sitio** (`index.html`, `foto1.jpg`, `musica.mp3`), que se publica gratis en GitHub Pages.
- **La planilla de Google** con el script `apps-script/Code.gs`. Es donde cargás los invitados y donde caen las confirmaciones y las canciones.

Seguí los pasos en orden. Lleva unos 15 minutos.

---

## 1. Crear la planilla

1. Creá una planilla nueva en Google Sheets, por ejemplo "Casamiento Mili & Pablo".
2. Abrí **Extensiones → Apps Script**.
3. Borrá todo lo que hay en `Código.gs` y pegá el contenido de `apps-script/Code.gs`. Guardá con el ícono del disquete.
4. Volvé a la planilla y recargala (F5). Arriba aparece el menú **Invitación**.
5. Elegí **Invitación → 1. Preparar planilla**. Se crean las hojas *Invitados*, *Confirmaciones* y *Canciones*.

> **Ojo con esto:** la primera vez Google te pide permisos y muestra "Google no verificó esta app". Es normal, porque el script es tuyo. Entrá en **Configuración avanzada → Ir a (nombre del proyecto)** y aceptá.

## 2. Cargar los invitados

En la hoja **Invitados** cargá una fila por grupo familiar:

| Grupo | Integrantes (separados por coma) |
|---|---|
| Flia Pérez | Alan Pérez, Gabriel Pérez, José Pérez |
| Tía Marta | Marta Gómez |

Completá solo esas dos columnas. Las demás se llenan solas.

## 3. Publicar el script como "aplicación web"

1. En Apps Script tocá **Implementar → Nueva implementación**.
2. En el engranaje de "Seleccionar tipo" elegí **Aplicación web**.
3. Configurá:
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquier usuario
4. Tocá **Implementar** y copiá la **URL de la aplicación web**. Termina en `/exec`.
5. En `index.html`, buscá `PEGAR_ACA_LA_URL_DE_APPS_SCRIPT` y reemplazalo por esa URL.

> **Ojo con esto:** si después cambiás algo en `Code.gs`, los cambios no se aplican solos. Andá a **Implementar → Gestionar implementaciones**, tocá el lápiz, elegí **Versión: Nueva versión** e **Implementar**. La URL sigue siendo la misma.

## 4. Publicar el sitio en GitHub Pages

1. Si no tenés cuenta en github.com, creá una gratis.
2. El repositorio ya está creado: `PabloTurri/Casamiento`. Tiene que ser **público**. Las Pages gratis requieren que el repo sea público. La lista de invitados no queda expuesta, porque vive en tu planilla y no en el repo.
3. Tocá **Add file → Upload files** y subí `index.html`, `foto1.jpg` y `musica.mp3`.
4. En **Settings → Pages**, en "Branch" elegí `main` y la carpeta `/ (root)`. Tocá **Save**.
5. En uno o dos minutos el sitio queda en `https://pabloturri.github.io/Casamiento/` (la C mayúscula importa).
6. La dirección del sitio ya está cargada en `Code.gs` y en `index.html`, no hace falta tocarla.

## 5. Generar los links y mandarlos

1. En la planilla elegí **Invitación → 2. Generar links de invitados**.
2. En la columna **Link** queda el link personal de cada grupo, por ejemplo `https://pabloturri.github.io/Casamiento/?i=k7m2qx`.
3. Mandale a cada grupo el suyo. Al abrirlo, ve sus nombres y la cantidad de lugares, y confirma solo por esas personas.

Si agregás invitados más adelante, volvé a usar "2. Generar links". A los que ya tienen clave no se la cambia.

## 6. Qué ves en la planilla

- **Invitados:** el estado de cada grupo (Pendiente, Confirmado, Confirmado parcial o No va), cuántos van ("2 de 3") y sus restricciones alimentarias.
- **Confirmaciones:** el historial de cada respuesta. Si un grupo modifica su confirmación, aparece una fila nueva y el estado en *Invitados* se actualiza.
- **Canciones:** las sugerencias, con el grupo que las mandó.

## Música

El sitio busca un archivo `musica.mp3` al lado de `index.html`:

- **Si está:** muestra la pantalla "Ingresar con música / sin música" y un botón flotante para pausar.
- **Si no está:** la invitación entra directo, sin música.

> **Ojo con esto:** "Can't Help Falling in Love" es una grabación con derechos de autor. En un repo público, GitHub puede recibir un reclamo y bajar el archivo. Es poco probable en una invitación personal, pero puede pasar.

## Probar antes de mandar

1. Cargá un grupo de prueba con tu nombre, generá su link y abrilo desde el celu.
2. Confirmá, sugerí una canción y fijate que aparezcan en la planilla.
3. Después borrá esas filas.
