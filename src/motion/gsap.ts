import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

const styles = getComputedStyle(document.documentElement);

function seconds(token: string) {
  const value = styles.getPropertyValue(`--motion-${token}`).trim();
  return Number.parseFloat(value) / (value.endsWith('ms') ? 1000 : 1);
}

function curve(token: string) {
  const value = styles.getPropertyValue(`--ease-${token}`).trim();
  return CustomEase.create(`roble-${token}`, value.slice('cubic-bezier('.length, -1));
}

export const duration = {
  press: seconds('press'),
  state: seconds('state'),
  gallery: seconds('gallery'),
  reveal: seconds('reveal'),
  scene: seconds('scene'),
};

export const ease = {
  settle: curve('soft'),
  dissolve: curve('in-out'),
};

export { gsap };
