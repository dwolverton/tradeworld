package com.iwolverton.tradeworld;

import de.articdive.jnoise.core.api.functions.Interpolation;
import de.articdive.jnoise.generators.noise_parameters.fade_functions.FadeFunction;
import de.articdive.jnoise.pipeline.JNoise;
import jakarta.annotation.Nullable;

public class MapGenerator {

    public WorldMap generateMap(int width, int height, @Nullable Long seed) {
        var map = new WorldMap(width, height);
        if (seed == null) {
            seed = (long) (Math.random() * 10000);
        }
        // build an altitude map using perlin noise
        JNoise noisePipeline = JNoise.newBuilder().perlin(seed, Interpolation.COSINE, FadeFunction.QUINTIC_POLY).scale(2.0).build();
        int ALTITUDE_RANGE = 16;

        for (int x = 0; x <= width; x++) {
            for (int y = 0; y <= height; y++) {
                var edgeAlt = noisePipeline.evaluateNoise((double) x / width, (double) y  / height) * ALTITUDE_RANGE;
                var middleAlt = noisePipeline.evaluateNoise((x + .5) / width, (y + .5) / height) * ALTITUDE_RANGE;
                
                String type = "grass";
                if (middleAlt < 2) {
                    type = "water";
                } else if (middleAlt > 6) {
                    type = "snow";
                }
                map.setCell(x, y, new MapCell((int) edgeAlt - 2, type));
            }
        }
        flattenOcean(map);
        return map;
    }

    private static void flattenOcean(WorldMap map) {
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

    public static void main(String[] args) {
        var generator = new MapGenerator();
        var map = generator.generateMap(3, 3, null);
        for (int y = 0; y <= map.getWidth(); y++) {
            for (int x = 0; x <= map.getHeight(); x++) {
                System.out.print(map.getCell(x, y).getAltitude() + " " + map.getCell(x, y).getType() + " | ");
            }
            System.out.println();
        }
    }
}
