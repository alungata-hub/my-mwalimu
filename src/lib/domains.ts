export type DomainId = 'cloud-concepts' | 'azure-fundamentals' | 'azure-management';

export interface DomainMeta {
  id: DomainId;
  name: string;
  weight: number;
  color: 'primary' | 'accent' | 'secondary';
}

export const DOMAIN_META: DomainMeta[] = [
  { id: 'cloud-concepts', name: 'Cloud Concepts', weight: 25, color: 'accent' },
  { id: 'azure-fundamentals', name: 'Azure Architecture and Services', weight: 35, color: 'primary' },
  { id: 'azure-management', name: 'Azure Management and Governance', weight: 40, color: 'secondary' },
];

const DOMAIN_IDS = new Set<DomainId>(DOMAIN_META.map((d) => d.id));

export function isDomainId(id: string): id is DomainId {
  return DOMAIN_IDS.has(id as DomainId);
}

export function getDomainName(id: DomainId): string {
  return DOMAIN_META.find((d) => d.id === id)?.name ?? id;
}
