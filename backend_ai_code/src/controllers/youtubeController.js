const YoutubeIntegration = require("../models/YoutubeIntegration");
const YoutubeCourse = require("../models/YoutubeCourse");
const Task = require("../models/Task");
const jwt = require("jsonwebtoken");
const ytService = require("../services/youtubeService");

// @desc    Initiate YouTube OAuth connection
// @route   GET /api/integrations/youtube/connect
// @access  Private
const connectYoutube = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token" });

    // Encode user JWT into state so we can identify user in callback
    const authUrl = ytService.getAuthUrl(token);
    res.json({ authUrl });
  } catch (error) {
    console.error("[YouTube Connect]", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    OAuth callback from Google
// @route   GET /api/integrations/youtube/callback
// @access  Public (redirect from Google)
const youtubeCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/integrations?error=no_code`
      );
    }

    // Decode user from state (JWT token)
    let userId;
    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      return res.redirect(
        `${process.env.FRONTEND_URL}/integrations?error=invalid_state`
      );
    }

    // Exchange code for tokens
    const tokens = await ytService.exchangeCode(code);

    // Get channel info
    let channelInfo = {};
    try {
      channelInfo = (await ytService.getChannelInfo(tokens.access_token)) || {};
    } catch (e) {
      console.warn("[YouTube] Could not fetch channel info:", e.message);
    }

    // Upsert integration
    await YoutubeIntegration.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        channelId: channelInfo.channelId || "",
        channelTitle: channelInfo.channelTitle || "",
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/integrations?youtube=connected`
    );
  } catch (error) {
    console.error("[YouTube Callback]", error.message);
    res.redirect(
      `${process.env.FRONTEND_URL}/integrations?error=${encodeURIComponent(error.message)}`
    );
  }
};

