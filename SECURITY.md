# Política de seguridad

## Versiones atendidas

Las correcciones se realizan sobre la rama `main`. Este proyecto es una aplicación demostrativa de código abierto, sin un servicio de soporte ni un plazo de respuesta garantizado. Revisa el README para conocer su alcance y el de sus dependencias.

## Reportar una vulnerabilidad

No publiques exploits, claves, bases de datos ni información personal en issues públicos.

Si GitHub muestra **Security → Advisories → Report a vulnerability**, utiliza ese canal privado. Si no está disponible, contacta primero a [Gian Sandoval por LinkedIn](https://www.linkedin.com/in/giansandoval/) para acordar un canal privado, sin enviar todavía datos sensibles. Crear este archivo no habilita automáticamente los reportes privados de GitHub.

Incluye la versión o commit afectado, el impacto, los pasos de reproducción con datos sintéticos y una posible mitigación. Comparte la información necesaria para reproducir el problema sin exponer sistemas ajenos.

## Límites del ejemplo

- MobileLab, cuando esté incluido, funciona como sandbox local de desarrollo y CI. Sus endpoints de prueba y su autenticación de demostración deben usarse con datos sintéticos.
- No publiques archivos SQLite, estado del CLI, tokens administrativos ni credenciales de terceros. El repositorio debe contener configuraciones y seeds de ejemplo, no una base con datos reales.
- Las excepciones de red local o HTTP del ejemplo sirven para desarrollo. Revisa la configuración de transporte, autenticación y permisos antes de adaptar la app a producción.
- Las dependencias conservan sus licencias y se revisan en el contexto de las comprobaciones disponibles. Un CI aprobado no constituye una garantía absoluta de ausencia de vulnerabilidades.
