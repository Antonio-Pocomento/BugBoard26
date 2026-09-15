package com.bugboard26.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    // Funzione che salva il file ricevuto e restituisce il path/riferimento
    String store(MultipartFile file);

    // Funzione che elimina un'immagine salvata
    void delete(String storedPath);
}
