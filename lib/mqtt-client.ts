import mqtt, { type MqttClient } from "mqtt";

interface MqttConfig {
  protocol: string;
  host: string;
  port: string;
  path: string;
  clientId?: string;
  username?: string;
  password?: string;
}

class MqttClientWrapper {
  private client: MqttClient;
  private config: MqttConfig;

  constructor(config: MqttConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  private createClient(): MqttClient {
    const { protocol, host, port, path } = this.config;
    const connectUrl = `${protocol}://${host}:${port}${path}`;

    return mqtt.connect(connectUrl, {
      clientId:
        this.config.clientId || `mqtt_${Math.random().toString(16).slice(3)}`,
      clean: true,
      connectTimeout: 4000,
      username: this.config.username,
      password: this.config.password,
      reconnectPeriod: 1000,
    });
  }

  public connect(): void {
    // If the client is disconnected, create a new one.
    if (this.client.disconnected || this.client.disconnecting) {
      this.client = this.createClient();
    }
    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    this.client.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });
  }
  public subscribe(topic: string | string[]): void {
    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error("MQTT subscription error:", err);
      } else {
        console.log(`Subscribed to topic(s): ${topic}`);
      }
    });
  }

  public publish(topic: string, message: string): void {
    this.client.publish(topic, message, (err) => {
      if (err) {
        console.error("MQTT publish error:", err);
      }
    });
  }

  public onMessage(callback: (topic: string, message: Buffer) => void): void {
    this.client.on("message", callback);
  }

  public disconnect(): void {
    this.client.end();
  }
}

// Default configuration
const defaultConfig: MqttConfig = {
  protocol: "ws",
  host: "localhost",
  port: "8083",
  path: "/mqtt",
  username: "client-3",
  password: "zxcvbnm,./",
};

// Create and export a singleton instance
export const mqttClient = new MqttClientWrapper(defaultConfig);
