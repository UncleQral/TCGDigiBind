package com.tcgdigibind.stats;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class StatsController {

    private final StatsService statsService;

    public StatsController (StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/stats/ping")
    public String ping(){
        return "pong";
    }

    @GetMapping("/stats/binder/{binderId}")
    public Map<String, Object> getBinderStats(@PathVariable int binderId){
        return statsService.getBinderStats(binderId);
    }


}

