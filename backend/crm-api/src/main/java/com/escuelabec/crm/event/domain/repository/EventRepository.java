package com.escuelabec.crm.event.domain.repository;

import com.escuelabec.crm.event.domain.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByLeadIdOrderByCreatedAtDesc(Long leadId);

    @Query("SELECT e FROM Event e WHERE " +
           "(:type IS NULL OR e.eventType = :type) AND " +
           "(:status IS NULL OR e.status = :status) " +
           "ORDER BY e.createdAt DESC")
    Page<Event> findFiltered(
            @Param("type")   Event.EventType type,
            @Param("status") Event.EventStatus status,
            Pageable pageable);
}
