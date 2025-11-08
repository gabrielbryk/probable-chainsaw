-- CreateTable
CREATE TABLE "Riddle" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "difficulty" TEXT,
    "hints" TEXT,
    "mediaUrl" TEXT,
    "metadata" TEXT,
    "successMessage" TEXT,
    "missMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Riddle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "activeRiddleId" INTEGER,
    "attemptsPerRiddle" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HintLog" (
    "id" SERIAL NOT NULL,
    "riddleId" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HintLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideTranscript" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EffectEvent" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EffectEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Riddle_order_key" ON "Riddle"("order");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_activeRiddleId_fkey" FOREIGN KEY ("activeRiddleId") REFERENCES "Riddle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HintLog" ADD CONSTRAINT "HintLog_riddleId_fkey" FOREIGN KEY ("riddleId") REFERENCES "Riddle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

