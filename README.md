<!-- mobile-factory:hero -->
<div align="center">
<h1>Turno Solidario</h1>
<p><strong>Organiza la ayuda, multiplica el impacto.</strong></p>
<p>Turnos y participación para actividades comunitarias.</p>
<p><a href="https://github.com/GianSandoval5/react-native-turno-solidario/actions/workflows/ci.yml"><img src="https://github.com/GianSandoval5/react-native-turno-solidario/actions/workflows/ci.yml/badge.svg" alt="CI"></a> <a href="LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-14645c" alt="MIT"></a> <img src="https://img.shields.io/badge/framework-React%20Native-14645c" alt="React Native"></p>
<p><a href="#funciones">Funciones</a> · <a href="#instalación">Instalación</a> · <a href="#mobilelab">MobileLab</a> · <a href="#pruebas">Pruebas</a> · <a href="CONTRIBUTING.md">Contribuir</a></p>
</div>

https://github.com/GianSandoval5/react-native-turno-solidario

Organizar un evento comunitario requiere conocer cupos, inscripciones y participaciones completadas. Turno Solidario aporta una herramienta de demostración para un coordinador local.

## Funciones

- Inicio: indicadores de turnos, participaciones pendientes y completadas.
- Turnos: búsqueda, filtro de cupos y catálogo ordenado por fecha.
- Formulario: alta/edición con nombre, lugar, fecha y cupo validado.
- Detalle: cupos, participantes, completar/cancelar inscripción y eliminar turno vacío con confirmación.
- Inscripción: alias sintético y rechazo de duplicados o cupos excedidos.
- Historial: participaciones completadas.

Diseño de alto contraste, controles con etiquetas accesibles, área segura, desplazamiento y ancho adaptable. Carga, error, vacío y recuperación. No hay capturas reales verificadas; la pieza promocional es ilustrativa.

## Instalación

Node 22, npm, Expo SDK 57, React Native 0.86.3, React 19.2.3 y TypeScript. Las versiones exactas resueltas están en package-lock.json y FACTORY_PROVENANCE.json. [Expo](https://docs.expo.dev/versions/latest/), [compatibilidad](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/).

```sh
git clone https://github.com/GianSandoval5/react-native-turno-solidario.git
cd react-native-turno-solidario
npm ci
npx expo start
```

Instala e inicia MobileLab antes de abrir la app.

## MobileLab

[MobileLab 1.1.0](https://github.com/GianSandoval5/MobileLab/releases/tag/v1.1.0) es un sandbox de desarrollo y CI, sin cuentas ni cloud. Descarga el binario oficial adecuado y verifica SHA-256 con SHA256SUMS antes de instalarlo en PATH. En la raíz:

```sh
mobilelab --version
mobilelab start
mobilelab db status
```

La configuración mobilelab.yaml y mobilelab/data.yaml declara /api/shifts. Las semillas son sintéticas, con alias demo. GET lista, PUT /api/shifts/{id} crea/reemplaza y DELETE elimina; la colección también ofrece POST, GET por ID y PATCH. Cada turno guarda id, title, place, date (AAAA-MM-DD), capacity y participants (alias y completed). El primer arranque siembra SQLite; los siguientes preservan datos. No se necesita SDK de eventos ni Hive. [Data API](https://github.com/GianSandoval5/MobileLab/blob/master/docs/data-api.md).

Android Emulator: http://10.0.2.2:4566; iOS Simulator: http://127.0.0.1:4566. Para un dispositivo en LAN privada, configura EXPO_PUBLIC_MOBILELAB_URL=http://IP_DEL_HOST:4566 y cambia host a 0.0.0.0 solo en una red confiable; Android USB permite adb reverse tcp:4566 tcp:4566. Reinicia Metro tras modificar la variable pública (no contiene secretos). HTTP local exclusivamente de desarrollo: configuración de red nativa mediante expo-build-properties; para producción usa HTTPS y elimina excepciones de cleartext. No exponer el sandbox a internet. No versionar .state.json, *.db, *.db-* ni credenciales.

## Pruebas

```sh
npx prettier --check App.tsx src test
npm run typecheck
npx expo install --check
npx jest --ci --coverage --runInBand
MOBILELAB_BIN=/ruta/mobilelab python3 scripts/verify_mobilelab.py
npx expo export --platform android
```

El script crea un sandbox temporal y puerto libre, compila el adaptador TypeScript, ejecuta CRUD real, reinicia MobileLab y verifica persistencia. No toca datos de trabajo. CI verifica formato, TypeScript, Jest, compatibilidad Expo, bundle JS Android, integración real y auditoría; el bundle no es APK nativo. Consulta FACTORY_PROVENANCE.json para evidencia real.

## Arquitectura

src/features/shifts/domain: entidades, reglas y contrato ShiftRepository. data: DTO y cliente HTTP inyectable. presentation: estado observable y pantallas. App.tsx compone dependencias. Tests con HTTP simulado y repositorio de memoria; producción del ejemplo solo MobileLab.

Para un backend real define OpenAPI, implementa ShiftRepository con HTTPS, autenticación y autorización, validación autoritativa, control de concurrencia y cupos transaccionales; sustituye la inyección en App.tsx. Hoy es un sandbox monousuario: no hay cuentas, sincronización, notificaciones ni transacciones concurrentes. Tras timeout actualiza antes de repetir. Roadmap: calendario, reservas con hora, acceso por roles y sincronización.

Inspiración conceptual: [Engelsystem](https://www.engelsystem.org/en) y [Volunteer Scheduler](https://github.com/KathySnider/volunteer-scheduler). Código original, sin copiar sus diseños.

## Autor
Gian Sandoval — Arquitecto Mobile. [GitHub](https://github.com/GianSandoval5) · [LinkedIn](https://www.linkedin.com/in/giansandoval/) · [Web](https://giansandoval.com). Si te sirve, ¡deja una ⭐! Código original MIT.


## Conecta con Gian Sandoval

Si este proyecto te sirve, deja una ⭐ en el repositorio para apoyar la serie de proyectos abiertos.

- GitHub: https://github.com/GianSandoval5
- LinkedIn: https://www.linkedin.com/in/giansandoval/
- Web: https://giansandoval.com

**Gian Sandoval — Arquitecto Mobile**
