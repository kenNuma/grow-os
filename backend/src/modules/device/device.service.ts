import { Injectable, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from './device.repository';

type CreateDeviceData = {
    name: string;
    deviceKey: string;
};

@Injectable()
export class DeviceService {
    constructor(private readonly deviceRepository: DeviceRepository) { }

    async findAll() {
        return this.deviceRepository.findAll();
    }

    async findByDeviceKey(deviceKey: string) {
        const device = await this.deviceRepository.findByDeviceKey(deviceKey);

        if (!device) {
            throw new NotFoundException(
                `Device with key "${deviceKey}" was not found.`,
            );
        }

        return device;
    }


    async create(data: CreateDeviceData) {
        return this.deviceRepository.create(data);
    }
}