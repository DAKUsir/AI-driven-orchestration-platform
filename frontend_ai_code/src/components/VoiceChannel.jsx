import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Users } from 'lucide-react'
import useGroupChatStore from '../store/useGroupChatStore'

export default function VoiceChannel({ groupId }) {
  const { getSocket } = useGroupChatStore()
  const socket = getSocket()

  const [inCall, setInCall] = useState(false)
  const [muted, setMuted] = useState(false)
  const [voiceUsers, setVoiceUsers] = useState([])
  
  const localStreamRef = useRef(null)
  const peersRef = useRef({}) // map of socketId -> RTCPeerConnection
  const audioRefs = useRef({}) // map of socketId -> HTMLAudioElement

  useEffect(() => {
    if (!socket) return

    // Setup socket listeners
    const onVoiceRoomUsers = async (users) => {
      setVoiceUsers(users)
      for (let user of users) {
        await createPeer(user.socketId, true)
      }
    }

    const onUserJoinedVoice = async (user) => {
      setVoiceUsers(prev => [...prev.filter(u => u.socketId !== user.socketId), user])
      await createPeer(user.socketId, false)
    }

    const onUserLeftVoice = ({ socketId }) => {
      setVoiceUsers(prev => prev.filter(u => u.socketId !== socketId))
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close()
        delete peersRef.current[socketId]
      }
      if (audioRefs.current[socketId]) {
        audioRefs.current[socketId].remove()
        delete audioRefs.current[socketId]
      }
    }

    const onWebRtcOffer = async ({ fromSocketId, offer }) => {
      let peer = peersRef.current[fromSocketId]
      if (!peer) {
        peer = await createPeer(fromSocketId, false)
      }
      await peer.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socket.emit('webrtc-answer', { targetSocketId: fromSocketId, answer })
    }

    const onWebRtcAnswer = async ({ fromSocketId, answer }) => {
      const peer = peersRef.current[fromSocketId]
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer))
      }
    }

    const onWebRtcIceCandidate = async ({ fromSocketId, candidate }) => {
      const peer = peersRef.current[fromSocketId]
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate))
      }
    }

    socket.on('voice-room-users', onVoiceRoomUsers)
    socket.on('user-joined-voice', onUserJoinedVoice)
    socket.on('user-left-voice', onUserLeftVoice)
    socket.on('webrtc-offer', onWebRtcOffer)
    socket.on('webrtc-answer', onWebRtcAnswer)
    socket.on('webrtc-ice-candidate', onWebRtcIceCandidate)

    return () => {
      socket.off('voice-room-users', onVoiceRoomUsers)
      socket.off('user-joined-voice', onUserJoinedVoice)
      socket.off('user-left-voice', onUserLeftVoice)
      socket.off('webrtc-offer', onWebRtcOffer)
      socket.off('webrtc-answer', onWebRtcAnswer)
      socket.off('webrtc-ice-candidate', onWebRtcIceCandidate)
    }
  }, [socket, inCall]) // re-bind when socket changes

  const createPeer = async (targetSocketId, initiator) => {
    if (peersRef.current[targetSocketId]) return peersRef.current[targetSocketId]

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    peersRef.current[targetSocketId] = peer

    // Add local stream tracks to peer
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current)
      })
    }

    // Handle ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          targetSocketId,
          candidate: event.candidate
        })
      }
    }

    // Handle remote track
    peer.ontrack = (event) => {
      if (!audioRefs.current[targetSocketId]) {
        const audio = document.createElement('audio')
        audio.autoplay = true
        audioRefs.current[targetSocketId] = audio
      }
      audioRefs.current[targetSocketId].srcObject = event.streams[0]
    }

    if (initiator) {
      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      socket?.emit('webrtc-offer', { targetSocketId, offer })
    }

    return peer
  }

  const joinVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      setInCall(true)
      setMuted(false)
      if (socket) {
        socket.emit('join-voice', groupId)
      }
    } catch (err) {
      console.error("Failed to access microphone", err)
      alert("Could not access microphone for voice call.")
    }
  }

  const leaveVoice = () => {
    if (socket) {
      socket.emit('leave-voice', groupId)
    }
    setInCall(false)
    setVoiceUsers([])
    
    // Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }

    // Close all peers
    Object.values(peersRef.current).forEach(peer => peer.close())
    peersRef.current = {}

    // Remove all audio elements
    Object.values(audioRefs.current).forEach(audio => audio.remove())
    audioRefs.current = {}
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setMuted(!audioTrack.enabled)
      }
    }
  }

  // Cleanup on unmount or group change
  useEffect(() => {
    return () => {
      if (inCall) leaveVoice()
    }
  }, [groupId, inCall])

  return (
    <div className="bg-zinc-900 border-t border-zinc-800/60 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Voice Channel</p>
            <p className="text-[11px] text-zinc-500">
              {inCall ? `${voiceUsers.length + 1} connected` : 'Ready to join'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {inCall ? (
            <>
              <button 
                onClick={toggleMute}
                className={`btn btn-icon btn-sm ${muted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'btn-ghost text-zinc-400'}`}
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button 
                onClick={leaveVoice}
                className="btn btn-icon btn-sm bg-red-500 hover:bg-red-600 text-white"
                title="Disconnect"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={joinVoice}
              className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Phone className="w-4 h-4 mr-1.5" />
              Join
            </button>
          )}
        </div>
      </div>
      
      {inCall && voiceUsers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {voiceUsers.map(user => (
            <div key={user.socketId} className="flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium text-zinc-300 truncate max-w-[80px]">
                {user.userName || 'User'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
