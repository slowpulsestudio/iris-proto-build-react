/**
 * aiPrompts — the suggested-prompt "pills" shown in the AI panel's empty
 * state. Kept in lib (rather than inline in AiPanel) so the constants can be
 * shared without importing the AiPanel component. The Identity Manager Home
 * page defines its own chips (HOME_CHIPS in mockIdentityHome).
 */

export interface SuggestedPrompt {
  label: string;
  prompt: string;
  icon: string;
}

/** Default pills (no selection context). */
export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    label: 'How do I delegate location management?',
    prompt: 'How do I delegate location management to another identity?',
    icon: 'UserSwitch',
  },
  {
    label: 'Audit recent permission changes',
    prompt: 'Show me how to audit recent permission changes.',
    icon: 'ClockCounterClockwise',
  },
  {
    label: 'Bulk-import identities from CSV',
    prompt: 'How can I bulk-import identities from a CSV file?',
    icon: 'UploadSimple',
  },
];

/** Pills shown when the panel has pending selection context. */
export const CONTEXT_PROMPTS: SuggestedPrompt[] = [
  {
    label: 'Summarize these selections',
    prompt: 'Summarize the selected items and what they have in common.',
    icon: 'ListBullets',
  },
  {
    label: 'Review their permissions',
    prompt: 'Review the effective permissions for the selected items and flag anything risky.',
    icon: 'ShieldCheck',
  },
  {
    label: 'Suggest a bulk action',
    prompt: 'What bulk actions would you recommend for the selected items?',
    icon: 'Lightning',
  },
];
