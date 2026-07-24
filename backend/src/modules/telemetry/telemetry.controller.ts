import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';

type CreateTelemetryBody = {
    deviceKey: string;
    temperature: number;
    humidity: number;
};

@Controller('telemetry')
export class TelemetryController {
    constructor(
        private readonly telemetryService: TelemetryService,
    ) { }

    @Post()
    async create(@Body() body: CreateTelemetryBody) {
        return this.telemetryService.create(body);
    }

    @Get('latest/:deviceKey')
    async findLatest(@Param('deviceKey') deviceKey: string) {
        return this.telemetryService.findLatest(deviceKey);
    }

    @Get('history/:deviceKey')
    async getHistoroy(@Param('deviceKey') deviceKey: string) {
        return this.telemetryService.getHistory(deviceKey);
    }
}