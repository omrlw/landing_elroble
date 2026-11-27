# Luz de fondo en El Roble

El hero abre con un destello que viaja por sus dos biseles. En los fondos claros aparecen lente, halo y velo según el espacio que deja cada composición. En verde bosque, el motivo recurrente es una lente circular recortada en la esquina inferior derecha. El borde y el interior de la lente recogen luz mientras su silueta permanece estable.

## Referencias

| Referencia | Aplicación en El Roble |
| --- | --- |
| Imágenes de concepto de El Roble | El disco oscuro queda recortado en la esquina. Sobre crema aparecen círculos velados y luz difusa cerca de las ilustraciones botánicas. |
| Daylight | La luz acompaña el relato. En Historia, el brillo cambia entre el margen izquierdo del retrato y el margen derecho del jardín. [Daylight en Awwwards](https://www.awwwards.com/sites/daylight) · [Caso de basement.studio](https://basement.studio/post/elevating-daylights-gtm-strategy) |
| 14islands | La luz del borde y la variación del tinte aportan volumen al vidrio. El shader de El Roble concentra este efecto en las superficies decorativas. [Caso de 14islands](https://tympanus.net/codrops/2023/10/10/progressively-enhanced-webgl-lens-refraction/) |

## Mapa de fondos

| Superficie | Forma y movimiento |
| --- | --- |
| Hero | Un destello amplio recorre cada bisel y la lente se flexiona suavemente. |
| Historia | Burbujas de distintos tamaños ascienden junto a un halo a la izquierda del retrato y un bisel abierto a la derecha del jardín. El scroll modula su paso. En el capítulo final, la foto tapa la lente allí donde ocupa el fondo. |
| Centro de día y Preguntas frecuentes | Halos tenues junto al margen derecho. |
| Programa, Recorrido y Comunidad | Velo junto a la ilustración en Programa y lentes parciales en Recorrido y Comunidad. |
| Confianza, Enfoque, Testimonios y cierre | Disco circular de vidrio recortado abajo a la derecha. |

## Implementación y verificación

[AmbientLight.astro](../src/components/AmbientLight.astro) selecciona la forma, el lado y el tono. La capa se ancla a los límites de la superficie de fondo. [ambient-light.ts](../src/scripts/ambient-light.ts) comparte un contexto WebGL y dibuja áreas acotadas alrededor de las lentes visibles. El tiempo de la animación se congela al ocultar la pestaña y las lentes fuera de pantalla liberan sus búferes.

En equipos sin WebGL, la alternativa CSS mantiene los perfiles y una pulsación tenue en los reflejos visibles. Con movimiento reducido quedan fijos y en colores forzados se ocultan. El hero conserva la pausa de su carrusel y, si WebGL falla, desplaza el brillo a través de una máscara CSS.

En `npm run preview`, revisar el bisel del hero, los reflejos laterales de Historia y las esquinas verdes. Comprobar las capas sobre crema y bosque, la pausa del hero, la alternativa sin WebGL, el movimiento reducido y los colores forzados.
