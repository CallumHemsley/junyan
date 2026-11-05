# Real local punctuation probes for ticket 0062

Audition evidence only. No production change or accepted voice. Four thanks lines use the existing cast/presets with authored punctuation. The small fixture is not complete game content and must never replace production content.

The original pinned Qwen engine generated two clips, zero failures. A separate temporary runtime installed the repository pinned Kokoro requirements and cached the exact existing f3ff3571791e39611d31c381e3a41a3af07b4987 model; it generated two clips, zero failures. Final small-fixture plan: 12 available, zero pending. Dictionary words were cached and unchanged. No subjective listening or pronunciation approval occurred; this is a new-take comparison, not causal proof that punctuation alone resolves realism.

`inventory.json` maps each shipped baseline path to the candidate and checksum. `candidate-manifest-entries.json` contains only the four matching generated records for later deliberate import. Existing presets are copied in voices.json. Preserve all other content, voices, manifest entries and clips. The owner imports only an accepted full result after listening and schema coordination.

Mac commands used the same scripts/content-audio.py as the ticket checkpoint, with explicit --content/--voices/--output, --write-content and sequential --engine qwen then --engine kokoro. Qwen Python: /tmp/junyan-qwen-venv-0049/bin/python, existing offline cache. Kokoro Python: /tmp/junyan-0062-kokoro-env/bin/python, HF_HUB_CACHE=/tmp/junyan-0062-models, HF_HUB_OFFLINE=1. Package environment and model files are not committed. No project dependency, schema or production file changed.
