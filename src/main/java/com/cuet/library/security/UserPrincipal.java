package com.cuet.library.security;

import com.cuet.library.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;

public class UserPrincipal implements UserDetails {

    private final User user;

    public UserPrincipal(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Customize if you track expiration
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Customize if you track locking
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Customize if you track credential expiry
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    public String getName() {
        return user.getName();
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    public String getEmail() {
        return user.getEmail();
    }
}
