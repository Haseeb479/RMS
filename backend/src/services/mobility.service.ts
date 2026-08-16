import { prisma } from '../config/database';
import { AuditService } from './audit.service';
import { JobService } from './job.service';

export interface SuccessorMatch {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  currentDesignation: string;
  currentLevel: string;
  currentSalary: number | null;
  experienceYears: number;
  performanceRating: number;
  matchScore: number; // 0 - 100%
  skillsMatch: string[];
  skillsMissing: string[];
  readinessLevel: 'Ready Now' | 'Ready in 3-6 Mo' | 'High Potential';
  recommendationReason: string;
}

export class MobilityService {

  /**
   * AI Talent Succession & Promotion Match Engine
   * Evaluates all active employees in the company against the vacant position
   */
  static async evaluateSuccessors(
    companyId: string,
    targetDesignation: string,
    department: string,
    targetLevel: string = 'senior',
    targetSkills: string[] = []
  ): Promise<SuccessorMatch[]> {
    // Fetch all active employees in the company (excluding offboarded)
    const employees = await (prisma as any).employee.findMany({
      where: {
        companyId,
        status: 'active',
      },
    });

    if (!employees || employees.length === 0) {
      return [];
    }

    const matches: SuccessorMatch[] = [];

    // Extract target skill keywords
    const targetKeywords = targetSkills.length > 0 
      ? targetSkills.map(s => s.toLowerCase().trim())
      : targetDesignation.toLowerCase().split(/[\s,/]+/).filter(w => w.length > 2);

    for (const emp of employees) {
      let empSkills: string[] = [];
      try {
        empSkills = emp.skills ? JSON.parse(emp.skills) : [];
      } catch {
        empSkills = typeof emp.skills === 'string' ? emp.skills.split(',') : [];
      }
      const empSkillsLower = empSkills.map(s => s.toLowerCase().trim());

      // 1. Skill Overlap Score (40 pts)
      const matchedSkills = empSkills.filter(s => 
        targetKeywords.some(kw => s.toLowerCase().includes(kw) || kw.includes(s.toLowerCase()))
      );
      const missingSkills = targetSkills.filter(s => 
        !empSkillsLower.some(es => es.includes(s.toLowerCase()))
      );

      const skillRatio = targetKeywords.length > 0 ? (matchedSkills.length / Math.max(targetKeywords.length, 1)) : 0.6;
      const skillScore = Math.min(skillRatio * 40, 40);

      // 2. Performance Rating Score (30 pts) -> 4.5/5.0 = 27 pts
      const perfScore = Math.min((emp.performanceRating / 5.0) * 30, 30);

      // 3. Department & Domain Alignment Score (20 pts)
      const isSameDept = emp.department.toLowerCase() === department.toLowerCase();
      const deptScore = isSameDept ? 20 : 8;

      // 4. Experience & Career Progression Score (10 pts)
      const expScore = Math.min((emp.experienceYears / 4.0) * 10, 10);

      // Total Match Score
      let totalMatch = Math.round(skillScore + perfScore + deptScore + expScore);
      totalMatch = Math.max(15, Math.min(totalMatch, 98));

      // Readiness determination
      let readiness: 'Ready Now' | 'Ready in 3-6 Mo' | 'High Potential' = 'Ready in 3-6 Mo';
      if (totalMatch >= 80 && emp.performanceRating >= 4.0 && emp.experienceYears >= 2) {
        readiness = 'Ready Now';
      } else if (totalMatch >= 65 || emp.performanceRating >= 4.3) {
        readiness = 'High Potential';
      }

      // Generate qualitative AI summary reason
      let reason = `${emp.firstName} is in ${emp.department} (${emp.experienceYears}y exp) with a strong ${emp.performanceRating.toFixed(1)}/5.0 performance appraisal`;
      if (isSameDept) {
        reason += ` and direct domain context in ${department}.`;
      } else {
        reason += ` with transferable cross-departmental capabilities.`;
      }

      matches.push({
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        email: emp.email,
        department: emp.department,
        currentDesignation: emp.designation,
        currentLevel: emp.level,
        currentSalary: emp.salary,
        experienceYears: emp.experienceYears,
        performanceRating: emp.performanceRating,
        matchScore: totalMatch,
        skillsMatch: matchedSkills.length > 0 ? matchedSkills : empSkills.slice(0, 3),
        skillsMissing: missingSkills.slice(0, 3),
        readinessLevel: readiness,
        recommendationReason: reason,
      });
    }

    // Sort by highest match score first, limit top 5
    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
  }

