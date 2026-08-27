/**
 * RapidKeyz Reusable License Management SDK
 * For Desktop Tools, Web Applications, Plugins, and Extension Scripts.
 */

export interface LicenseClientConfig {
  baseUrl: string;
  productId: string;
  deviceId: string;
  installationId: string;
  deviceName?: string;
  platform?: string;
  clientVersion?: string;
}

export interface ActivationResponse {
  valid: boolean;
  status?: string;
  product?: string;
  plan?: string;
  expires_at?: string;
  server_time?: string;
  session_id?: string;
  attestation?: {
    alg: "ES256";
    payload: any;
    signature: string;
    publicKeyPem: string;
  };
  error?: string;
  errorCode?: string;
}

export interface TrialResponse {
  success: boolean;
  license_key?: string;
  status?: string;
  product?: string;
  plan?: string;
  starts_at?: string;
  expires_at?: string;
  attestation?: any;
  error?: string;
  errorCode?: string;
}

export class LicenseClient {
  private config: LicenseClientConfig;
  private currentSessionId: string | null = null;
  private heartbeatTimer: any = null;

  constructor(config: LicenseClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/$/, ""),
    };
  }

  /**
   * Request 3-Day Free Trial
   */
  async requestTrial(email: string): Promise<TrialResponse> {
    try {
      const res = await fetch(`${this.config.baseUrl}/api/v1/license/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          product: this.config.productId,
          device_id: this.config.deviceId,
          installation_id: this.config.installationId,
          device_name: this.config.deviceName,
          platform: this.config.platform,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message || "Network error", errorCode: "NETWORK_ERROR" };
    }
  }

  /**
   * Activate License Key on current Device
   */
  async activate(licenseKey: string): Promise<ActivationResponse> {
    try {
      const res = await fetch(`${this.config.baseUrl}/api/v1/license/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: licenseKey,
          product: this.config.productId,
          device_id: this.config.deviceId,
          installation_id: this.config.installationId,
          device_name: this.config.deviceName,
          platform: this.config.platform,
          client_version: this.config.clientVersion,
        }),
      });
      const data: ActivationResponse = await res.json();
      if (data.valid && data.session_id) {
        this.currentSessionId = data.session_id;
      }
      return data;
    } catch (err: any) {
      return { valid: false, error: err.message || "Network error", errorCode: "NETWORK_ERROR" };
    }
  }

  /**
   * Validate Session
   */
  async validate(licenseKey?: string): Promise<ActivationResponse> {
    if (!this.currentSessionId) {
      return { valid: false, error: "No active session.", errorCode: "INVALID_SESSION" };
    }

    try {
      const res = await fetch(`${this.config.baseUrl}/api/v1/license/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.currentSessionId,
          license_key: licenseKey,
          product: this.config.productId,
          device_id: this.config.deviceId,
        }),
      });
      return await res.json();
    } catch (err: any) {
      return { valid: false, error: err.message || "Network error", errorCode: "NETWORK_ERROR" };
    }
  }

  /**
   * Start periodic heartbeat (default interval: 10 minutes)
   */
  startHeartbeat(intervalMinutes: number = 10, onRevokedOrExpired?: (err: string) => void) {
    this.stopHeartbeat();
    const ms = intervalMinutes * 60 * 1000;

    this.heartbeatTimer = setInterval(async () => {
      if (!this.currentSessionId) return;

      try {
        const res = await fetch(`${this.config.baseUrl}/api/v1/license/heartbeat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: this.currentSessionId,
            product: this.config.productId,
            device_id: this.config.deviceId,
          }),
        });

        const data: ActivationResponse = await res.json();
        if (!data.valid && onRevokedOrExpired) {
          this.stopHeartbeat();
          onRevokedOrExpired(data.error || "License session revoked or expired.");
        }
      } catch (e) {}
    }, ms);
  }

  /**
   * Stop periodic heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Deactivate current Session
   */
  async deactivate(licenseKey?: string): Promise<boolean> {
    this.stopHeartbeat();
    if (!this.currentSessionId) return true;

    try {
      await fetch(`${this.config.baseUrl}/api/v1/license/deactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: this.currentSessionId,
          license_key: licenseKey,
        }),
      });
      this.currentSessionId = null;
      return true;
    } catch (err) {
      return false;
    }
  }
}
