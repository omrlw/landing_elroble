// Reseñas de familias confirmadas por el centro el 24 de septiembre de 2026.
export const reviews = [
  {
    name: 'Carmen Rosa Quispe', initials: 'CQ', rating: 5, avatar: 'carmen',
    quote: 'Ver el cariño con el que atienden a mi mamá me devolvió la paz. Siempre la encuentro limpia, peinadita y de buen ánimo.',
    tabletQuote: 'Ver el cariño con el que atienden a mi mamá me devolvió la paz.',
  },
  {
    name: 'Patricia Zúñiga Huanca', initials: 'PZ', rating: 5, avatar: 'patricia', featured: true,
    quote: 'Cuidan mucho la dignidad de los residentes: siempre los ves conversando o haciendo dinámicas. Nos dieron confianza desde la primera visita.',
    tabletQuote: 'Nos dieron confianza desde la primera visita.',
  },
  {
    name: 'Jorge Luis Paredes', initials: 'JP', rating: 5, avatar: 'jorge',
    quote: 'El médico siempre nos mantiene informados de sus controles y medicinas. Da mucha tranquilidad saber a mi papá en buenas manos.',
    tabletQuote: 'Da mucha tranquilidad saber a mi papá en buenas manos.',
  },
  {
    name: 'Marco Antonio Flores', initials: 'MF', rating: 5, avatar: 'carmen',
    quote: 'Se nota la vocación y el respeto hacia el adulto mayor. Eso no se paga con nada.',
    tabletQuote: 'Se nota la vocación y el respeto hacia el adulto mayor.',
  },
  {
    name: 'Rosa María Valdivia', initials: 'RV', rating: 5, avatar: 'jorge',
    quote: 'El avance de mi papá fue muy notorio gracias a las terapias físicas. Las instalaciones siempre están limpias y se sienten acogedoras.',
    tabletQuote: 'El avance de mi papá fue muy notorio gracias a las terapias físicas.',
  },
  {
    name: 'Víctor Raúl Guillén', initials: 'VG', rating: 5,
    quote: 'Mi papá tiene problemas de memoria y a veces se desorienta o se pone ansioso. En casa ya no sabíamos cómo manejarlo, pero las licenciadas de aquí tienen una paciencia de oro. Jamás le levantan la voz, le siguen la conversación con cariño y lo calman rápido. Saber que lo tratan con tanta ternura me da un respiro enorme.',
    excerpt: 'Mi papá tiene problemas de memoria y a veces se desorienta o se pone ansioso. En casa ya no sabíamos cómo manejarlo, pero…',
    tabletQuote: 'Saber que lo tratan con tanta ternura me da un respiro enorme.',
  },
  {
    name: 'Hernán Huamán', initials: 'HH', rating: 5, avatar: 'patricia',
    quote: 'Desde que ingresó, mi mamita recuperó el ánimo. Tiene compañía y las técnicas de enfermería la tratan como a su propia abuelita.',
    tabletQuote: 'Desde que ingresó, mi mamita recuperó el ánimo.',
  },
  {
    name: 'Gladys Bustamante', initials: 'GB', rating: 5,
    quote: 'El mes pasado le festejamos el cumpleaños a mi mami en el jardincito y nos dieron todas las facilidades para llevar una tortita y cantar con los demás residentes. Se nota que no es un lugar frío ni parece hospital; se siente como una casa grande. Mi mamá siempre me dice que la señorita del turno tarde la engríe bastante.',
    excerpt: 'El mes pasado le festejamos el cumpleaños a mi mami en el jardincito y nos dieron todas las facilidades para llevar una tortita…',
    tabletQuote: 'Se siente como una casa grande.',
  },
  {
    name: 'Ramiro Cáceres Llerena', initials: 'RL', rating: 4,
    quote: 'Llevamos a mi tío después de una operación de cadera porque necesitaba asistencia fija las 24 horas y curaciones continuas. Cumplieron con mucha puntualidad los horarios de sus pastillas y las pautas del doctor. Hoy ya camina con andador y con mucho mejor semblante. Un trabajo muy responsable.',
    excerpt: 'Llevamos a mi tío después de una operación de cadera porque necesitaba asistencia fija las 24…',
    tabletQuote: 'Hoy ya camina con andador y con mucho mejor semblante.',
  },
  {
    name: 'Julio César Ticona', initials: 'JT', rating: 4,
    quote: 'Al comienzo mi abuelo no quería saber nada de quedarse, estaba renegón porque decía que él se bastaba solo. Pero los chicos del turno supieron ganárselo con calma, sentándose a charlar de sus tiempos. La comida es casera, suave y pensada en su digestión. Fue un cambio muy positivo para toda la familia.',
    excerpt: 'Al comienzo mi abuelo no quería saber nada de quedarse, estaba renegón porque decía que él se bastaba solo. Pero los chicos del…',
    tabletQuote: 'Fue un cambio muy positivo para toda la familia.',
  },
  {
    name: 'Fiorella Vizcarra', initials: 'FV', rating: 5, featured: true,
    quote: 'Por temas laborales paso casi todo el día fuera y me dolía dejar a mi mamá tantas horas sola. Lo que más valoro es que cuando estoy con la angustia en el trabajo, me mandan fotitos o mensajes avisándome que ya almorzó bien o que está sentadita tomando su sol de la mañana. Esos detalles no tienen precio.',
    excerpt: 'Por temas laborales paso casi todo el día fuera y me dolía dejar a mi mamá tantas horas sola. Lo que más valoro es que cuando estoy con la angustia en el…',
    tabletQuote: 'Me mandan fotitos o mensajes avisándome que ya almorzó bien…',
  },
  {
    name: 'Elena Mamani Chura', initials: 'EC', rating: 5,
    quote: 'Lo primero que miré cuando fui a pedir informes fueron los cuartos y los baños, porque a veces en estos sitios hay descuido. En El Roble todo está impecable, entra buena ventilación y tienen frazadas abrigadoras para cuando baja la temperatura en las noches. Mi mamita está cuidada, limpia y bien alimentada.',
    excerpt: 'Lo primero que miré cuando fui a pedir informes fueron los cuartos y los baños, porque a veces en estos sitios hay…',
    tabletQuote: 'Mi mamita está cuidada, limpia y bien alimentada.',
  },
] satisfies {
  name: string;
  initials: string;
  rating: 4 | 5;
  quote: string;
  tabletQuote: string;
  avatar?: 'carmen' | 'jorge' | 'patricia';
  featured?: boolean;
  excerpt?: string;
}[];
