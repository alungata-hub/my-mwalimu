import type { DomainId } from './domains.ts';

export interface StudyCard {
  id: string;
  domain: DomainId;
  concept: string;
  definition: string;
  example: string;
  examRelevance: string;
  checkQuestion: string;
  checkAnswer: string;
}

export const STUDY_CARDS: StudyCard[] = [
  // ── Cloud Concepts ───────────────────────────────────────────────────
  {
    id: 'sb-cc-1',
    domain: 'cloud-concepts',
    concept: 'Cloud Computing',
    definition:
      'Cloud computing is the delivery of computing services — servers, storage, databases, networking, software — over the internet ("the cloud") on a pay-as-you-go basis. You rent what you need from a provider instead of buying and maintaining your own hardware.',
    example:
      'Imagine a small NGO in Kisumu that needs a website for a short campaign. Instead of buying a server and paying for electricity and IT staff, they host the site on Azure for a few shillings per month. When the campaign ends, they stop paying — no leftover hardware to worry about.',
    examRelevance:
      'This is foundational — AZ-900 expects you to identify the five characteristics (on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service) and distinguish cloud models (public, private, hybrid). Expect at least one question on these definitions.',
    checkQuestion: 'Which pricing model is fundamental to cloud computing?',
    checkAnswer:
      'A consumption-based (pay-as-you-go) model — you pay only for the resources you use, when you use them.',
  },
  {
    id: 'sb-cc-2',
    domain: 'cloud-concepts',
    concept: 'CapEx vs OpEx',
    definition:
      'Capital expenditure (CapEx) is upfront spending on physical assets that depreciate over time, like buying servers. Operational expenditure (OpEx) is ongoing spending on services as you consume them, like a monthly cloud bill. Cloud computing shifts spending from CapEx to OpEx.',
    example:
      'Think of a matatu owner. Buying the vehicle outright is CapEx — a big one-time cost. Using a ride-hailing app and paying per trip is OpEx — you pay only when you travel. Cloud works like the ride-hailing model: no big purchase, just ongoing usage costs.',
    examRelevance:
      'You will likely see a scenario question asking which type of expenditure a given cloud scenario represents. Know that cloud favors OpEx and that this reduces the risk of over-provisioning or under-provisioning hardware.',
    checkQuestion:
      'A company pays for Azure Virtual Machines on a monthly basis. Is this CapEx or OpEx?',
    checkAnswer: 'OpEx — it is an ongoing operational cost based on usage, not an upfront hardware purchase.',
  },
  {
    id: 'sb-cc-3',
    domain: 'cloud-concepts',
    concept: 'Shared Responsibility Model',
    definition:
      'Security and maintenance responsibilities are split between the cloud provider and the customer. The split depends on the service model. The provider always handles physical infrastructure; the customer always handles data and access. The middle layers (OS, middleware, runtime) shift depending on IaaS, PaaS, or SaaS.',
    example:
      'Like renting a house. The landlord (provider) fixes the roof and plumbing. You (customer) always lock your doors and manage your belongings. In a fully serviced apartment (SaaS), the landlord also cleans and maintains furniture — but you still manage your own valuables.',
    examRelevance:
      'A common question type lists responsibilities and asks who handles each in a given model. Remember: the provider always owns physical security; the customer always owns data. As you move IaaS → PaaS → SaaS, the provider takes on more.',
    checkQuestion: 'In PaaS, who is responsible for the operating system?',
    checkAnswer:
      'The cloud provider manages the OS in PaaS. The customer manages only their applications and data.',
  },

  // ── Azure Architecture and Services ──────────────────────────────────
  {
    id: 'sb-az-1',
    domain: 'azure-fundamentals',
    concept: 'Regions and Availability Zones',
    definition:
      'An Azure region is a set of datacenters connected by a low-latency network, deployed in a geographic area. An availability zone is a physically separate datacenter within a region with independent power, cooling, and networking. Most regions have at least three zones.',
    example:
      'Think of a region as a city like Lagos, and availability zones as different neighborhoods in that city. If one neighborhood loses power, the others keep running. An app spread across zones stays online even if one datacenter fails.',
    examRelevance:
      'Expect questions on the difference between a region and a zone, and which services support zonal deployments. Know that not all Azure regions have availability zones, and that availability zones protect against datacenter-level failures, not region-wide disasters.',
    checkQuestion: 'What is the difference between a region and an availability zone?',
    checkAnswer:
      'A region is a set of datacenters in a geographic area. An availability zone is one physically separate datacenter within that region with its own power, cooling, and network.',
  },
  {
    id: 'sb-az-2',
    domain: 'azure-fundamentals',
    concept: 'Resource Groups',
    definition:
      'A resource group is a logical container that holds related Azure resources. Every resource exists in exactly one resource group. Resources in the same group share a lifecycle — they are deployed, managed, and can be deleted together.',
    example:
      'Like a project folder at school. You put all the files for one assignment — the report, the slides, the data — in one folder. When the assignment is done, you delete the whole folder. The folder itself costs nothing; it just keeps things organized.',
    examRelevance:
      'Know that a resource group is a management container, not a billing boundary (that is a subscription). A resource can only be in one resource group. Resources in different groups can still interact if configured to do so.',
    checkQuestion: 'Can a single Azure resource belong to two resource groups at the same time?',
    checkAnswer: 'No — every resource exists in exactly one resource group.',
  },
  {
    id: 'sb-az-3',
    domain: 'azure-fundamentals',
    concept: 'Azure Storage Tiers',
    definition:
      'Azure Blob storage offers three access tiers: Hot (optimized for frequent access, highest storage cost), Cool (for infrequent access, lower storage cost, minimum 30-day retention), and Archive (for rarely accessed data, lowest storage cost, high retrieval latency of several hours).',
    example:
      'A hospital in Accra keeps current patient records in Hot storage for instant access. Older records from the past year go to Cool — still accessible but cheaper. Records older than five years, kept only for legal compliance, go to Archive — very cheap but takes hours to retrieve.',
    examRelevance:
      'Expect a scenario question: given an access pattern and retention requirement, which tier is most cost-effective? Remember the trade-off: lower storage cost means higher retrieval cost and latency.',
    checkQuestion:
      'Which storage tier has the lowest storage cost but the highest retrieval latency?',
    checkAnswer:
      'The Archive tier — it is cheapest to store but can take several hours to retrieve data.',
  },

  // ── Azure Management and Governance ──────────────────────────────────
  {
    id: 'sb-mg-1',
    domain: 'azure-management',
    concept: 'Azure Policy',
    definition:
      'Azure Policy is a service that enforces organizational standards and conventions on Azure resources. You define rules — such as "resources may only be deployed to East US" or "all resources must have a cost-center tag" — and Policy evaluates and blocks non-compliant deployments.',
    example:
      'A bank in Nairobi wants all cloud resources in a specific datacenter for regulatory compliance. They create a Policy that blocks deployments anywhere else. When a developer tries to create a resource in another region, Policy stops it at the door — like a security guard checking IDs.',
    examRelevance:
      'Know the difference between Policy (enforcement) and RBAC (access control). Policy is about what resources can look like and where they can be; RBAC is about who can do what. Expect a scenario distinguishing the two.',
    checkQuestion: 'Which Azure service enforces that all resources are deployed to a specific region?',
    checkAnswer: 'Azure Policy — it can define allowed locations and block non-compliant deployments.',
  },
  {
    id: 'sb-mg-2',
    domain: 'azure-management',
    concept: 'Cost Management Tools',
    definition:
      'Azure provides several cost tools: the Pricing Calculator estimates costs before deployment, the TCO Calculator compares on-premises vs cloud total cost of ownership, and Azure Cost Management tracks and analyzes actual spending after deployment. Budgets and alerts notify you when spending crosses thresholds.',
    example:
      'Before migrating a school registry system to Azure, a school uses the Pricing Calculator to budget. After migration, they set a monthly budget alert at 50,000 KES — if spending approaches that, Azure emails the IT lead so they can investigate before overspending.',
    examRelevance:
      'A common question pairs a scenario with the right tool. "Estimate before deploying" = Pricing Calculator. "Compare on-prem vs cloud" = TCO Calculator. "Track and optimize current spending" = Cost Management. "Get notified" = Budgets and alerts.',
    checkQuestion:
      'Which tool estimates the cost of specific Azure resources before they are deployed?',
    checkAnswer: 'The Azure Pricing Calculator.',
  },
  {
    id: 'sb-mg-3',
    domain: 'azure-management',
    concept: 'Resource Locks',
    definition:
      'A resource lock is a protection that prevents accidental deletion or modification of an Azure resource. A CanNotDelete lock allows changes but blocks deletion. A ReadOnly lock blocks both changes and deletion. Locks are inherited by child resources and can be set at subscription, resource group, or resource level.',
    example:
      'Like putting a chain on a filing cabinet in an office. With a CanNotDelete lock, staff can still read and rearrange papers (modify settings) but cannot throw the cabinet away (delete). A ReadOnly lock is like sealing it — nobody opens it at all.',
    examRelevance:
      'Know the two lock types and their inheritance behavior. Expect a question asking which lock type prevents accidental deletion while still allowing configuration changes — the answer is CanNotDelete.',
    checkQuestion:
      'Which resource lock allows configuration changes but prevents deletion?',
    checkAnswer: 'A CanNotDelete lock — you can modify the resource but cannot delete it.',
  },
];

export function studyCardsByDomain(domain: DomainId): StudyCard[] {
  return STUDY_CARDS.filter((c) => c.domain === domain);
}
