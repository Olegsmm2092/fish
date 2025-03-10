const ws = required('ws')
const server = new ws.Server({ port: '3000' })

server.on('connection', socket => {
	socket.on('messege', messege => {
		console.log(messege)
		socket.send(`${messege}`)
	})
})


