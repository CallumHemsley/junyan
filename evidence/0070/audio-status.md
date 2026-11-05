# Garden audio gate

The authored speaker is the existing resident 林姐. Her existing appearance and voice ID `serena` are reused. The word voice also remains `serena`.

The pinned model is `mlx-community/Qwen3-TTS-12Hz-0.6B-CustomVoice-4bit` at revision `08c72cad5e2fd0f41730c8bd1f28149585e46361`. No alternate voice, browser TTS, silent file or unrelated clip is supplied.

Run `PYTHONDONTWRITEBYTECODE=1 python3 src/features/garden/audio-plan.py` from this checkout to reproduce `audio-jobs.json`. The feature-local adapter imports the existing pipeline without changing its generator, model or hashes. It audits every authored URL against that pipeline's identity. New assets belong at `public/audio/garden/<filename>`. Existing identical canonical word assets keep their existing URL. Interface captions reference word entries directly and do not create redundant dialogue jobs.

Parent audio probe reports that `/workspace/garden-audio-probe` installed `mlx[cpu] 0.32.4`, `mlx-audio 0.6.3` and `soundfile 0.14.0`. The CPU backend imports and runs quantized matrix multiplication. Qwen Model and load_model import; the pipeline's memory/cache limit calls succeed. These are capability probes, not generated speech or a listening verdict. The pinned checkpoint is absent and Hugging Face download is policy-blocked. Actual pinned model loading, generation and listening remain open.

All seven central authored dialogue lines need new assets. The current manifest is the exact source of missing-job counts. No missing asset is counted as voiced content. The development harness records shared playback requests rather than pretending to play unavailable garden audio. Integrated playback, offline coverage and actual listening remain release blockers.
