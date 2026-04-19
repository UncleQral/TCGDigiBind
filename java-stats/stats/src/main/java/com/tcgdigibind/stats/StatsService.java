package com.tcgdigibind.stats;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatsService {

    private final JdbcTemplate jdbcTemplate;

    public StatsService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> getBinderStats(int binderId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("cardCount", getCardCount(binderId));
        stats.put("sealedCount", getSealedCount(binderId));
        stats.put("gradedCount", getGradedCount(binderId));
        stats.put("avgPrice", getAveragePrice(binderId));
        stats.put("mostExpensive", getMostExpensive(binderId));
        stats.put("cheapest", getCheapest(binderId));
        stats.put("priceChange", getPriceChange(binderId));
        stats.put("foilRatio", getFoilRatio(binderId));
        stats.put("conditionDistribution", getConditionDistribution(binderId));
        return stats;
    }

    private int getCardCount(int binderId) {
        String sql = "SELECT COUNT(*) FROM binder_card WHERE binder_id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, binderId);

    }

    private int getSealedCount(int binderId) {
        String sql = "SELECT COUNT(*) FROM binder_sealed WHERE binder_id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, binderId);
    }

    private int getGradedCount(int binderId) {
        String sql = "SELECT COUNT(*) FROM graded_card WHERE binder_id = ?";
        return jdbcTemplate.queryForObject(sql, Integer.class, binderId);
    }

    private double getAveragePrice(int binderId) {
        String cardSql = "SELECT COALESCE(SUM(cp.trend_price), 0) FROM binder_card bc LEFT JOIN card_price cp ON cp.card_id = bc.card_id WHERE bc.binder_id = ?";
        String sealedSql = "SELECT COALESCE(SUM(sp.trend_price), 0) FROM binder_sealed bs LEFT JOIN sealed_price sp ON sp.sealed_id = bs.sealed_id WHERE bs.binder_id = ?";

        Double cardSum = jdbcTemplate.queryForObject(cardSql, Double.class, binderId);
        Double sealedSum = jdbcTemplate.queryForObject(sealedSql, Double.class, binderId);

        int totalCount = getCardCount(binderId) + getSealedCount(binderId);
        if (totalCount == 0) return 0;

        return (cardSum + sealedSum) / totalCount;
    }

    private Map<String, Object> getMostExpensive(int binderId) {
        String cardSql = "SELECT c.name, cp.trend_price, bc.image_url " +
                    "FROM binder_card bc " +
                    "LEFT JOIN card c ON c.card_id = bc.card_id " +
                    "LEFT JOIN card_price cp ON cp.card_id = bc.card_id " +
                    "WHERE bc.binder_id = ? " +
                    "ORDER BY cp.trend_price DESC LIMIT 1";

        String sealedSql = "SELECT sp.name, spr.trend_price, bs.image_url " +
                    "FROM binder_sealed bs " +
                    "LEFT JOIN sealed_prod sp ON sp.id = bs.sealed_id " +
                    "LEFT JOIN sealed_price spr ON spr.sealed_id = bs.sealed_id " +
                    "WHERE bs.binder_id = ? " +
                    "ORDER BY spr.trend_price DESC LIMIT 1";

        List<Map<String, Object>> cardResults = jdbcTemplate.queryForList(cardSql, binderId);
        List<Map<String, Object>> sealedResults = jdbcTemplate.queryForList(sealedSql, binderId);

        Map<String, Object> expCard = cardResults.isEmpty() ? null : cardResults.get(0);
        Map<String, Object> expSealed = sealedResults.isEmpty() ? null : sealedResults.get(0);

        if (expCard == null) return expSealed;
        if (expSealed == null) return expCard;

        double cardPrice = ((Number) expCard.get("trend_price")).doubleValue();
        double sealedPrice = ((Number) expSealed.get("trend_price")).doubleValue();

        return cardPrice >= sealedPrice ? expCard : expSealed;
    }

    private Map<String,Object> getCheapest (int binderId){
        String cardSql = "SELECT c.name, cp.trend_price, bc.image_url " +
                "FROM binder_card bc " +
                "LEFT JOIN card c ON c.card_id = bc.card_id " +
                "LEFT JOIN card_price cp ON cp.card_id = bc.card_id " +
                "WHERE bc.binder_id = ? " +
                "ORDER BY cp.trend_price ASC LIMIT 1";

        String sealedSql = "SELECT sp.name, spr.trend_price, bs.image_url " +
                "FROM binder_sealed bs " +
                "LEFT JOIN sealed_prod sp ON sp.id = bs.sealed_id " +
                "LEFT JOIN sealed_price spr ON spr.sealed_id = bs.sealed_id " +
                "WHERE bs.binder_id = ? " +
                "ORDER BY spr.trend_price ASC LIMIT 1";

        List<Map<String, Object>> cardResults = jdbcTemplate.queryForList(cardSql, binderId);
        List<Map<String, Object>> sealedResults = jdbcTemplate.queryForList(sealedSql, binderId);

        Map<String, Object> expCard = cardResults.isEmpty() ? null : cardResults.get(0);
        Map<String, Object> expSealed = sealedResults.isEmpty() ? null : sealedResults.get(0);

        if (expCard == null) return expSealed;
        if (expSealed == null) return expCard;

        double cardPrice = ((Number) expCard.get("trend_price")).doubleValue();
        double sealedPrice = ((Number) expSealed.get("trend_price")).doubleValue();

        return cardPrice <= sealedPrice ? expCard : expSealed;
    }

    private Map<String, Object> getPriceChange(int binderId) {
        String sql = "SELECT " +
                "COALESCE(SUM(cp.trend_price), 0) as totalTrend, " +
                "COALESCE(SUM(cp.avg_sell), 0) as totalAvg " +
                "FROM binder_card bc " +
                "LEFT JOIN card_price cp ON cp.card_id = bc.card_id " +
                "WHERE bc.binder_id = ?";
        return jdbcTemplate.queryForMap(sql, binderId);
    }

    private Map<String, Object> getFoilRatio(int binderId) {
        String sql = "SELECT " +
                "SUM(CASE WHEN bc.foil = 1 THEN 1 ELSE 0 END) as foilCount, " +
                "SUM(CASE WHEN bc.foil = 0 THEN 1 ELSE 0 END) as nonFoilCount " +
                "FROM binder_card bc " +
                "WHERE bc.binder_id = ?";
        return jdbcTemplate.queryForMap(sql, binderId);
    }

    private List<Map<String, Object>> getConditionDistribution(int binderId) {
        String sql = "SELECT cc.name as conditionName, COUNT(*) as count " +
                "FROM binder_card bc " +
                "LEFT JOIN card_condition cc ON cc.id = bc.condition_of_card " +
                "WHERE bc.binder_id = ? " +
                "GROUP BY cc.name";
        return jdbcTemplate.queryForList(sql, binderId);
    }
}
