import type { EmployeeData } from "@/types/schedule";

// Substring-match on the role string so multi-role employees match correctly
// (e.g. "Supervisor, Tech" still counts as a Supervisor).
const hasRole = (role: string, keyword: string) =>
  role.toLowerCase().includes(keyword.toLowerCase());

/**
 * Returns the names of employees who hold a Manager or Supervisor role.
 * Used to populate name dropdowns in LOD, Management Lunches, and MGMT tables.
 */
export function getManagerNames(directory: EmployeeData[]): string[] {
  return directory
    .filter((e) => hasRole(e.role, "Manager") || hasRole(e.role, "Supervisor"))
    .map((e) => e.name);
}

/**
 * Returns the names of employees whose role includes 'Receiving'.
 * Used to populate the Receiving column dropdown in the Receiving table.
 */
export function getReceivingNames(directory: EmployeeData[]): string[] {
  return directory
    .filter((e) => hasRole(e.role, "Receiving"))
    .map((e) => e.name);
}

/**
 * Returns the names of employees whose role includes 'Wireless'.
 * Used to populate the Bell column dropdown in the Bell table.
 */
export function getWirelessNames(directory: EmployeeData[]): string[] {
  return directory
    .filter((e) => hasRole(e.role, "Wireless"))
    .map((e) => e.name);
}
