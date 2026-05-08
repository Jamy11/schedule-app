import type { Employee, EmployeeData } from "@/types/schedule";

export function createEmployee(id: number): Employee {
  return { id, name: "", role: "", shift: "", b1: "", b2: "", b3: "" };
}

export function handleAddRow(employees: Employee[]): Employee[] {
  const maxId =
    employees.length > 0 ? Math.max(...employees.map((e) => e.id)) : 0;
  return [...employees, createEmployee(maxId + 1)];
}

export function handleDeleteRow(
  employees: Employee[],
  idToDelete: number
): Employee[] {
  return employees.filter((e) => e.id !== idToDelete);
}

export function handleEmployeeSelection(
  selectedName: string,
  directory: EmployeeData[],
  currentEmployee: Employee
): Employee {
  const found = directory.find((e) => e.name === selectedName);
  return found
    ? { ...currentEmployee, name: selectedName, role: found.role }
    : { ...currentEmployee, name: selectedName };
}

export function handleTimeSelection(
  employees: Employee[],
  employeeId: number,
  startTime: string,
  endTime: string
): Employee[] {
  return employees.map((emp) =>
    emp.id === employeeId
      ? { ...emp, shift: `${startTime} – ${endTime}` }
      : emp
  );
}
