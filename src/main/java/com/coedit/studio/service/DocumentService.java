package com.coedit.studio.service;

import com.coedit.studio.model.ProjectFile;
import com.coedit.studio.repository.ProjectFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DocumentService {

    @Autowired
    private ProjectFileRepository fileRepository;

    // Save the entire text contents directly into the DB instead of a file
    public void saveSnapshot(Long fileId, String content) {
        try {
            Optional<ProjectFile> opt = fileRepository.findById(fileId);
            if (opt.isPresent()) {
                ProjectFile f = opt.get();
                f.setContent(content);
                fileRepository.save(f);
            }
        } catch (Exception e) {
            System.err.println("Failed to save Document DB snapshot: " + e.getMessage());
        }
    }

    // Load the latest snapshot for late joiners
    public String loadSnapshot(Long fileId) {
        try {
            Optional<ProjectFile> opt = fileRepository.findById(fileId);
            if (opt.isPresent()) {
                return opt.get().getContent();
            }
        } catch (Exception e) {
            System.err.println("Failed to load DB snapshot: " + e.getMessage());
        }
        return null;
    }
}
