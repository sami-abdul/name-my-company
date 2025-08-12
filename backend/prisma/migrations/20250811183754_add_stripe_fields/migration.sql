-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT now(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_sessions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "prompt" VARCHAR(500) NOT NULL,
    "model_used" VARCHAR(100),
    "token_count" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),

    CONSTRAINT "generation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_suggestions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "session_id" UUID NOT NULL,
    "domain_name" VARCHAR(255) NOT NULL,
    "is_available" BOOLEAN,
    "checked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),

    CONSTRAINT "domain_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "stripe_customer_id" VARCHAR(255),
    "stripe_subscription_id" VARCHAR(255),
    "tier" VARCHAR(20) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "current_period_end" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) DEFAULT now(),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_generation_sessions_user_id" ON "generation_sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_generation_sessions_created_at" ON "generation_sessions"("created_at");

-- CreateIndex
CREATE INDEX "idx_domain_suggestions_session_id" ON "domain_suggestions"("session_id");

-- CreateIndex
CREATE INDEX "idx_domain_suggestions_domain_name" ON "domain_suggestions"("domain_name");

-- CreateIndex
CREATE INDEX "idx_domain_suggestions_created_at" ON "domain_suggestions"("created_at");

-- CreateIndex
CREATE INDEX "idx_subscriptions_user_id" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");

-- AddForeignKey
ALTER TABLE "generation_sessions" ADD CONSTRAINT "generation_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_suggestions" ADD CONSTRAINT "domain_suggestions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "generation_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
