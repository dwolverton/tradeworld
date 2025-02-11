package com.iwolverton.tradeworld;

public class MapCell {
    private int altitude;
    private String type;

    public MapCell(int altitude, String type) {
        this.altitude = altitude;
        this.type = type;
    }

    public int getAltitude() {
        return altitude;
    }

    public void setAltitude(int altitude) {
        this.altitude = altitude;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    
}
