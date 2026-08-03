import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

type CreateTelemetryData = {
    deviceKey: string;
    temperature: number;
    humidity: number;
    pressure: number;
};

@Injectable()
export class TelemetryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: CreateTelemetryData) {
        const device = await this.prisma.device.findUnique({
            where: {
                deviceKey: data.deviceKey,
            },
        });

        if (!device) {
            return null;
        }

        return this.prisma.$transaction(async (transaction) => {
            const telemetry = await transaction.telemetry.create({
                data: {
                    deviceId: device.id,
                    temperature: data.temperature,
                    humidity: data.humidity,
                    pressure: data.pressure,
                },
            });

            await transaction.device.update({
                where: {
                    id: device.id,
                },
                data: {
                    status: "online",
                    lastSeenAt: telemetry.recordedAt,
                },
            });

            return telemetry;
        });
    }

    async findLatestByDeviceKey(deviceKey: string) {
        const device = await this.prisma.device.findUnique({
            where: {
                deviceKey,
            },
        });

        if (!device) {
            return null;
        }

        return this.prisma.telemetry.findFirst({
            where: {
                deviceId: device.id,
            },
            orderBy: {
                recordedAt: 'desc',
            },
        });
    }

    async findAllByDeviceKey(deviceKey: string, limit = 100) {
        const device = await this.prisma.device.findUnique({
            where: {
                deviceKey,
            },
        });

        if (!device) {
            return null;
        }

        return this.prisma.telemetry.findMany({
            where: {
                deviceId: device.id,
            },
            orderBy: {
                recordedAt: 'desc',
            },
            take: limit,
        });
    }
}