package com.bugboard26.backend.service;

import com.bugboard26.backend.exception.InvalidImageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalImageStorageService implements ImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/png", "image/jpeg", "image/webp", "image/gif");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5MB

    private final Path uploadRoot;

    public LocalImageStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new UncheckedIOException("Error creating image folder in: " + uploadRoot, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        validate(file);

        String extension = extensionFor(file.getContentType());
        String storedFileName = UUID.randomUUID() + extension;
        Path destination = uploadRoot.resolve(storedFileName).normalize();

        if (!destination.getParent().equals(uploadRoot)) {
            throw new InvalidImageException("Not a valid file name: " + storedFileName);
        }

        try {
            file.transferTo(destination);
        } catch (IOException e) {
            throw new UncheckedIOException("Image saving error", e);
        }

        return storedFileName;
    }

    @Override
    public void delete(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return;
        }
        try {
            Files.deleteIfExists(uploadRoot.resolve(storedPath).normalize());
        } catch (IOException e) {
            throw new UncheckedIOException("Image deletion error", e);
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("Image file is empty or null");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidImageException("Image is too big (>5MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new InvalidImageException("Image Format not supported. Use PNG, JPEG, WEBP or GIF");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> throw new InvalidImageException("Image Format not supported");
        };
    }
}
