export type Sample = {
    /** device-relative timestamp in ms */
    t_ms: number;
    /** linear accel in m/s^2 */
    ax: number; ay: number; az: number;
    /** angular rate in rad/s */
    gx: number; gy: number; gz: number;
  };
  
  export type DeviceInfo = { id: string; name?: string; rssi?: number };
  
  export type ImuBatchHandler = (batch: Sample[]) => void;
  