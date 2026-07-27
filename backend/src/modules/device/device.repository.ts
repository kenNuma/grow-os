import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

type CreateDeviceData = {
    name: string;
    deviceKey: string;
};

@Injectable()
export class DeviceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.device.findMany();
    }

    async findByDeviceKey(deviceKey: string) {
        return this.prisma.device.findUnique({
            where: {
                deviceKey,
            },
        });
    }

    async create(data: CreateDeviceData) {
        return this.prisma.device.create({
            data,
        });
    }
}