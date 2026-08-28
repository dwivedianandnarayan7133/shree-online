let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', socket => {
    socket.on('join_request', requestId => {
      socket.join(requestId);
    });
  });
}

function broadcastRequestUpdate(request) {
  if (ioInstance) {
    ioInstance.emit('request_updated', request);
    if (request.requestId) {
      ioInstance.to(request.requestId).emit('my_request_updated', request);
    }
  }
}

function broadcastPrintJobUpdate(printJob) {
  if (ioInstance) {
    ioInstance.emit('print_job_updated', printJob);
  }
}

function broadcastNotification(notification) {
  if (ioInstance) {
    ioInstance.emit('notification', notification);
  }
}

module.exports = {
  initSocket,
  broadcastRequestUpdate,
  broadcastPrintJobUpdate,
  broadcastNotification
};
