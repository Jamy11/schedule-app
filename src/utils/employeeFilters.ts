import type { EmployeeData } from "@/types/schedule";

const MANAGER_ROLES = ["Manager", "Supervisor"] as const;

/**
 * Returns the names of employees who hold a management or supervisor role.
 * Used to populate name dropdowns in LOD, Management Lunches, and MGMT tables.
 */
export function getManagerNames(directory: EmployeeData[]): string[] {
  return directory
    .filter((e) => (MANAGER_ROLES as readonly string[]).includes(e.role))
    .map((e) => e.name);
}

/**
 * Returns the names of employees whose role is 'Receiving'.
 * Used to populate the Receiving column dropdown in the Receiving table.
 */
export function getReceivingNames(directory: EmployeeData[]): string[] {
  return directory
    .filter((e) => e.role === "Receiving")
    .map((e) => e.name);
}

/**
 * Returns the names of employees whose role is 'Wireless'.
 * Used to populate the Bell column dropdown in the Bell table.
 */
export function getWirelessNames(directory: EmployeeData[]): string[] {
  return directory
    .filter((e) => e.role === "Wireless")
    .map((e) => e.name);
}
