import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const sites = await prisma.site.findMany({
    include: {
      rollouts: { include: { vendor: true } },
      tasks: true,
    },
  });
  return NextResponse.json(sites);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description, location } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const site = await prisma.site.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      location: location?.trim() || null,
    },
    include: {
      rollouts: { include: { vendor: true } },
      tasks: true,
    },
  });

  return NextResponse.json(site, { status: 201 });
}
