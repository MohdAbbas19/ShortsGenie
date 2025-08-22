from gtts import gTTS
import sys

text = sys.argv[1]
lang = sys.argv[2]

tts = gTTS(text, lang=lang)
filename = "public/output.mp3"
tts.save(filename)

print("output.mp3")
