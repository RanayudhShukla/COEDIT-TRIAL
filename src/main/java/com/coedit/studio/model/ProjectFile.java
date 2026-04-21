package com.coedit.studio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "files")
public class ProjectFile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private String language;

    public ProjectFile() {}

    public ProjectFile(String filename, String content, String language) {
        this.filename = filename;
        this.content = content;
        this.language = language;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
