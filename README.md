# ritw237.github.io — personal website

My personal site. A cinematic "cyberpunk apartment" (Deus Ex: Mankind Divided–inspired)
where my profile, projects, stack, and contact links float as glass holographic panels
on the walls of a living, looping room.

Live at: https://ritw237.github.io

---

## How this site is built (plain English)

**The whole website is ONE file: `index.html`.**
All the layout, text, styling (CSS), and behavior (JavaScript) live inside that single
file. There are no separate stylesheet or script files to manage. This makes it easy to
edit and hard to break.

The only other things the site needs are media files, kept in the **`refs/`** folder:

| File | What it is |
|------|------------|
| `refs/room-video.mp4` | The looping room video (fireplace + rain + city). Has built-in audio. |
| `refs/room-base.png`  | A still image of the room. Used as a fallback before the video loads. |
| `refs/wm-cover.png`   | A small patch that hides a watermark in the bottom-right of the video. |
| `refs/music-unatco-loop.mp3` | The background music track (toggled by the music button). |
| `refs/og-image.png`   | The image shown when the site link is shared (WhatsApp/LinkedIn/etc). |
| `favicon.svg` / `favicon.png` | The little icon shown in the browser tab. |

That's the entire site. Nothing else is required.

---

## How to make changes in the future

You do NOT need web development knowledge. The flow is:

1. **Get the current file.** Download `index.html` from this repo
   (click the file → "Download raw file"), or copy its full contents.
2. **Ask an AI to edit it.** Paste the whole file into ChatGPT/Claude/etc. and describe
   the change in plain words. Always end with:
   *"Give me back the COMPLETE updated file, not just the changed part."*
3. **Replace and re-upload.** Save what it gives you as `index.html`, then upload it to
   this repo (GitHub: **Add file → Upload files → drag it in → Commit changes**).
   The live site updates in ~1 minute.

**Tip:** make one small change at a time, and keep a backup of the last working
`index.html` so you can always revert if something looks wrong.

### Common future edits
- **Add a clickable link to a project** — find the project name in the `ARCHIVE` section
  and wrap it in a link. (Just tell the AI: "make the Demogen project link to <URL>".)
- **Add a résumé download** — add a new line in the `SIGNAL` section pointing to a PDF.
- **Change wording** — search the file for the text you want to change; it appears twice
  (once for desktop, once for the mobile `m...` version) — update both.

---

## Structure inside index.html (orientation for an AI or developer)

- **Desktop view**: a fixed 1764×1176 "stage" holding the room video + 5 glass panels
  (`.holo` elements): IDENTITY, PROFILE, ARCHIVE, STACK, SIGNAL. Scaled to fit any screen.
- **Mobile view** (screens ≤ 820px wide): a separate layer (`.mroom` + `.mscroll` with
  `.msec` / `.mholo` sections). The room video pans across as you scroll; each panel
  fades in. The desktop stage is hidden on mobile and vice-versa.
- **Audio**: two toggles, bottom-right. "Ambience" plays the video's own sound via the
  Web Audio API with a seamless crossfade loop; "Music" plays `music-unatco-loop.mp3`.
  Both have hover-reveal volume sliders. Sound starts on first tap/click (browser rule).
- **Content appears TWICE** in the file — once in the desktop panels, once in the mobile
  sections. If you edit text, update both copies.

---

## Deploying (how it goes live)

This repo is a GitHub Pages site. Any file committed to the `main` branch at the repo
root is published automatically to https://ritw237.github.io within a minute or two.
No build step, no commands — just upload files and commit.
