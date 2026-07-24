import { Injectable } from '@nestjs/common';
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

    async create(data: CreateDeviceData) {
        return this.deviceRepository.create(data);
    }
}