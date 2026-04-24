package mk.ukim.finki.muxvideorooms.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class LiveKitService {

    @Value("${livekit.url}")
    private String livekitUrl;

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public String createRoom() {
        return UUID.randomUUID().toString();
    }

    public String createParticipantToken(String roomName, String participantIdentity) {
        return createParticipantToken(roomName, participantIdentity, participantIdentity);
    }

    public String createParticipantToken(String roomName, String identity, String displayName) {
        SecretKey key = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> videoClaims = Map.of(
                "room", roomName,
                "roomJoin", true,
                "canPublish", true,
                "canSubscribe", true
        );

        return Jwts.builder()
                .issuer(apiKey)
                .subject(identity)
                .claim("video", videoClaims)
                .claim("name", displayName)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000))
                .signWith(key)
                .compact();
    }

    public void deleteRoom(String roomName) {
        try {
            String httpUrl = livekitUrl
                    .replace("ws://", "http://")
                    .replace("wss://", "https://");

            SecretKey key = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));
            String adminToken = Jwts.builder()
                    .issuer(apiKey)
                    .subject("admin")
                    .claim("video", Map.of("roomAdmin", true, "room", roomName))
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 60_000))
                    .signWith(key)
                    .compact();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(adminToken);

            restTemplate.exchange(
                    httpUrl + "/twirp/livekit.RoomService/DeleteRoom",
                    HttpMethod.POST,
                    new HttpEntity<>(Map.of("room", roomName), headers),
                    Void.class
            );
            System.out.println("LiveKit room deleted: " + roomName);
        } catch (Exception e) {
            System.err.println("LiveKit deleteRoom error: " + e.getMessage());
        }
    }
}
