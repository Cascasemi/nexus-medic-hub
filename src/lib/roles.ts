// Which staff roles can access which part of the app. Shared between route
// guards (App.tsx), nav visibility (SidebarNav.tsx), and in-page checks so
// they can't drift apart — a role should never see a nav link (or reach a
// page's content) that it can't actually use.
export const FOLDER_ROLES = ['admin', 'doctor', 'nurse'];
export const TEST_ROLES = ['admin', 'doctor', 'nurse', 'technician'];
export const DIAGNOSING_ROLES = ['admin', 'doctor', 'nurse'];
export const ADMIN_ONLY = ['admin'];
