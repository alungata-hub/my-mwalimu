import type { DomainId } from './domains.ts';
import { isDomainId } from './domains.ts';

export interface QuestionOption {
  id: number;
  text: string;
  explanation: string;
}

export interface Question {
  id: string;
  domain: DomainId;
  topic: string;
  prompt: string;
  options: QuestionOption[];
  answer: number;
}

export const QUESTIONS: Question[] = [
  // ── Cloud Concepts (25%) ──────────────────────────────────────────────
  {
    id: 'cc-1',
    domain: 'cloud-concepts',
    topic: 'What is cloud computing?',
    prompt:
      'Which characteristic of cloud computing allows a customer to provision resources automatically without interacting with the provider?',
    options: [
      {
        id: 0,
        text: 'On-demand self-service',
        explanation:
          'Correct. On-demand self-service means a customer can provision computing capabilities as needed without requiring human interaction with the provider.',
      },
      {
        id: 1,
        text: 'Resource pooling',
        explanation:
          'Incorrect. Resource pooling is the provider serving multiple customers from a shared pool of resources, not the customer provisioning without interaction.',
      },
      {
        id: 2,
        text: 'Measured service',
        explanation:
          'Incorrect. Measured service refers to usage being monitored and billed, not to the ability to provision without human interaction.',
      },
      {
        id: 3,
        text: 'Broad network access',
        explanation:
          'Incorrect. Broad network access means services are reachable over the network using standard mechanisms, not that provisioning is automatic.',
      },
    ],
    answer: 0,
  },
  {
    id: 'cc-2',
    domain: 'cloud-concepts',
    topic: 'Shared responsibility model',
    prompt:
      'In the shared responsibility model, which of the following is always the responsibility of the cloud provider in every service model (IaaS, PaaS, SaaS)?',
    options: [
      {
        id: 0,
        text: 'Operating system patching',
        explanation:
          'Incorrect. The customer is responsible for OS patching in IaaS; the provider takes this on only in PaaS/SaaS.',
      },
      {
        id: 1,
        text: 'Application code',
        explanation:
          'Incorrect. The application is always the customer\u2019s responsibility across all service models.',
      },
      {
        id: 2,
        text: 'Physical security of the datacenter',
        explanation:
          'Correct. The provider always handles physical hosts, network, and datacenter security regardless of the service model.',
      },
      {
        id: 3,
        text: 'Data classification and access',
        explanation:
          'Incorrect. Data and access control are always customer responsibilities across all service models.',
      },
    ],
    answer: 2,
  },
  {
    id: 'cc-3',
    domain: 'cloud-concepts',
    topic: 'Public, private, and hybrid cloud',
    prompt:
      'An organization wants to keep sensitive customer data on dedicated infrastructure while running its public website on shared cloud infrastructure. Which deployment model best fits this scenario?',
    options: [
      {
        id: 0,
        text: 'Public cloud',
        explanation:
          'Incorrect. A public cloud uses shared infrastructure only and would not provide dedicated resources for the sensitive data.',
      },
      {
        id: 1,
        text: 'Private cloud',
        explanation:
          'Incorrect. A private cloud is dedicated to one organization but would not easily also host the public website on shared infrastructure.',
      },
      {
        id: 2,
        text: 'Hybrid cloud',
        explanation:
          'Correct. A hybrid cloud combines public cloud (for the website) and private cloud (for the sensitive data), with portability between them.',
      },
      {
        id: 3,
        text: 'Multi-cloud',
        explanation:
          'Incorrect. Multi-cloud means using several public cloud providers, not combining public and private infrastructure.',
      },
    ],
    answer: 2,
  },
  {
    id: 'cc-4',
    domain: 'cloud-concepts',
    topic: 'Consumption-based model',
    prompt:
      'A company moves from buying on-premises servers to paying only for the Azure resources it uses each hour. Which financial benefit are they gaining?',
    options: [
      {
        id: 0,
        text: 'Capital expenditure (CapEx) increase',
        explanation:
          'Incorrect. Moving to the cloud reduces, not increases, capital expenditure on hardware.',
      },
      {
        id: 1,
        text: 'Operational expenditure (OpEx) model',
        explanation:
          'Correct. The consumption-based model shifts costs to operational expenditure \u2014 you pay for what you use rather than buying hardware upfront.',
      },
      {
        id: 2,
        text: 'Fixed annual hardware cost',
        explanation:
          'Incorrect. The consumption model is variable based on usage, not a fixed annual hardware cost.',
      },
      {
        id: 3,
        text: 'Elimination of all IT costs',
        explanation:
          'Incorrect. Cloud does not eliminate all IT costs; it shifts how they are incurred and billed.',
      },
    ],
    answer: 1,
  },
  {
    id: 'cc-5',
    domain: 'cloud-concepts',
    topic: 'Benefits of cloud services',
    prompt:
      'Which term describes the ability of a cloud system to automatically add resources to handle a spike in demand and remove them when demand drops?',
    options: [
      {
        id: 0,
        text: 'High availability',
        explanation:
          'Incorrect. High availability refers to maximizing uptime, not to scaling resources with demand.',
      },
      {
        id: 1,
        text: 'Rapid elasticity',
        explanation:
          'Correct. Elasticity is the ability to add and remove resources automatically in response to demand changes.',
      },
      {
        id: 2,
        text: 'Reliability',
        explanation:
          'Incorrect. Reliability is the ability of a system to recover from failures, not to scale with demand.',
      },
      {
        id: 3,
        text: 'Predictability',
        explanation:
          'Incorrect. Predictability refers to consistent performance and cost, not to scaling behavior.',
      },
    ],
    answer: 1,
  },

  // ── Azure Architecture and Services (35%) ────────────────────────────
  {
    id: 'az-1',
    domain: 'azure-fundamentals',
    topic: 'Core Azure architectural components',
    prompt:
      'What is the primary purpose of a resource group in Azure?',
    options: [
      {
        id: 0,
        text: 'To define a billing boundary for an organization',
        explanation:
          'Incorrect. Billing boundaries are defined by subscriptions, not resource groups.',
      },
      {
        id: 1,
        text: 'To act as a container that holds related resources sharing a common lifecycle',
        explanation:
          'Correct. A resource group is a logical container for resources that are deployed, managed, and retired together.',
      },
      {
        id: 2,
        text: 'To isolate network traffic between subnets',
        explanation:
          'Incorrect. Network isolation is handled by virtual networks and subnets, not resource groups.',
      },
      {
        id: 3,
        text: 'To manage user identities and passwords',
        explanation:
          'Incorrect. User identity is managed by Microsoft Entra ID, not resource groups.',
      },
    ],
    answer: 1,
  },
  {
    id: 'az-2',
    domain: 'azure-fundamentals',
    topic: 'Compute and networking services',
    prompt:
      'Which Azure service provides a Platform-as-a-Service (PaaS) hosting environment for web applications without managing the underlying operating system?',
    options: [
      {
        id: 0,
        text: 'Azure Virtual Machines',
        explanation:
          'Incorrect. Virtual Machines are IaaS, meaning you manage the operating system yourself.',
      },
      {
        id: 1,
        text: 'Azure App Service',
        explanation:
          'Correct. App Service is a PaaS offering that hosts web and mobile apps without exposing OS management to the customer.',
      },
      {
        id: 2,
        text: 'Azure Blob Storage',
        explanation:
          'Incorrect. Blob Storage is a storage service for unstructured data, not an application hosting platform.',
      },
      {
        id: 3,
        text: 'Azure Key Vault',
        explanation:
          'Incorrect. Key Vault stores secrets and keys; it does not host applications.',
      },
    ],
    answer: 1,
  },
  {
    id: 'az-3',
    domain: 'azure-fundamentals',
    topic: 'Storage services',
    prompt:
      'You need to store large volumes of log data that will rarely be accessed but must be retained for compliance. Which Blob storage access tier is the most cost-effective choice?',
    options: [
      {
        id: 0,
        text: 'Hot tier',
        explanation:
          'Incorrect. The Hot tier is optimized for frequent access and has the highest storage cost, not suitable for rarely accessed data.',
      },
      {
        id: 1,
        text: 'Cool tier',
        explanation:
          'Incorrect. The Cool tier is for infrequently accessed data (at least 30 days), but the Archive tier is cheaper for rarely accessed data.',
      },
      {
        id: 2,
        text: 'Archive tier',
        explanation:
          'Correct. The Archive tier offers the lowest storage cost for data that is rarely accessed, with higher retrieval latency.',
      },
      {
        id: 3,
        text: 'Premium tier',
        explanation:
          'Incorrect. Premium tier is optimized for high-performance, frequently accessed data \u2014 the opposite of this scenario.',
      },
    ],
    answer: 2,
  },
  {
    id: 'az-4',
    domain: 'azure-fundamentals',
    topic: 'Identity, access, and security',
    prompt:
      'In Azure role-based access control (RBAC), which of the following best describes a role assignment?',
    options: [
      {
        id: 0,
        text: 'A policy that restricts which regions resources can be deployed to',
        explanation:
          'Incorrect. Region restrictions are enforced by Azure Policy, not RBAC role assignments.',
      },
      {
        id: 1,
        text: 'A combination of a security principal, a role definition, and a scope',
        explanation:
          'Correct. A role assignment grants a security principal a specific role definition at a given scope (subscription, resource group, or resource).',
      },
      {
        id: 2,
        text: 'A container for storing cryptographic keys',
        explanation:
          'Incorrect. Cryptographic keys are stored in Azure Key Vault, not defined by RBAC assignments.',
      },
      {
        id: 3,
        text: 'A rule that routes network traffic between subnets',
        explanation:
          'Incorrect. Traffic routing is handled by network security groups and routing tables, not RBAC.',
      },
    ],
    answer: 1,
  },
  {
    id: 'az-5',
    domain: 'azure-fundamentals',
    topic: 'Core Azure architectural components',
    prompt:
      'What is an availability zone in Azure?',
    options: [
      {
        id: 0,
        text: 'A set of datacenters within a region equipped with independent power, cooling, and networking',
        explanation:
          'Correct. An availability zone is a physically separate location within a region with its own power, cooling, and networking for fault isolation.',
      },
      {
        id: 1,
        text: 'A geographic region containing several datacenters connected by a low-latency network',
        explanation:
          'Incorrect. This describes an Azure region, not an availability zone within a region.',
      },
      {
        id: 2,
        text: 'A logical grouping of subscriptions under a management hierarchy',
        explanation:
          'Incorrect. That describes a management group, not an availability zone.',
      },
      {
        id: 3,
        text: 'A network boundary that isolates resources from the internet',
        explanation:
          'Incorrect. This describes a virtual network, not an availability zone.',
      },
    ],
    answer: 0,
  },

  // ── Azure Management and Governance (40%) ────────────────────────────
  {
    id: 'mg-1',
    domain: 'azure-management',
    topic: 'Cost planning and management',
    prompt:
      'Which Azure tool should you use to estimate the monthly cost of a proposed set of Azure resources before you deploy them?',
    options: [
      {
        id: 0,
        text: 'Azure Cost Management',
        explanation:
          'Incorrect. Cost Management tracks and analyzes spending for resources that are already deployed; it does not estimate pre-deployment costs.',
      },
      {
        id: 1,
        text: 'Total Cost of Ownership (TCO) Calculator',
        explanation:
          'Incorrect. The TCO Calculator compares the total cost of on-premises infrastructure versus cloud, not the cost of a specific Azure resource set.',
      },
      {
        id: 2,
        text: 'Azure Pricing Calculator',
        explanation:
          'Correct. The Pricing Calculator estimates the cost of specific Azure resources and configurations before deployment.',
      },
      {
        id: 3,
        text: 'Azure Advisor',
        explanation:
          'Incorrect. Advisor recommends optimizations for existing resources; it does not estimate costs for proposed deployments.',
      },
    ],
    answer: 2,
  },
  {
    id: 'mg-2',
    domain: 'azure-management',
    topic: 'Governance and compliance',
    prompt:
      'Your company requires that all Azure resources be deployed only to the East US region. Which service should you use to enforce this requirement?',
    options: [
      {
        id: 0,
        text: 'Azure Policy',
        explanation:
          'Correct. Azure Policy evaluates resources against rules such as allowed locations and can block non-compliant deployments.',
      },
      {
        id: 1,
        text: 'Azure Monitor',
        explanation:
          'Incorrect. Azure Monitor collects telemetry and alerts on metrics; it does not enforce deployment rules.',
      },
      {
        id: 2,
        text: 'Azure Blueprints',
        explanation:
          'Incorrect. Blueprints packages policies, roles, and templates for repeatable deployments, but the enforcement itself comes from Azure Policy.',
      },
      {
        id: 3,
        text: 'Resource locks',
        explanation:
          'Incorrect. Resource locks prevent deletion or modification of existing resources; they do not control deployment regions.',
      },
    ],
    answer: 0,
  },
  {
    id: 'mg-3',
    domain: 'azure-management',
    topic: 'Monitoring and reporting',
    prompt:
      'Which Azure service would you use to view active service outages and planned maintenance events that affect your Azure resources?',
    options: [
      {
        id: 0,
        text: 'Azure Monitor metrics',
        explanation:
          'Incorrect. Azure Monitor metrics show performance data for your resources, not provider-side outage and maintenance information.',
      },
      {
        id: 1,
        text: 'Azure Service Health',
        explanation:
          'Correct. Service Health provides a personalized view of Azure service outages and planned maintenance affecting your resources.',
      },
      {
        id: 2,
        text: 'Azure Advisor',
        explanation:
          'Incorrect. Advisor offers best-practice recommendations; it does not report live outages or maintenance events.',
      },
      {
        id: 3,
        text: 'Application Insights',
        explanation:
          'Incorrect. Application Insights monitors application performance and errors, not Azure platform outages.',
      },
    ],
    answer: 1,
  },
  {
    id: 'mg-4',
    domain: 'azure-management',
    topic: 'Azure tooling for management',
    prompt:
      'Which statement best describes Azure Cloud Shell?',
    options: [
      {
        id: 0,
        text: 'A locally installed command-line tool for managing Azure resources',
        explanation:
          'Incorrect. Cloud Shell is browser-based and runs in the cloud, not a locally installed tool.',
      },
      {
        id: 1,
        text: 'An interactive, browser-accessible shell for managing Azure resources with authentication pre-configured',
        explanation:
          'Correct. Cloud Shell is an interactive, browser-based shell with Azure authentication already configured for the signed-in user.',
      },
      {
        id: 2,
        text: 'A declarative JSON template used to deploy Azure resources',
        explanation:
          'Incorrect. That describes an ARM template, not Cloud Shell.',
      },
      {
        id: 3,
        text: 'A graphical web portal for managing Azure subscriptions',
        explanation:
          'Incorrect. The graphical portal is the Azure Portal; Cloud Shell is a command-line environment.',
      },
    ],
    answer: 1,
  },
  {
    id: 'mg-5',
    domain: 'azure-management',
    topic: 'Governance and compliance',
    prompt:
      'You want to prevent a critical Azure resource from being accidentally deleted. Which type of resource lock should you apply?',
    options: [
      {
        id: 0,
        text: 'A CanNotDelete lock',
        explanation:
          'Correct. A CanNotDelete lock prevents deletion while still allowing modifications to the resource\u2019s configuration.',
      },
      {
        id: 1,
        text: 'A ReadOnly lock',
        explanation:
          'Incorrect. A ReadOnly lock prevents both deletion and modification, which is more restrictive than needed to prevent only accidental deletion.',
      },
      {
        id: 2,
        text: 'An Azure Policy assignment',
        explanation:
          'Incorrect. Policy enforces compliance rules on resource properties; it is not the mechanism used to lock a specific resource against deletion.',
      },
      {
        id: 3,
        text: 'A network security group rule',
        explanation:
          'Incorrect. NSG rules control network traffic, not resource deletion.',
      },
    ],
    answer: 0,
  },
];

