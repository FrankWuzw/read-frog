import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v088-to-v089"

describe("v088-to-v089 migration", () => {
  it("keeps Edge TTS selected and preserves existing voice settings", () => {
    const oldTts = {
      defaultVoice: "en-US-DavisNeural",
      languageVoices: { eng: "en-US-DavisNeural" },
      rate: 12,
      pitch: -3,
      volume: 5,
    }

    expect(migrate({ tts: oldTts })).toEqual({
      tts: {
        ...oldTts,
        backend: "edge",
        openAICompatible: {
          baseURL: "http://127.0.0.1:8880/v1",
          apiKey: "",
          model: "kokoro",
          voice: "af_heart",
          responseFormat: "mp3",
          speed: 1,
          instructions: "",
        },
      },
    })
  })

  it("leaves invalid top-level values unchanged", () => {
    expect(migrate(null)).toBeNull()
    expect(migrate([])).toEqual([])
  })
})
