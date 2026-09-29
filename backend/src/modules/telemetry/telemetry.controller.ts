import { Body, Controller, Query, Post, Get, Param } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import  type { CreateTelemetryData } from './telemetry.types';

@Controller('telemetry')
export class TelemetryController {
    constructor(
        private readonly telemetryService: TelemetryService,
    ) { }

    @Post()
    async create(@Body() body: CreateTelemetryData) {
        return this.telemetryService.create(body);
    }

    @Get('latest/:deviceKey')
    async findLatest(@Param('deviceKey') deviceKey: string) {
        return this.telemetryService.findLatest(deviceKey);
    }

    @Get('history/:deviceKey')
    async getHistoroy(
        @Param('deviceKey') deviceKey: string,
        @Query("limit") limit?: string,
    ) {
        return this.telemetryService.getHistory(
            deviceKey,
            limit ? Number(limit) : undefined,
        );
    }
}