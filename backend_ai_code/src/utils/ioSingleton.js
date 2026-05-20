// Singleton holder for Socket.IO instance
// Set once in server.js, accessed anywhere via getIO()
let _io = null

module.exports = {
  setIO: (io) => { _io = io },
  getIO: () => _io,
}
