import { Injectable } from '@nestjs/common';

type DeviceControlState = {
    led: boolean;
    fan: boolean;
};

@Injectable()
export class ControlStateService {
    private readonly states = new Map<string, DeviceControlState>();

    getState(deviceKey: string): DeviceControlState {
        return this.states.get(deviceKey) ?? { led: false, fan: false };
    }
    // LED state
    updateLedState(deviceKey: string, isOn: boolean) {
        const current = this.getState(deviceKey);

        this.states.set(deviceKey, {
            ...current,
            led: isOn,
        });
    }

    // fan state 
    updateFanState(deviceKey: string, isOn: boolean) {
        const current = this.getState(deviceKey);

        this.states.set(deviceKey, {
            ...current,
            fan: isOn,
        });
    }

}