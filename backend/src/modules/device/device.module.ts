import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceRepository } from './device.repository';
import { DeviceService } from './device.service';
import { MqttModule } from '../../mqtt/mqtt.module';


@Module({
    imports: [MqttModule],
    controllers: [DeviceController],
    providers: [
        DeviceService,
        DeviceRepository,
    ],
})
export class DeviceModule { }