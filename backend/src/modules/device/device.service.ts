import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DeviceRepository } from './device.repository';
import { MqttService } from '../../mqtt/mqtt.service';
import { ControlStateService } from '../../mqtt/control-state.service';

type CreateDeviceData = {
    name: string;
    deviceKey: string;
};

type UpdateDeviceData = {
    name: string;
};

type ControlDeviceData = {
    target: string;
    action: string;
};

const DEVICE_NAME_MAX_LENGTH = 50;

@Injectable()
export class DeviceService {
    constructor(
        private readonly deviceRepository: DeviceRepository,
        private readonly mqttService: MqttService,
        private readonly controlStateService: ControlStateService,
    ) { }

    async findAll() {
        return this.deviceRepository.findAll();
    }

    async findByDeviceKey(deviceKey: string) {
        const device =
            await this.deviceRepository.findByDeviceKey(deviceKey);

        if (!device) {
            throw new NotFoundException(
                `Device with key "${deviceKey}" was not found.`,
            );
        }

        return device;
    }

    async create(data: CreateDeviceData) {
        const name = this.validateDeviceName(data.name);
        const deviceKey = data.deviceKey?.trim();

        if (!deviceKey) {
            throw new BadRequestException(
                'Device key is required.',
            );
        }

        const existingDevice =
            await this.deviceRepository.findByDeviceKey(deviceKey);

        if (existingDevice) {
            throw new ConflictException(
                `Device with key "${deviceKey}" already exists.`,
            );
        }

        return this.deviceRepository.create({
            name,
            deviceKey,
        });
    }

    async updateByDeviceKey(
        deviceKey: string,
        data: UpdateDeviceData,
    ) {
        await this.findByDeviceKey(deviceKey);

        const name = this.validateDeviceName(data.name);

        return this.deviceRepository.updateByDeviceKey(
            deviceKey,
            {
                name,
            },
        );
    }

    async deleteByDeviceKey(deviceKey: string) {
        await this.findByDeviceKey(deviceKey);

        return this.deviceRepository.deleteByDeviceKey(
            deviceKey,
        );
    }

    async control(deviceKey: string, data: ControlDeviceData) {
        await this.findByDeviceKey(deviceKey);

        const target = data.target?.trim();
        const action = data.action?.trim();

        if (!target) {
            throw new BadRequestException(
                'Control target is required.',
            );
        }

        if (!action) {
            throw new BadRequestException(
                'Control action is required.',
            );
        }

        await this.mqttService.publishControl(
            deviceKey,
            target,
            action,
        );

        return {
            deviceKey,
            target,
            action,
            message: 'Control command published.',
        };
    }

    async getControlState(deviceKey: string) {
        await this.findByDeviceKey(deviceKey);

        return this.controlStateService.getState(deviceKey);
    }


    private validateDeviceName(name: string) {
        const trimmedName = name?.trim();

        if (!trimmedName) {
            throw new BadRequestException(
                'Device name is required.',
            );
        }

        if (trimmedName.length > DEVICE_NAME_MAX_LENGTH) {
            throw new BadRequestException(
                `Device name must be ${DEVICE_NAME_MAX_LENGTH} characters or fewer.`,
            );
        }

        return trimmedName;
    }
}