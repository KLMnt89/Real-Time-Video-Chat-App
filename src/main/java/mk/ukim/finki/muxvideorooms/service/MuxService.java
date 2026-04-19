package mk.ukim.finki.muxvideorooms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
public class MuxService {

    @Value("${mux.token-id}")
    private String tokenId;

    @Value("${mux.token-secret}")
    private String tokenSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String MUX_BASE = "https://api.mux.com/video/v1";

    private HttpHeaders getHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String creds = tokenId + ":" + tokenSecret;
        String encoded = Base64.getEncoder().encodeToString(creds.getBytes());
        headers.set("Authorization", "Basic " + encoded);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    public String createSpace() {
        try {
            String url = MUX_BASE + "/spaces";
            HttpEntity<String> request = new HttpEntity<>("{\"type\":\"server\"}", getHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
            System.out.println("✅ Mux Space креиран: " + data.get("id"));
            return (String) data.get("id");
        } catch (HttpClientErrorException e) {
            System.err.println("❌ Mux createSpace error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw new RuntimeException("Mux createSpace failed: " + e.getMessage());
        }
    }

    public String createParticipantToken(String spaceId, String participantId) {
        try {
            String url = MUX_BASE + "/spaces/" + spaceId + "/broadcaster-id-tokens";
            HttpEntity<Map<String, String>> request = new HttpEntity<>(
                    Map.of("participant_id", participantId), getHeaders()
            );
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
            System.out.println("✅ Mux token креиран за: " + participantId);
            return (String) data.get("token");
        } catch (HttpClientErrorException e) {
            System.err.println("❌ Mux token error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw new RuntimeException("Mux createParticipantToken failed: " + e.getMessage());
        }
    }

    public void deleteSpace(String spaceId) {
        try {
            String url = MUX_BASE + "/spaces/" + spaceId;
            restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(getHeaders()), Void.class);
            System.out.println("✅ Mux Space избришан: " + spaceId);
        } catch (HttpClientErrorException e) {
            System.err.println("❌ Mux deleteSpace error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
        }
    }
}