-- CreateTable
CREATE TABLE "twitter_access" (
    "id" TEXT NOT NULL,
    "request_secret" TEXT NOT NULL,
    "oauth_token" TEXT NOT NULL,
    "access_token" TEXT,
    "access_secret" TEXT,
    "user_id" TEXT NOT NULL,
    "username" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "twitter_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twitter_access_oauth_token_key" ON "twitter_access"("oauth_token");

-- CreateIndex
CREATE UNIQUE INDEX "twitter_access_user_id_key" ON "twitter_access"("user_id");

-- CreateIndex
CREATE INDEX "twitter_access_user_id_idx" ON "twitter_access"("user_id");

-- AddForeignKey
ALTER TABLE "twitter_access" ADD CONSTRAINT "twitter_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
