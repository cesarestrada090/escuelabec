package com.escuelabec.crm.lead.domain.repository;

import com.escuelabec.crm.lead.domain.model.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findByFunnelStageIdOrderByCreatedAtDesc(Integer funnelStageId);

    Page<Lead> findByFunnelStageIdOrderByCreatedAtDesc(Integer funnelStageId, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.funnelStageId = :stageId AND " +
           "(LOWER(l.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(l.lastName)  LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(l.email)     LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Lead> findByStageAndQuery(@Param("stageId") Integer stageId, @Param("q") String q, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.funnelStageId = :stageId AND l.source = :source")
    Page<Lead> findByStageAndSource(@Param("stageId") Integer stageId, @Param("source") String source, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.funnelStageId = :stageId AND l.source = :source AND " +
           "(LOWER(l.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(l.lastName)  LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(l.email)     LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Lead> findByStageAndSourceAndQuery(@Param("stageId") Integer stageId, @Param("source") String source, @Param("q") String q, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.funnelStageId = :stageId AND " +
           "(LOWER(l.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(l.lastName)  LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           " LOWER(l.email)     LIKE LOWER(CONCAT('%',:q,'%')))")
    Long countByStageAndQuery(@Param("stageId") Integer stageId, @Param("q") String q);

    Page<Lead> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String firstName, String lastName, String email, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.funnelStageId = :stageId")
    Long countByFunnelStageId(@Param("stageId") Integer stageId);

    @Query("SELECT l.funnelStageId, COUNT(l) FROM Lead l GROUP BY l.funnelStageId")
    List<Object[]> countGroupByStage();

    @Query(value = "SELECT funnel_stage_id, COUNT(*) FROM leads " +
                   "WHERE DATE_FORMAT(created_at,'%Y-%m') = :month " +
                   "GROUP BY funnel_stage_id",
           nativeQuery = true)
    List<Object[]> countGroupByStageByMonth(@Param("month") String month);

    @Query(value = "SELECT status, COUNT(*) FROM leads GROUP BY status", nativeQuery = true)
    List<Object[]> countGroupByStatus();

    @Query(value = "SELECT status, COUNT(*) FROM leads WHERE created_at BETWEEN :from AND :to GROUP BY status", nativeQuery = true)
    List<Object[]> countGroupByStatusInRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT l.source, COUNT(l) FROM Lead l GROUP BY l.source ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupBySource();

    @Query(value = "SELECT source, COUNT(*) FROM leads " +
                   "WHERE DATE_FORMAT(created_at,'%Y-%m') = :month " +
                   "GROUP BY source ORDER BY COUNT(*) DESC",
           nativeQuery = true)
    List<Object[]> countGroupBySourceByMonth(@Param("month") String month);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    long countByStatus(Lead.LeadStatus status);

    long countByAssignedToIsNotNull();

    @Query(value = "SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as total, " +
                   "SUM(CASE WHEN status='CONVERTED' THEN 1 ELSE 0 END) as converted " +
                   "FROM leads WHERE created_at >= :from " +
                   "GROUP BY DATE_FORMAT(created_at,'%Y-%m') ORDER BY month",
           nativeQuery = true)
    List<Object[]> countByMonth(@Param("from") LocalDateTime from);

    @Query(value = "SELECT CONCAT(u.first_name,' ',u.last_name) as name, COUNT(l.lead_id) as total, " +
                   "SUM(CASE WHEN l.status='CONVERTED' THEN 1 ELSE 0 END) as converted " +
                   "FROM leads l LEFT JOIN users u ON l.assigned_to = u.user_id " +
                   "GROUP BY l.assigned_to, u.first_name, u.last_name ORDER BY total DESC",
           nativeQuery = true)
    List<Object[]> countByVendor();

    @Query(value = "SELECT CONCAT(u.first_name,' ',u.last_name) as name, COUNT(l.lead_id) as total, " +
                   "SUM(CASE WHEN l.status='CONVERTED' THEN 1 ELSE 0 END) as converted " +
                   "FROM leads l LEFT JOIN users u ON l.assigned_to = u.user_id " +
                   "WHERE DATE_FORMAT(l.created_at,'%Y-%m') = :month " +
                   "GROUP BY l.assigned_to, u.first_name, u.last_name ORDER BY total DESC",
           nativeQuery = true)
    List<Object[]> countByVendorByMonth(@Param("month") String month);

    boolean existsByEmail(String email);
}
