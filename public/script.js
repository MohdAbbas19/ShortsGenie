
const form = document.getElementById("scriptForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const idea = document.getElementById("idea").value;
  const scriptLang = document.getElementById("scriptLang").value;
  const voiceLang = document.getElementById("voiceLang").value;

  const scriptRes = await fetch("/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, lang: scriptLang })
  });
  const scriptData = await scriptRes.json();
  document.getElementById("scriptText").textContent = scriptData.script;

  const audioRes = await fetch("/generate-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: scriptData.script, voiceLang })
  });
  const audioData = await audioRes.json();

  document.getElementById("audio").src = audioData.audio;
  document.getElementById("result").classList.remove("hidden");
});
