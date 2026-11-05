"""Original breakfast sound design. Python stdlib + ffmpeg; no sampled input."""
from array import array
from pathlib import Path
import math
import random
import subprocess
import tempfile
import wave

RATE = 24000
SECONDS = 73
rng = random.Random(63)
mix = array('f', [0]) * (RATE * SECONDS)
# Very low steam/room preparation texture; periodic envelope has matched endpoints.
low = 0.0
for i in range(len(mix)):
    low += 0.035 * (rng.uniform(-1, 1) - low)
    mix[i] = low * 0.025 * (0.8 + 0.2 * math.cos(2 * math.pi * i / len(mix)))

def cup(start, strength):
    for j in range(int(RATE * 0.65)):
        t = j / RATE
        attack = min(1, t / 0.002)
        value = sum(math.sin(2 * math.pi * f * t) * math.exp(-t * decay)
                    for f, decay in [(1067, 24), (1733, 33), (2791, 44)]) / 3
        mix[int(start * RATE) + j] += strength * value * attack

def pour(start, duration):
    smooth = 0.0
    for j in range(int(duration * RATE)):
        t = j / RATE
        smooth += 0.2 * (rng.uniform(-1, 1) - smooth)
        envelope = math.sin(math.pi * t / duration) ** 0.65
        # Splash noise, irregular falling liquid resonances, no voiced oscillation.
        bubble = math.sin(2 * math.pi * (390 * t + 150 * t * t))
        pulse = max(0, math.sin(2 * math.pi * 8.7 * t)) ** 12
        mix[int(start * RATE) + j] += envelope * (smooth * 0.065 + bubble * pulse * 0.009)

def prepare(start, duration):
    smooth = 0.0
    for j in range(int(duration * RATE)):
        t = j / RATE
        noise = rng.uniform(-1, 1)
        smooth += 0.13 * (noise - smooth)
        envelope = math.sin(math.pi * t / duration) ** 2
        mix[int(start * RATE) + j] += smooth * envelope * 0.022 * (0.6 + 0.4 * math.sin(2 * math.pi * 2.3 * t) ** 2)

for at, strength in [(3.1, .055), (3.32, .023), (16.4, .04), (28.7, .05), (44.2, .042), (44.51, .018), (59.8, .05), (68.2, .035)]:
    cup(at, strength)
for at, duration in [(7.3, 2.9), (33.1, 3.8), (62.5, 2.4)]:
    pour(at, duration)
for at, duration in [(12.1, 2.3), (22.7, 4.2), (39.8, 2.8), (51.3, 4.4)]:
    prepare(at, duration)
# Quiet seam, no foreground event crossing loop boundary.
for i in range(RATE // 8):
    fade = i / (RATE // 8)
    mix[i] *= fade
    mix[-i - 1] *= fade
out = Path('public/audio/ambience')
out.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    source = str(Path(tmp) / 'breakfast.wav')
    with wave.open(source, 'wb') as wav:
        wav.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        wav.writeframes(array('h', (round(max(-1, min(1, v)) * 32767) for v in mix)).tobytes())
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
                    '-c:a', 'libmp3lame', '-b:a', '48k', str(out / 'breakfast.mp3')], check=True)
print(f'{out / "breakfast.mp3"}: {(out / "breakfast.mp3").stat().st_size} bytes')
