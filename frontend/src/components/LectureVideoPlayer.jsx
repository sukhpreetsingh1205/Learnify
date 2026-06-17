import React, { useMemo, useState } from "react";

const getYouTubeId = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (host.endsWith("youtube.com")) {
      const vParam = url.searchParams.get("v");
      if (vParam) return vParam;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex >= 0 && parts[shortsIndex + 1]) return parts[shortsIndex + 1];
    }

    if (host.endsWith("youtube-nocookie.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1]) return parts[embedIndex + 1];
    }

    return null;
  } catch {
    return null;
  }
};

const getVimeoId = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "vimeo.com" && !host.endsWith(".vimeo.com")) return null;

    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

const getGoogleDrivePreviewUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "drive.google.com") return null;

    // https://drive.google.com/file/d/<id>/view?...
    const match = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (match?.[1]) return `https://drive.google.com/file/d/${match[1]}/preview`;

    // https://drive.google.com/open?id=<id>
    const id = url.searchParams.get("id");
    if (id) return `https://drive.google.com/file/d/${id}/preview`;

    return null;
  } catch {
    return null;
  }
};

const normalizeDirectVideoUrl = (rawUrl) => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "");

    // Dropbox share links often don't play in <video>; try a best-effort "raw" variant.
    if (host.endsWith("dropbox.com")) {
      url.searchParams.delete("dl");
      url.searchParams.set("raw", "1");
      return url.toString();
    }

    return rawUrl;
  } catch {
    return rawUrl;
  }
};

const buildPlayerConfig = (rawUrl) => {
  const url = rawUrl?.trim();
  if (!url) return { type: "empty" };

  const youTubeId = getYouTubeId(url);
  if (youTubeId) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${youTubeId}`,
      title: "YouTube video player",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    };
  }

  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeoId}`,
      title: "Vimeo video player",
      allow: "autoplay; fullscreen; picture-in-picture",
    };
  }

  const drivePreview = getGoogleDrivePreviewUrl(url);
  if (drivePreview) {
    return {
      type: "iframe",
      src: drivePreview,
      title: "Google Drive video player",
      allow: "autoplay; fullscreen",
    };
  }

  return { type: "video", src: normalizeDirectVideoUrl(url) };
};

function LectureVideoPlayer({ url, className = "" }) {
  const [showHint, setShowHint] = useState(false);

  const config = useMemo(() => buildPlayerConfig(url), [url]);

  if (config.type === "empty") return null;

  if (config.type === "iframe") {
    return (
      <iframe
        key={config.src}
        src={config.src}
        title={config.title}
        className={className}
        allow={config.allow}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      <video
        key={config.src}
        src={config.src}
        controls
        className={className}
        playsInline
        onError={() => setShowHint(true)}
      />
      {showHint && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 text-center">
          <p className="text-xs text-white">
            This link can’t be played in the browser. Use a direct video file link (like .mp4) or paste a YouTube/Drive link.
          </p>
        </div>
      )}
    </div>
  );
}

export default LectureVideoPlayer;
