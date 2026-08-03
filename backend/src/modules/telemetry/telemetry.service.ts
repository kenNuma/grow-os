import { Injectable, NotFoundException } from '@nestjs/common';
import { TelemetryRepository } from './telemetry.repository';

type CreateTelemetryData = {
    deviceKey: string;
    temperature: number;
    humidity: number;
    pressure: number;
};

@Injectable()
export class TelemetryService {
    constructor(
        private readonly telemetryRepository: TelemetryRepository,
    ) { }

    async create(data: CreateTelemetryData) {
        const telemetry = await this.telemetryRepository.create(data);

        if (!telemetry) {
            throw new NotFoundException('Device not found');
        }

        return telemetry;
    }

    async findLatest(deviceKey: string) {
        const telemetry = await this.telemetryRepository.findLatestByDeviceKey(deviceKey);

        if (!telemetry) {
            throw new NotFoundException('Telemetry not found');
        }

        return telemetry;
    }

    async getHistory(deviceKey: string, limit?: number) {
        const allTelemetry = await this.telemetryRepository.findAllByDeviceKey(deviceKey, limit);

        if (!allTelemetry) {
            throw new NotFoundException('Telemetry not found');
        }

        return allTelemetry;
    }
}