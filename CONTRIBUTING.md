# Contribuir a react-native-turno-solidario

Gracias por ayudar a mejorar este proyecto abierto de **Gian Sandoval — Arquitecto Mobile**.

## Antes de empezar

Lee el [README](README.md), el [código de conducta](CODE_OF_CONDUCT.md) y la [licencia MIT](LICENSE). Para una mejora grande, abre primero una propuesta que explique el problema y el comportamiento esperado. Las correcciones pequeñas pueden enviarse directamente en un pull request.

## Preparar y verificar

Clona tu fork, crea una rama descriptiva y sigue el inicio rápido del README. Ejecuta las comprobaciones del framework utilizado:

```bash
npm ci
npx prettier --check App.tsx src test
npm run typecheck
npm test -- --ci --coverage
npx expo export --platform android
```

Si la app incluye MobileLab, inicia el sandbox y comprueba el flujo real de datos como indica el README. Los tests unitarios usan clientes simulados; no requieren credenciales ni datos de un servicio externo.

## Enviar un pull request

Describe el problema, el cambio y cómo lo verificaste. Incluye capturas reales si cambias la interfaz y agrega pruebas cuando cambies reglas de negocio, persistencia o manejo de errores. Mantén cada PR centrado en un objetivo y explica los cambios de contrato o de dependencias.

No incluyas builds, bases SQLite, directorios de dependencias, credenciales ni datos personales. Usa fixtures sintéticos. Las vulnerabilidades se reportan mediante [SECURITY.md](SECURITY.md), sin detalles sensibles en issues públicos.

Al contribuir, aceptas que tu código original se distribuya bajo la licencia MIT del proyecto. Conserva los avisos y licencias de los componentes de terceros.

## Apoyar la serie

Una ⭐, un reporte reproducible o una mejora de documentación también ayudan.

- [GitHub](https://github.com/GianSandoval5)
- [LinkedIn](https://www.linkedin.com/in/giansandoval/)
- [Web](https://giansandoval.com)
