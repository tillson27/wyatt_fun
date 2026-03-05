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

  // Create Sites
  const alpha = await prisma.site.create({
    data: {
      id: "site-alpha",
      name: "Alpha",
      description: "Northern Alberta SAGD Facility A",
      location: "Fort McMurray, AB",
    },
  });

  const bravo = await prisma.site.create({
    data: {
      id: "site-bravo",
      name: "Bravo",
      description: "Northern Alberta SAGD Facility B",
      location: "Conklin, AB",
    },
  });

  const charlie = await prisma.site.create({
    data: {
      id: "site-charlie",
      name: "Charlie",
      description: "Northern Alberta SAGD Facility C",
      location: "Lac La Biche, AB",
    },
  });

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
      description: "Operator rounds and reading sheets digitization",
      contactName: "Mike Rodriguez",
      contactEmail: "m.rodriguez@opsflow.com",
    },
  });

  // Create Work Streams
  const bypass = await prisma.workStream.create({
    data: {
      id: "ws-bypass",
      name: "Safety Bypass",
      description: "Safety bypass form digitization and workflow",
      vendorId: safetyVendor.id,
    },
  });

  const carSeal = await prisma.workStream.create({
    data: {
      id: "ws-carseal",
      name: "Car Seal",
      description: "Car seal tracking and management",
      vendorId: safetyVendor.id,
    },
  });

  const loto = await prisma.workStream.create({
    data: {
      id: "ws-loto",
      name: "LOTO",
      description: "Lock-Out/Tag-Out procedure management",
      vendorId: safetyVendor.id,
    },
  });

  const rounds = await prisma.workStream.create({
    data: {
      id: "ws-rounds",
      name: "Operator Rounds",
      description: "Digital operator rounds and field data collection",
      vendorId: opsVendor.id,
    },
  });

  const sheets = await prisma.workStream.create({
    data: {
      id: "ws-sheets",
      name: "Reading Sheets",
      description: "Equipment reading sheet digitization",
      vendorId: opsVendor.id,
    },
  });

  // Create Site-Vendor Rollouts (6 records: 3 sites x 2 vendors)
  const now = new Date();
  const rolloutData = [
    {
      siteId: alpha.id,
      vendorId: safetyVendor.id,
      status: "in_progress",
      progressPct: 65,
      delayDays: 5,
      delayReason: "Waiting on P&ID updates from engineering",
      plannedStart: new Date("2026-01-15"),
      plannedEnd: new Date("2026-04-30"),
      actualStart: new Date("2026-01-20"),
    },
    {
      siteId: alpha.id,
      vendorId: opsVendor.id,
      status: "in_progress",
      progressPct: 45,
      delayDays: 0,
      plannedStart: new Date("2026-02-01"),
      plannedEnd: new Date("2026-05-15"),
      actualStart: new Date("2026-02-01"),
    },
    {
      siteId: bravo.id,
      vendorId: safetyVendor.id,
      status: "in_progress",
      progressPct: 30,
      delayDays: 10,
      delayReason: "Vendor resource constraints - key developer on leave",
      plannedStart: new Date("2026-02-15"),
      plannedEnd: new Date("2026-06-15"),
      actualStart: new Date("2026-02-25"),
    },
    {
      siteId: bravo.id,
      vendorId: opsVendor.id,
      status: "not_started",
      progressPct: 0,
      delayDays: 0,
      plannedStart: new Date("2026-04-01"),
      plannedEnd: new Date("2026-07-31"),
    },
    {
      siteId: charlie.id,
      vendorId: safetyVendor.id,
      status: "not_started",
      progressPct: 0,
      delayDays: 0,
      plannedStart: new Date("2026-05-01"),
      plannedEnd: new Date("2026-08-31"),
    },
    {
      siteId: charlie.id,
      vendorId: opsVendor.id,
      status: "not_started",
      progressPct: 0,
      delayDays: 0,
      plannedStart: new Date("2026-06-01"),
      plannedEnd: new Date("2026-09-30"),
    },
  ];

  for (const r of rolloutData) {
    await prisma.siteVendorRollout.create({ data: r });
  }

  // Create Milestones
  const milestones = [
    { title: "Alpha Safety Kickoff", date: new Date("2026-01-20"), type: "kickoff", status: "completed", siteId: alpha.id, workStreamId: bypass.id },
    { title: "Alpha Safety UAT", date: new Date("2026-03-15"), type: "uat", status: "upcoming", siteId: alpha.id, workStreamId: bypass.id },
    { title: "Alpha Safety Go-Live", date: new Date("2026-04-30"), type: "go_live", status: "upcoming", siteId: alpha.id, workStreamId: bypass.id },
    { title: "Alpha Ops Rounds Kickoff", date: new Date("2026-02-01"), type: "kickoff", status: "completed", siteId: alpha.id, workStreamId: rounds.id },
    { title: "Alpha Ops UAT", date: new Date("2026-04-01"), type: "uat", status: "upcoming", siteId: alpha.id, workStreamId: rounds.id },
    { title: "Bravo Safety Kickoff", date: new Date("2026-02-25"), type: "kickoff", status: "completed", siteId: bravo.id, workStreamId: bypass.id },
    { title: "Bravo Safety UAT", date: new Date("2026-05-01"), type: "uat", status: "upcoming", siteId: bravo.id, workStreamId: bypass.id },
    { title: "Bravo Ops Kickoff", date: new Date("2026-04-01"), type: "kickoff", status: "upcoming", siteId: bravo.id, workStreamId: rounds.id },
    { title: "Charlie Safety Kickoff", date: new Date("2026-05-01"), type: "kickoff", status: "upcoming", siteId: charlie.id, workStreamId: bypass.id },
    { title: "Charlie Ops Kickoff", date: new Date("2026-06-01"), type: "kickoff", status: "upcoming", siteId: charlie.id, workStreamId: rounds.id },
  ];

  for (const m of milestones) {
    await prisma.milestone.create({ data: m });
  }

  // Create sample Tasks
  const tasks = [
    {
      title: "Finalize P&ID mapping for Alpha bypass forms",
      description: "Complete the piping and instrumentation diagram mapping to digital bypass form fields",
      status: "in_progress",
      priority: "high",
      owner: "James T.",
      dueDate: new Date("2026-03-10"),
      siteId: alpha.id,
      vendorId: safetyVendor.id,
      workStreamId: bypass.id,
    },
    {
      title: "Configure Alpha car seal equipment list",
      description: "Import and validate equipment master list for car seal tracking",
      status: "todo",
      priority: "medium",
      owner: "Sarah Chen",
      dueDate: new Date("2026-03-20"),
      siteId: alpha.id,
      vendorId: safetyVendor.id,
      workStreamId: carSeal.id,
    },
    {
      title: "Review LOTO template with Alpha H&S team",
      description: "Walk through proposed LOTO digital workflow with site safety team for approval",
      status: "blocked",
      priority: "high",
      owner: "Mike R.",
      dueDate: new Date("2026-03-05"),
      siteId: alpha.id,
      vendorId: safetyVendor.id,
      workStreamId: loto.id,
    },
    {
      title: "Build Alpha operator rounds route plan",
      description: "Define the sequential route and checkpoints for operator field rounds",
      status: "in_progress",
      priority: "medium",
      owner: "Dave K.",
      dueDate: new Date("2026-03-15"),
      siteId: alpha.id,
      vendorId: opsVendor.id,
      workStreamId: rounds.id,
    },
    {
      title: "Alpha reading sheet template design",
      description: "Design digital reading sheet templates matching existing paper forms",
      status: "done",
      priority: "medium",
      owner: "Lisa M.",
      dueDate: new Date("2026-02-28"),
      completedAt: new Date("2026-02-27"),
      siteId: alpha.id,
      vendorId: opsVendor.id,
      workStreamId: sheets.id,
    },
    {
      title: "Bravo safety bypass requirements gathering",
      description: "Collect site-specific bypass requirements and variations from Bravo site",
      status: "in_progress",
      priority: "high",
      owner: "Sarah Chen",
      dueDate: new Date("2026-03-25"),
      siteId: bravo.id,
      vendorId: safetyVendor.id,
      workStreamId: bypass.id,
    },
    {
      title: "Vendor API integration testing - SafeTrack",
      description: "Test SafeTrack API endpoints for data exchange with corporate systems",
      status: "todo",
      priority: "critical",
      owner: "James T.",
      dueDate: new Date("2026-03-08"),
      siteId: alpha.id,
      vendorId: safetyVendor.id,
      workStreamId: bypass.id,
    },
    {
      title: "Training material development - Operator Rounds",
      description: "Create user training documentation and quick-reference guides for operator rounds app",
      status: "todo",
      priority: "low",
      owner: "Dave K.",
      dueDate: new Date("2026-04-15"),
      siteId: alpha.id,
      vendorId: opsVendor.id,
      workStreamId: rounds.id,
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
      rawNotes: `Discussed Alpha site progress. Safety bypass forms at 65% complete.\n\nACTION: James T. to finalize P&ID mapping by March 10\nACTION: Sarah Chen to schedule Bravo site visit for requirements\n- [ ] Mike R. to reschedule LOTO review with H&S team\n@Dave K. update the rounds route plan with new well pad additions\n\nBravo is 10 days behind on SafeTrack - vendor resource issue.\nCharlie kickoff still on track for May.`,
      parsedSummary: "Alpha safety at 65%. Bravo delayed 10 days due to vendor resources. Charlie on track for May kickoff.",
    },
  });

  // Create progress snapshots for the last 14 days
  for (let i = 13; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const sites = [
      { siteId: alpha.id, base: 50, rate: 1.2 },
      { siteId: bravo.id, base: 15, rate: 1.0 },
      { siteId: charlie.id, base: 0, rate: 0 },
    ];

    for (const s of sites) {
      const progress = Math.min(100, Math.round(s.base + s.rate * (13 - i)));
      await prisma.progressSnapshot.create({
        data: {
          date,
          siteId: s.siteId,
          totalTasks: 20,
          completedTasks: Math.round((progress / 100) * 20),
          overdueTasks: Math.max(0, Math.round(Math.random() * 3)),
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
