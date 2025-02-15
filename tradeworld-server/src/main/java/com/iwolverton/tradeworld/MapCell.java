package com.iwolverton.tradeworld;

public class MapCell {
    private int altitude;
    private double middleAltitude;
    private String type;
    private double temperature;
    private double moisture;

    public MapCell(int altitude, double middleAltitude, String type) {
        this.altitude = altitude;
        this.middleAltitude = middleAltitude;
        this.type = type;
    }

    public int getAltitude() {
        return altitude;
    }

    public void setAltitude(int altitude) {
        this.altitude = altitude;
    }

    public double getMiddleAltitude() {
        return middleAltitude;
    }

    public void setMiddleAltitude(double middleAltitude) {
        this.middleAltitude = middleAltitude;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getMoisture() {
        return moisture;
    }

    public void setMoisture(double moisture) {
        this.moisture = moisture;
    }
}
