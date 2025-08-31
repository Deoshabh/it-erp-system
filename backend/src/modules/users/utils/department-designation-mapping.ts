import { Department, Designation } from '../entities/user.entity';

// Mapping of departments to their relevant designations
export const DepartmentDesignationMapping: Record<Department, Designation[]> = {
  [Department.INFORMATION_TECHNOLOGY]: [
    Designation.CTO,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.SENIOR_SOFTWARE_ENGINEER,
    Designation.SOFTWARE_ENGINEER,
    Designation.JUNIOR_SOFTWARE_ENGINEER,
    Designation.SYSTEM_ADMINISTRATOR,
    Designation.DEVOPS_ENGINEER,
    Designation.QA_ENGINEER,
    Designation.SPECIALIST,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.HUMAN_RESOURCES]: [
    Designation.DIRECTOR,
    Designation.HR_MANAGER,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.HR_EXECUTIVE,
    Designation.RECRUITER,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.FINANCE]: [
    Designation.CFO,
    Designation.DIRECTOR,
    Designation.FINANCE_MANAGER,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.ACCOUNTANT,
    Designation.ACCOUNTS_EXECUTIVE,
    Designation.SPECIALIST,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.SALES]: [
    Designation.DIRECTOR,
    Designation.SALES_MANAGER,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.SALES_EXECUTIVE,
    Designation.BUSINESS_DEVELOPMENT_EXECUTIVE,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.MARKETING]: [
    Designation.DIRECTOR,
    Designation.MARKETING_MANAGER,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.MARKETING_EXECUTIVE,
    Designation.DIGITAL_MARKETING_SPECIALIST,
    Designation.SPECIALIST,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.OPERATIONS]: [
    Designation.DIRECTOR,
    Designation.OPERATIONS_MANAGER,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.OPERATIONS_EXECUTIVE,
    Designation.COORDINATOR,
    Designation.SPECIALIST,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.CUSTOMER_SERVICE]: [
    Designation.DIRECTOR,
    Designation.CUSTOMER_SERVICE_MANAGER,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.CUSTOMER_SERVICE_REPRESENTATIVE,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.PROCUREMENT]: [
    Designation.DIRECTOR,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.COORDINATOR,
    Designation.SPECIALIST,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.QUALITY_ASSURANCE]: [
    Designation.DIRECTOR,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.QA_ENGINEER,
    Designation.SPECIALIST,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.RESEARCH_DEVELOPMENT]: [
    Designation.DIRECTOR,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.SENIOR_SOFTWARE_ENGINEER,
    Designation.SOFTWARE_ENGINEER,
    Designation.SPECIALIST,
    Designation.COORDINATOR,
    Designation.CONSULTANT,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.ADMINISTRATION]: [
    Designation.CEO,
    Designation.DIRECTOR,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
  
  [Department.LEGAL]: [
    Designation.DIRECTOR,
    Designation.MANAGER,
    Designation.ASSISTANT_MANAGER,
    Designation.SPECIALIST,
    Designation.CONSULTANT,
    Designation.COORDINATOR,
    Designation.EXECUTIVE,
    Designation.INTERN,
    Designation.TRAINEE,
  ],
};

// Helper function to get designations by department
export function getDesignationsByDepartment(department: Department): Designation[] {
  return DepartmentDesignationMapping[department] || [];
}

// Helper function to format designation for display
export function formatDesignationLabel(designation: Designation): string {
  return designation
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Helper function to format department for display
export function formatDepartmentLabel(department: Department): string {
  return department
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
