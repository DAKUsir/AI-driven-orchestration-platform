import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, PlayCircle, CheckCircle, Circle, Clock, ExternalLink,
  Loader2, ListTodo, Calendar, BarChart3, RefreshCw,
} from 'lucide-react'
import useYoutubeStore from '../store/useYoutubeStore'

export default function YoutubeCoursePage() {
  const { id } = useParams()
  const {
    courseDetail, loading, generatingTasks,
    fetchCourseDetail, toggleVideo, generateTasks,
  } = useYoutubeStore()

  const [taskModal, setTaskModal] = useState(false)
  const [videosPerDay, setVideosPerDay] = useState(3)
  const [taskResult, setTaskResult] = useState(null)

  useEffect(() => {
    fetchCourseDetail(id)
  }, [id])

  if (loading || !courseDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    )
  }

  const course = courseDetail
  const progress = course.progressPercentage || 0
  const watchedCount = course.videos?.filter((v) => v.watched).length || 0
  const totalSec = course.videos?.reduce((a, v) => a + (v.durationSeconds || 0), 0) || 0
  const remainingSec = course.videos?.filter((v) => !v.watched).reduce((a, v) => a + (v.durationSeconds || 0), 0) || 0

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  const handleGenerateTasks = async () => {
    try {
      const result = await generateTasks(id, videosPerDay)
      setTaskResult(result)
    } catch {}
  }

  // Find next unwatched video
  const nextVideo = course.videos?.find((v) => !v.watched)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link to="/youtube" className="btn btn-ghost btn-sm btn-icon">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-zinc-100 truncate">{course.title}</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {course.channelTitle && <>by {course.channelTitle} · </>}
            {course.totalVideos} videos · {formatTime(totalSec)}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-zinc-100">{watchedCount}/{course.totalVideos}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Videos</p>
        </div>
        <div className="card p-4 text-center">
          <p className={`text-xl font-bold ${progress === 100 ? 'text-emerald-400' : 'text-orange-400'}`}>{progress}%</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Progress</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-amber-400">{formatTime(remainingSec)}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Remaining</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-orange-400">{formatTime(totalSec)}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">Total</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Overall Progress</span>
          <span className="text-sm font-semibold text-zinc-200">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }}
            className={`h-full rounded-full ${progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {nextVideo && (
          <a href={`https://youtube.com/watch?v=${nextVideo.videoId}&list=${course.playlistId}`}
            target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            <PlayCircle className="w-4 h-4" /> Continue: {nextVideo.title?.slice(0, 40)}...
          </a>
        )}
        <button onClick={() => { setTaskModal(true); setTaskResult(null) }}
          className="btn btn-secondary btn-sm">
          <ListTodo className="w-4 h-4" /> Generate Tasks
        </button>
        <a href={`https://youtube.com/playlist?list=${course.playlistId}`}
          target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
          <ExternalLink className="w-4 h-4" /> Open Playlist
        </a>
      </div>

      {/* Video List */}
      <div className="card">
        <div className="px-4 py-3 border-b border-zinc-800/60">
          <h2 className="text-sm font-semibold text-zinc-300">Videos ({course.videos?.length || 0})</h2>
        </div>
        <div className="divide-y divide-zinc-800/40 max-h-[60vh] overflow-y-auto">
          {course.videos?.map((video, i) => (
            <motion.div key={video.videoId || i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors cursor-pointer ${
                video.watched ? 'opacity-60' : ''
              }`}
              onClick={() => toggleVideo(id, video.videoId, !video.watched)}
            >
              {/* Watch toggle */}
              <button className="flex-shrink-0" title={video.watched ? 'Mark unwatched' : 'Mark watched'}>
                {video.watched ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600 hover:text-zinc-400" />
                )}
              </button>

              {/* Index */}
              <span className="text-xs text-zinc-600 w-6 text-right flex-shrink-0">
                {(video.position ?? i) + 1}
              </span>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${video.watched ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {video.title}
                </p>
              </div>

              {/* Duration */}
              <span className="text-xs text-zinc-500 flex-shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {video.duration || '—'}
              </span>

              {/* External link */}
              <a href={`https://youtube.com/watch?v=${video.videoId}&list=${course.playlistId}`}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-zinc-600 hover:text-zinc-300 flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generate Tasks Modal */}
      {taskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setTaskModal(false)}>
          <div className="card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" /> Generate Study Plan
            </h3>
            {taskResult ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-300">{taskResult.message}</p>
                  <p className="text-xs text-zinc-500 mt-1">{taskResult.totalDays} days of study planned</p>
                </div>
                <Link to="/planner" className="btn btn-primary w-full btn-sm">View in Planner</Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Videos per day</label>
                  <input type="number" value={videosPerDay}
                    onChange={(e) => setVideosPerDay(parseInt(e.target.value) || 1)}
                    min={1} max={20} className="input" />
                </div>
                <button onClick={handleGenerateTasks} disabled={generatingTasks} className="btn btn-primary w-full">
                  {generatingTasks ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListTodo className="w-4 h-4" />}
                  {generatingTasks ? 'Generating...' : 'Generate Tasks'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
