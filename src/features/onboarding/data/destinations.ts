import type { DestinationCategory } from '../types';

export interface CategoryMeta {
  id: DestinationCategory;
  label: string;
  emoji: string;
}

export interface DestinationItem {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'hill_station', label: 'Hills', emoji: '🏔' },
  { id: 'beach', label: 'Beaches', emoji: '🏖' },
  { id: 'pilgrimage', label: 'Pilgrimage', emoji: '🛕' },
  { id: 'heritage', label: 'Heritage', emoji: '🏛' },
  { id: 'wildlife', label: 'Wildlife', emoji: '🐯' },
  { id: 'international', label: 'International', emoji: '🌍' },
  { id: 'custom', label: 'Custom', emoji: '✏' },
];

type PresetCategory = Exclude<DestinationCategory, 'custom'>;

const DESTINATIONS_BY_CATEGORY: Readonly<Record<PresetCategory, DestinationItem[]>> = {
  hill_station: [
    { id: 'manali', name: 'Manali', emoji: '🏔', subtitle: 'Himachal Pradesh' },
    { id: 'shimla', name: 'Shimla', emoji: '🌲', subtitle: 'Himachal Pradesh' },
    { id: 'ooty', name: 'Ooty', emoji: '🌿', subtitle: 'Tamil Nadu' },
    { id: 'darjeeling', name: 'Darjeeling', emoji: '🍵', subtitle: 'West Bengal' },
    { id: 'mussoorie', name: 'Mussoorie', emoji: '⛰', subtitle: 'Uttarakhand' },
    { id: 'coorg', name: 'Coorg', emoji: '☕', subtitle: 'Karnataka' },
    { id: 'munnar', name: 'Munnar', emoji: '🌱', subtitle: 'Kerala' },
    { id: 'kasol', name: 'Kasol', emoji: '🏕', subtitle: 'Himachal Pradesh' },
    { id: 'nainital', name: 'Nainital', emoji: '🌊', subtitle: 'Uttarakhand' },
    { id: 'kodaikanal', name: 'Kodaikanal', emoji: '🌺', subtitle: 'Tamil Nadu' },
    { id: 'leh', name: 'Leh–Ladakh', emoji: '🗻', subtitle: 'J&K' },
    { id: 'dharamshala', name: 'Dharamshala', emoji: '🧘', subtitle: 'Himachal Pradesh' },
  ],
  beach: [
    { id: 'goa-north', name: 'North Goa', emoji: '🌊', subtitle: 'Goa' },
    { id: 'goa-south', name: 'South Goa', emoji: '🌴', subtitle: 'Goa' },
    { id: 'andaman', name: 'Andaman Islands', emoji: '🏝', subtitle: 'Andaman & Nicobar' },
    { id: 'varkala', name: 'Varkala', emoji: '🌅', subtitle: 'Kerala' },
    { id: 'kovalam', name: 'Kovalam', emoji: '🏖', subtitle: 'Kerala' },
    { id: 'pondicherry', name: 'Pondicherry', emoji: '🏛', subtitle: 'Puducherry' },
    { id: 'puri', name: 'Puri', emoji: '🛕', subtitle: 'Odisha' },
    { id: 'tarkarli', name: 'Tarkarli', emoji: '🐠', subtitle: 'Maharashtra' },
    { id: 'alibaug', name: 'Alibaug', emoji: '⚓', subtitle: 'Maharashtra' },
    { id: 'lakshadweep', name: 'Lakshadweep', emoji: '🐚', subtitle: 'Lakshadweep' },
  ],
  pilgrimage: [
    { id: 'varanasi', name: 'Varanasi', emoji: '🪔', subtitle: 'Uttar Pradesh' },
    { id: 'tirupati', name: 'Tirupati', emoji: '🙏', subtitle: 'Andhra Pradesh' },
    { id: 'rishikesh', name: 'Rishikesh', emoji: '🧘', subtitle: 'Uttarakhand' },
    { id: 'amritsar', name: 'Amritsar', emoji: '⭐', subtitle: 'Punjab' },
    { id: 'shirdi', name: 'Shirdi', emoji: '🕌', subtitle: 'Maharashtra' },
    { id: 'mathura', name: 'Mathura–Vrindavan', emoji: '🪷', subtitle: 'Uttar Pradesh' },
    { id: 'haridwar', name: 'Haridwar', emoji: '💧', subtitle: 'Uttarakhand' },
    { id: 'somnath', name: 'Somnath', emoji: '🏛', subtitle: 'Gujarat' },
    { id: 'kedarnath', name: 'Kedarnath', emoji: '🗻', subtitle: 'Uttarakhand' },
    { id: 'rameswaram', name: 'Rameswaram', emoji: '🌊', subtitle: 'Tamil Nadu' },
  ],
  heritage: [
    { id: 'jaipur', name: 'Jaipur', emoji: '🏰', subtitle: 'Rajasthan' },
    { id: 'agra', name: 'Agra', emoji: '🕌', subtitle: 'Uttar Pradesh' },
    { id: 'hampi', name: 'Hampi', emoji: '🗿', subtitle: 'Karnataka' },
    { id: 'khajuraho', name: 'Khajuraho', emoji: '🏛', subtitle: 'Madhya Pradesh' },
    { id: 'mysuru', name: 'Mysuru', emoji: '👑', subtitle: 'Karnataka' },
    { id: 'delhi', name: 'Delhi', emoji: '🏙', subtitle: 'Delhi' },
    { id: 'hyderabad', name: 'Hyderabad', emoji: '💎', subtitle: 'Telangana' },
    { id: 'ajanta-ellora', name: 'Ajanta–Ellora', emoji: '⛏', subtitle: 'Maharashtra' },
    { id: 'mahabalipuram', name: 'Mahabalipuram', emoji: '🌊', subtitle: 'Tamil Nadu' },
    { id: 'udaipur', name: 'Udaipur', emoji: '🌺', subtitle: 'Rajasthan' },
  ],
  wildlife: [
    { id: 'jim-corbett', name: 'Jim Corbett', emoji: '🐯', subtitle: 'Uttarakhand' },
    { id: 'ranthambore', name: 'Ranthambore', emoji: '🦁', subtitle: 'Rajasthan' },
    { id: 'kaziranga', name: 'Kaziranga', emoji: '🦏', subtitle: 'Assam' },
    { id: 'bandhavgarh', name: 'Bandhavgarh', emoji: '🐆', subtitle: 'Madhya Pradesh' },
    { id: 'periyar', name: 'Periyar', emoji: '🐘', subtitle: 'Kerala' },
    { id: 'kanha', name: 'Kanha', emoji: '🌿', subtitle: 'Madhya Pradesh' },
    { id: 'sundarbans', name: 'Sundarbans', emoji: '🐊', subtitle: 'West Bengal' },
    { id: 'nagarhole', name: 'Nagarhole', emoji: '🦌', subtitle: 'Karnataka' },
    { id: 'pench', name: 'Pench', emoji: '🌳', subtitle: 'Madhya Pradesh' },
    { id: 'gir', name: 'Gir', emoji: '🦁', subtitle: 'Gujarat' },
  ],
  international: [
    { id: 'bali', name: 'Bali', emoji: '🌴', subtitle: 'Indonesia' },
    { id: 'dubai', name: 'Dubai', emoji: '🏙', subtitle: 'UAE' },
    { id: 'bangkok', name: 'Bangkok', emoji: '🛕', subtitle: 'Thailand' },
    { id: 'singapore', name: 'Singapore', emoji: '🦁', subtitle: 'Singapore' },
    { id: 'nepal', name: 'Nepal', emoji: '🗻', subtitle: 'Nepal' },
    { id: 'bhutan', name: 'Bhutan', emoji: '🏔', subtitle: 'Bhutan' },
    { id: 'sri-lanka', name: 'Sri Lanka', emoji: '🌿', subtitle: 'Sri Lanka' },
    { id: 'maldives', name: 'Maldives', emoji: '🏝', subtitle: 'Maldives' },
    { id: 'paris', name: 'Paris', emoji: '🗼', subtitle: 'France' },
    { id: 'tokyo', name: 'Tokyo', emoji: '🏯', subtitle: 'Japan' },
    { id: 'phuket', name: 'Phuket', emoji: '🏖', subtitle: 'Thailand' },
    { id: 'kuala-lumpur', name: 'Kuala Lumpur', emoji: '🌆', subtitle: 'Malaysia' },
  ],
};

export function getDestinations(category: DestinationCategory): DestinationItem[] {
  if (category === 'custom') return [];
  return DESTINATIONS_BY_CATEGORY[category];
}
