import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';

import { TelemetryService } from '../modules/telemetry/telemetry.service';
import { ControlStateService } from './control-state.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MqttService.name);
    private readonly telemetryTopic = 'growos/telemetry';
    private readonly deviceStateTopic = 'growos/devices/+/state';

    private client: MqttClient | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly telemetryService: TelemetryService,
        private readonly controlStateService: ControlStateService,
    ) { }

    onModuleInit() {
        const brokerUrl =
            this.configService.get<string>('MQTT_URL') ??
            'mqtt://localhost:1883';

        this.client = connect(brokerUrl);

        this.client.on('connect', () => {
            this.logger.log(`Connected to MQTT broker: ${brokerUrl}`);

            this.client?.subscribe(
                this.telemetryTopic,
                (error) => {
                    if (error) {
                        this.logger.error(
                            `Failed to subscribe to topic: ${this.telemetryTopic}`,
                            error,
                        );
                        return;
                    }

                    this.logger.log(
                        `Subscribed to topic: ${this.telemetryTopic}`,
                    );
                },
            );

            this.client?.subscribe(
                this.deviceStateTopic,
                (error) => {
                    if (error) {
                        this.logger.error(
                            `Failed to subscribe to topic: ${this.deviceStateTopic}`,
                            error,
                        );
                        return;
                    }

                    this.logger.log(
                        `Subscribed to topic: ${this.deviceStateTopic}`,
                    );
                },
            );
        });

        this.client.on('message', async (topic, payload) => {
            const message = payload.toString();

            this.logger.log(`Received MQTT message`);
            this.logger.log(`Topic: ${topic}`);
            this.logger.log(`Payload: ${message}`);

            try {
                if (
                    topic.startsWith('growos/devices/') &&
                    topic.endsWith('/state')
                ) {
                    const state = JSON.parse(message);
                    const deviceKey = topic.split('/')[2];

                    if (state.target === 'led') {
                        this.controlStateService.updateLedState(
                            deviceKey,
                            state.state === 'on',
                        );
                    }

                    if (state.target === 'fan') {
                        this.controlStateService.updateFanState(
                            deviceKey,
                            state.state === 'on',
                        );
                    }
                    
                    return;
                }
                const telemetry = JSON.parse(message);

                if (
                    typeof telemetry.deviceKey !== 'string' ||
                    telemetry.deviceKey.trim() === '' ||
                    typeof telemetry.temperature !== 'number' ||
                    typeof telemetry.humidity !== 'number'
                ) {
                    this.logger.warn('Invalid telemetry payload');
                    return;
                }

                await this.telemetryService.create({
                    deviceKey: telemetry.deviceKey,
                    temperature: telemetry.temperature,
                    humidity: telemetry.humidity,
                    pressure: telemetry.pressure,
                });

                this.logger.log('Telemetry saved');
            } catch (error) {
                this.logger.error('Failed to process telemetry', error);
            }
        });

        this.client.on('error', (error) => {
            this.logger.error('MQTT connection error', error);
        });

        this.client.on('reconnect', () => {
            this.logger.warn('Reconnecting to MQTT broker...');
        });
    }

    async publishControl(
        deviceKey: string,
        target: string,
        action: string,
    ): Promise<void> {
        if (!this.client || !this.client.connected) {
            throw new Error('MQTT client is not connected');
        }

        const topic = `growos/devices/${deviceKey}/control`;

        const payload = JSON.stringify({
            target,
            action,
        });

        await new Promise<void>((resolve, reject) => {
            this.client?.publish(topic, payload, (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });

        this.logger.log(`Published MQTT control message`);
        this.logger.log(`Topic: ${topic}`);
        this.logger.log(`Payload: ${payload}`);
    }

    onModuleDestroy() {
        this.client?.end();
        this.client = null;
    }
}