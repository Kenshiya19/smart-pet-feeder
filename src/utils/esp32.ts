const DEFAULT_ESP32_IP = '192.168.1.2';

export function getEsp32BaseUrl(ipAddress?: string): string {
  const ip = (ipAddress || DEFAULT_ESP32_IP)
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  return `http://${ip}`;
}

export interface Esp32Status {
  connected: boolean;
  ip?: string;
  wifiName: string;
  bowlWeight?: number;
  hopperDistance?: number;
  hopperLevelPercent?: number;
  petPresent?: boolean;
  feedingInProgress?: boolean;
  status?: string;
  lastFeedingTime?: string;
  feedingCount?: number;
}

export async function pingEsp32(
  ipAddress?: string
): Promise<Esp32Status> {
  const baseUrl = getEsp32BaseUrl(ipAddress);

  const controller = new AbortController();

  const timeout = window.setTimeout(
    () => controller.abort(),
    2500
  );

  try {
    const response = await fetch(`${baseUrl}/status`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `ESP32 status HTTP ${response.status}`
      );
    }

    const data = await response.json();

    return {
      connected: true,
      ...data,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function feedEsp32(
  amountGrams: number,
  ipAddress?: string
): Promise<string> {
  const baseUrl = getEsp32BaseUrl(ipAddress);
 
  const controller = new AbortController();

  const timeout = window.setTimeout(
    () => controller.abort(),
    35000
  );

  try {
    const response = await fetch(
      `${baseUrl}/feed?target=${encodeURIComponent(amountGrams)}`,
      {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      }
    );

    const text = await response.text();

    // -----------------------------------------------
    // FEEDING ERROR
    // -----------------------------------------------
    if (!response.ok) {

      // Try JSON response first
      try {
        const data = JSON.parse(text);

        if (data.reason === 'food_remaining') {
          throw new Error(
            `Food remains in bowl: ${data.bowlWeight ?? 0} g. ` +
            `${data.petPresent ? 'Pet detected.' : 'Pet not detected.'} ` +
            `Feeding cancelled.`
          );
        }
      } catch (jsonError) {

        // If this is already our intended error,
        // send it directly to App.tsx
        if (
          jsonError instanceof Error &&
          jsonError.message.includes('Food remains in bowl')
        ) {
          throw jsonError;
        }
      }

      // Your current ESP32 sends plain text:
      // "Food already remains in bowl"
      if (
        text
          .toLowerCase()
          .includes('food already remains in bowl')
      ) {
        throw new Error(
          'Food remains in bowl. Feeding cancelled.'
        );
      }

      throw new Error(
        text || `ESP32 feeding HTTP ${response.status}`
      );
    }

    // -----------------------------------------------
    // FEEDING SUCCESS
    // -----------------------------------------------
    return text;

  } finally {
    window.clearTimeout(timeout);
  }
}


// -----------------------------------------------
// LED BRIGHTNESS
// -----------------------------------------------
export async function setLedBrightness(
  brightness: number,
  ipAddress?: string
): Promise<string> {

  const baseUrl = getEsp32BaseUrl(ipAddress);

  const value = Math.max(
    0,
    Math.min(100, Math.round(brightness))
  );

  const response = await fetch(
    `${baseUrl}/settings?ledBrightness=${value}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || `ESP32 LED settings HTTP ${response.status}`
    );
  }

  return text;
}
export async function setChimeOnDispense(
  enabled: boolean,
  ipAddress?: string
): Promise<string> {
  const baseUrl = getEsp32BaseUrl(ipAddress);

  const response = await fetch(
    `${baseUrl}/settings?chimeOnDispense=${enabled}`,
    {
      method: 'GET',
      cache: 'no-store',
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      text || `ESP32 audio settings HTTP ${response.status}`
    );
  }

  return text;
}