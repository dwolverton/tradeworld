package com.iwolverton.tradeworld;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class MapApiController {

    @GetMapping("/generate-map")
    public WorldMap generateMap(@RequestParam int width, @RequestParam int height, @RequestParam(required = false) Long seed) {
        return new MapGenerator(width, height, seed).generateMap();
    }
    
}
