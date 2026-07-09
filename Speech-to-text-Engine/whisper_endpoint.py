# Deploys a FASTAPI endpoint for Whisper models (via FasterWhisper) on Modal GPUs.
# Uses CDLI's fine-tuned Ugandan English model with CTranslate2 for efficient inference.
# You can use any HuggingFace Whisper model by changing the MODEL_ID variable.
#
# To deploy:
#   modal deploy whisper_endpoint.py
#
# To test:
#   curl -X POST "https://xxxxx--whisper-endpoint-transcriber-transcribe.modal.run" \
#     -F "wav=@jfk_asknot.wav" \
#     -F "language=en"

# Requires: huggingface-secret configured in Modal!
import modal
from pathlib import Path
import numpy as np
from fastapi import File, Form

MODAL_APP_NAME = "whisper_endpoint_small_v1"

SAMPLE_RATE = 16000
BEAM_SIZE = 2
MODEL_MOUNT_DIR = Path("/models")
MODEL_DOWNLOAD_DIR = Path("downloads")

GPU = 'L4'
SCALEDOWN = 60 * 30  # seconds — keep warm through extended usage sessions

# HUGGINGFACE_REPO = "cdli/whisper-large-v3_finetuned_ugandan_english_nonstandard_speech_v1.0"
HUGGINGFACE_REPO = "cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0"

def maybe_download_and_convert_model(model_storage_dir, model_id):
    """Download and convert model to CTranslate2 format if not available locally.
    Checks cache first to avoid re-converting on every endpoint restart.
    """
    import ctranslate2

    print(f"Checking for cached model in storage directory: {model_storage_dir}, model ID: {model_id}")

    subdir = model_id.replace("/", "_") + "_ct2"
    model_path = model_storage_dir / subdir
    print(f"Looking for model at: {model_path}")

    if not model_path.exists():
        print(f"Model not found in cache -- downloading from HuggingFace: {model_id}")
        model_path.mkdir(parents=True)

        converter = ctranslate2.converters.TransformersConverter(
            model_name_or_path=model_id,
        )
        print(f"Converting to CTranslate2 format (float16)...")
        converter.convert(str(model_path), quantization="float16", force=True)
        print(f"Model successfully converted and saved to {model_path}")
    else:
        print(f"Found cached model at {model_path}")

    return str(model_path)


def transcribe_with_fasterwhisper(
    fasterwhisper_model,
    audio_array: np.ndarray,
    language,
    get_transcript_only=False,
    use_word_timestamps=False):
    """Actual transcription logic."""

    import numpy as np
    import time

    t1 = time.time()

    task = 'transcribe'
    print(f"Running Whisper transcription...")
    print(f"Language: {language if language else 'auto-detect'}")
    print(f"Audio length: {len(audio_array)} samples ({len(audio_array)/SAMPLE_RATE:.2f}s)")

    segments, _ = fasterwhisper_model.transcribe(
        audio_array,
        beam_size=BEAM_SIZE,
        language=language,
        task=task,
        condition_on_previous_text=False,
        vad_filter=True,
        word_timestamps=use_word_timestamps,
    )

    transcription = ''
    segment_texts = []
    words = []
    confidences = []
    compression_ratios = []

    print("[SEGMENTS] Processing transcribed segments...")
    segment_count = 0
    for segment in segments:
        segment_count += 1
        transcription += segment.text + ' '
        if get_transcript_only:
            continue
        segment_texts.append(segment.text)
        confidence = np.exp(segment.avg_logprob)
        confidences.append(confidence)
        compression_ratios.append(segment.compression_ratio)
        print(f"[SEGMENT {segment_count}] [{segment.start:.2f}s - {segment.end:.2f}s] "
              f"confidence: {confidence:.3f}, compression: {segment.compression_ratio:.3f}")
        print(f"[SEGMENT {segment_count}] Text: {segment.text}")
        if segment.words:
            for word in segment.words:
                words.append(word)

    transcription = transcription.strip()
    if get_transcript_only:
        return transcription

    elapsed_time = time.time() - t1
    avg_confidence = np.mean(confidences) if confidences else 0
    avg_compression_ratio = np.mean(compression_ratios) if compression_ratios else 0

    print(f"Transcription completed in {elapsed_time:.2f} seconds")
    print(f"Total segments: {segment_count}")
    print(f"Average confidence: {avg_confidence:.3f}")
    print(f"Average compression ratio: {avg_compression_ratio:.3f}")
    print(f"Final transcription: {transcription}")

    return {
        'result': "success",
        'transcription': transcription,
        'segments': segment_texts,
        'confidences': confidences,
        'compression_ratios': compression_ratios,
        'words': words
        }

#############################################
# Modal service with transcription endpoints
#############################################

# We need an image with cuda 12 and cudnn 9 when using faster-whisper (ctranslatr 4.5.0 depends on it).
cuda_image = (
    # modal.Image.from_registry("nvidia/cuda:12.3.2-cudnn9-runtime-ubuntu22.04", add_python="3.11")
    modal.Image.from_registry("nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04", add_python="3.11")  # ← cudnn8
    .apt_install("git", "ffmpeg")
    .pip_install(
        "fastapi[standard]",
        "numpy",
        "librosa",
        "huggingface_hub[hf_transfer]==0.26.2",        
        "torch",
        "transformers==4.44.2",   
        "ctranslate2==4.4.0",     
        "faster_whisper==1.0.3",  
    )
)

app = modal.App(MODAL_APP_NAME)
volume = modal.Volume.from_name(MODAL_APP_NAME, create_if_missing=True)

with cuda_image.imports():
    from fastapi import File, Form
    import librosa
    import io
    from pathlib import Path
    import numpy as np
    from faster_whisper import WhisperModel


