-- CreateTable
CREATE TABLE "promotional_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount', 'first_time', 'referral', 'loyalty', 'seasonal'
    "value" DECIMAL(10,2) NOT NULL,
    "max_discount" DECIMAL(10,2),
    "min_order_value" DECIMAL(10,2) DEFAULT 0,
    "max_uses" INTEGER,
    "current_uses" INTEGER DEFAULT 0,
    "service_types" TEXT[], -- Array of service types
    "customer_types" TEXT[], -- Array of customer types
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotional_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_performance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "uses_count" INTEGER DEFAULT 0,
    "total_discount" DECIMAL(10,2) DEFAULT 0,
    "revenue_generated" DECIMAL(10,2) DEFAULT 0,
    "bookings_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_rules_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_type" VARCHAR(50) NOT NULL, -- 'service_area', 'document_limits', 'pricing_multipliers', 'heloc_restrictions'
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_rules_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_change_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rule_id" UUID NOT NULL,
    "old_config" JSONB,
    "new_config" JSONB NOT NULL,
    "change_reason" TEXT,
    "changed_by" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rule_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_code_usage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" UUID NOT NULL,
    "booking_id" UUID,
    "customer_email" VARCHAR(255),
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promo_code_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotional_campaigns_code_key" ON "promotional_campaigns"("code");

-- CreateIndex
CREATE INDEX "promotional_campaigns_active_idx" ON "promotional_campaigns"("is_active");

-- CreateIndex
CREATE INDEX "promotional_campaigns_dates_idx" ON "promotional_campaigns"("valid_from", "valid_until");

-- CreateIndex
CREATE INDEX "campaign_performance_campaign_date_idx" ON "campaign_performance"("campaign_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "business_rules_config_rule_type_key" ON "business_rules_config"("rule_type");

-- CreateIndex
CREATE INDEX "business_rules_config_active_idx" ON "business_rules_config"("is_active");

-- CreateIndex
CREATE INDEX "rule_change_log_rule_id_idx" ON "rule_change_log"("rule_id");

-- CreateIndex
CREATE INDEX "promo_code_usage_campaign_idx" ON "promo_code_usage"("campaign_id");

-- CreateIndex
CREATE INDEX "promo_code_usage_booking_idx" ON "promo_code_usage"("booking_id");

-- AddForeignKey
ALTER TABLE "campaign_performance" ADD CONSTRAINT "campaign_performance_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "promotional_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_change_log" ADD CONSTRAINT "rule_change_log_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "business_rules_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "promotional_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE; 