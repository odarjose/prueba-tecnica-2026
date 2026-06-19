# Prueba Técnica

Hola, gracias por llegar a esta etapa del proceso.

A continuación te dejamos la prueba técnica. La idea no es que sea perfecta ni que inviertas un fin de semana entero en ella, sino ver cómo estructuras una solución y cómo razonas tus decisiones.

**Cómo entregarla:**

Haz un **fork** de este repositorio y trabaja sobre él. Cuando termines, envía un  **Pull Request** . Ten en cuenta que los commits que hagas después del PR no se tomarán en cuenta, así que asegúrate de que esté todo listo antes de abrirlo.

Tienes **72 horas** desde que te compartimos el repositorio para entregar.

Después de revisar tu código, coordinamos una **videollamada corta** donde te pediremos que nos cuentes cómo lo resolviste y que hagas un par de ajustes en vivo. Nada complicado, solo queremos verte trabajar un rato.

Cualquier duda, escríbeme a elias.guere@unifrutti.com

---

## Lo que vas a construir

Una **API RESTful** para administrar un catálogo de productos.

Puedes elegir **una** de estas dos opciones según con qué te sientas más cómodo:

| Opción | Backend             | Base de datos           |
| ------- | ------------------- | ----------------------- |
| A       | ASP.NET Core (C#)   | SQL Server o PostgreSQL |
| B       | NestJS (TypeScript) | SQL Server o PostgreSQL |

---

## Autenticación

| Acción           | Descripción                                   |
| ----------------- | ---------------------------------------------- |
| Registrar usuario | Registrar nombre de usuario y contraseña      |
| Iniciar sesión   | Autenticar al usuario y devolver un token JWT  |
| Cerrar sesión    | Invalidar el token del usuario                 |
| Refrescar token   | Generar un nuevo token e invalidar el anterior |

El token debería durar entre  **5 y 10 minutos** .

---

## Productos

Los endpoints de esta sección requieren estar autenticado (token JWT válido).

| Acción                | Descripción                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registrar producto     | Nombre, descripción, precio unitario, stock y categoría                                                                                                                  |
| Listar productos       | Listar los productos, con filtros opcionales:`sort`,`limit`,`page`,`search_by_name` *(ej:`sort=nombre-ASC`,`limit=10`,`page=2`,`search_by_name=laptop`)* |
| Buscar producto por ID | Devolver el detalle de un producto                                                                                                                                         |
| Actualizar producto    | Modificar un producto existente                                                                                                                                            |
| Eliminar producto      | Eliminar un producto                                                                                                                                                       |

---

## Un endpoint extra (opcional)

Si te sobra tiempo y quieres, agrega un endpoint adicional que te parezca útil para esta API. Tú eliges cuál. Si lo haces, cuéntanos en el README por qué lo elegiste.

---

## Algunas consideraciones

* Incluye el **script SQL** con las tablas y relaciones de la base de datos.
* Agrega un **`README.md`** explicando cómo levantar el proyecto en local. Si no podemos correrlo siguiendo tus instrucciones, no vamos a poder evaluarlo bien, así que dale cariño a esta parte.
* La API debería validar los datos de entrada y devolver mensajes de error claros cuando algo sale mal.
* No necesitas hacer frontend.
* Usa ORM o queries directas, lo que prefieras (Entity Framework, TypeORM, Dapper, etc.).

---

Una última cosa: cuando abras el Pull Request, escríbenos en la descripción **cuál fue la parte que más te costó** de la prueba y cómo la resolviste. Nos sirve para conversarlo en la videollamada.

¡Éxitos! Quedamos atentos a tu entrega.
