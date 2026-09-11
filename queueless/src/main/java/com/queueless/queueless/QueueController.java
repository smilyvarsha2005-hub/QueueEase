package com.queueless.queueless;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class QueueController {

    private final QueueTokenRepository repository;
    private final NotificationRepository notificationRepository;
    private final OrganizationRepository organizationRepository;
    private final ServiceRepository serviceRepository;

    public QueueController(
            QueueTokenRepository repository,
            NotificationRepository notificationRepository,
            OrganizationRepository organizationRepository,
            ServiceRepository serviceRepository) {

        this.repository = repository;
        this.notificationRepository = notificationRepository;
        this.organizationRepository = organizationRepository;
        this.serviceRepository = serviceRepository;
    }


    /* =========================================================
       HOME
       ========================================================= */

    @GetMapping("/queue")
    public String queueHome() {

        return "Queue Management System is running!";
    }


    /* =========================================================
       TAKE TOKEN
       ========================================================= */

    @GetMapping("/queue/take")
    public QueueToken takeToken(

            @RequestParam(defaultValue = "Customer")
            String customerName,

            @RequestParam(defaultValue = "")
            String contact,

            @RequestParam(defaultValue = "EMAIL")
            String notificationMethod,

            @RequestParam
            int organizationId,

            @RequestParam
            int serviceId,

            @RequestParam
            int customerId) {


        /*
         * Count only WAITING/CALLED customers
         * belonging to the same organization
         * and service.
         */

        List<QueueToken> tokens =
                repository.findAll();


        long activeCustomers =
                tokens.stream()
                        .filter(token ->
                                token.getOrganizationId()
                                        == organizationId)
                        .filter(token ->
                                token.getServiceId()
                                        == serviceId)
                        .filter(token ->
                                "WAITING".equals(
                                        token.getStatus()
                                )
                                ||
                                "CALLED".equals(
                                        token.getStatus()
                                )
                        )
                        .count();


        int queuePosition =
                (int) activeCustomers + 1;


        int estimatedWaitingTime =
                (queuePosition - 1) * 5;


        QueueToken token =
                new QueueToken(
                        customerName,
                        contact,
                        notificationMethod,
                        queuePosition,
                        estimatedWaitingTime,
                        "WAITING"
                );


        token.setOrganizationId(
                organizationId
        );

        token.setServiceId(
                serviceId
        );

        token.setCustomerId(
                customerId
        );


        QueueToken savedToken =
                repository.save(token);


        String message =
                "Your QueueEase token is " +
                savedToken.getTokenNumber() +
                ". Your current queue position is " +
                queuePosition +
                ". Estimated waiting time is " +
                estimatedWaitingTime +
                " minutes.";


        Notification notification =
                new Notification(
                        savedToken.getTokenNumber(),
                        notificationMethod,
                        "PENDING",
                        message
                );


        notificationRepository.save(
                notification
        );


        return savedToken;
    }


    /* =========================================================
       ALL TOKENS
       ========================================================= */

    @GetMapping("/queue/all")
    public Iterable<QueueToken> getAllTokens() {

        return repository.findAll();
    }


    /* =========================================================
       FILTERED QUEUE
       ========================================================= */

    @GetMapping("/queue/filter")
    public List<QueueToken> getFilteredQueue(

            @RequestParam
            int organizationId,

            @RequestParam
            int serviceId) {


        return repository.findAll()
                .stream()

                .filter(token ->
                        token.getOrganizationId()
                                == organizationId)

                .filter(token ->
                        token.getServiceId()
                                == serviceId)

                .toList();
    }


    /* =========================================================
       QUEUE STATUS
       ========================================================= */

    @GetMapping("/queue/status")
    public String queueStatus() {

        long totalTokens =
                repository.count();


        long nextToken =
                totalTokens + 1;


        return "Total Tokens: " +
                totalTokens +
                ", Next Token: " +
                nextToken;
    }


    /* =========================================================
       TOKEN STATUS
       ========================================================= */

    @GetMapping("/queue/status/{tokenNumber}")
    public QueueToken getTokenStatus(

            @PathVariable
            int tokenNumber) {


        return repository.findById(
                tokenNumber
        ).orElse(null);
    }


    /* =========================================================
       CALL NEXT TOKEN
       ========================================================= */

    @GetMapping("/queue/call-next")
    public QueueToken callNextToken(

            @RequestParam
            int organizationId,

            @RequestParam
            int serviceId) {


        List<QueueToken> tokens =
                repository.findAll();


        /*
         * Find the first WAITING customer
         * only inside the selected organization
         * and selected service.
         */

        for (QueueToken token : tokens) {

            if (

                    token.getOrganizationId()
                            == organizationId

                    &&

                    token.getServiceId()
                            == serviceId

                    &&

                    "WAITING".equals(
                            token.getStatus()
                    )

            ) {


                token.setStatus(
                        "CALLED"
                );


                repository.save(
                        token
                );


                return token;
            }
        }


        return null;
    }


    /* =========================================================
       SERVE TOKEN
       ========================================================= */

    @GetMapping("/queue/serve/{tokenNumber}")
    public String serveToken(

            @PathVariable
            int tokenNumber) {


        QueueToken token =
                repository.findById(
                        tokenNumber
                ).orElse(null);


        if (token == null) {

            return "Token not found";
        }


        int organizationId =
                token.getOrganizationId();


        int serviceId =
                token.getServiceId();


        token.setStatus(
                "SERVED"
        );


        repository.save(
                token
        );


        /*
         * Recalculate positions only for
         * this organization + service.
         */

        List<QueueToken> tokens =
                repository.findAll();


        int position = 1;


        for (QueueToken waitingToken :
                tokens) {


            if (

                    waitingToken
                            .getOrganizationId()
                            == organizationId

                    &&

                    waitingToken
                            .getServiceId()
                            == serviceId

                    &&

                    "WAITING".equals(
                            waitingToken.getStatus()
                    )

            ) {


                waitingToken.setQueuePosition(
                        position
                );


                waitingToken.setEstimatedWaitingTime(
                        (position - 1) * 5
                );


                repository.save(
                        waitingToken
                );


                position++;
            }
        }


        return "Token " +
                tokenNumber +
                " has been served";
    }


    /* =========================================================
       ORGANIZATIONS
       ========================================================= */

    @GetMapping("/organizations")
    public Iterable<Organization>
    getOrganizations() {

        return organizationRepository.findAll();
    }


    /* =========================================================
       SERVICES
       ========================================================= */

    @GetMapping("/services/{organizationId}")
    public Iterable<Service>
    getServices(

            @PathVariable
            int organizationId) {


        return serviceRepository.findAll()
                .stream()

                .filter(service ->
                        service.getOrganizationId()
                                == organizationId)

                .toList();
    }

}