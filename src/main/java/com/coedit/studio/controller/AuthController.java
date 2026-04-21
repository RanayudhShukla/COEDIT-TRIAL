package com.coedit.studio.controller;

import com.coedit.studio.model.User;
import com.coedit.studio.repository.UserRepository;
import com.coedit.studio.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        User user = new User(username, encoder.encode(password));
        userRepository.save(user);

        String jwt = jwtUtils.generateJwtToken(username);
        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null || !encoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid username or password!");
        }

        String jwt = jwtUtils.generateJwtToken(username);
        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", username);
        return ResponseEntity.ok(response);
    }
}
