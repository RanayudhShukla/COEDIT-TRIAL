let stompClient = null;
let username = null;
const editor = document.getElementById('editor');
const messageArea = document.getElementById('messageArea');

function connect() {
    // 1. Ask for a name first
    username = prompt("Please enter your name:");
    
    if(!username) username = "Anonymous";

    const socket = new SockJS('/ws-coedit');
    stompClient = Stomp.over(socket);

    // 2. Only ONE connect call
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        document.getElementById('status').innerText = "Connected as " + username + " ✅";

        // 3. Tell everyone we joined
        stompClient.send("/app/editor.addUser", {}, JSON.stringify({sender: username, type: 'JOIN'}));

        // 4. Listen for updates AND join messages
        stompClient.subscribe('/topic/public', function (messageOutput) {
    const body = JSON.parse(messageOutput.body);
    
    if (body.type === 'JOIN') {
        showEvent(body.sender + " joined the studio!");
        
        // NEW: If I am the one who just joined, load the existing text!
        if (body.sender === username) {
            editor.value = body.content; 
        }
    } else if (body.type === 'LEAVE') {
        showEvent(body.sender + " left the studio.");
    } else if (body.type === 'UPDATE') {
        // Only update if someone ELSE typed
        if (body.sender !== username) {
            editor.value = body.content;
        }
    }
}); // Make sure to close your brackets!
    });
}

// Helper to show "Joined/Left" messages on screen
function showEvent(text) {
    const li = document.createElement('li');
    li.textContent = text;
    messageArea.appendChild(li);
    // Remove the notification after 3 seconds so it doesn't clutter
    setTimeout(() => li.remove(), 3000);
}

// Send updates as you type
editor.addEventListener('input', function() {
    const message = {
        sender: username,
        content: editor.value,
        type: 'UPDATE'
    };
    stompClient.send("/app/editor.sendUpdate", {}, JSON.stringify(message));
});

connect();