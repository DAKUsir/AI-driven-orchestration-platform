const { google } = require("googleapis");

// ── Course-detection keywords ──
const COURSE_KEYWORDS = [
  "course", "tutorial", "bootcamp", "masterclass", "complete guide",
  "full course", "crash course", "learn", "beginner to advanced",
  "dsa", "data structures", "algorithms", "react", "python", "java",
  "javascript", "node", "machine learning", "deep learning", "ai",
  "development", "programming", "coding", "web dev", "frontend",
  "backend", "full stack", "devops", "docker", "kubernetes",
  "sql", "mongodb", "system design", "interview", "placement",
];

const IGNORE_KEYWORDS = [
  "music", "songs", "playlist", "vlog", "vevo", "funny",
  "comedy", "entertainment", "gaming", "memes", "shorts",
];

// ── Category detection ──
const CATEGORY_MAP = {
  "dsa": ["dsa", "data structure", "algorithm", "leetcode", "competitive", "sorting", "graph", "tree", "dynamic programming"],
  "web-dev": ["react", "angular", "vue", "html", "css", "javascript", "node", "express", "next", "frontend", "backend", "full stack", "web"],
  "python": ["python", "django", "flask", "fastapi"],
  "java": ["java", "spring", "spring boot"],
  "ml-ai": ["machine learning", "deep learning", "ai", "artificial intelligence", "tensorflow", "pytorch", "neural network", "nlp", "computer vision"],
  "devops": ["devops", "docker", "kubernetes", "ci/cd", "aws", "cloud", "terraform"],
  "mobile": ["android", "ios", "flutter", "react native", "swift", "kotlin"],
  "database": ["sql", "mysql", "postgres", "mongodb", "database", "redis"],
  "system-design": ["system design", "architecture", "scalability", "microservices"],
};

function detectCategory(title) {
  const lower = title.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((k) => lower.includes(k))) return cat;
  }
  return "general";
}

function isCoursePlaylist(title, description = "") {
  const combined = `${title} ${description}`.toLowerCase();
  const hasCourseKeyword = COURSE_KEYWORDS.some((k) => combined.includes(k));
  const hasIgnoreKeyword = IGNORE_KEYWORDS.some((k) => combined.includes(k));
  return hasCourseKeyword && !hasIgnoreKeyword;
}

