import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.progressSnapshot.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.siteVendorRollout.deleteMany();
  await prisma.workStream.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.site.deleteMany();

  // Create 16 Sites (NATO phonetic alphabet)
  const siteDefs = [
    { id: "site-alpha",    name: "Alpha",    description: "SAGD Facility A", location: "Fort McMurray, AB" },
    { id: "site-bravo",    name: "Bravo",    description: "SAGD Facility B", location: "Conklin, AB" },
    { id: "site-charlie",  name: "Charlie",  description: "SAGD Facility C", location: "Lac La Biche, AB" },
    { id: "site-delta",    name: "Delta",    description: "SAGD Facility D", location: "Cold Lake, AB" },
    { id: "site-echo",     name: "Echo",     description: "SAGD Facility E", location: "Bonnyville, AB" },
    { id: "site-foxtrot",  name: "Foxtrot",  description: "SAGD Facility F", location: "Wabasca, AB" },
    { id: "site-golf",     name: "Golf",     description: "SAGD Facility G", location: "Peace River, AB" },
    { id: "site-hotel",    name: "Hotel",    description: "SAGD Facility H", location: "High Level, AB" },
    { id: "site-india",    name: "India",    description: "SAGD Facility I", location: "Grande Prairie, AB" },
    { id: "site-juliet",   name: "Juliet",   description: "SAGD Facility J", location: "Slave Lake, AB" },
    { id: "site-kilo",     name: "Kilo",     description: "SAGD Facility K", location: "Athabasca, AB" },
    { id: "site-lima",     name: "Lima",     description: "SAGD Facility L", location: "Edson, AB" },
    { id: "site-mike",     name: "Mike",     description: "SAGD Facility M", location: "Whitecourt, AB" },
    { id: "site-november", name: "November", description: "SAGD Facility N", location: "Hinton, AB" },
    { id: "site-oscar",    name: "Oscar",    description: "SAGD Facility O", location: "Drayton Valley, AB" },
    { id: "site-papa",     name: "Papa",     description: "SAGD Facility P", location: "Lloydminster, AB" },
  ];

  const siteRecords: Record<string, { id: string; name: string }> = {};
  for (const s of siteDefs) {
    const record = await prisma.site.create({ data: s });
    siteRecords[s.id] = record;
  }

  // Create Vendors
  const safetyVendor = await prisma.vendor.create({
    data: {
      id: "vendor-safety",
      name: "SafeTrack Solutions",
      description: "Safety forms digitization - bypass, car seal, LOTO",
      contactName: "Sarah Chen",
      contactEmail: "sarah.chen@safetrack.io",
    },
  });

  const opsVendor = await prisma.vendor.create({
    data: {
      id: "vendor-ops",
      name: "OpsFlow Systems",
      description: "Operator rounds, shift logs, and facilities digitization",
      contactName: "Mike Rodriguez",
      contactEmail: "m.rodriguez@opsflow.com",
    },
  });

  // Create 6 Work Streams
  const shiftLogs = await prisma.workStream.create({
    data: {
      id: "ws-shiftlogs",
      name: "Shift Logs",
      description: "Digital shift log management and handover workflow",
      vendorId: opsVendor.id,
    },
  });

  const facilities = await prisma.workStream.create({
    data: {
      id: "ws-facilities",
      name: "Facilities",
      description: "Facilities inspection and maintenance digitization",
      vendorId: opsVendor.id,
    },
  });

  const logsCarSeals = await prisma.workStream.create({
    data: {
      id: "ws-carseals",
      name: "Logs Car Seals",
      description: "Car seal tracking and management logs",
      vendorId: safetyVendor.id,
    },
  });

  const criticalSafetyBypass = await prisma.workStream.create({
    data: {
      id: "ws-bypass",
      name: "Critical Safety Bypass",
      description: "Critical safety bypass form digitization and workflow",
      vendorId: safetyVendor.id,
    },
  });

  const lockoutTagout = await prisma.workStream.create({
    data: {
      id: "ws-loto",
      name: "Lockout Tagout",
      description: "Lock-Out/Tag-Out procedure management",
      vendorId: safetyVendor.id,
    },
  });

  const operatorRounds = await prisma.workStream.create({
    data: {
      id: "ws-rounds",
      name: "Operator Rounds",
      description: "Digital operator rounds and field data collection",
      vendorId: opsVendor.id,
    },
  });

  // Create Site-Vendor Rollouts for all 16 sites × 2 vendors
  // Sites are staged: first 4 active, next 4 planned near-term, rest queued
  const rolloutDefs = [
    // Alpha - active
    { siteId: "site-alpha", vendorId: safetyVendor.id, status: "in_progress", progressPct: 65, delayDays: 5, delayReason: "Waiting on P&ID updates from engineering", plannedStart: new Date("2026-01-15"), plannedEnd: new Date("2026-04-30"), actualStart: new Date("2026-01-20") },
    { siteId: "site-alpha", vendorId: opsVendor.id,    status: "in_progress", progressPct: 45, delayDays: 0, plannedStart: new Date("2026-02-01"), plannedEnd: new Date("2026-05-15"), actualStart: new Date("2026-02-01") },
    // Bravo - active
    { siteId: "site-bravo", vendorId: safetyVendor.id, status: "in_progress", progressPct: 30, delayDays: 10, delayReason: "Vendor resource constraints", plannedStart: new Date("2026-02-15"), plannedEnd: new Date("2026-06-15"), actualStart: new Date("2026-02-25") },
    { siteId: "site-bravo", vendorId: opsVendor.id,    status: "not_started", progressPct: 0,  delayDays: 0, plannedStart: new Date("2026-04-01"), plannedEnd: new Date("2026-07-31") },
    // Charlie - active
    { siteId: "site-charlie", vendorId: safetyVendor.id, status: "in_progress", progressPct: 15, delayDays: 0, plannedStart: new Date("2026-03-01"), plannedEnd: new Date("2026-06-30"), actualStart: new Date("2026-03-01") },
    { siteId: "site-charlie", vendorId: opsVendor.id,    status: "not_started", progressPct: 0,  delayDays: 0, plannedStart: new Date("2026-05-01"), plannedEnd: new Date("2026-08-31") },
    // Delta - active
    { siteId: "site-delta", vendorId: safetyVendor.id, status: "in_progress", progressPct: 10, delayDays: 0, plannedStart: new Date("2026-03-15"), plannedEnd: new Date("2026-07-15"), actualStart: new Date("2026-03-15") },
    { siteId: "site-delta", vendorId: opsVendor.id,    status: "not_started", progressPct: 0,  delayDays: 0, plannedStart: new Date("2026-05-15"), plannedEnd: new Date("2026-09-15") },
    // Echo - planned Q2
    { siteId: "site-echo", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-04-01"), plannedEnd: new Date("2026-07-31") },
    { siteId: "site-echo", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-06-01"), plannedEnd: new Date("2026-09-30") },
    // Foxtrot
    { siteId: "site-foxtrot", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-04-15"), plannedEnd: new Date("2026-08-15") },
    { siteId: "site-foxtrot", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-06-15"), plannedEnd: new Date("2026-10-15") },
    // Golf
    { siteId: "site-golf", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-05-01"), plannedEnd: new Date("2026-08-31") },
    { siteId: "site-golf", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-07-01"), plannedEnd: new Date("2026-10-31") },
    // Hotel
    { siteId: "site-hotel", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-05-15"), plannedEnd: new Date("2026-09-15") },
    { siteId: "site-hotel", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-07-15"), plannedEnd: new Date("2026-11-15") },
    // India - Q3
    { siteId: "site-india", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-06-01"), plannedEnd: new Date("2026-09-30") },
    { siteId: "site-india", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-08-01"), plannedEnd: new Date("2026-11-30") },
    // Juliet
    { siteId: "site-juliet", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-06-15"), plannedEnd: new Date("2026-10-15") },
    { siteId: "site-juliet", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-08-15"), plannedEnd: new Date("2026-12-15") },
    // Kilo
    { siteId: "site-kilo", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-07-01"), plannedEnd: new Date("2026-10-31") },
    { siteId: "site-kilo", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-09-01"), plannedEnd: new Date("2026-12-31") },
    // Lima
    { siteId: "site-lima", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-07-15"), plannedEnd: new Date("2026-11-15") },
    { siteId: "site-lima", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-09-15"), plannedEnd: new Date("2027-01-15") },
    // Mike - Q4
    { siteId: "site-mike", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-08-01"), plannedEnd: new Date("2026-11-30") },
    { siteId: "site-mike", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-10-01"), plannedEnd: new Date("2027-01-31") },
    // November
    { siteId: "site-november", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-08-15"), plannedEnd: new Date("2026-12-15") },
    { siteId: "site-november", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-10-15"), plannedEnd: new Date("2027-02-15") },
    // Oscar
    { siteId: "site-oscar", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-09-01"), plannedEnd: new Date("2026-12-31") },
    { siteId: "site-oscar", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-11-01"), plannedEnd: new Date("2027-02-28") },
    // Papa
    { siteId: "site-papa", vendorId: safetyVendor.id, status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-09-15"), plannedEnd: new Date("2027-01-15") },
    { siteId: "site-papa", vendorId: opsVendor.id,    status: "not_started", progressPct: 0, delayDays: 0, plannedStart: new Date("2026-11-15"), plannedEnd: new Date("2027-03-15") },
  ];

  for (const r of rolloutDefs) {
    await prisma.siteVendorRollout.create({ data: r });
  }

  // Create Milestones
  const milestones = [
    { title: "Alpha Safety Kickoff",          date: new Date("2026-01-20"), type: "kickoff",  status: "completed", siteId: "site-alpha",   workStreamId: criticalSafetyBypass.id },
    { title: "Alpha Safety UAT",              date: new Date("2026-03-15"), type: "uat",      status: "upcoming",  siteId: "site-alpha",   workStreamId: criticalSafetyBypass.id },
    { title: "Alpha Safety Go-Live",          date: new Date("2026-04-30"), type: "go_live",  status: "upcoming",  siteId: "site-alpha",   workStreamId: criticalSafetyBypass.id },
    { title: "Alpha Operator Rounds Kickoff", date: new Date("2026-02-01"), type: "kickoff",  status: "completed", siteId: "site-alpha",   workStreamId: operatorRounds.id },
    { title: "Alpha Operator Rounds UAT",     date: new Date("2026-04-01"), type: "uat",      status: "upcoming",  siteId: "site-alpha",   workStreamId: operatorRounds.id },
    { title: "Bravo Safety Kickoff",          date: new Date("2026-02-25"), type: "kickoff",  status: "completed", siteId: "site-bravo",   workStreamId: criticalSafetyBypass.id },
    { title: "Bravo Safety UAT",              date: new Date("2026-05-01"), type: "uat",      status: "upcoming",  siteId: "site-bravo",   workStreamId: criticalSafetyBypass.id },
    { title: "Bravo Ops Kickoff",             date: new Date("2026-04-01"), type: "kickoff",  status: "upcoming",  siteId: "site-bravo",   workStreamId: operatorRounds.id },
    { title: "Charlie Safety Kickoff",        date: new Date("2026-03-01"), type: "kickoff",  status: "completed", siteId: "site-charlie", workStreamId: criticalSafetyBypass.id },
    { title: "Charlie Safety UAT",            date: new Date("2026-06-01"), type: "uat",      status: "upcoming",  siteId: "site-charlie", workStreamId: criticalSafetyBypass.id },
    { title: "Delta Safety Kickoff",          date: new Date("2026-03-15"), type: "kickoff",  status: "completed", siteId: "site-delta",   workStreamId: criticalSafetyBypass.id },
    { title: "Delta Safety UAT",              date: new Date("2026-06-15"), type: "uat",      status: "upcoming",  siteId: "site-delta",   workStreamId: criticalSafetyBypass.id },
    { title: "Echo Safety Kickoff",           date: new Date("2026-04-01"), type: "kickoff",  status: "upcoming",  siteId: "site-echo",    workStreamId: criticalSafetyBypass.id },
    { title: "Foxtrot Safety Kickoff",        date: new Date("2026-04-15"), type: "kickoff",  status: "upcoming",  siteId: "site-foxtrot", workStreamId: criticalSafetyBypass.id },
  ];

  for (const m of milestones) {
    await prisma.milestone.create({ data: m });
  }

  // Create sample Tasks covering all 6 work streams
  const tasks = [
    // Shift Logs
    {
      title: "Alpha shift log template configuration",
      description: "Configure digital shift log templates to match current paper handover format",
      status: "in_progress",
      priority: "high",
      owner: "Dave K.",
      dueDate: new Date("2026-03-20"),
      siteId: "site-alpha",
      vendorId: opsVendor.id,
      workStreamId: shiftLogs.id,
    },
    // Facilities
    {
      title: "Alpha facilities inspection checklist build",
      description: "Build digital facilities inspection forms for all process units",
      status: "todo",
      priority: "medium",
      owner: "Lisa M.",
      dueDate: new Date("2026-04-01"),
      siteId: "site-alpha",
      vendorId: opsVendor.id,
      workStreamId: facilities.id,
    },
    // Logs Car Seals
    {
      title: "Configure Alpha car seal equipment list",
      description: "Import and validate equipment master list for car seal tracking",
      status: "todo",
      priority: "medium",
      owner: "Sarah Chen",
      dueDate: new Date("2026-03-20"),
      siteId: "site-alpha",
      vendorId: safetyVendor.id,
      workStreamId: logsCarSeals.id,
    },
    // Critical Safety Bypass
    {
      title: "Finalize P&ID mapping for Alpha bypass forms",
      description: "Complete the piping and instrumentation diagram mapping to digital bypass form fields",
      status: "in_progress",
      priority: "high",
      owner: "James T.",
      dueDate: new Date("2026-03-10"),
      siteId: "site-alpha",
      vendorId: safetyVendor.id,
      workStreamId: criticalSafetyBypass.id,
    },
    {
      title: "Vendor API integration testing - SafeTrack",
      description: "Test SafeTrack API endpoints for data exchange with corporate systems",
      status: "todo",
      priority: "critical",
      owner: "James T.",
      dueDate: new Date("2026-03-08"),
      siteId: "site-alpha",
      vendorId: safetyVendor.id,
      workStreamId: criticalSafetyBypass.id,
    },
    // Lockout Tagout
    {
      title: "Review LOTO template with Alpha H&S team",
      description: "Walk through proposed LOTO digital workflow with site safety team for approval",
      status: "blocked",
      priority: "high",
      owner: "Mike R.",
      dueDate: new Date("2026-03-05"),
      siteId: "site-alpha",
      vendorId: safetyVendor.id,
      workStreamId: lockoutTagout.id,
    },
    // Operator Rounds
    {
      title: "Build Alpha operator rounds route plan",
      description: "Define the sequential route and checkpoints for operator field rounds",
      status: "in_progress",
      priority: "medium",
      owner: "Dave K.",
      dueDate: new Date("2026-03-15"),
      siteId: "site-alpha",
      vendorId: opsVendor.id,
      workStreamId: operatorRounds.id,
    },
    {
      title: "Training material development - Operator Rounds",
      description: "Create user training documentation and quick-reference guides for operator rounds app",
      status: "todo",
      priority: "low",
      owner: "Dave K.",
      dueDate: new Date("2026-04-15"),
      siteId: "site-alpha",
      vendorId: opsVendor.id,
      workStreamId: operatorRounds.id,
    },
    // Bravo tasks
    {
      title: "Bravo safety bypass requirements gathering",
      description: "Collect site-specific bypass requirements and variations from Bravo site",
      status: "in_progress",
      priority: "high",
      owner: "Sarah Chen",
      dueDate: new Date("2026-03-25"),
      siteId: "site-bravo",
      vendorId: safetyVendor.id,
      workStreamId: criticalSafetyBypass.id,
    },
    {
      title: "Bravo shift log workflow design",
      description: "Map Bravo-specific shift handover process to digital shift log workflow",
      status: "todo",
      priority: "medium",
      owner: "Lisa M.",
      dueDate: new Date("2026-04-10"),
      siteId: "site-bravo",
      vendorId: opsVendor.id,
      workStreamId: shiftLogs.id,
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t });
  }

  // Create a sample meeting
  await prisma.meeting.create({
    data: {
      title: "Weekly SAGD Implementation Sync",
      date: new Date("2026-03-03"),
      attendees: "James T., Sarah Chen, Mike R., Dave K., Lisa M.",
      rawNotes: `Discussed Alpha and Bravo site progress. Critical Safety Bypass at 65% on Alpha.\n\nACTION: James T. to finalize P&ID mapping by March 10\nACTION: Sarah Chen to schedule Bravo site visit for requirements\n- [ ] Mike R. to reschedule LOTO review with H&S team\n@Dave K. update the operator rounds route plan with new well pad additions\n\nBravo is 10 days behind on SafeTrack - vendor resource issue.\nCharlie and Delta kickoffs on track. Echo/Foxtrot planned for April.`,
      parsedSummary: "Alpha safety at 65%. Bravo delayed 10 days due to vendor resources. Charlie, Delta on track. Echo/Foxtrot kickoff planned for April.",
    },
  });

  // Create progress snapshots for the last 14 days (Alpha, Bravo, Charlie, Delta)
  const now = new Date();
  const activeSnapshotSites = [
    { siteId: "site-alpha",   base: 50, rate: 1.2 },
    { siteId: "site-bravo",   base: 15, rate: 1.0 },
    { siteId: "site-charlie", base: 5,  rate: 0.7 },
    { siteId: "site-delta",   base: 2,  rate: 0.5 },
  ];

  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    for (const s of activeSnapshotSites) {
      const progress = Math.min(100, Math.round(s.base + s.rate * (13 - i)));
      await prisma.progressSnapshot.create({
        data: {
          date,
          siteId: s.siteId,
          totalTasks: 20,
          completedTasks: Math.round((progress / 100) * 20),
          overdueTasks: Math.max(0, Math.round(Math.random() * 2)),
          progressPct: progress,
        },
      });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
