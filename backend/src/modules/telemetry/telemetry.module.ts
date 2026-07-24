import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { TelemetryRepository } from './telemetry.repository';

@Module({
    controllers: [TelemetryController],
    providers: [TelemetryService, TelemetryRepository],
})
export class TelemetryModule { }