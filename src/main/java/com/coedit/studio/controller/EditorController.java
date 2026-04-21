package com.coedit.studio.controller;

import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import com.coedit.studio.model.EditorMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import com.coedit.studio.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;

@Controller
public class EditorController {

    @Autowired
    private DocumentService documentService;

    @MessageMapping("/editor/{fileId}.sendUpdate") 
    @SendTo("/topic/file/{fileId}")             
    public EditorMessage sendUpdate(@DestinationVariable Long fileId, EditorMessage message) {
        return message;
    }
    
    @MessageMapping("/editor/{fileId}.addUser")
    @SendTo("/topic/file/{fileId}")
    public EditorMessage addUser(@DestinationVariable Long fileId, EditorMessage message, SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        if (headerAccessor != null && headerAccessor.getSessionAttributes() != null) {
            headerAccessor.getSessionAttributes().put("username", message.getSender());
        }
        
        // Feed the snapshot back to the joining user so they start perfectly synced
        String snapshot = documentService.loadSnapshot(fileId);
        if (snapshot != null) {
             message.setContent(snapshot);
        }
        
        return message;
    }

    @MessageMapping("/editor/{fileId}.save")
    public void saveDocument(@DestinationVariable Long fileId, EditorMessage message) {
        if (message.getContent() != null) {
            documentService.saveSnapshot(fileId, message.getContent());
        }
    }
}