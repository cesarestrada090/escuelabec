package com.escuelabec.crm.shared.application;

import com.escuelabec.crm.shared.application.dto.UserDto;
import com.escuelabec.crm.shared.domain.model.*;
import com.escuelabec.crm.shared.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto.Response> findAll() {
        return userRepository.findAll().stream()
                .filter(User::getActive)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto.Response create(UserDto.CreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User.UserRole role = User.UserRole.SALES;
        if (request.getRole() != null) {
            try { role = User.UserRole.valueOf(request.getRole().toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .build();
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserDto.Response update(Long id, UserDto.UpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName()  != null) user.setLastName(request.getLastName());
        if (request.getEmail()     != null) user.setEmail(request.getEmail());
        if (request.getPassword()  != null) user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getActive()    != null) user.setActive(request.getActive());
        if (request.getRole()      != null) {
            try { user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        user.setActive(false);
        userRepository.save(user);
    }

    public UserDto.Response toResponse(User user) {
        UserDto.Response r = new UserDto.Response();
        r.setUserId(user.getUserId());
        r.setFirstName(user.getFirstName());
        r.setLastName(user.getLastName());
        r.setEmail(user.getEmail());
        r.setRole(user.getRole().name());
        r.setActive(user.getActive());
        r.setCreatedAt(user.getCreatedAt());
        return r;
    }
}
