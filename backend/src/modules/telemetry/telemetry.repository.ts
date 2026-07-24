import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

type CreateTelemetryData = {
    deviceKey: string;
    temperature: number;
    humidity: number;
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

        return this.prisma.telemetry.create({
            data: {
                deviceId: device.id,
                temperature: data.temperature,
                humidity: data.humidity,
            },
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

    async findAllByDeviceKey(deviceKey: string) {
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
            take: 100,
        });
    }
}