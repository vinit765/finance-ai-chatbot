const socket = io("http://127.0.0.1:5000");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function sendMessage() {
    let message = userInput.value.trim();
    if (message === "") return;

    // Add user message with avatar
    addMessage("🧑‍💼 You", message, "user-message", "user-avatar.png");

    // Show typing animation
    showTypingAnimation();

    // Send message to server
    socket.emit("user_message", { message });

    // Clear input field
    userInput.value = "";
}

// Listen for bot responses
socket.on("bot_response", (data) => {
    removeTypingAnimation();
    let structuredResponse = formatResponse(data.message);
    addMessage("🤖 Bot", structuredResponse, "bot-message", "bot-avatar.png");
});

// Function to add messages to chatbox
function addMessage(sender, text, className, avatar) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add(className);

    let img = document.createElement("img");
    img.src = avatar;
    img.classList.add("avatar");

    let textDiv = document.createElement("div");
    textDiv.classList.add("message-content");
    textDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;

    messageDiv.appendChild(img);
    messageDiv.appendChild(textDiv);

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to structure AI responses
function formatResponse(response) {
    response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    response = response.replace(/\n/g, "<br>");
    return response;
}

// Show typing animation
function showTypingAnimation() {
    let typingDiv = document.createElement("div");
    typingDiv.classList.add("bot-message", "typing");
    typingDiv.id = "typing-animation";
    typingDiv.innerHTML = "🤖 Bot is typing...";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove typing animation when bot responds
function removeTypingAnimation() {
    let typingDiv = document.getElementById("typing-animation");
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Allow sending messages with Enter key
userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
});
