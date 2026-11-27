# Dirección atmosférica de El Roble

La composición inicial concentra las fotografías y los controles en el centro y deja superficies amplias de crema entre ellos. En escritorio esto se aprecia especialmente en las cabeceras de Centro de día y Programa, y en los márgenes de Recorrido. En móvil el espacio se reduce a franjas de lectura y separaciones cortas. En las secciones verdes, el degradado original aporta una variación vertical que se puede complementar con luz lateral.

La intervención parte de crema `#f4f1ec`, papel `#fcfaf5`, miel `#e8d7b9`, verde de acción `#2b4027` y bosque `#1c2b1a`. La fotografía cotidiana, Cormorant Garamond en los títulos y Google Sans Flex en la lectura guían la composición.

## Investigación visual y técnica

| Referencia | Qué se estudió | Aplicación viable |
| --- | --- | --- |
| Awwwards y el estudio de Neutra VDL | El sitio del estudio usa una retícula editorial ligada a su arquitectura. El espacio entre bloques sostiene el ritmo de lectura. | Usar los márgenes y transiciones de la retícula existente para situar los campos de luz. [Neutra VDL](https://www.awwwards.com/sites/neutra-vdl) |
| Sowvital en SiteInspire y Leslie David Studio | La identidad reúne fotografía, ilustración y referencias a libros de botánica bajo una misma dirección editorial. | Usar las siluetas de roble y las tonalidades de miel que ya identifican a El Roble. [Selección de SiteInspire](https://www.siteinspire.com/websites/category/home-and-garden) · [Caso del estudio](https://leslie-david.com/projects/sowvital-branding) |
| Sanctuary Garden de Reed Hilderbrand | Los robles existentes y el sotobosque filtran y enmarcan la vida cotidiana. El jardín se lee en estratos. | Dibujar dos estratos de follaje, con una penumbra más próxima y otra más difusa, dentro de una sola máscara. [Sanctuary Garden](https://www.reedhilderbrand.com/projects/sanctuary-garden) |
| Summer Shadows en Behance | Las sombras vegetales sobre superficies de estudio convierten el follaje fuera de cuadro en parte de la composición. | Recortar la proyección en el borde del fondo y desvanecerla antes de las fotografías. [Summer Shadows](https://www.behance.net/gallery/100159863/Summer-Shadows) |
| The Secret Garden en CSS Design Awards | La ilustración sirve de hilo conductor en una experiencia editorial interactiva. | Reservar la proyección reconocible para Centro de día y conservar la continuidad en el resto mediante el color y la textura. [The Secret Garden](https://www.cssdesignawards.com/sites/bond-grace-the-secret-garden/42009/) |
| Are.na y el archivo del Instituto de Dendrología | La ramificación y la variación de siluetas generan naturalidad. El dibujo botánico de roble aporta una referencia para la forma lobulada. | Dibujar ramas y hojas originales en SVG, con cambios de escala y ángulo. [Algorithmic Botany](https://www.are.na/editorial/algorithmic-botany) · [Quercus robur](https://rcin.org.pl/dlibra/doccontent?id=190909) |
| CodePen y SVG | La turbulencia fractal produce grano. El filtro separa la escala del ruido de su intensidad visible. | Repetir un mosaico SVG de 128 px con alfa bajo en las superficies. [Prueba de kynd](https://codepen.io/kynd/pen/jOdmmLJ) · [Especificación SVG](https://www.w3.org/TR/SVG11/filters) |
| NoiseJS y The Book of Shaders | El ruido interpolado es una opción para simular pigmentos, madera y otros materiales. | La textura final se resuelve con el filtro SVG y los campos difusos con gradientes CSS. [NoiseJS](https://github.com/josephg/noisejs) · [The Book of Shaders](https://thebookofshaders.com/11/) |

Los archivos de producción son propios. Las referencias orientaron la composición y la técnica.

## Pruebas en la landing

Las tres direcciones se aplicaron a los mismos encuadres de Centro de día y Enfoque en Chrome a 1440 × 1000 y 390 × 844.

| Dirección | Prueba | Resultado |
| --- | --- | --- |
| Luz bajo el roble | Sombra lobulada de dos penumbras, luz clara y pigmento cálido. | Aporta una señal propia de la marca. La versión final concentra la sombra en Centro de día y reduce su intensidad en móvil. |
| Papel de herbario | Grano visible sobre crema y un baño de miel, con el mismo acabado sobre bosque. | La textura era perceptible detrás de todo el texto. Se incorporó un grano de menor amplitud al tratamiento final. |
| Luz difusa | Un haz diagonal sobre crema y una transición lateral entre miel y bosque. | La primera prueba dividía el fondo en dos. En producción, los campos radiales más amplios suavizan esa división en Enfoque, Programa y Recorrido. |

La sombra de Centro de día se mueve hasta 10 px en horizontal y 6 px en vertical durante el scroll. En reposo permanece fija. El fondo estático también cubre móviles, movimiento reducido y navegadores sin soporte para la animación. [Especificación de animación por desplazamiento](https://www.w3.org/TR/scroll-animations-1/)