// @desc    Get YouTube connection status
// @route   GET /api/integrations/youtube/status
// @access  Private
const getYoutubeStatus = async (req, res) => {
  try {
    const integration = await YoutubeIntegration.findOne({
      userId: req.user.id,
    });
    if (!integration) {
      return res.json({ connected: false });
    }
    res.json({
      connected: true,
      channelTitle: integration.channelTitle,
      channelId: integration.channelId,
      connectedAt: integration.connectedAt,
      lastSynced: integration.lastSynced,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all YouTube courses for user
// @route   GET /api/integrations/youtube/courses
// @access  Private
const getYoutubeCourses = async (req, res) => {
  try {
    const { status, category, courseOnly } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (courseOnly === "true") filter.isCourse = true;

    const courses = await YoutubeCourse.find(filter)
      .select("-videos") // Don't send all video data by default
      .sort({ updatedAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course with all videos
// @route   GET /api/integrations/youtube/courses/:id
// @access  Private
const getYoutubeCourseDetail = async (req, res) => {
  try {
    const course = await YoutubeCourse.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync YouTube playlists → detect courses → save
// @route   POST /api/integrations/youtube/sync
// @access  Private
const syncYoutube = async (req, res) => {
  try {
    const integration = await YoutubeIntegration.findOne({
      userId: req.user.id,
    });
    if (!integration) {
      return res.status(400).json({ message: "YouTube not connected" });
    }

    // Get a valid (refreshed if needed) access token
    const accessToken = await ytService.getValidAccessToken(integration);

    // 1. Fetch user's playlists
    const playlists = await ytService.getUserPlaylists(accessToken);

    let synced = 0;
    let skipped = 0;

    for (const pl of playlists) {
      try {
        const courseData = await ytService.buildCourseFromPlaylist(accessToken, pl);

        // Check if already saved
        const existing = await YoutubeCourse.findOne({
          userId: req.user.id,
          playlistId: courseData.playlistId,
        });

        if (existing) {
          // Update metadata but preserve user's progress
          existing.title = courseData.title;
          existing.description = courseData.description;
          existing.thumbnail = courseData.thumbnail;
          existing.channelTitle = courseData.channelTitle;
          existing.totalVideos = courseData.totalVideos;
          existing.estimatedHours = courseData.estimatedHours;
          existing.isCourse = courseData.isCourse;
          existing.lastSynced = new Date();

          // Merge video list (preserve watched status)
          const watchedMap = {};
          existing.videos.forEach((v) => {
            if (v.watched) watchedMap[v.videoId] = true;
          });
          existing.videos = courseData.videos.map((v) => ({
            ...v,
            watched: watchedMap[v.videoId] || false,
          }));
          existing.completedVideos = existing.videos.filter((v) => v.watched).length;
          existing.progressPercentage =
            existing.totalVideos > 0
              ? Math.round((existing.completedVideos / existing.totalVideos) * 100)
              : 0;

          await existing.save();
          synced++;
        } else {
          // Create new
          await YoutubeCourse.create({
            userId: req.user.id,
            ...courseData,
            completedVideos: 0,
            progressPercentage: 0,
            status: "not-started",
            lastSynced: new Date(),
          });
          synced++;
        }
      } catch (e) {
        console.warn(`[YouTube Sync] Skipping playlist ${pl.id}:`, e.message);
        skipped++;
      }
    }

    // Update last synced on integration
    integration.lastSynced = new Date();
    await integration.save();

    res.json({
      message: `Synced ${synced} playlists, skipped ${skipped}`,
      synced,
      skipped,
      total: playlists.length,
    });
  } catch (error) {
    console.error("[YouTube Sync]", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a public YouTube playlist by URL (no OAuth needed)
// @route   POST /api/integrations/youtube/add-playlist
// @access  Private
const addPlaylistByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Playlist URL is required" });
    }

    // Extract playlist ID
    const playlistId = ytService.extractPlaylistId(url);
    if (!playlistId) {
      return res.status(400).json({ message: "Invalid YouTube playlist URL" });
    }

    // Check if already saved
    const existing = await YoutubeCourse.findOne({
      userId: req.user.id,
      playlistId,
    });
    if (existing) {
      return res.status(409).json({
        message: "This playlist is already in your library",
        course: existing,
      });
    }

    // Fetch playlist data using API key (public data)
    const courseData = await ytService.buildCourseFromPlaylistUrl(url);

    // Save to DB
    const course = await YoutubeCourse.create({
      userId: req.user.id,
      ...courseData,
      completedVideos: 0,
      progressPercentage: 0,
      status: "not-started",
      lastSynced: new Date(),
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("[YouTube Add Playlist]", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark video as watched/unwatched
// @route   PATCH /api/integrations/youtube/courses/:id/video
// @access  Private
const toggleVideoWatched = async (req, res) => {
  try {
    const { videoId, watched } = req.body;
    const course = await YoutubeCourse.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const video = course.videos.find((v) => v.videoId === videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    video.watched = watched !== undefined ? watched : !video.watched;

    // Recalculate progress
    course.completedVideos = course.videos.filter((v) => v.watched).length;
    course.progressPercentage =
      course.totalVideos > 0
        ? Math.round((course.completedVideos / course.totalVideos) * 100)
        : 0;

    // Auto-update status
    if (course.completedVideos === 0) {
      course.status = "not-started";
    } else if (course.completedVideos >= course.totalVideos) {
      course.status = "completed";
    } else {
      course.status = "in-progress";
    }

    // Track last watched
    if (video.watched) {
      course.lastWatchedVideo = {
        title: video.title,
        videoId: video.videoId,
        position: video.position,
      };
    }

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course status
// @route   PATCH /api/integrations/youtube/courses/:id
// @access  Private
const updateYoutubeCourse = async (req, res) => {
  try {
    const { status, category } = req.body;
    const course = await YoutubeCourse.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (status) course.status = status;
    if (category) course.category = category;
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate study tasks from a YouTube course
// @route   POST /api/integrations/youtube/courses/:id/generate-tasks
// @access  Private
const generateTasksFromCourse = async (req, res) => {
  try {
    const { videosPerDay = 3, startDate } = req.body;
    const course = await YoutubeCourse.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const unwatchedVideos = course.videos.filter((v) => !v.watched);
    if (unwatchedVideos.length === 0) {
      return res.json({ message: "All videos already watched", tasks: [] });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const tasks = [];
    let dayOffset = 0;

    for (let i = 0; i < unwatchedVideos.length; i += videosPerDay) {
      const chunk = unwatchedVideos.slice(i, i + videosPerDay);
      const taskDate = new Date(start);
      taskDate.setDate(taskDate.getDate() + dayOffset);

      const totalMinutes = Math.round(
        chunk.reduce((acc, v) => acc + v.durationSeconds, 0) / 60
      );

      const videoTitles = chunk.map((v) => v.title).join(", ");

      const task = await Task.create({
        userId: req.user.id,
        title: `📺 ${course.title}: Watch videos ${i + 1}–${i + chunk.length}`,
        description: `Videos:\n${chunk.map((v, idx) => `  ${idx + 1}. ${v.title} (${v.duration})`).join("\n")}\n\nPlaylist: https://youtube.com/playlist?list=${course.playlistId}`,
        category: "youtube",
        priority: "medium",
        status: "pending",
        sourceLink: `https://youtube.com/watch?v=${chunk[0].videoId}&list=${course.playlistId}`,
        estimatedMinutes: totalMinutes || 30,
        dueDate: taskDate,
        calendarSlot: {
          date: taskDate,
        },
      });

      tasks.push(task);
      dayOffset++;
    }

    res.status(201).json({
      message: `Generated ${tasks.length} tasks from "${course.title}"`,
      tasks,
      totalDays: dayOffset,
    });
  } catch (error) {
    console.error("[Generate Tasks]", error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a YouTube course
// @route   DELETE /api/integrations/youtube/courses/:id
// @access  Private
const deleteYoutubeCourse = async (req, res) => {
  try {
    const course = await YoutubeCourse.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Disconnect YouTube integration
// @route   DELETE /api/integrations/youtube/disconnect
// @access  Private
const disconnectYoutube = async (req, res) => {
  try {
    await YoutubeIntegration.findOneAndDelete({ userId: req.user.id });
    // Optionally remove all courses
    if (req.query.removeCourses === "true") {
      await YoutubeCourse.deleteMany({ userId: req.user.id });
    }
    res.json({ message: "YouTube disconnected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  connectYoutube,
  youtubeCallback,
  getYoutubeStatus,
  getYoutubeCourses,
  getYoutubeCourseDetail,
  syncYoutube,
  addPlaylistByUrl,
  toggleVideoWatched,
  updateYoutubeCourse,
  generateTasksFromCourse,
  deleteYoutubeCourse,
  disconnectYoutube,
};
