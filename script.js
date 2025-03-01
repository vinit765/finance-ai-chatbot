const socket = io("http://127.0.0.1:5000");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

function sendMessage() {
    let message = userInput.value.trim();
    if (message === "") return;

   
    addMessage("🧑‍💼 You", message, "user-message", "user-avatar.png");

    
    showTypingAnimation();

    
    socket.emit("user_message", { message });

    
    userInput.value = "";
}


socket.on("bot_response", (data) => {
    removeTypingAnimation();
    let structuredResponse = formatResponse(data.message);
    addMessage("🤖 Bot", structuredResponse, "bot-message", "bot-avatar.png");
});


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


function formatResponse(response) {
    response = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    response = response.replace(/\n/g, "<br>");
    return response;
}


function showTypingAnimation() {
    let typingDiv = document.createElement("div");
    typingDiv.classList.add("bot-message", "typing");
    typingDiv.id = "typing-animation";
    typingDiv.innerHTML = "🤖 Bot is typing...";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function removeTypingAnimation() {
    let typingDiv = document.getElementById("typing-animation");
    if (typingDiv) {
        typingDiv.remove();
    }
}


userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessage();
});
