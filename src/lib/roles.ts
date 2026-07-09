// Which staff roles can access which part of the app. Shared between route
// guards (App.tsx) and nav visibility (SidebarNav.tsx) so they can't drift
// apart — a role should never see a nav link to a page it can't open.
export const CLINICAL_ROLES = ['admin', 'doctor', 'nurse', 'technician'];
export const DIAGNOSING_ROLES = ['admin', 'doctor', 'nurse'];
export const ADMIN_ONLY = ['admin'];
