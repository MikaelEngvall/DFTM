package com.dftm.model;

public enum Language {
    EN("en", "English"),
    SV("sv", "Svenska"),
    UK("uk", "Ukrainian"),
    PL("pl", "Polski");

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