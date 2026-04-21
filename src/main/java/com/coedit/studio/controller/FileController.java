package com.coedit.studio.controller;

import com.coedit.studio.model.ProjectFile;
import com.coedit.studio.repository.ProjectFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private ProjectFileRepository fileRepository;

    @GetMapping
    public List<ProjectFile> getAllFiles() {
        return fileRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectFile> getFile(@PathVariable Long id) {
        return fileRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ProjectFile createFile(@RequestBody ProjectFile file) {
        if (file.getLanguage() == null) {
            file.setLanguage("java");
        }
        if (file.getContent() == null) {
            file.setContent("");
        }
        return fileRepository.save(file);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        if (fileRepository.existsById(id)) {
            fileRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
