package com.queueless.queueless;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/organization")
@CrossOrigin(origins = "*")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    // Add organization
    @PostMapping("/add")
    public Organization addOrganization(@RequestBody Organization organization) {
        return organizationRepository.save(organization);
    }

    // Get all organizations
    @GetMapping("/all")
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    // Get organization by ID
    @GetMapping("/{id}")
    public Organization getOrganizationById(@PathVariable int id) {
        return organizationRepository.findById(id).orElse(null);
    }
}