package com.dftm.model;

public enum TaskStatus {
    PENDING("väntande"),
    IN_PROGRESS("pågående"),
    NOT_FEASIBLE("ej genomförbar"),
    COMPLETED("klar");

    private final String value;

    TaskStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
} 