  /**
   * Ingest Payroll Departure / Offboarding Webhook Event
   */
  static async handleDepartureWebhook(
    companySlug: string,
    payload: {
      employeeCode?: string;
      employeeName?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      department?: string;
      designation?: string;
      level?: string;
      salary?: number;
      departureDate?: string;
      departureReason?: string;
      source?: string;
    }
  ) {
    const company = await prisma.company.findUnique({ where: { slug: companySlug } });
    if (!company) throw new Error('Company not found for slug');

    const fullName = payload.employeeName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'Departed Employee';
    const dept = payload.department || 'General';
    const title = payload.designation || 'Staff Member';
    const level = payload.level || 'senior';

    // 1. Mark existing employee as offboarded if found
    let matchedEmployee = null;
    if (payload.employeeCode || payload.email) {
      matchedEmployee = await (prisma as any).employee.findFirst({
        where: {
          companyId: company.id,
          OR: [
            payload.employeeCode ? { employeeCode: payload.employeeCode } : {},
            payload.email ? { email: payload.email } : {},
          ].filter(Boolean),
        },
      });

      if (matchedEmployee) {
        await (prisma as any).employee.update({
          where: { id: matchedEmployee.id },
          data: {
            status: 'offboarded',
            exitDate: payload.departureDate ? new Date(payload.departureDate) : new Date(),
            exitReason: payload.departureReason || 'Payroll Offboarding Integration',
          },
        });
      }
    }

    // 2. Run AI Succession matching engine
    const suggestedSuccessors = await this.evaluateSuccessors(company.id, title, dept, level);

    // 3. Create Departure Event
    const event = await (prisma as any).payrollDepartureEvent.create({
      data: {
        companyId: company.id,
        employeeId: matchedEmployee?.id || null,
        employeeName: fullName,
        employeeEmail: payload.email || matchedEmployee?.email || null,
        department: dept,
        designation: title,
        level,
        salary: payload.salary || matchedEmployee?.salary || null,
        departureDate: payload.departureDate ? new Date(payload.departureDate) : new Date(),
        departureReason: payload.departureReason || 'Payroll Offboarding Integration',
        source: payload.source || 'payroll_webhook',
        status: 'pending_action',
        suggestedSuccessors: JSON.stringify(suggestedSuccessors),
      },
    });

    // 4. Audit Log
    await AuditService.log(
      company.id,
      'PAYROLL_EMPLOYEE_DEPARTED',
      `Payroll event: ${fullName} departed from ${dept} (${title}). Succession AI generated ${suggestedSuccessors.length} internal promotion candidates.`
    );

    return event;
  }

  /**
   * Execute Internal Promotion and trigger Cascading Vacancy Backfill
   */
  static async promoteEmployee(
    companyId: string,
    eventId: string,
    employeeId: string,
    newSalary?: number
  ) {
    const event = await (prisma as any).payrollDepartureEvent.findFirst({
      where: { id: eventId, companyId },
    });
    if (!event) throw new Error('Vacancy event not found');

    const employee = await (prisma as any).employee.findFirst({
      where: { id: employeeId, companyId },
    });
    if (!employee) throw new Error('Employee not found');

    const formerDesignation = employee.designation;
    const formerDepartment = employee.department;
    const formerLevel = employee.level;
    const formerSalary = employee.salary;

    // 1. Promote Employee to target role
    const updatedEmployee = await (prisma as any).employee.update({
      where: { id: employeeId },
      data: {
        designation: event.designation,
        department: event.department,
        level: event.level,
        salary: newSalary || (event.salary ? Math.round(event.salary * 0.95) : employee.salary),
        status: 'active',
      },
    });

    // 2. Mark current event as resolved with internal promotion
    await (prisma as any).payrollDepartureEvent.update({
      where: { id: eventId },
      data: {
        status: 'promoted_internally',
        selectedSuccessorId: employeeId,
        promotedEmployeeName: `${employee.firstName} ${employee.lastName}`,
      },
    });

    // 3. 🚨 AUTOMATED CASCADING BACKFILL:
    // Because the employee was promoted, their previous junior/mid position is now vacant!
    // Evaluate successors for their vacated seat and create a cascading vacancy event.
    const cascadingSuccessors = await this.evaluateSuccessors(
      companyId,
      formerDesignation,
      formerDepartment,
      formerLevel
    );

    const cascadingEvent = await (prisma as any).payrollDepartureEvent.create({
      data: {
        companyId,
        employeeId: null,
        employeeName: `${employee.firstName} ${employee.lastName} (Vacated seat upon promotion)`,
        employeeEmail: employee.email,
        department: formerDepartment,
        designation: formerDesignation,
        level: formerLevel,
        salary: formerSalary,
        departureDate: new Date(),
        departureReason: `Cascading vacancy: Promoted to ${event.designation}`,
        source: 'cascading_internal_promotion',
        status: 'pending_action',
        isCascadingVacancy: true,
        cascadedFromRole: event.designation,
        suggestedSuccessors: JSON.stringify(cascadingSuccessors),
      },
    });

    // Audit Log
    await AuditService.log(
      companyId,
      'INTERNAL_PROMOTION_EXECUTED',
      `Promoted ${employee.firstName} ${employee.lastName} to ${event.designation} in ${event.department}. Spawned cascading backfill requisition for former role (${formerDesignation}).`
    );

    return {
      promotedEmployee: updatedEmployee,
      cascadingEvent,
    };
  }

  /**
   * Create Job Requisition from Vacant Seat
   */
  static async createJobRequisitionFromVacancy(
    companyId: string,
    eventId: string,
    overrideData: any = {}
  ) {
    const event = await (prisma as any).payrollDepartureEvent.findFirst({
      where: { id: eventId, companyId },
    });
    if (!event) throw new Error('Vacancy event not found');

    const title = overrideData.title || event.designation;
    const department = overrideData.department || event.department;
    const salary = overrideData.salary || (event.salary ? `$${event.salary.toLocaleString()} / year` : undefined);

    const description = overrideData.description || 
      `We are hiring a talented ${title} to join our high-impact ${department} team. You will drive key strategic initiatives, collaborate with cross-functional partners, and shape the future of our products.`;

    const requirements = overrideData.requirements || 
      `- Proven track record in ${department} as a ${title} or related field\n- Strong problem solving and collaborative communication\n- Demonstrated excellence in team delivery and execution.`;

    // Create Draft Job
    const job = await JobService.create(companyId, {
      title,
      description,
      location: overrideData.location || 'Hybrid / Remote',
      type: overrideData.type || 'full-time',
      salary,
      requirements,
    });

    // Mark event as requisition created
    await (prisma as any).payrollDepartureEvent.update({
      where: { id: eventId },
      data: {
        status: 'requisition_created',
        createdJobId: job.id,
      },
    });

    await AuditService.log(
      companyId,
      'VACANCY_JOB_REQUISITION_CREATED',
      `Created open job requisition for ${title} (${department}) following departure of ${event.employeeName}.`
    );

    return job;
  }

