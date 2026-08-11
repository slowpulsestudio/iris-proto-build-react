import type { ProductIconName } from '../../components/ProductIcon/ProductIcon.js';
import type { BadgeTone } from '../../components/Badge/Badge.js';

/**
 * Service Catalogue data — mirrors the Figma "Service Catalogue" design.
 * All copy is generalized placeholder content; figures (uptime, days, status)
 * are static for the prototype.
 */

export interface InstanceRow {
  id: string;
  name: string;
  status: string;
  /** 'success' renders the green check + neutral row; 'error' tints the row
   *  with the error background. */
  tone: 'success' | 'error';
}

interface ServiceCardSubscribed {
  kind: 'subscribed';
  id: string;
  name: string;
  productIcon: ProductIconName;
  /** Headline meta (e.g. "Renews in", "Trial expires in"). */
  meta: { label: string; value: string; unit: string };
  /** Status badge shown next to the meta value. */
  status: { label: string; tone: BadgeTone };
  instances: InstanceRow[];
  /** Footer prompt + link copy. */
  footer: { prompt: string; link: string };
}

interface ServiceCardPromo {
  kind: 'promo';
  id: string;
  name: string;
  productIcon: ProductIconName;
  description: string;
  learnMoreHref: string;
  features: string[];
  cta: { label: string };
}

export type ServiceCard = ServiceCardSubscribed | ServiceCardPromo;

export const GLOBAL_UPTIME = '99.54%';

export const SERVICE_CARDS: ServiceCard[] = [
  {
    kind: 'subscribed',
    id: 'identity-manager',
    name: 'Identity Manager',
    productIcon: 'identity-manager',
    meta: { label: 'Renews in', value: '689', unit: 'days' },
    status: { label: 'Subscribed', tone: 'neutral' },
    instances: [
      { id: 'prod', name: 'Production', status: 'Operational', tone: 'success' },
      { id: 'dev', name: 'Development', status: 'Operational', tone: 'success' },
    ],
    footer: { prompt: 'Need additional instances?', link: 'Get in touch' },
  },
  {
    kind: 'subscribed',
    id: 'safeguard',
    name: 'Safeguard',
    productIcon: 'safeguard',
    meta: { label: 'Trial expires in', value: '7', unit: 'days' },
    status: { label: 'Trial', tone: 'warning' },
    instances: [
      { id: 'prod', name: 'Production', status: 'Operational', tone: 'success' },
    ],
    footer: { prompt: 'Need an upgrade?', link: 'Get in touch' },
  },
  {
    kind: 'promo',
    id: 'active-roles',
    name: 'Active Roles',
    productIcon: 'active-roles',
    description:
      'A single, unified view of all identity systems that automates secure, ' +
      'least-privilege access across Entra ID, Microsoft 365, and Active Directory.',
    learnMoreHref: '#/services',
    features: [
      'All Business features',
      '30-day free trial',
      'No credit card required',
    ],
    cta: { label: 'Start free trial' },
  },
];

export interface ServiceExtension {
  id: string;
  name: string;
  icon: string;
  status: string;
}

export const SERVICE_EXTENSIONS: ServiceExtension[] = [
  { id: 'io-connect', name: 'IO Connect', icon: 'Sparkle', status: 'Operational' },
  { id: 'cloud-assistant', name: 'Cloud Assistant', icon: 'CloudCheck', status: 'Operational' },
  {
    id: 'safeguard-assets',
    name: 'Connect for Safeguard Assets',
    icon: 'Stack',
    status: 'Operational',
  },
];
