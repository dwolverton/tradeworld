package com.iwolverton.tradeworld;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class WorldMap {

    private int width;
    private int height;
    private MapCell[] data;

    public WorldMap(int width, int height) {
        this.width = width;
        this.height = height;
        this.data = new MapCell[(width + 1) * (height + 1)];
    }

    @JsonIgnore
    public MapCell getCell(int x, int y) {
        return data[y * (width + 1) + x];
    }

    @JsonIgnore
    public void setCell(int x, int y, MapCell cell) {
        data[y * (width + 1) + x] = cell;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public MapCell[] getData() {
        return data;
    }

}
