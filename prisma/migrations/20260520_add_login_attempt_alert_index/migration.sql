-- AddIndex: composite (email, success, createdAt) for alert-check query
-- This index serves: WHERE email = $1 AND success = false AND createdAt >= $2
-- which runs on every failed login to detect credential stuffing.
CREATE INDEX "LoginAttempt_email_success_createdAt_idx"
  ON "LoginAttempt"("email", "success", "createdAt");
