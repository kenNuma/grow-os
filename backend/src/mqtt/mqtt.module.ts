import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TelemetryModule } from '../modules/telemetry/telemetry.module';
import { ControlStateService } from './control-state.service';

@Module({
    imports: [TelemetryModule],
    providers: [MqttService, ControlStateService],
    exports: [MqttService, ControlStateService]
})

export class MqttModule {}