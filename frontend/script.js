// Store conversation history
let conversationHistory = [];

// API endpoint
const API_URL = '/api/chat';

function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        const safeUrl = url.replace(/"/g, '&quot;');
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

function setWelcomeTime() {
    const el = document.getElementById('welcomeTime');
    if (el) el.textContent = formatTime();
}

function applySavedTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.documentElement.classList.add('dark');
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.querySelector('.icon').textContent = document.documentElement.classList.contains('dark') ? '🌞' : '🌙';
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const themeToggle = document.getElementById('themeToggle');

    applySavedTheme();
    setWelcomeTime();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.querySelector('.icon').textContent = isDark ? '🌞' : '🌙';
        });
    }

    // Auto-resize textarea
    input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 140) + 'px';
    });

    // Send message on Enter (but allow Shift+Enter for new line)
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    // Disable input and button while processing
    const sendButton = document.getElementById('sendButton');
    input.disabled = true;
    sendButton.disabled = true;

    // Add user message to chat
    addMessage(message, 'user');

    // Clear input
    input.value = '';
    input.style.height = 'auto';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Send request to backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                history: conversationHistory
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator();

        if (data.status === 'success') {
            // Add bot response to chat
            addMessage(data.response, 'bot');

            // Update conversation history
            conversationHistory.push({
                role: 'user',
                content: message
            });
            conversationHistory.push({
                role: 'assistant',
                content: data.response
            });
        } else {
            addMessage('Sorry, there was an error processing your request.', 'bot');
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I could not connect to the server. Please try again.', 'bot');
        console.error('Error:', error);
    } finally {
        // Re-enable input and button
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
    }
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = sender === 'user' ? '🧑' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const textP = document.createElement('p');
    textP.innerHTML = linkify(text);

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = formatTime();

    contentDiv.appendChild(textP);
    bubble.appendChild(contentDiv);
    bubble.appendChild(meta);

    if (sender === 'user') {
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
    }

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'typing-dots';
    dotsDiv.innerHTML = '<span></span><span></span><span></span>';

    contentDiv.appendChild(dotsDiv);
    bubble.appendChild(contentDiv);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(bubble);
    messagesContainer.appendChild(typingDiv);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function clearChat() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
                <div class="message bot-message">
                    <div class="avatar">🤖</div>
                    <div class="bubble">
                        <div class="message-content">
                            <p>Hello! I'm your AI assistant powered by Groq. How can I help you today?</p>
                        </div>
                        <div class="meta"><span class="time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                    </div>
                </div>
            `;

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle.querySelector('.icon');

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.add('dark');
        icon.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        const isDark = body.classList.contains('dark');
        icon.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Set welcome time
    document.getElementById('welcomeTime').textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Auto-resize textarea
    const userInput = document.getElementById('userInput');
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 140) + 'px';
    });
}