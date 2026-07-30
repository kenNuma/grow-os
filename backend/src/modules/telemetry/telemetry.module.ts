import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { TelemetryRepository } from './telemetry.repository';

@Module({
    controllers: [TelemetryController],
    providers: [TelemetryService, TelemetryRepository],
    exports: [TelemetryService],
})
export class TelemetryModule { }