export const business = {
  name: 'Centro Geronto Geriátrico El Roble',
  locality: 'Arequipa',
  foundedYear: 2009,
  phone: '+51 960 229 170',
  whatsappNumber: '51960229170',
  email: 'info@elroblecentrogeriatrico.com',
  address: 'Pasaje O’Higgins 218, Vallecito, Arequipa',
  schedule: 'De lunes a viernes, de 9:00 a. m. a 1:00 p. m.',
  mapUrl: 'https://maps.app.goo.gl/32V5CJt1QathHEVv6',
  socialProfiles: {
    tiktok: 'https://www.tiktok.com/@elroble2026',
  },
} as const;

function whatsappLink(message: string) {
  const url = new URL(`https://wa.me/${business.whatsappNumber}`);
  url.searchParams.set('text', message);
  return url.href;
}

export const whatsappUrl = whatsappLink('Hola, me gustaría agendar una visita a El Roble.');
export const pricingUrl = whatsappLink('Hola, me gustaría consultar los precios del centro de día El Roble.');
export const firstVisitUrl = whatsappLink('Hola, me gustaría agendar mi primera visita a El Roble.');
export const phoneUrl = `tel:${business.phone.replace(/\s/g, '')}`;
