[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mVV06Hfm)
# shipping

Aplicación **Shipping** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `MateandoAndo`.

Esta app corresponde al módulo de envíos y logística en el proyecto de tipo **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

---
## Descripción de la aplicación
Esta aplicación se encarga de mostrar el historial de envíos de los distintos paquetes, el estado actual en el que cada paquete que fue comprado en el marketplace se encuentra y permitirle a los operadores del correo (quienes realizan el envío puerta a puerta) modificar el estado de un paquete a medida que este sufre algún cambio. Por ejemplo, el Vendedor informa que un paquete está listo para ser despachado, un operador del correo lo pasa a buscar y modifica el estado de dicho paquete para informar que ahora mismo se encuentra EN TRANSITO rumbo a su destino (la direccion que el comprador incluyó en los datos de envío). 

## Link al deploy
[Entrar a la Aplicación en Vercel](https://proyecto-c-shipping-mateandoando.vercel.app)

## Credenciales de prueba 
Para facilitar la evaluación del proyecto, utilizar los siguientes accesos:

* **Rol de Operador / Repartidor:**
  * **Email:** `shipping+clerk_test@iaw.com`
  * **Contraseña:** `iawuser#`

## Tecnologías utilizadas
* **Framework:** Next.js (App Router)
* **Autenticación:** Clerk
* **Base de Datos:** PostgreSQL con Prisma ORM
* **Estilos:** Tailwind CSS

  ## Datos de prueba (códigos de seguimiento)

La base de datos ya cuenta con paquetes precargados en diferentes estados. Se puede probar el buscador público utilizando cualquiera de los siguientes códigos de seguimiento (respetando el formato):

* `c40a88bf-e642-41a4-b09e-1f74a0da2231` — **Estado:** Despachado
* `c40a66bf-e613-41a4-b09e-1f74a0da2231` — **Estado:** Entregado
* `c53a66bf-e613-41a4-b08e-1f74a0da2231` — **Estado:** Retornado

Opcionalmente, si se desea ver qué ocurre al ingresar un número de seguimiento incorrecto, puede tomar alguno de los códigos de arriba y modificarlos un poco (pero respetando el formato) para producir un nuevo código de seguimiento que no exista en la base de datos. 
