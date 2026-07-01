"use client";

export const VOXSIGN_SIMULATION_SETTINGS_KEY = "voxsign_simulation_settings";
export const VOXSIGN_SIMULATION_EMAIL = "taleemmankuer@gmail.com";

export type SimulationSettings = {
  showSettings: boolean;
  simulate: boolean;
  sentence: string;
};

export const defaultSimulationSettings: SimulationSettings = {
  showSettings: false,
  simulate: false,
  sentence: "",
};

export const readSimulationSettings = (): SimulationSettings => {
  if (typeof window === "undefined") {
    return defaultSimulationSettings;
  }

  const rawSettings = window.localStorage.getItem(
    VOXSIGN_SIMULATION_SETTINGS_KEY,
  );

  if (!rawSettings) {
    return defaultSimulationSettings;
  }

  try {
    const parsed = JSON.parse(rawSettings) as Partial<SimulationSettings>;

    return {
      showSettings: Boolean(parsed.showSettings),
      simulate: Boolean(parsed.simulate),
      sentence:
        typeof parsed.sentence === "string" ? parsed.sentence : "",
    };
  } catch (error) {
    console.error("Failed to parse simulation settings", error);
    return defaultSimulationSettings;
  }
};

export const writeSimulationSettings = (settings: SimulationSettings) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    VOXSIGN_SIMULATION_SETTINGS_KEY,
    JSON.stringify(settings),
  );
};
