import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TelemetryModule } from '../modules/telemetry/telemetry.module';

@Module({
    imports: [TelemetryModule],
    providers: [MqttService],
    
})

export class MqttModule {}