@app.cls(
    image=cuda_image, 
    secrets=[modal.Secret.from_name("huggingface-secret")],
    gpu=GPU, 
    memory=4096,
    timeout=600,
    scaledown_window=SCALEDOWN, 
    enable_memory_snapshot=True,
    volumes={MODEL_MOUNT_DIR: volume})
@modal.concurrent(max_inputs=10)
class Transcriber:
    """Default Whisper model, can specify language or let model detect."""

    model_id = HUGGINGFACE_REPO

    @modal.enter()
    def enter(self):
        print(f"Starting WhisperTranscriber initialization - model repository: {self.model_id}")

        model_dir = MODEL_MOUNT_DIR / MODEL_DOWNLOAD_DIR
        model_path = maybe_download_and_convert_model(model_dir, self.model_id)
        self.whisper_model = WhisperModel(model_path, device="cuda", compute_type="float16")
        print("FasterWhisper model successfully loaded and ready")


    @modal.fastapi_endpoint(docs=True, method="GET")
    def warm(self):
        """Lightweight warm-up endpoint — just confirms the container and model are live.
        Returns immediately without any transcription work.
        The frontend calls this when the Signing tab mounts to pre-warm the GPU container
        so the first real transcription request doesn't pay the full cold-start penalty."""
        import time
        is_warm = self.whisper_model is not None
        print(f"[WARM] Container is {'warm' if is_warm else 'cold (model not loaded)'} "
              f"— enter() has {'run' if is_warm else 'not run'} yet")
        return {"status": "warm" if is_warm else "cold", "timestamp": time.time()}


    @modal.fastapi_endpoint(docs=True, method="POST")
    def transcribe(
        self, 
        wav: bytes = File(), 
        language: str = Form(default=None), 
        use_word_timestamps: bool = Form(default=False)
    ):
        import tempfile
        import os
        import subprocess
        import logging

        logger = logging.getLogger(__name__)
        file_size = len(wav)

        print(f"Received request. File size: {file_size} bytes")

        # ── Input validation ──────────────────────────────────────────────
        if file_size == 0:
            print("REJECTED: empty upload (0 bytes)")
            return {"error": "Empty audio file received."}

        MIN_WAV_SIZE = 48  # smallest valid WAV header + 1 sample
        if file_size < MIN_WAV_SIZE:
            print(f"REJECTED: file too small ({file_size} bytes) — likely corrupt or truncated")
            return {"error": f"Audio file too small ({file_size} bytes)."}

        # Log initial bytes for diagnostic purposes
        header_hex = wav[:16].hex()
        print(f"File header (first 16 bytes): {header_hex}")

        # Save to temp file (no .wav hardcode — format is unknown until probed)
        raw_path = None
        wav_path = None
        audio_array = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".audio") as tmp:
                tmp.write(wav)
                raw_path = tmp.name

            print("Saved temp file:", raw_path)

            # Try loading directly (works if input is already WAV/PCM)
            try:
                audio_array, _ = librosa.load(raw_path, sr=SAMPLE_RATE)
                print("Decoded directly with librosa — input was already a supported format")
            except Exception:
                # Direct decode failed — transcode via ffmpeg to WAV
                print("Direct librosa decode failed — attempting ffmpeg transcode to WAV")
                wav_path = raw_path + ".wav"
                try:
                    subprocess.run(
                        ["ffmpeg", "-y", "-i", raw_path, "-ar", str(SAMPLE_RATE),
                         "-ac", "1", "-sample_fmt", "s16", wav_path],
                        capture_output=True, text=True, check=True, timeout=120,
                    )
                    print(f"ffmpeg transcode succeeded to: {wav_path}")
                except subprocess.CalledProcessError as proc_err:
                    print(f"FFMPEG TRANSCODE FAILURE — Size: {file_size}, Header: {header_hex}, "
                          f"stderr: {proc_err.stderr[:500]}")
                    return {"error": f"Audio transcoding failed: unsupported format"}
                except subprocess.TimeoutExpired:
                    print(f"FFMPEG TIMEOUT — Size: {file_size}, Header: {header_hex}")
                    return {"error": "Audio transcoding timed out."}

                # Load the transcoded WAV
                try:
                    audio_array, _ = librosa.load(wav_path, sr=SAMPLE_RATE)
                    print("Loaded transcoded WAV successfully")
                except Exception as load_err:
                    print(f"AUDIO LOAD FAILURE after ffmpeg — Size: {file_size}, "
                          f"Header: {header_hex}, Error: {load_err}")
                    return {"error": f"Failed to decode audio after transcoding: {load_err}"}

            if audio_array is None or len(audio_array) == 0:
                print(f"AUDIO LOAD FAILURE — librosa returned empty array (size={file_size}, header={header_hex})")
                return {"error": "Decoded audio is empty. The file may be corrupt or silent."}

            duration = len(audio_array) / SAMPLE_RATE
            print(f"Audio loaded successfully. Samples: {len(audio_array)}, Duration: {duration:.2f}s")

            try:
                result = transcribe_with_fasterwhisper(
                    self.whisper_model,
                    audio_array,
                    language,
                    get_transcript_only=False,
                    use_word_timestamps=use_word_timestamps
                )
            except Exception as transcribe_err:
                print(f"TRANSCRIPTION FAILURE — Size: {file_size}, Duration: {duration:.2f}s, "
                      f"Header: {header_hex}, Error: {transcribe_err}")
                return {"error": f"Transcription pipeline error: {transcribe_err}"}

            return result

        finally:
            if raw_path and os.path.exists(raw_path):
                os.remove(raw_path)
            if wav_path and os.path.exists(wav_path):
                os.remove(wav_path)
            if audio_array is not None:
                del audio_array