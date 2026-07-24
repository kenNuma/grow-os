import { Body, Controller, Get, Post } from '@nestjs/common';
import { DeviceService } from './device.service';

type CreateDeviceBody = {
    name: string;
    deviceKey: string;
};

@Controller('devices')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) { }

    @Get()
    async findAll() {
        return this.deviceService.findAll();
    }

    @Post()
    async create(@Body() body: CreateDeviceBody) {
        return this.deviceService.create(body);
    }
}