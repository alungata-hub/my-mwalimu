import type { DomainId } from './domains.ts';

export interface Flashcard {
  id: string;
  domain: DomainId;
  topic: string;
  front: string;
  back: string;
}

export const FLASHCARDS: Flashcard[] = [
  // ── Cloud Concepts ───────────────────────────────────────────────────
  {
    id: 'fc-cc-1',
    domain: 'cloud-concepts',
    topic: 'On-demand self-service',
    front: 'What is "on-demand self-service" in cloud computing?',
    back: 'A customer can provision computing resources automatically without interacting with the provider. Think of a hotel where you check yourself in via a kiosk at any hour — no receptionist needed.',
  },
  {
    id: 'fc-cc-2',
    domain: 'cloud-concepts',
    topic: 'Shared responsibility model',
    front: 'In a SaaS model, what is the customer still responsible for?',
    back: 'Data and access configuration. The provider handles everything else — OS, runtime, middleware. Like renting a furnished apartment: the landlord fixes the plumbing, but you lock your own doors and manage your own belongings.',
  },
  {
    id: 'fc-cc-3',
    domain: 'cloud-concepts',
    topic: 'CapEx vs OpEx',
    front: 'How does OpEx differ from CapEx in cloud spending?',
    back: 'CapEx is upfront spending on physical assets (buying servers). OpEx is ongoing spending on services as you use them (paying a monthly cloud bill). Like buying a matatu vs paying for Uber rides only when you travel.',
  },
  {
    id: 'fc-cc-4',
    domain: 'cloud-concepts',
    topic: 'Elasticity',
    front: 'What does "elasticity" mean in the cloud?',
    back: 'The ability to automatically add resources when demand rises and remove them when it drops. Like a restaurant that opens extra tables during lunch rush and packs them away at night — you only pay for the seats in use.',
  },
  {
    id: 'fc-cc-5',
    domain: 'cloud-concepts',
    topic: 'Hybrid cloud',
    front: 'What is a hybrid cloud?',
    back: 'A setup that combines public cloud and private cloud with data and app portability between them. Like a farmer who sells produce at the public market but keeps seed reserves in a private store room.',
  },

  // ── Azure Architecture and Services ──────────────────────────────────
  {
    id: 'fc-az-1',
    domain: 'azure-fundamentals',
    topic: 'Resource group',
    front: 'What is a resource group in Azure?',
    back: 'A logical container that holds related resources sharing a common lifecycle. You deploy, manage, and delete them together. Like a project folder that holds all files for one assignment — when the assignment ends, you remove the whole folder.',
  },
  {
    id: 'fc-az-2',
    domain: 'azure-fundamentals',
    topic: 'Availability zone',
    front: 'What is an availability zone?',
    back: 'A physically separate datacenter within an Azure region with its own power, cooling, and network. If one zone goes down, others keep running. Like having branch banks in different parts of Nairobi — if one loses power, customers use another.',
  },
  {
    id: 'fc-az-3',
    domain: 'azure-fundamentals',
    topic: 'App Service',
    front: 'What is Azure App Service?',
    back: 'A PaaS hosting platform for web and mobile apps where Azure manages the OS and infrastructure. You only bring your code. Like renting a fully staffed restaurant kitchen — you just cook; someone else maintains the building.',
  },
  {
    id: 'fc-az-4',
    domain: 'azure-fundamentals',
    topic: 'Blob storage tiers',
    front: 'Name the three Blob storage access tiers.',
    back: 'Hot (frequent access, highest storage cost), Cool (infrequent access, lower cost), and Archive (rare access, lowest cost, highest retrieval latency). Like a market stall vs a back storeroom vs a warehouse in another town.',
  },
  {
    id: 'fc-az-5',
    domain: 'azure-fundamentals',
    topic: 'Microsoft Entra ID',
    front: 'What is Microsoft Entra ID (formerly Azure AD)?',
    back: 'A cloud-based identity and directory service that manages users, groups, and access. It is the backbone of authentication for Azure. Like a school registry that verifies every student and teacher before they enter the campus.',
  },

  // ── Azure Management and Governance ──────────────────────────────────
  {
    id: 'fc-mg-1',
    domain: 'azure-management',
    topic: 'Azure Policy',
    front: 'What does Azure Policy do?',
    back: 'Enforces organizational rules and conventions on resources — e.g., allowed regions, required tags, naming standards. It blocks non-compliant deployments. Like a school rule that says no student may enter the lab without an ID — enforced at the door.',
  },
  {
    id: 'fc-mg-2',
    domain: 'azure-management',
    topic: 'Pricing Calculator',
    front: 'What is the Azure Pricing Calculator used for?',
    back: 'Estimating the monthly cost of a proposed set of Azure resources before you deploy them. Like asking a builder for a cost estimate before construction begins — you choose materials and get a quote.',
  },
  {
    id: 'fc-mg-3',
    domain: 'azure-management',
    topic: 'Resource lock',
    front: 'What is a CanNotDelete resource lock?',
    back: 'A lock that prevents a resource from being deleted while still allowing configuration changes. Like putting a padlock on a filing cabinet — you can still rearrange papers inside, but you cannot throw the cabinet away.',
  },
  {
    id: 'fc-mg-4',
    domain: 'azure-management',
    topic: 'Azure Service Health',
    front: 'What does Azure Service Health show you?',
    back: 'A personalized view of Azure service outages and planned maintenance that affect your specific resources. Like a traffic report that only mentions roads on your route, not every road in the country.',
  },
  {
    id: 'fc-mg-5',
    domain: 'azure-management',
    topic: 'Cloud Shell',
    front: 'What is Azure Cloud Shell?',
    back: 'An interactive, browser-based shell for managing Azure resources with authentication pre-configured for your account. Like a remote control that already knows which TV it belongs to — no setup, just press buttons.',
  },
];

export function flashcardsByDomain(domain: DomainId): Flashcard[] {
  return FLASHCARDS.filter((c) => c.domain === domain);
}
