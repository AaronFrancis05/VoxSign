import modal
import io
from fastapi import Request, UploadFile, File
from fastapi.responses import JSONResponse, Response

MODEL_DIR = "/vol/whisper-luganda-final"
GPU = "L40S"
SCALEDOWN = 30

app = modal.App("wulira-ai")
volume = modal.Volume.from_name("whisper-asr")

image = (
    modal.Image.debian_slim()
    .pip_install(
        "torch",
        "transformers",
        "scipy",
        "accelerate",
        "librosa",
        "soundfile",
        "numpy",
        "fastapi[standard]"
    )
)

@app.cls(
    gpu=GPU,
    image=image,
    volumes={"/vol": volume},
    scaledown_window=SCALEDOWN,
    max_containers=2,
    enable_memory_snapshot=True,
)
class WuliraAI:

    @modal.enter()
    def load_models(self):
        import torch
        from transformers import WhisperProcessor, WhisperForConditionalGeneration, AutoTokenizer, AutoModelForTextToWaveform

        print("Loading Luganda Whisper model...")
        self.device = "cuda"
        
        # ASR Model
        self.asr_processor = WhisperProcessor.from_pretrained(MODEL_DIR, local_files_only=True)
        self.asr_model = WhisperForConditionalGeneration.from_pretrained(
            MODEL_DIR, 
            dtype=torch.float16, 
            local_files_only=True
        ).to(self.device)
        
        self.asr_model.config.forced_decoder_ids = self.asr_processor.get_decoder_prompt_ids(
            language="sw",
            task="transcribe"
        )
        self.asr_model.eval()

        print("Loading Luganda TTS model...")
        # TTS Model
        self.tts_tokenizer = AutoTokenizer.from_pretrained("facebook/mms-tts-lug")
        self.tts_model = AutoModelForTextToWaveform.from_pretrained(
            "facebook/mms-tts-lug",
            dtype=torch.float16
        ).to(self.device)
        self.tts_model.eval()

        print("All models loaded successfully")

    # --- ASR HELPER ---
    def load_audio(self, audio_bytes):
        import librosa
        import soundfile as sf
        import numpy as np
        try:
            # Try loading as a file (WAV, etc.)
            audio, sr = sf.read(io.BytesIO(audio_bytes))
        except Exception:
            try:
                # Fallback to librosa generic load
                audio, sr = librosa.load(io.BytesIO(audio_bytes), sr=None)
            except Exception:
                # FINAL FALLBACK: Assume raw PCM 16-bit 16kHz Mono
                # This is what our streaming frontend sends for low-latency
                audio = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                sr = 16000

        # stereo -> mono
        if len(audio.shape) > 1:
            audio = np.mean(audio, axis=1)
        
        # resample to 16kHz
        if sr != 16000:
            audio = librosa.resample(audio, orig_sr=sr, target_sr=16000)

        # clip max duration (30 sec)
        max_len = 16000 * 30
        if len(audio) > max_len:
            audio = audio[:max_len]
        
        audio = audio.astype("float32")
        
        # normalize
        peak = np.max(np.abs(audio))
        if peak > 0:
            audio = audio / peak
        
        return audio

    # --- ASR INTERNAL ---
    def run_asr(self, audio):
        import torch
        inputs = self.asr_processor.feature_extractor(
            audio,
            sampling_rate=16000,
            return_tensors="pt"
        )
        input_features = inputs.input_features.to(self.device).half()

        with torch.no_grad():
            ids = self.asr_model.generate(
                input_features,
                max_new_tokens=120,
                num_beams=2,
                no_repeat_ngram_size=3
            )

        text = self.asr_processor.tokenizer.batch_decode(ids, skip_special_tokens=True)[0]
        return text.strip()

    # --- TTS HELPER ---
    def run_tts(self, text):
        import torch
        import io
        import scipy.io.wavfile as wavfile
        import numpy as np

        inputs = self.tts_tokenizer(text, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}