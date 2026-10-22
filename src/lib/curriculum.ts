import {
  Cloud,
  ShieldCheck,
  Settings2,
  BookOpen,
  Layers,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';

export type DomainId = 'cloud-concepts' | 'azure-fundamentals' | 'azure-management';

export interface Domain {
  id: DomainId;
  name: string;
  shortName: string;
  weight: number;
  description: string;
  icon: LucideIcon;
  color: 'primary' | 'accent' | 'secondary';
  topics: Topic[];
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
}

export const DOMAINS: Domain[] = [
  {
    id: 'cloud-concepts',
    name: 'Cloud Concepts',
    shortName: 'Cloud Concepts',
    weight: 25,
    description:
      'Understand cloud concepts, the shared responsibility model, and the benefits of cloud services such as high availability, scalability, elasticity, and reliability.',
    icon: Cloud,
    color: 'accent',
    topics: [
      {
        id: 'what-is-cloud',
        title: 'What is cloud computing?',
        summary:
          'Cloud computing delivers computing services over the internet on a pay-as-you-go basis.',
        keyPoints: [
          'On-demand self-service without human interaction with the provider.',
          'Broad network access from standard devices over the internet.',
          'Resource pooling — multi-tenant, location-independent resources.',
          'Rapid elasticity — scale out and in automatically with demand.',
          'Measured service — usage is monitored, controlled, and billed.',
        ],
      },
      {
        id: 'shared-responsibility',
        title: 'Shared responsibility model',
        summary:
          'The provider and customer each own different parts of security and maintenance depending on the service model.',
        keyPoints: [
          'Provider: physical hosts, network, data center, physical security.',
          'Customer (IaaS): OS, apps, data, identity and access.',
          'Customer (PaaS): apps and data only.',
          'Customer (SaaS): data and access configuration only.',
          'Responsibility shifts toward the provider as you move IaaS → PaaS → SaaS.',
        ],
      },
      {
        id: 'cloud-models',
        title: 'Public, private, and hybrid cloud',
        summary:
          'Deployment models differ by who owns and accesses the underlying resources.',
        keyPoints: [
          'Public cloud — shared infrastructure owned by the provider.',
          'Private cloud — dedicated resources for one organization.',
          'Hybrid cloud — combines public and private with data and app portability.',
          'Multi-cloud — using several public providers simultaneously.',
          'Azure Arc helps manage hybrid and multi-cloud resources.',
        ],
      },
      {
        id: 'consumption-model',
        title: 'Consumption-based model',
        summary:
          'You pay only for what you use, avoiding upfront infrastructure costs.',
        keyPoints: [
          'No upfront capital expenditure (CapEx).',
          'Operational expenditure (OpEx) instead of CapEx.',
          'Costs scale with actual resource usage.',
          'Plan and forecast with per-minute or per-second billing.',
          'Try new resources without hardware investment.',
        ],
      },
      {
        id: 'cloud-benefits',
        title: 'Benefits of cloud services',
        summary:
          'High availability, scalability, reliability, predictability, security, and governance.',
        keyPoints: [
          'High availability — services run with minimal downtime.',
          'Scalability — add resources horizontally or vertically as needed.',
          'Reliability — resilient systems that recover automatically.',
          'Predictability — consistent performance and cost.',
          'Security and governance — centralized policy and compliance.',
        ],
      },
    ],
  },
  {
    id: 'azure-fundamentals',
    name: 'Azure Architecture and Services',
    shortName: 'Azure Services',
    weight: 35,
    description:
      'Understand core Azure architectural components, compute, networking, storage, and identity services that form the foundation of Azure solutions.',
    icon: Settings2,
    color: 'primary',
    topics: [
      {
        id: 'core-components',
        title: 'Core Azure architectural components',
        summary:
          'Regions, availability zones, resource groups, subscriptions, and management groups.',
        keyPoints: [
          'Region — a set of datacenters deployed with low-latency networking.',
          'Availability zone — physically separate locations within a region.',
          'Resource group — container for related resources with unified lifecycle.',
          'Subscription — billing and management boundary for resources.',
          'Management group — organizes subscriptions into a hierarchy for policy.',
        ],
      },
      {
        id: 'compute',
        title: 'Compute and networking services',
        summary:
          'Virtual machines, containers, app services, and virtual networks.',
        keyPoints: [
          'VMs — IaaS with full OS control and scale sets for autoscaling.',
          'Containers — Azure Container Instances and AKS for orchestration.',
          'Azure App Service — PaaS for web and mobile apps.',
          'Virtual network (VNet) — isolated, segmented network in the cloud.',
          'Load balancer and Application Gateway distribute traffic.',
        ],
      },
      {
        id: 'storage',
        title: 'Storage services',
        summary:
          'Blob, disk, file, and table storage with access tiers and redundancy.',
        keyPoints: [
          'Blob storage — unstructured data (images, logs, video).',
          'Disk storage — managed disks for VMs.',
          'Azure Files — managed file shares accessible via SMB/NFS.',
          'Access tiers — hot, cool, and archive trade latency for cost.',
          'Redundancy — LRS, GRS, RA-GRS, ZRS for durability options.',
        ],
      },
      {
        id: 'identity',
        title: 'Identity, access, and security',
        summary:
          'Entra ID (Azure AD), RBAC, and key management for secure resources.',
        keyPoints: [
          'Microsoft Entra ID — cloud-based identity and directory service.',
          'RBAC — role-based access control scoped to subscriptions, groups, resources.',
          'Microsoft Entra Domain Services — managed domain services.',
          'Azure Key Vault — secrets, keys, and certificates management.',
          'Azure Active Directory B2C — customer identity and access management.',
        ],
      },
    ],
  },
  {
    id: 'azure-management',
    name: 'Azure Management and Governance',
    shortName: 'Management & Governance',
    weight: 40,
    description:
      'Understand how to manage, govern, monitor, and secure Azure resources cost-effectively using built-in tooling and best practices.',
    icon: ShieldCheck,
    color: 'secondary',
    topics: [
      {
        id: 'cost-management',
        title: 'Cost planning and management',
        summary:
          'Pricing calculator, Total Cost of Ownership, and Azure Cost Management.',
        keyPoints: [
          'Pricing calculator — estimate costs before deploying resources.',
          'TCO calculator — compare on-premises vs. cloud total cost.',
          'Azure Cost Management — track, allocate, and optimize spend.',
          'Tags — metadata to organize and report on resources.',
          'Budgets and alerts — get notified when spending crosses thresholds.',
        ],
      },
      {
        id: 'governance',
        title: 'Governance and compliance',
        summary:
          'Azure Policy, Blueprints, and compliance offerings to enforce standards.',
        keyPoints: [
          'Azure Policy — enforce rules and conventions on resources.',
          'Azure Blueprints — packages of policies, roles, and templates.',
          'Microsoft Purview — data governance and classification.',
          'Service Trust Portal and Microsoft Defender for Cloud for compliance.',
          'Locks — prevent accidental deletion or modification.',
        ],
      },
      {
        id: 'monitoring',
        title: 'Monitoring and reporting',
        summary:
          'Azure Monitor, Log Analytics, and Service Health for observability.',
        keyPoints: [
          'Azure Monitor — platform for collecting and analyzing telemetry.',
          'Log Analytics workspace — query logs with Kusto Query Language.',
          'Azure Service Health — view outages and planned maintenance.',
          'Application Insights — app performance and error monitoring.',
          'Alerts — notify teams based on metric or log conditions.',
        ],
      },
      {
        id: 'tooling',
        title: 'Azure tooling for management',
        summary:
          'Portal, CLI, PowerShell, and ARM/Bicep templates for deployment.',
        keyPoints: [
          'Azure Portal — graphical UI for all resource operations.',
          'Azure CLI and PowerShell — cross-platform command-line tools.',
          'ARM templates — declarative JSON for repeatable deployments.',
          'Bicep — concise DSL that compiles to ARM templates.',
          'Azure Cloud Shell — browser-based shell with auth pre-configured.',
        ],
      },
    ],
  },
];

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  group: 'main' | 'domains' | 'tools';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BookOpen, route: '#/dashboard', group: 'main' },
  { id: 'cloud-concepts', label: 'Cloud Concepts', icon: Cloud, route: '#/domains/cloud-concepts', group: 'domains' },
  { id: 'azure-fundamentals', label: 'Azure Services', icon: Settings2, route: '#/domains/azure-fundamentals', group: 'domains' },
  { id: 'azure-management', label: 'Management & Governance', icon: ShieldCheck, route: '#/domains/azure-management', group: 'domains' },
  { id: 'practice', label: 'Practice Exam', icon: BookOpen, route: '#/practice', group: 'tools' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, route: '#/flashcards', group: 'tools' },
  { id: 'study-buddy', label: 'Study Buddy', icon: GraduationCap, route: '#/study-buddy', group: 'tools' },
  { id: 'settings', label: 'Settings', icon: Settings2, route: '#/settings', group: 'tools' },
];

export function getDomain(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export const TOTAL_TOPICS = DOMAINS.reduce((sum, d) => sum + d.topics.length, 0);
