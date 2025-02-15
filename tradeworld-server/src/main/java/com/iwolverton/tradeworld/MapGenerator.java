package com.iwolverton.tradeworld;

import de.articdive.jnoise.core.api.functions.Interpolation;
import de.articdive.jnoise.generators.noise_parameters.fade_functions.FadeFunction;
import de.articdive.jnoise.pipeline.JNoise;
import jakarta.annotation.Nullable;

public class MapGenerator {
    private static final double MIN_TEMPERATURE = 5.0;
    private static final double MAX_TEMPERATURE = 35.0;
    private static final int MIN_ALTITUDE = -18;
    private static final int MAX_ALTITUDE = 16;

    private final int width;
    private final int height;
    private final long seed;
    private WorldMap map;

    public MapGenerator(int width, int height, @Nullable Long seed) {
        this.width = width;
        this.height = height;
        if (seed == null) {
            seed = (long) (Math.random() * 10000);
        }
        this.seed = seed;
    }

    public WorldMap generateMap() {
        map = new WorldMap(width, height);

        // build an altitude map using perlin noise
        JNoise noisePipeline = JNoise.newBuilder().perlin(seed, Interpolation.COSINE, FadeFunction.QUINTIC_POLY).scale(2.0).build();
        double ALTITUDE_RANGE = (MAX_ALTITUDE - MIN_ALTITUDE) / 2.0;
        double ALTITUDE_OFFSET = ALTITUDE_RANGE + MIN_ALTITUDE;

        for (int x = 0; x <= width; x++) {
            for (int y = 0; y <= height; y++) {
                var edgeAlt = noisePipeline.evaluateNoise((double) x / width, (double) y  / height) * ALTITUDE_RANGE + ALTITUDE_OFFSET;
                var middleAlt = noisePipeline.evaluateNoise((x + .5) / width, (y + .5) / height) * ALTITUDE_RANGE + ALTITUDE_OFFSET;
                
                String type = "grass";
                if (middleAlt < 0) {
                    type = "water";
                }
                map.setCell(x, y, new MapCell((int) edgeAlt, middleAlt, type));
            }
        }
        flattenOcean();
        addBaseTemperatures();
        addMoisture();
        addTypes();
        return map;
    }

    private void flattenOcean() {
        for (int x = 0; x < map.getWidth(); x++) {
            for (int y = 0; y < map.getHeight(); y++) {
                var cell = map.getCell(x, y);
                if (cell.getType().equals("water")) {
                    cell.setAltitude(0);
                    map.getCell(x + 1, y).setAltitude(0);
                    map.getCell(x, y + 1).setAltitude(0);
                    map.getCell(x + 1, y + 1).setAltitude(0);
                }
            }
        }
    }

    private void addBaseTemperatures() {
        JNoise temperatureNoise = JNoise.newBuilder().perlin(seed + 1, Interpolation.COSINE, FadeFunction.QUINTIC_POLY).scale(2.0).build();
        double NOISE_COEFFICIENT = 5.0;
        double TEMPERATURE_RANGE = MAX_TEMPERATURE - MIN_TEMPERATURE;
        double ALTITUDE_COEFFICIENT = -40.0 / MAX_ALTITUDE;

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                var cell = map.getCell(x, y);
                double noise = temperatureNoise.evaluateNoise((double) x / width, (double) y  / height) * NOISE_COEFFICIENT;
                double altitudeAdjustment = cell.getMiddleAltitude() * ALTITUDE_COEFFICIENT;
                cell.setTemperature((1.0-getLatitude(x, y)) * TEMPERATURE_RANGE + MIN_TEMPERATURE + altitudeAdjustment + noise);
            }
        }
    }

    private double getLatitude(int x, int y) {
        return ( (double) x / width - (double) y / height ) / 2.0 + 0.5;
    }

    private void addMoisture() {
        JNoise moistureNoise = JNoise.newBuilder().perlin(seed + 2, Interpolation.COSINE, FadeFunction.QUINTIC_POLY).scale(2.0).build();
        double TEMPERATURE_COEFFICIENT = .05 / MAX_TEMPERATURE;
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                var cell = map.getCell(x, y);
                double prevMoisture;
                double prevAltitude;
                if (x == 0 || y == 0) {
                    prevMoisture = moistureNoise.evaluateNoise((double) x / width, (double) y  / height) / 2 + 0.5;
                    prevAltitude = cell.getMiddleAltitude();
                } else {
                    var prevCell = map.getCell(x - 1, y - 1);
                    prevMoisture = prevCell.getMoisture();
                    prevAltitude = prevCell.getMiddleAltitude();
                }

                double moisture = prevMoisture;
                if (cell.getType().equals("water")) {
                    if (cell.getTemperature() > 0.0) {
                        moisture = prevMoisture + (1.0 - prevMoisture) * TEMPERATURE_COEFFICIENT * cell.getTemperature();
                    }
                } else if (cell.getMiddleAltitude() > prevAltitude) {
                    double elevationGain = cell.getMiddleAltitude() - prevAltitude;
                    moisture -= moisture * .05 * elevationGain;
                }

                if (moisture > 1.0) {
                    moisture = 1.0;
                } else if (moisture < 0.0) {
                    moisture = 0.0;
                }
                cell.setMoisture(moisture);
            }
        }
    }

    private void addTypes() {
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                var cell = map.getCell(x, y);
                if (cell.getType().equals("water")) {
                    continue;
                }
                if (cell.getMoisture() < 0.15) {
                    cell.setType("desert");
                } else if (cell.getTemperature() < 0.0) {
                    cell.setType("snow");
//                } else if (cell.getMoisture() < 0.25) {
//                    cell.setType("dirt");
                } else if (cell.getMoisture() < 0.4) {
                    cell.setType("grass");
                } else {
                    cell.setType("forest");
                }
            }
        }
    }

    public static void main(String[] args) {
        var generator = new MapGenerator(3, 3, null);
        var map = generator.generateMap();
        for (int y = 0; y <= map.getWidth(); y++) {
            for (int x = 0; x <= map.getHeight(); x++) {
                System.out.print(map.getCell(x, y).getAltitude() + " " + map.getCell(x, y).getType() + " | ");
            }
            System.out.println();
        }
    }
}