export interface ValidationIssue {
  questionId: string;
  field: string;
  message: string;
}

export function validateQuestions(questions: Question[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const q of questions) {
    if (!q.id) issues.push({ questionId: '(unknown)', field: 'id', message: 'Question is missing an id.' });
    if (!isDomainId(q.domain))
      issues.push({ questionId: q.id, field: 'domain', message: `Invalid domain: "${q.domain}".` });
    if (!q.topic) issues.push({ questionId: q.id, field: 'topic', message: 'Question is missing a topic.' });
    if (!q.prompt) issues.push({ questionId: q.id, field: 'prompt', message: 'Question is missing a prompt.' });
    if (q.options.length !== 4)
      issues.push({ questionId: q.id, field: 'options', message: `Expected 4 options, got ${q.options.length}.` });
    q.options.forEach((opt, i) => {
      if (!opt.text) issues.push({ questionId: q.id, field: `options[${i}].text`, message: 'Option is missing text.' });
      if (!opt.explanation)
        issues.push({ questionId: q.id, field: `options[${i}].explanation`, message: 'Option is missing an explanation.' });
      if (opt.id !== i)
        issues.push({ questionId: q.id, field: `options[${i}].id`, message: `Option id should be ${i}, got ${opt.id}.` });
    });
    if (!q.options.some((o) => o.id === q.answer))
      issues.push({ questionId: q.id, field: 'answer', message: `Answer ${q.answer} does not match any option id.` });
  }
  return issues;
}

export function questionsByDomain(domain: DomainId): Question[] {
  return QUESTIONS.filter((q) => q.domain === domain);
}

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((q) => q.id === id);
}
