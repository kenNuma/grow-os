-- CreateTable
CREATE TABLE "telemetries" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telemetries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "telemetries_deviceId_idx" ON "telemetries"("deviceId");

-- AddForeignKey
ALTER TABLE "telemetries" ADD CONSTRAINT "telemetries_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
