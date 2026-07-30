import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';

import { TelemetryService } from '../modules/telemetry/telemetry.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MqttService.name);
    private readonly topic = 'growos/telemetry';

    private client: MqttClient | null = null;

    constructor(
        private readonly configService: ConfigService,
        private readonly telemetryService: TelemetryService,
    ) { }

    onModuleInit() {
        const brokerUrl =
            this.configService.get<string>('MQTT_URL') ??
            'mqtt://localhost:1883';

        this.client = connect(brokerUrl);

        this.client.on('connect', () => {
            this.logger.log(`Connected to MQTT broker: ${brokerUrl}`);

            this.client?.subscribe(this.topic, (error) => {
                if (error) {
                    this.logger.error(
                        `Failed to subscribe to topic: ${this.topic}`,
                        error,
                    );
                    return;
                }

                this.logger.log(`Subscribed to topic: ${this.topic}`);
            });
        });

        this.client.on('message', async (topic, payload) => {
            const message = payload.toString();

            this.logger.log(`Received MQTT message`);
            this.logger.log(`Topic: ${topic}`);
            this.logger.log(`Payload: ${message}`);

            try {
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

    onModuleDestroy() {
        this.client?.end();
        this.client = null;
    }
}