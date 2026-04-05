-- CreateTable
CREATE TABLE "lead_assignment_members" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_assignment_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_email_dispatches" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "member_email" TEXT NOT NULL,
    "member_name" TEXT NOT NULL,
    "assignment_order" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "is_responded" BOOLEAN NOT NULL DEFAULT false,
    "escalated_at" TIMESTAMP(3),

    CONSTRAINT "lead_email_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_assignment_members_email_key" ON "lead_assignment_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lead_assignment_members_order_key" ON "lead_assignment_members"("order");

-- CreateIndex
CREATE UNIQUE INDEX "lead_email_dispatches_token_key" ON "lead_email_dispatches"("token");

-- AddForeignKey
ALTER TABLE "lead_email_dispatches" ADD CONSTRAINT "lead_email_dispatches_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "daily_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_email_dispatches" ADD CONSTRAINT "lead_email_dispatches_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "lead_assignment_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
