import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

type CreateDeviceData = {
    name: string;
    deviceKey: string;
};

type UpdateDeviceData = {
    name: string;
};

@Injectable()
export class DeviceRepository {
    constructor(private readonly prisma: PrismaService) { }

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

    async updateByDeviceKey(deviceKey: string, data: UpdateDeviceData) {
        return this.prisma.device.update({
            where: {
                deviceKey,
            },
            data: {
                name: data.name,
            },
        });
    }

    async deleteByDeviceKey(deviceKey: string) {
        return this.prisma.device.delete({
            where: {
                deviceKey,
            },
        });
    }
}