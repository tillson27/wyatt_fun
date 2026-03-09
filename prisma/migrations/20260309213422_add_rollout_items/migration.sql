-- CreateTable
CREATE TABLE "RolloutItem" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "mod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Not Started',
    "rag" TEXT NOT NULL DEFAULT 'Green',
    "owner" TEXT NOT NULL DEFAULT '',
    "targetGoLive" TEXT NOT NULL DEFAULT '',
    "actualGoLive" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "blockers" TEXT NOT NULL DEFAULT '',
    "pctComplete" INTEGER NOT NULL DEFAULT 0,
    "manualPct" BOOLEAN NOT NULL DEFAULT false,
    "activities" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolloutItem_pkey" PRIMARY KEY ("id")
);
