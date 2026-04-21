package com.coedit.studio.model;

public class EditorMessage {
    private String content;
    private String sender;
    private int cursorPosition;
    private MessageType type;

    public enum MessageType {
        CHAT,
        AWARENESS,
        JOIN,
        LEAVE,
        UPDATE
    }

    // Standard Getters and Setters (VS Code can generate these, but here they are)
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public int getCursorPosition() { return cursorPosition; }
    public void setCursorPosition(int cursorPosition) { this.cursorPosition = cursorPosition; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
}