package com.dftm.model;

public enum Language {
    SV("sv", "Swedish"),
    EN("en", "English"),
    PL("pl", "Polish"),
    UK("uk", "Ukrainian");

    private final String code;
    private final String displayName;

    Language(String code, String displayName) {
        this.code = code;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getDisplayName() {
        return displayName;
    }
} 