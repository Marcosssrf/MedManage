package com.clinica.exception;

import java.time.OffsetDateTime;

public class ErroResposta {
    private final OffsetDateTime timestamp;
    private final Integer status;
    private final String error;
    private final String path;

    public ErroResposta(OffsetDateTime timestamp, Integer status, String error, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.path = path;
    }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public Integer getStatus() { return status; }
    public String getError() { return error; }
    public String getPath() { return path; }
}