// ── Parse ISO 8601 duration to seconds ──
function parseDuration(iso) {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  return h * 3600 + m * 60 + s;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Build OAuth2 client ──
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BACKEND_URL || "http://localhost:5000"}/api/integrations/youtube/callback`
  );
}

// ── Get auth URL for YouTube ──
function getAuthUrl(state) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    state,
  });
}

// ── Exchange code for tokens ──
async function exchangeCode(code) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// ── Refresh an expired access token ──
// Returns a valid access token, refreshing from DB if needed
async function getValidAccessToken(integration) {
  // If token hasn't expired yet (with 5-min buffer), use it
  if (integration.tokenExpiry) {
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    if (new Date(integration.tokenExpiry).getTime() - bufferMs > Date.now()) {
      return integration.accessToken;
    }
  }

  // Token expired or no expiry recorded — try refreshing
  if (!integration.refreshToken) {
    throw new Error("YouTube token expired and no refresh token available. Please reconnect YouTube.");
  }

  console.log("[YouTube] Access token expired, refreshing...");
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: integration.refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  // Update the integration record in DB
  integration.accessToken = credentials.access_token;
  if (credentials.expiry_date) {
    integration.tokenExpiry = new Date(credentials.expiry_date);
  }
  if (credentials.refresh_token) {
    integration.refreshToken = credentials.refresh_token;
  }
  await integration.save();

  console.log("[YouTube] Token refreshed successfully");
  return credentials.access_token;
}

// ── Get authenticated YouTube client ──
function getYoutubeClient(accessToken) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.youtube({ version: "v3", auth: oauth2Client });
}

// ── Get YouTube client with API key (for public data) ──
function getPublicYoutubeClient() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not configured");
  return google.youtube({ version: "v3", auth: apiKey });
}

// ── Fetch user's channel info ──
async function getChannelInfo(accessToken) {
  const yt = getYoutubeClient(accessToken);
  const res = await yt.channels.list({
    part: "snippet,contentDetails",
    mine: true,
  });
  const channel = res.data.items?.[0];
  if (!channel) return null;
  return {
    channelId: channel.id,
    channelTitle: channel.snippet.title,
  };
}

// ── Fetch user's playlists ──
async function getUserPlaylists(accessToken) {
  const yt = getYoutubeClient(accessToken);
  const playlists = [];
  let nextPageToken = null;

  do {
    const res = await yt.playlists.list({
      part: "snippet,contentDetails",
      mine: true,
      maxResults: 50,
      pageToken: nextPageToken,
    });
    if (res.data.items) {
      playlists.push(...res.data.items);
    }
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  return playlists;
}

// ── Fetch saved/liked playlists ──
async function getSavedPlaylists(accessToken) {
  const yt = getYoutubeClient(accessToken);
  try {
    const res = await yt.subscriptions.list({
      part: "snippet",
      mine: true,
      maxResults: 50,
    });
    return res.data.items || [];
  } catch {
    return [];
  }
}

// ── Fetch playlist items (videos) ──
async function getPlaylistVideos(accessToken, playlistId) {
  const yt = accessToken ? getYoutubeClient(accessToken) : getPublicYoutubeClient();
  const videos = [];
  let nextPageToken = null;

  do {
    const res = await yt.playlistItems.list({
      part: "snippet,contentDetails",
      playlistId,
      maxResults: 50,
      pageToken: nextPageToken,
    });
    if (res.data.items) {
      videos.push(...res.data.items);
    }
    nextPageToken = res.data.nextPageToken;
  } while (nextPageToken);

  return videos;
}

// ── Fetch video durations ──
async function getVideoDurations(accessToken, videoIds) {
  if (!videoIds.length) return {};
  const yt = accessToken ? getYoutubeClient(accessToken) : getPublicYoutubeClient();
  const durations = {};

  // Batch in groups of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await yt.videos.list({
      part: "contentDetails",
      id: batch.join(","),
    });
    if (res.data.items) {
      res.data.items.forEach((v) => {
        const seconds = parseDuration(v.contentDetails.duration);
        durations[v.id] = {
          duration: formatDuration(seconds),
          durationSeconds: seconds,
        };
      });
    }
  }
  return durations;
}

// ── Build course data from playlist object (OAuth-synced) ──
async function buildCourseFromPlaylist(accessToken, playlist) {
  const playlistId = playlist.id;
  const title = playlist.snippet.title;
  const description = playlist.snippet.description || "";
  const thumbnail =
    playlist.snippet.thumbnails?.high?.url ||
    playlist.snippet.thumbnails?.medium?.url ||
    playlist.snippet.thumbnails?.default?.url ||
    "";
  const channelTitle = playlist.snippet.channelTitle || "";
  const totalVideos = playlist.contentDetails?.itemCount || 0;

  // Fetch all videos in playlist
  const items = await getPlaylistVideos(accessToken, playlistId);
  const videoIds = items
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);

  // Fetch durations
  const durations = await getVideoDurations(accessToken, videoIds);

  const videos = items.map((item, idx) => {
    const vid = item.contentDetails?.videoId;
    const dur = durations[vid] || { duration: "0:00", durationSeconds: 0 };
    return {
      videoId: vid,
      title: item.snippet?.title || `Video ${idx + 1}`,
      duration: dur.duration,
      durationSeconds: dur.durationSeconds,
      position: item.snippet?.position ?? idx,
      watched: false,
    };
  });

  const totalSeconds = videos.reduce((acc, v) => acc + v.durationSeconds, 0);
  const estimatedHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const category = detectCategory(title + " " + description);
  const courseDetected = isCoursePlaylist(title, description);

  return {
    playlistId,
    title,
    description,
    thumbnail,
    channelTitle,
    totalVideos: videos.length || totalVideos,
    estimatedHours,
    category,
    isCourse: courseDetected,
    videos,
  };
}

// ── Extract playlist ID from a YouTube URL ──
function extractPlaylistId(url) {
  try {
    const parsed = new URL(url);
    // Handle youtube.com/playlist?list=PLxxxxx
    const listParam = parsed.searchParams.get("list");
    if (listParam) return listParam;
    // Handle direct playlist ID
    if (/^PL[A-Za-z0-9_-]+$/.test(url)) return url;
    return null;
  } catch {
    // Maybe it's a raw playlist ID
    if (/^PL[A-Za-z0-9_-]+$/.test(url)) return url;
    return null;
  }
}

// ── Build course from a public playlist URL (API key, no OAuth) ──
async function buildCourseFromPlaylistUrl(playlistUrl) {
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    throw new Error("Invalid YouTube playlist URL. Please provide a valid playlist link.");
  }

  const yt = getPublicYoutubeClient();

  // Fetch playlist metadata
  const plRes = await yt.playlists.list({
    part: "snippet,contentDetails",
    id: playlistId,
  });

  const playlist = plRes.data.items?.[0];
  if (!playlist) {
    throw new Error("Playlist not found or is private. Make sure the playlist is public.");
  }

  const title = playlist.snippet.title;
  const description = playlist.snippet.description || "";
  const thumbnail =
    playlist.snippet.thumbnails?.high?.url ||
    playlist.snippet.thumbnails?.medium?.url ||
    playlist.snippet.thumbnails?.default?.url ||
    "";
  const channelTitle = playlist.snippet.channelTitle || "";
  const totalVideoCount = playlist.contentDetails?.itemCount || 0;

  // Fetch all videos (using API key — null for accessToken)
  const items = await getPlaylistVideos(null, playlistId);
  const videoIds = items
    .map((item) => item.contentDetails?.videoId)
    .filter(Boolean);

  // Fetch durations (using API key)
  const durations = await getVideoDurations(null, videoIds);

  const videos = items.map((item, idx) => {
    const vid = item.contentDetails?.videoId;
    const dur = durations[vid] || { duration: "0:00", durationSeconds: 0 };
    return {
      videoId: vid,
      title: item.snippet?.title || `Video ${idx + 1}`,
      duration: dur.duration,
      durationSeconds: dur.durationSeconds,
      position: item.snippet?.position ?? idx,
      watched: false,
    };
  });

  const totalSeconds = videos.reduce((acc, v) => acc + v.durationSeconds, 0);
  const estimatedHours = Math.round((totalSeconds / 3600) * 10) / 10;
  const category = detectCategory(title + " " + description);
  const courseDetected = isCoursePlaylist(title, description);

  return {
    playlistId,
    title,
    description,
    thumbnail,
    channelTitle,
    totalVideos: videos.length || totalVideoCount,
    estimatedHours,
    category,
    isCourse: courseDetected,
    videos,
  };
}

module.exports = {
  getOAuth2Client,
  getAuthUrl,
  exchangeCode,
  getValidAccessToken,
  getChannelInfo,
  getUserPlaylists,
  getSavedPlaylists,
  getPlaylistVideos,
  getVideoDurations,
  buildCourseFromPlaylist,
  buildCourseFromPlaylistUrl,
  extractPlaylistId,
  isCoursePlaylist,
  detectCategory,
  parseDuration,
  formatDuration,
};
