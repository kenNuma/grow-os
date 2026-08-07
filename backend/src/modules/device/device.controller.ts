import { Body, Controller, Get, Post, Param, Patch, Delete } from '@nestjs/common';
import { DeviceService } from './device.service';

type CreateDeviceBody = {
    name: string;
    deviceKey: string;
};

type UpdateDeviceBody = {
    name: string;
};

type ControlDeviceBody = {
    target: string;
    action: string;
};

@Controller('devices')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) { }

    @Get()
    async findAll() {
        return this.deviceService.findAll();
    }

    @Get(':deviceKey')
    async findByDeviceKey(
        @Param('deviceKey') deviceKey: string,
    ) {
        return this.deviceService.findByDeviceKey(deviceKey);
    }

    @Get(':deviceKey/control-state')
    async getControlState(
        @Param('deviceKey') deviceKey: string,
    ) {
        return this.deviceService.getControlState(
            deviceKey,
        );
    }

    @Post()
    async create(@Body() body: CreateDeviceBody) {
        return this.deviceService.create(body);
    }

    @Post(':deviceKey/control')
    async control(
        @Param('deviceKey') deviceKey: string,
        @Body() body: ControlDeviceBody,
    ) {
        return this.deviceService.control(
            deviceKey,
            body,
        );
    }

    @Patch(':deviceKey')
    async updateByDeviceKey(
        @Param('deviceKey') deviceKey: string,
        @Body() body: UpdateDeviceBody,
    ) {
        return this.deviceService.updateByDeviceKey(
            deviceKey,
            body,
        );
    }

    @Delete(':deviceKey')
    async deleteByDeviceKey(
        @Param('deviceKey') deviceKey: string,
    ) {
        return this.deviceService.deleteByDeviceKey(
            deviceKey,
        );
    }
}