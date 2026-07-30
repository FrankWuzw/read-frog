import type { TestSeriesObject } from "./types"
import { testSeries as previousTestSeries } from "./v088"

const externalTTSDefaults = {
  backend: "edge" as const,
  openAICompatible: {
    baseURL: "http://127.0.0.1:8880/v1",
    apiKey: "",
    model: "kokoro",
    voice: "af_heart",
    responseFormat: "mp3" as const,
    speed: 1,
    instructions: "",
  },
}

/**
 * Frozen v089 expectations. Keep the migration delta explicit here instead of
 * deriving expected fixtures by calling the migration under test.
 */
export const testSeries: TestSeriesObject = Object.fromEntries(
  Object.entries(previousTestSeries).map(([name, series]) => [
    name,
    {
      ...series,
      config: {
        ...series.config,
        tts: {
          ...series.config.tts,
          ...externalTTSDefaults,
        },
      },
    },
  ]),
)