  /**
   * List Vacancy & Departure Events
   */
  static async listEvents(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;

    return await (prisma as any).payrollDepartureEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List Company Employees Directory
   */
  static async listEmployees(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.department) where.department = filters.department;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { designation: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await (prisma as any).employee.findMany({
      where,
      orderBy: [{ department: 'asc' }, { designation: 'asc' }],
    });
  }

  /**
   * Create or Seed Employee Record
   */
  static async createEmployee(companyId: string, data: any) {
    let employeeCode = data.employeeCode;
    if (!employeeCode) {
      const count = await (prisma as any).employee.count({ where: { companyId } });
      employeeCode = `EMP-${100 + count + 1}`;
    }

    return await (prisma as any).employee.create({
      data: {
        companyId,
        employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        department: data.department || 'Engineering',
        designation: data.designation || 'Software Engineer',
        level: data.level || 'mid',
        skills: data.skills ? (typeof data.skills === 'string' ? data.skills : JSON.stringify(data.skills)) : JSON.stringify(['JavaScript', 'Node.js', 'Teamwork']),
        experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : 2,
        salary: data.salary ? Number(data.salary) : 85000,
        performanceRating: data.performanceRating ? Number(data.performanceRating) : 4.2,
        status: data.status || 'active',
      },
    });
  }

  /**
   * Seed Full Enterprise Talent Pool (120+ employees across 6 key departments)
   */
  static async seedSampleEmployees(companyId: string, force: boolean = false) {
    if (!force) {
      const count = await (prisma as any).employee.count({ where: { companyId } });
      if (count >= 50) return { count, message: 'Directory already contains enterprise workforce' };
    }

    // Clear existing if force
    if (force) {
      await (prisma as any).employee.deleteMany({ where: { companyId } });
    }

    const departmentsData = [
      // 1. Supply Chain Management
      {
        department: 'Supply Chain Management',
        roles: [
          { title: 'VP of Global Supply Chain', level: 'vp', skills: ['Global Logistics', 'Strategic Sourcing', 'ERP Supply Chain', 'Vendor Negotiation', 'Risk Management'], exp: 14, salary: 195000, perf: 4.9 },
          { title: 'Supply Chain Director', level: 'director', skills: ['Supply Network Optimization', 'Operations Leadership', 'Cost Reduction', 'Logistics Management'], exp: 11, salary: 160000, perf: 4.8 },
          { title: 'Senior Procurement Manager', level: 'lead', skills: ['Strategic Procurement', 'Supplier Audits', 'Contract Management', 'SAP MM', 'Cost Analysis'], exp: 8, salary: 125000, perf: 4.7 },
          { title: 'Procurement Specialist', level: 'senior', skills: ['Vendor Management', 'Purchase Orders', 'RFQ/RFP Process', 'Supplier Evaluation'], exp: 5, salary: 88000, perf: 4.5 },
          { title: 'Associate Sourcing Specialist', level: 'mid', skills: ['Sourcing', 'Contract Review', 'Supplier Relations', 'Cost Benchmarking'], exp: 3, salary: 72000, perf: 4.2 },
          { title: 'Junior Buyer', level: 'junior', skills: ['PO Processing', 'Vendor Communications', 'Excel', 'Inventory Tracking'], exp: 1, salary: 56000, perf: 4.1 },
          { title: 'Logistics Operations Director', level: 'director', skills: ['Fleet Management', '3PL Management', 'International Freight', 'Distribution Networks'], exp: 12, salary: 155000, perf: 4.8 },
          { title: 'Senior Logistics Coordinator', level: 'senior', skills: ['Freight Forwarding', 'Route Optimization', 'Warehouse Dispatch', 'TMS'], exp: 6, salary: 92000, perf: 4.6 },
          { title: 'Logistics Coordinator', level: 'mid', skills: ['Shipment Tracking', 'Carrier Relations', 'Bill of Lading', 'Documentation'], exp: 3, salary: 68000, perf: 4.3 },
          { title: 'Logistics Associate', level: 'junior', skills: ['Dispatch Support', 'Shipping Labels', 'Inventory Logs', 'Customer Support'], exp: 1, salary: 52000, perf: 4.0 },
          { title: 'Demand Planning Manager', level: 'lead', skills: ['Forecasting', 'S&OP', 'Statistical Modeling', 'Inventory Optimization', 'Tableau'], exp: 9, salary: 130000, perf: 4.8 },
          { title: 'Senior Demand Planner', level: 'senior', skills: ['Demand Forecasting', 'Supply-Demand Balancing', 'Safety Stock', 'ERP Planning'], exp: 6, salary: 98000, perf: 4.6 },
          { title: 'Supply Chain Data Analyst', level: 'mid', skills: ['SQL', 'PowerBI', 'Supply Chain Analytics', 'Python', 'KPI Reporting'], exp: 3, salary: 78000, perf: 4.5 },
          { title: 'Junior Inventory Analyst', level: 'junior', skills: ['Inventory Counts', 'Stock Reconciliation', 'Excel', 'ERP Data Entry'], exp: 1, salary: 54000, perf: 4.2 },
          { title: 'Warehouse Operations Manager', level: 'lead', skills: ['WMS Systems', 'Warehouse Safety', 'Lean 5S', 'Staff Scheduling', 'Forklift Ops'], exp: 8, salary: 110000, perf: 4.7 },
          { title: 'Warehouse Shift Supervisor', level: 'mid', skills: ['Shift Management', 'Order Fulfillment', 'Barcode Scanning', 'Quality Checks'], exp: 4, salary: 70000, perf: 4.3 },
          { title: 'Inventory Control Specialist', level: 'mid', skills: ['Cycle Counting', 'Stock Auditing', 'Shrinkage Prevention', 'WMS'], exp: 3, salary: 64000, perf: 4.4 },
          { title: 'Material Requirement Planner (MRP)', level: 'mid', skills: ['MRP Systems', 'BOM Management', 'Production Scheduling', 'Stock Replenishment'], exp: 4, salary: 76000, perf: 4.5 },
          { title: 'Vendor Quality Assurance Lead', level: 'senior', skills: ['Supplier Quality', 'ISO 9001', 'Defect Root Cause Analysis', 'Audits'], exp: 7, salary: 102000, perf: 4.6 },
          { title: 'Supply Chain Operations Trainee', level: 'junior', skills: ['Operations Support', 'Order Tracking', 'Excel', 'Data Entry'], exp: 1, salary: 50000, perf: 4.0 },
        ]
      },

      // 2. IT and Support
      {
        department: 'IT and Support',
        roles: [
          { title: 'Chief Information Officer (CIO)', level: 'vp', skills: ['IT Governance', 'Cloud Strategy', 'Cybersecurity', 'Enterprise Architecture', 'Budgeting'], exp: 16, salary: 210000, perf: 4.9 },
          { title: 'IT Infrastructure Director', level: 'director', skills: ['Hybrid Cloud', 'Data Center Ops', 'Network Strategy', 'Disaster Recovery'], exp: 12, salary: 165000, perf: 4.8 },
          { title: 'Principal Cloud Architect', level: 'lead', skills: ['AWS', 'Azure', 'Kubernetes', 'Terraform', 'Microservices', 'High Availability'], exp: 10, salary: 155000, perf: 4.9 },
          { title: 'Senior DevOps Engineer', level: 'senior', skills: ['CI/CD Pipelines', 'Docker', 'Kubernetes', 'GitHub Actions', 'Linux', 'Bash'], exp: 6, salary: 128000, perf: 4.7 },
          { title: 'DevOps Engineer', level: 'mid', skills: ['Docker', 'AWS', 'Jenkins', 'Linux Administration', 'Monitoring', 'Prometheus'], exp: 3, salary: 95000, perf: 4.4 },
          { title: 'Junior Cloud Administrator', level: 'junior', skills: ['AWS Basics', 'Linux', 'Shell Scripting', 'Virtual Machines'], exp: 1, salary: 70000, perf: 4.2 },
          { title: 'Senior Cybersecurity Architect', level: 'lead', skills: ['Threat Modeling', 'SOC Management', 'Zero Trust', 'Penetration Testing', 'SIEM'], exp: 9, salary: 145000, perf: 4.8 },
          { title: 'Information Security Analyst', level: 'mid', skills: ['Vulnerability Scans', 'Incident Response', 'Firewall Rules', 'Phishing Audits'], exp: 4, salary: 90000, perf: 4.5 },
          { title: 'Security Operations Specialist', level: 'junior', skills: ['Log Monitoring', 'EDR Tools', 'Access Control', 'Compliance Audits'], exp: 2, salary: 68000, perf: 4.2 },
          { title: 'Lead Network Engineer', level: 'lead', skills: ['Cisco CCNA/CCNP', 'BGP/OSPF', 'SD-WAN', 'VPNs', 'Load Balancers', 'VLANs'], exp: 8, salary: 130000, perf: 4.7 },
          { title: 'Senior Network Administrator', level: 'senior', skills: ['Network Config', 'WiFi 6 Infrastructure', 'Switching', 'Network Troubleshooting'], exp: 5, salary: 100000, perf: 4.6 },
          { title: 'Senior Database Administrator', level: 'senior', skills: ['PostgreSQL', 'Oracle DB', 'MySQL', 'Database Tuning', 'Replication', 'Backups'], exp: 7, salary: 120000, perf: 4.7 },
          { title: 'Database Support Specialist', level: 'mid', skills: ['SQL Queries', 'ETL Jobs', 'Index Optimization', 'Data Integrity'], exp: 3, salary: 82000, perf: 4.3 },
          { title: 'IT Helpdesk & Support Manager', level: 'lead', skills: ['ITIL', 'ServiceNow', 'SLA Management', 'Team Leadership', 'Customer Satisfaction'], exp: 7, salary: 105000, perf: 4.7 },
          { title: 'Senior IT Support Specialist', level: 'senior', skills: ['Active Directory', 'macOS/Windows OS', 'Hardware Diagnostics', 'Office 365'], exp: 5, salary: 80000, perf: 4.6 },
          { title: 'IT Support Technician (Tier 2)', level: 'mid', skills: ['Desktop Support', 'Network Troubleshooting', 'VoIP Phones', 'Ticketing Systems'], exp: 3, salary: 65000, perf: 4.4 },
          { title: 'IT Support Associate (Tier 1)', level: 'junior', skills: ['Password Resets', 'Laptop Imaging', 'Peripheral Setup', 'User Guidance'], exp: 1, salary: 52000, perf: 4.1 },
          { title: 'Junior IT Helpdesk Representative', level: 'junior', skills: ['Customer Service', 'Ticket Dispatch', 'Basic Troubleshooting', 'Inventory'], exp: 1, salary: 48000, perf: 4.0 },
          { title: 'Systems Administrator', level: 'mid', skills: ['Windows Server', 'Linux RedHat', 'VMware ESXi', 'Patch Management'], exp: 4, salary: 86000, perf: 4.5 },
          { title: 'IT Asset & License Coordinator', level: 'junior', skills: ['Hardware Asset Tracking', 'Software Licenses', 'Vendor Invoices', 'Procurement'], exp: 2, salary: 58000, perf: 4.2 },
        ]
      },

      // 3. ERP (Enterprise Resource Planning)
      {
        department: 'ERP',
        roles: [
          { title: 'VP of Enterprise Applications', level: 'vp', skills: ['Enterprise ERP', 'SAP S/4HANA', 'Oracle Cloud', 'Digital Transformation', 'C-Suite Strategy'], exp: 15, salary: 205000, perf: 4.9 },
          { title: 'ERP Program Director', level: 'director', skills: ['ERP Roadmaps', 'Cross-Module Integration', 'Vendor Management', 'Governance'], exp: 12, salary: 170000, perf: 4.8 },
          { title: 'Lead SAP S/4HANA Architect', level: 'lead', skills: ['SAP Architecture', 'Fiori', 'HANA DB', 'ABAP', 'System Landscape'], exp: 10, salary: 158000, perf: 4.9 },
          { title: 'Senior SAP Functional Consultant (SD/MM)', level: 'senior', skills: ['SAP SD', 'SAP MM', 'Order-to-Cash', 'Procure-to-Pay', 'Configuration'], exp: 7, salary: 135000, perf: 4.7 },
          { title: 'SAP Functional Consultant (FI/CO)', level: 'mid', skills: ['SAP FICO', 'General Ledger', 'Cost Center Accounting', 'Financial Reporting'], exp: 4, salary: 102000, perf: 4.5 },
          { title: 'Junior SAP Support Analyst', level: 'junior', skills: ['SAP GUI', 'User Roles', 'Master Data Maintenance', 'Ticket Resolution'], exp: 2, salary: 72000, perf: 4.2 },
          { title: 'Lead Oracle Cloud ERP Specialist', level: 'lead', skills: ['Oracle Financials', 'Oracle SCM Cloud', 'PL/SQL', 'BIP Reports', 'Integrations'], exp: 9, salary: 148000, perf: 4.8 },
          { title: 'Oracle ERP Technical Developer', level: 'senior', skills: ['Oracle Forms/Reports', 'OAF', 'REST APIs', 'Data Migration', 'Workflow'], exp: 6, salary: 118000, perf: 4.6 },
          { title: 'Oracle Functional Analyst', level: 'mid', skills: ['Oracle GL/AP/AR', 'Business Process Mapping', 'User Acceptance Testing'], exp: 3, salary: 88000, perf: 4.3 },
          { title: 'Senior NetSuite Administrator', level: 'senior', skills: ['NetSuite SuiteScript', 'SuiteFlow', 'Saved Searches', 'Advanced Financials'], exp: 6, salary: 122000, perf: 4.7 },
          { title: 'NetSuite Developer', level: 'mid', skills: ['SuiteScript 2.0', 'JavaScript', 'Custom Records', 'API Integrations'], exp: 3, salary: 92000, perf: 4.4 },
          { title: 'Junior NetSuite Analyst', level: 'junior', skills: ['User Permissions', 'Custom Fields', 'Data Imports', 'Reports'], exp: 1, salary: 65000, perf: 4.1 },
          { title: 'ERP Data Migration Lead', level: 'lead', skills: ['ETL Pipelines', 'Data Cleansing', 'Master Data Governance', 'SQL Server', 'Python'], exp: 8, salary: 132000, perf: 4.7 },
          { title: 'ERP Business Systems Analyst', level: 'senior', skills: ['Requirements Gathering', 'Gap Analysis', 'Process Re-engineering', 'Documentation'], exp: 5, salary: 98000, perf: 4.6 },
          { title: 'ERP Quality Assurance Lead', level: 'senior', skills: ['Test Automation', 'ERP Regression Testing', 'Selenium', 'Test Scripts'], exp: 6, salary: 105000, perf: 4.5 },
          { title: 'ERP Integration Specialist', level: 'mid', skills: ['MuleSoft', 'Middleware APIs', 'EDI 850/856/810', 'Web Services'], exp: 4, salary: 94000, perf: 4.4 },
          { title: 'ERP Technical Support Specialist', level: 'mid', skills: ['Issue Resolution', 'Patch Upgrades', 'User Training', 'System Monitoring'], exp: 3, salary: 78000, perf: 4.3 },
          { title: 'ERP Master Data Specialist', level: 'junior', skills: ['Master Data Management', 'Data Integrity', 'Excel', 'Data Validation'], exp: 2, salary: 60000, perf: 4.2 },
          { title: 'ERP Change Management Specialist', level: 'mid', skills: ['User Training', 'SOP Writing', 'Workflow Transition', 'Workshops'], exp: 4, salary: 84000, perf: 4.4 },
          { title: 'Junior ERP Support Trainee', level: 'junior', skills: ['Basic SQL', 'Data Auditing', 'Helpdesk Support', 'Documentation'], exp: 1, salary: 52000, perf: 4.0 },
        ]
      },

      // 4. HR Department
      {
        department: 'HR Department',
        roles: [
          { title: 'Chief Human Resources Officer (CHRO)', level: 'vp', skills: ['Talent Strategy', 'Executive Leadership', 'Culture', 'Compensation & Benefits', 'Labor Law'], exp: 15, salary: 190000, perf: 4.9 },
          { title: 'Director of People Operations', level: 'director', skills: ['People Ops', 'Employee Engagement', 'Org Design', 'HR Tech Stack', 'Retention'], exp: 11, salary: 150000, perf: 4.8 },
          { title: 'Senior HR Business Partner (HRBP)', level: 'lead', skills: ['Strategic HR', 'Talent Management', 'Succession Planning', 'Conflict Resolution', 'Coaching'], exp: 8, salary: 120000, perf: 4.8 },
          { title: 'HR Business Partner', level: 'senior', skills: ['Performance Management', 'Employee Relations', 'Org Health', 'Manager Coaching'], exp: 5, salary: 95000, perf: 4.6 },
          { title: 'Associate HR Business Partner', level: 'mid', skills: ['HR Advisory', 'Exit Interviews', 'Policy Guidance', 'Employee Surveys'], exp: 3, salary: 74000, perf: 4.3 },
          { title: 'Head of Talent Acquisition', level: 'lead', skills: ['Recruitment Strategy', 'Executive Hiring', 'Employer Branding', 'ATS Systems', 'Sourcing'], exp: 8, salary: 125000, perf: 4.8 },
          { title: 'Senior Technical Recruiter', level: 'senior', skills: ['Full-Cycle Recruiting', 'Boolean Search', 'Candidate Screening', 'Offer Negotiation'], exp: 5, salary: 96000, perf: 4.7 },
          { title: 'Corporate Recruiter', level: 'mid', skills: ['Interview Coordination', 'Resume Parsing', 'Job Boards Syndication', 'Onboarding'], exp: 3, salary: 72000, perf: 4.4 },
          { title: 'Talent Sourcing Specialist', level: 'junior', skills: ['LinkedIn Recruiter', 'Cold Outreach', 'Candidate Pipelines', 'Screening'], exp: 1, salary: 55000, perf: 4.2 },
          { title: 'Compensation & Benefits Manager', level: 'lead', skills: ['Salary Benchmarking', 'Equity Programs', 'Health Insurance', 'Retirement Plans', 'Tax Compliance'], exp: 8, salary: 128000, perf: 4.7 },
          { title: 'Payroll & Benefits Specialist', level: 'mid', skills: ['Payroll Processing', 'Zoho Payroll', 'Direct Deposit', 'Tax Withholdings', 'FMLA'], exp: 4, salary: 78000, perf: 4.5 },
          { title: 'Junior Payroll Clerk', level: 'junior', skills: ['Timesheet Auditing', 'Wage Calculations', 'Data Entry', 'Employee Queries'], exp: 1, salary: 52000, perf: 4.1 },
          { title: 'Learning & Development Manager', level: 'lead', skills: ['Instructional Design', 'Leadership Workshops', 'LMS Platforms', 'Skill Development'], exp: 7, salary: 112000, perf: 4.6 },
          { title: 'Training Specialist', level: 'mid', skills: ['Employee Onboarding', 'Webinars', 'SOP Training', 'Course Creation'], exp: 3, salary: 68000, perf: 4.3 },
          { title: 'Senior HR Generalist', level: 'senior', skills: ['HR Policies', 'Labor Compliance', 'Benefits Administration', 'Investigations'], exp: 6, salary: 88000, perf: 4.6 },
          { title: 'HR Generalist', level: 'mid', skills: ['Onboarding/Offboarding', 'HR Records', 'Employment Verification', 'I-9 Compliance'], exp: 3, salary: 66000, perf: 4.3 },
          { title: 'HR Operations Coordinator', level: 'junior', skills: ['Document Management', 'HR Inbox Management', 'Scheduling', 'New Hire Kits'], exp: 1, salary: 50000, perf: 4.1 },
          { title: 'People Analytics Specialist', level: 'mid', skills: ['HR Metrics', 'Turnover Analysis', 'Diversity Reporting', 'Tableau', 'Excel'], exp: 3, salary: 76000, perf: 4.5 },
        ]
      },

      // 5. Import Export Depart
      {
        department: 'Import Export Depart',
        roles: [
          { title: 'VP of International Trade', level: 'vp', skills: ['Global Commerce', 'Trade Treaties', 'Customs Strategy', 'Tariff Negotiation', 'International Law'], exp: 15, salary: 195000, perf: 4.9 },
          { title: 'Director of Global Import/Export', level: 'director', skills: ['International Logistics', 'Cross-Border Compliance', 'Freight Contracts', 'Incoterms 2020'], exp: 11, salary: 155000, perf: 4.8 },
          { title: 'Customs Compliance Manager', level: 'lead', skills: ['Customs Regulations', 'HTS Tariff Codes', 'ITAR/EAR', 'C-TPAT', 'Customs Audits'], exp: 8, salary: 122000, perf: 4.7 },
          { title: 'Licensed Customs Broker Specialist', level: 'senior', skills: ['Customs Declarations', 'Duty Drawbacks', 'Classification', 'Entry Summaries'], exp: 6, salary: 98000, perf: 4.6 },
          { title: 'Customs Entry Specialist', level: 'mid', skills: ['Customs Filings', 'Bill of Lading', 'Commercial Invoices', 'Border Clearances'], exp: 3, salary: 72000, perf: 4.3 },
          { title: 'Junior Customs Associate', level: 'junior', skills: ['Document Collation', 'HTS Lookup', 'Import Permits', 'Data Verification'], exp: 1, salary: 54000, perf: 4.1 },
          { title: 'International Freight Forwarding Lead', level: 'lead', skills: ['Ocean Freight (FCL/LCL)', 'Air Freight Charters', 'Port Drayage', 'Carrier Contracts'], exp: 8, salary: 118000, perf: 4.7 },
          { title: 'Senior Ocean Freight Coordinator', level: 'senior', skills: ['Booking Confirmations', 'Container Tracking', 'Demurrage Management', 'Vessel Schedules'], exp: 5, salary: 88000, perf: 4.5 },
          { title: 'Air Cargo Specialist', level: 'mid', skills: ['Air Waybills', 'Hazardous Air Freight', 'TSA Regulations', 'Express Courier'], exp: 4, salary: 76000, perf: 4.4 },
          { title: 'Export Documentation Manager', level: 'lead', skills: ['Export Licensing', 'Certificate of Origin', 'Consular Invoices', 'Letter of Credit (LC)'], exp: 7, salary: 112000, perf: 4.7 },
          { title: 'Senior Export Compliance Analyst', level: 'senior', skills: ['Denied Party Screening', 'Sanctions Compliance', 'AES Direct Filings'], exp: 5, salary: 92000, perf: 4.6 },
          { title: 'Export Logistics Executive', level: 'mid', skills: ['Shipping Instructions', 'Packing Lists', 'Port Customs Release', 'Freight Rates'], exp: 3, salary: 70000, perf: 4.3 },
          { title: 'Trade Finance & LC Specialist', level: 'senior', skills: ['Letter of Credit Auditing', 'Trade Finance', 'Bank Discrepancies', 'Incoterms'], exp: 6, salary: 96000, perf: 4.6 },
          { title: 'International Logistics Clerk', level: 'junior', skills: ['Tracking Reports', 'Arrival Notices', 'Delivery Orders', 'Filing'], exp: 1, salary: 50000, perf: 4.0 },
          { title: 'Port Operations Coordinator', level: 'mid', skills: ['Terminal Operations', 'Customs Inspections', 'Demurrage/Detention', 'Drayage'], exp: 4, salary: 75000, perf: 4.4 },
          { title: 'Marine Insurance & Claims Specialist', level: 'mid', skills: ['Cargo Insurance', 'Damage Inspection', 'Marine Claims', 'Loss Prevention'], exp: 4, salary: 80000, perf: 4.5 },
          { title: 'Cross-Border Operations Analyst', level: 'mid', skills: ['Cross-Border Logistics', 'Free Trade Agreements (USMCA/EU)', 'Duty Savings'], exp: 3, salary: 74000, perf: 4.3 },
          { title: 'Import/Export Documentation Assistant', level: 'junior', skills: ['Invoice Matching', 'Scanning & Archiving', 'Courier Dispatch', 'Status Updates'], exp: 1, salary: 48000, perf: 4.0 },
          { title: 'Dangerous Goods (HazMat) Shipping Lead', level: 'senior', skills: ['IMDG Regulations', 'IATA DGR', 'Dangerous Goods Declaration', 'Material Safety'], exp: 6, salary: 104000, perf: 4.6 },
          { title: 'Global Trade Compliance Trainee', level: 'junior', skills: ['Trade Data Entry', 'Compliance Checklists', 'Vendor Document Collection'], exp: 1, salary: 51000, perf: 4.1 },
        ]
      },

      // 6. Sales Deprt
      {
        department: 'Sales Deprt',
        roles: [
          { title: 'Chief Commercial Officer (CCO) / VP of Sales', level: 'vp', skills: ['Global Sales Leadership', 'Revenue Strategy', 'Enterprise Deals', 'Executive Negotiation', 'Forecasting'], exp: 16, salary: 220000, perf: 4.9 },
          { title: 'Enterprise Sales Director', level: 'director', skills: ['Enterprise GTM', 'Territory Planning', 'Quota Attainment', 'Deal Architecture'], exp: 12, salary: 175000, perf: 4.8 },
          { title: 'Senior Enterprise Account Executive', level: 'lead', skills: ['Complex B2B Sales', 'C-Suite Presentations', 'MEDDPICC', 'Salesforce CRM', 'Multi-Year Contracts'], exp: 8, salary: 140000, perf: 4.8 },
          { title: 'Enterprise Account Executive', level: 'senior', skills: ['Solution Selling', 'Client Prospecting', 'Contract Negotiation', 'Demo Presentations'], exp: 5, salary: 110000, perf: 4.6 },
          { title: 'Mid-Market Account Executive', level: 'mid', skills: ['Pipeline Management', 'Discovery Calls', 'Closing Deals', 'Relationship Building'], exp: 3, salary: 85000, perf: 4.4 },
          { title: 'Junior Account Executive', level: 'junior', skills: ['Cold Prospecting', 'Product Demos', 'Follow-up Emails', 'CRM Updating'], exp: 1, salary: 65000, perf: 4.2 },
          { title: 'Sales Operations Director', level: 'director', skills: ['Sales Analytics', 'Incentive Compensation', 'Salesforce Architecture', 'Territory Design'], exp: 10, salary: 150000, perf: 4.8 },
          { title: 'Senior Sales Operations Analyst', level: 'senior', skills: ['Revenue Forecasting', 'CRM Optimization', 'Sales Velocity Reports', 'BI Dashboards'], exp: 5, salary: 98000, perf: 4.6 },
          { title: 'Sales Enablement Manager', level: 'lead', skills: ['Sales Playbooks', 'Rep Training', 'Competitive Battlecards', 'Pitch Coaching'], exp: 7, salary: 115000, perf: 4.7 },
          { title: 'Lead Solutions Consultant / Sales Engineer', level: 'lead', skills: ['Technical Architecture', 'RFP Responses', 'Technical Proof-of-Concept', 'API Demos'], exp: 8, salary: 138000, perf: 4.8 },
          { title: 'Senior Solutions Engineer', level: 'senior', skills: ['Product Integrations', 'Technical Demonstrations', 'Pre-Sales Consulting'], exp: 5, salary: 112000, perf: 4.6 },
          { title: 'Business Development Manager (Inbound/Outbound)', level: 'lead', skills: ['BDR Coaching', 'Outreach Cadences', 'Cold Calling Mastery', 'Lead Qualification'], exp: 7, salary: 108000, perf: 4.7 },
          { title: 'Senior Business Development Representative (BDR)', level: 'senior', skills: ['Account-Based Marketing', 'Cold Calling', 'Email Campaigns', 'SalesLoft'], exp: 4, salary: 75000, perf: 4.5 },
          { title: 'Business Development Representative (BDR)', level: 'mid', skills: ['Lead Generation', 'Cold Emailing', 'LinkedIn Outreach', 'Qualifying Leads'], exp: 2, salary: 62000, perf: 4.3 },
          { title: 'Inbound Sales Development Rep (SDR)', level: 'junior', skills: ['Inbound Lead Routing', 'Fast Response', 'Meeting Booking', 'HubSpot'], exp: 1, salary: 54000, perf: 4.2 },
          { title: 'Junior SDR Trainee', level: 'junior', skills: ['Phone Prospecting', 'List Building', 'Contact Verification', 'CRM Entry'], exp: 1, salary: 48000, perf: 4.0 },
          { title: 'Customer Success Director', level: 'director', skills: ['Gross/Net Revenue Retention', 'Customer Onboarding', 'QBR Leadership', 'Churn Prevention'], exp: 10, salary: 145000, perf: 4.8 },
          { title: 'Senior Customer Success Manager', level: 'senior', skills: ['Account Health Audits', 'Upsell/Cross-sell', 'Executive Sponsor Meetings'], exp: 5, salary: 98000, perf: 4.6 },
          { title: 'Customer Success Manager', level: 'mid', skills: ['Client Training', 'Usage Analytics', 'Support Escalations', 'Renewals'], exp: 3, salary: 78000, perf: 4.4 },
          { title: 'Strategic Account Manager (Key Accounts)', level: 'senior', skills: ['VIP Client Retention', 'Expansion Revenue', 'Multi-Year Growth Strategy'], exp: 6, salary: 105000, perf: 4.7 },
        ]
      }
    ];

    const firstNames = ['James', 'Emma', 'Olivia', 'Noah', 'Liam', 'Sophia', 'Lucas', 'Mia', 'Benjamin', 'Charlotte', 'Elijah', 'Amelia', 'William', 'Harper', 'Alexander', 'Evelyn', 'Daniel', 'Abigail', 'Matthew', 'Emily', 'Henry', 'Elizabeth', 'Sebastian', 'Mila', 'Jack', 'Ella', 'Samuel', 'Avery', 'David', 'Sofia', 'Joseph', 'Camila', 'Carter', 'Aria', 'Owen', 'Scarlett', 'Wyatt', 'Victoria', 'John', 'Madison', 'Dylan', 'Luna', 'Luke', 'Grace', 'Gabriel', 'Chloe', 'Anthony', 'Penelope', 'Isaac', 'Layla'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

    let empCodeCounter = 1001;
    let totalCreated = 0;

    for (const deptGroup of departmentsData) {
      for (let rIdx = 0; rIdx < deptGroup.roles.length; rIdx++) {
        const role = deptGroup.roles[rIdx];
        const fn = firstNames[(empCodeCounter * 3 + rIdx) % firstNames.length];
        const ln = lastNames[(empCodeCounter * 7 + rIdx) % lastNames.length];
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${empCodeCounter % 10}@jhon-corp.com`;
        const phone = `+1 (555) ${Math.floor(100 + Math.random() * 899)}-${Math.floor(1000 + Math.random() * 8999)}`;

        await (prisma as any).employee.create({
          data: {
            companyId,
            employeeCode: `EMP-${empCodeCounter}`,
            firstName: fn,
            lastName: ln,
            email,
            phone,
            department: deptGroup.department,
            designation: role.title,
            level: role.level,
            skills: JSON.stringify(role.skills),
            experienceYears: role.exp,
            salary: role.salary,
            performanceRating: role.perf,
            status: 'active',
            hireDate: new Date(Date.now() - role.exp * 365 * 24 * 60 * 60 * 1000),
          },
        });

        empCodeCounter++;
        totalCreated++;
      }
    }

    return {
      count: totalCreated,
      message: `Successfully populated ${totalCreated} enterprise employees across all 6 departments for Jhon's company.`,
    };
  }
}

